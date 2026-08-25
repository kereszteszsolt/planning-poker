const referencePattern = /^\{([^{}]+)\}$/;
const supportedTypes = new Set([
  "color",
  "dimension",
  "duration",
  "fontFamily",
  "fontWeight",
  "number",
  "shadow",
]);

const isObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const tokenEntries = (source) => {
  const tokens = new Map();
  const visit = (value, path, setName, inheritedType) => {
    if (!isObject(value))
      throw new Error(`Invalid group at ${path.join(".")}.`);
    if (Object.hasOwn(value, "$value")) {
      const children = Object.keys(value).filter((key) => !key.startsWith("$"));
      if (children.length > 0)
        throw new Error(`Token ${path.join(".")} also contains child tokens.`);
      const name = path.join(".");
      if (tokens.has(name)) throw new Error(`Duplicate token path: ${name}.`);
      const type = value.$type ?? inheritedType;
      if (!supportedTypes.has(type))
        throw new Error(`Unsupported or missing type for ${name}.`);
      tokens.set(name, { name, setName, type, value: value.$value });
      return;
    }
    const nextType = value.$type ?? inheritedType;
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("$")) continue;
      visit(child, [...path, key], setName, nextType);
    }
  };

  for (const [setName, set] of Object.entries(source))
    visit(set, [], setName, undefined);
  return tokens;
};

const assertDimension = (name, value, kind = "dimension") => {
  if (
    !isObject(value) ||
    typeof value.value !== "number" ||
    !Number.isFinite(value.value) ||
    !new Set(kind === "duration" ? ["ms", "s"] : ["px", "rem"]).has(value.unit)
  ) {
    throw new Error(`Invalid ${kind} value for ${name}.`);
  }
};

const validateResolvedValue = ({ name, type }, value) => {
  switch (type) {
    case "color":
      if (
        typeof value !== "string" ||
        !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value)
      )
        throw new Error(`Invalid color value for ${name}.`);
      break;
    case "dimension":
      assertDimension(name, value);
      break;
    case "duration":
      assertDimension(name, value, "duration");
      break;
    case "fontFamily":
      if (!(
        typeof value === "string" ||
        (Array.isArray(value) &&
          value.every((item) => typeof item === "string"))
      ))
        throw new Error(`Invalid fontFamily value for ${name}.`);
      break;
    case "fontWeight":
      if (typeof value !== "number" || value < 1 || value > 1000)
        throw new Error(`Invalid fontWeight value for ${name}.`);
      break;
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value))
        throw new Error(`Invalid number value for ${name}.`);
      break;
    case "shadow":
      if (!isObject(value))
        throw new Error(`Invalid shadow value for ${name}.`);
      validateResolvedValue(
        { name: `${name}.color`, type: "color" },
        value.color,
      );
      for (const property of ["offsetX", "offsetY", "blur", "spread"])
        assertDimension(`${name}.${property}`, value[property]);
      break;
  }
};

export const resolveTokens = (source) => {
  const tokens = tokenEntries(source);
  const resolved = new Map();
  const resolving = new Set();

  const resolve = (name) => {
    if (resolved.has(name)) return resolved.get(name);
    const token = tokens.get(name);
    if (!token) throw new Error(`Missing token reference: ${name}.`);
    if (resolving.has(name))
      throw new Error(`Circular token reference: ${name}.`);
    resolving.add(name);
    const reference =
      typeof token.value === "string"
        ? token.value.match(referencePattern)
        : null;
    let value = token.value;
    if (reference) {
      const target = tokens.get(reference[1]);
      if (!target) throw new Error(`Missing token reference: ${reference[1]}.`);
      if (target.type !== token.type)
        throw new Error(`Type mismatch in token reference: ${name}.`);
      value = resolve(reference[1]).value;
    }
    validateResolvedValue(token, value);
    resolving.delete(name);
    const result = { ...token, value };
    resolved.set(name, result);
    return result;
  };

  for (const name of tokens.keys()) resolve(name);
  return [...resolved.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
};

const cssName = (name) =>
  `--pp-${name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .toLowerCase()}`;

const cssValue = ({ type, value }) => {
  if (type === "dimension" || type === "duration")
    return `${value.value}${value.unit}`;
  if (type === "fontFamily")
    return Array.isArray(value) ? value.join(", ") : value;
  if (type === "shadow")
    return `${value.offsetX.value}${value.offsetX.unit} ${value.offsetY.value}${value.offsetY.unit} ${value.blur.value}${value.blur.unit} ${value.spread.value}${value.spread.unit} ${value.color}`;
  return String(value);
};

export const generateCss = (source) => {
  const tokens = resolveTokens(source);
  const names = new Set();
  const lines = tokens.map((token) => {
    const name = cssName(token.name);
    if (names.has(name))
      throw new Error(`Duplicate generated CSS name: ${name}.`);
    names.add(name);
    return `  ${name}: ${cssValue(token)};`;
  });
  return [
    "/* Generated from tokens/planning-poker.tokens.json. Do not edit directly. */",
    ":root {",
    ...lines,
    "}",
    "",
  ].join("\n");
};
