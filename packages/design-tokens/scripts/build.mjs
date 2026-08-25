import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { generateCss } from "../src/token-tools.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(packageRoot, "tokens/planning-poker.tokens.json");
const outputPath = resolve(packageRoot, "dist/tokens.css");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const generated = generateCss(source);

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== generated) {
    throw new Error("Generated token CSS is out of date. Run pnpm build.");
  }
  console.log("TOKEN_CSS_CURRENT");
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, generated);
  console.log("TOKEN_CSS_GENERATED");
}
