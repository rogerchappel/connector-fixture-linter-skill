import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));

const required = [
  "bin/connector-fixture-lint.js",
  "scripts/package-smoke.mjs",
  "scripts/validate-release-readiness.mjs",
  "src/linter.js",
  "test/fixtures/good/create-note.json",
  "docs/EXAMPLE_REPORT.md",
  "docs/RELEASE_CANDIDATE.md",
  "SKILL.md",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md"
];
const forbidden = [
  "test/cli-help.test.js",
  "test/linter.test.js"
];

const missing = required.filter((file) => !files.has(file));
const unexpected = forbidden.filter((file) => files.has(file));
if (missing.length || unexpected.length) {
  console.error(`Package smoke failed; missing files:\n${missing.join("\n")}`);
  if (unexpected.length) {
    console.error(`Package smoke failed; unexpectedly packed:\n${unexpected.join("\n")}`);
  }
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);
