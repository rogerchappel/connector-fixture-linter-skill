import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
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
