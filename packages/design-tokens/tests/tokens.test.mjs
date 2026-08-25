import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { generateCss, resolveTokens } from "../src/token-tools.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(
  await readFile(
    resolve(packageRoot, "tokens/planning-poker.tokens.json"),
    "utf8",
  ),
);

const clone = () => structuredClone(source);

const relativeLuminance = (hex) => {
  const channels = hex
    .slice(1, 7)
    .match(/.{2}/g)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (first, second) => {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
};

test("resolves the approved token source and matches committed CSS", async () => {
  const tokens = resolveTokens(source);
  assert.ok(tokens.length > 40);
  const generated = generateCss(source);
  const committed = await readFile(
    resolve(packageRoot, "dist/tokens.css"),
    "utf8",
  );
  assert.equal(generated, committed);
  assert.match(generated, /--pp-color-action-primary: #1d4ed8;/);
});

test("rejects missing and circular references", () => {
  const missing = clone();
  missing.Semantic.color.text.primary.$value = "{color.base.missing}";
  assert.throws(() => resolveTokens(missing), /Missing token reference/);

  const circular = clone();
  circular.Semantic.color.text.primary.$value = "{color.text.secondary}";
  circular.Semantic.color.text.secondary.$value = "{color.text.primary}";
  assert.throws(() => resolveTokens(circular), /Circular token reference/);
});

test("rejects duplicate token paths and invalid values", () => {
  const duplicate = clone();
  duplicate.Semantic.color.base = structuredClone(duplicate.Global.color.base);
  assert.throws(() => resolveTokens(duplicate), /Duplicate token path/);

  const invalid = clone();
  invalid.Global.size.touch.$value = { value: -1, unit: "vw" };
  assert.throws(() => resolveTokens(invalid), /Invalid dimension value/);
});

test("essential text and action pairs meet WCAG AA contrast", () => {
  const colors = new Map(
    resolveTokens(source)
      .filter((token) => token.type === "color")
      .map((token) => [token.name, token.value]),
  );
  const pairs = [
    ["color.text.primary", "color.background.surface"],
    ["color.text.secondary", "color.background.surface"],
    ["color.text.inverse", "color.action.primary"],
    ["color.text.inverse", "color.action.success"],
    ["color.text.inverse", "color.action.warning"],
    ["color.text.inverse", "color.action.danger"],
    ["color.status.dangerText", "color.status.dangerSurface"],
  ];

  for (const [foreground, background] of pairs) {
    const ratio = contrastRatio(colors.get(foreground), colors.get(background));
    assert.ok(
      ratio >= 4.5,
      `${foreground} on ${background} has contrast ${ratio.toFixed(2)}:1`,
    );
  }
});
