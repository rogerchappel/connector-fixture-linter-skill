import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");
const skill = readFileSync("SKILL.md", "utf8");
const ci = readFileSync(".github/workflows/ci.yml", "utf8");
const failures = [];

function requireField(condition, message) {
  if (!condition) failures.push(message);
}

requireField(pkg.name === "connector-fixture-linter-skill", "package name must remain connector-fixture-linter-skill");
requireField(pkg.version === "0.1.0", "release candidate version must stay explicit");
requireField(pkg.license === "MIT", "package must declare the MIT license");
requireField(pkg.repository?.url === "git+https://github.com/rogerchappel/connector-fixture-linter-skill.git", "repository metadata must point at GitHub");
requireField(pkg.bugs?.url === "https://github.com/rogerchappel/connector-fixture-linter-skill/issues", "bugs URL must point at GitHub issues");
requireField(pkg.homepage === "https://github.com/rogerchappel/connector-fixture-linter-skill#readme", "homepage must point at the README");
requireField(pkg.bin?.["connector-fixture-lint"] === "./bin/connector-fixture-lint.js", "CLI bin must point at ./bin/connector-fixture-lint.js");
requireField(Array.isArray(pkg.files), "package files allowlist is required");
requireField(pkg.engines?.node === ">=22", "package engines must require Node.js 22 or newer");
requireField(readme.includes("Node.js 22 or newer"), "README must document the Node.js 22+ runtime contract");
requireField(skill.includes("Node.js 22 or newer"), "SKILL must document the Node.js 22+ runtime contract");
requireField(/node-version:\s*\[22, 24\]/.test(ci), "CI must verify Node.js 22 and 24");
requireField(!/node-version:\s*\[[^\]]*(?:18|20)/.test(ci), "CI must not include unsupported Node.js 18 or 20 lines");
requireField((ci.match(/run: npm ci/g) ?? []).length === 2, "CI verify and release jobs must use npm ci");
requireField(!ci.includes("npm install"), "CI must not fall back to npm install");
requireField(/release-gate:[\s\S]*?node-version:\s*24/.test(ci), "release readiness must run on Node.js 24");

for (const entry of ["bin", "src", "scripts", "test/fixtures", "docs", "SKILL.md", "README.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md"]) {
  requireField(pkg.files?.includes(entry), `package files allowlist must include ${entry}`);
}

for (const file of [
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "SKILL.md",
  "docs/EXAMPLE_REPORT.md",
  "docs/RELEASE_CANDIDATE.md",
  "test/fixtures/good/create-note.json",
  ".github/workflows/ci.yml"
]) {
  requireField(existsSync(file), `${file} must be present for release review`);
}

if (failures.length) {
  console.error(`release readiness failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("release readiness ok");
