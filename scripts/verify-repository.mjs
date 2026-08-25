import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const git = (...arguments_) =>
  execFileSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });

const ignoredDirectories = new Set([
  ".git",
  ".pnpm-store",
  ".turbo",
  "coverage",
  "dist",
  "e2e-report",
  "e2e-results",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const collectSourceFiles = (directory = repositoryRoot) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(absolutePath);
    return [path.relative(repositoryRoot, absolutePath)];
  });

let trackedFiles;
try {
  git("rev-parse", "--is-inside-work-tree");
  git("diff", "--check");
  trackedFiles = git("ls-files", "-z").split("\0").filter(Boolean);
} catch {
  trackedFiles = collectSourceFiles();
  console.log(
    "REPOSITORY_NOTE: Git metadata is unavailable; source-file checks continue without git diff --check.",
  );
}
const failures = [];
const recordFailure = (message) => failures.push(message);

for (const filename of trackedFiles.filter((value) =>
  value.endsWith(".json"),
)) {
  try {
    const source = readFileSync(path.join(repositoryRoot, filename), "utf8");
    const parseableSource = path.basename(filename).startsWith("tsconfig")
      ? source
          .replace(/\/\*[\s\S]*?\*\//gu, "")
          .replace(/^\s*\/\/.*$/gmu, "")
          .replace(/,\s*([}\]])/gu, "$1")
      : source;
    JSON.parse(parseableSource);
  } catch (error) {
    recordFailure(`${filename}: invalid JSON (${error.message})`);
  }
}

const markdownLinks = /!?\[[^\]]*\]\(([^)]+)\)/g;
const htmlLinks = /\b(?:href|src)=["']([^"']+)["']/g;
const ignoredSchemes = /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i;

const checkLink = (markdownFile, rawTarget) => {
  let target = rawTarget.trim();
  if (target.startsWith("<") && target.endsWith(">"))
    target = target.slice(1, -1);
  target = target.split(/\s+["']/)[0];
  if (!target || ignoredSchemes.test(target)) return;
  const pathOnly = target.split(/[?#]/, 1)[0];
  if (!pathOnly) return;
  let decoded;
  try {
    decoded = decodeURIComponent(pathOnly);
  } catch {
    recordFailure(`${markdownFile}: malformed link encoding: ${target}`);
    return;
  }
  const resolved = path.resolve(
    repositoryRoot,
    path.dirname(markdownFile),
    decoded,
  );
  if (
    !resolved.startsWith(`${repositoryRoot}${path.sep}`) &&
    resolved !== repositoryRoot
  ) {
    recordFailure(`${markdownFile}: link escapes repository: ${target}`);
    return;
  }
  if (!existsSync(resolved)) {
    recordFailure(`${markdownFile}: broken relative link: ${target}`);
    return;
  }
  if (target.endsWith("/") && !statSync(resolved).isDirectory()) {
    recordFailure(`${markdownFile}: expected directory link: ${target}`);
  }
};

for (const filename of trackedFiles.filter((value) => value.endsWith(".md"))) {
  const contents = readFileSync(path.join(repositoryRoot, filename), "utf8");
  for (const expression of [markdownLinks, htmlLinks]) {
    expression.lastIndex = 0;
    for (const match of contents.matchAll(expression))
      checkLink(filename, match[1]);
  }
}

for (const filename of [
  "docs/design/planning-poker-interface-plan.svg",
  "docs/design/planning-poker-penpot-overview.svg",
  "docs/design/planning-poker-penpot-vote-hidden.svg",
  "readme-assets/planning-poker-mark.svg",
]) {
  const source = readFileSync(path.join(repositoryRoot, filename), "utf8");
  if (!/^\s*<svg\b[\s\S]*<\/svg>\s*$/u.test(source)) {
    recordFailure(`${filename}: not a complete portable SVG document`);
  }
  if (/\b(?:href|src)=["']https?:/iu.test(source)) {
    recordFailure(`${filename}: external resources are not portable`);
  }
}

assert.deepEqual(failures, [], failures.join("\n"));
console.log(
  `REPOSITORY_OK: ${trackedFiles.length} tracked files, JSON, relative Markdown links, and portable SVG sources verified.`,
);
