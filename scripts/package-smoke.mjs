import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const packageDirectory = mkdtempSync(join(tmpdir(), "connector-fixture-package-smoke-"));
const output = execFileSync("npm", ["pack", "--json", "--pack-destination", packageDirectory], {
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

try {
  const installDirectory = join(packageDirectory, "install");
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", installDirectory, join(packageDirectory, pack.filename)], {
    stdio: "pipe"
  });
  const executable = join(installDirectory, "node_modules", ".bin", "connector-fixture-lint");
  const report = execFileSync(executable, [resolve("test/fixtures/good"), "--format", "markdown"], {
    encoding: "utf8"
  });
  if (!report.includes("# Connector Fixture Lint Report") || !report.includes("Errors: 0")) {
    throw new Error("installed executable did not produce the expected clean Markdown report");
  }
} finally {
  rmSync(packageDirectory, { recursive: true, force: true });
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files and its installed executable runs`);
