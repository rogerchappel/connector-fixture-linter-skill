import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
  const literalFixture = join(packageDirectory, "literal-markdown.json");
  writeFileSync(literalFixture, JSON.stringify({
    name: "fixture\n## injected - item `code`",
    connector: "crm",
    action: "read",
    mode: "read-only",
    scopes: ["records.read"],
    approval: { required: false },
    input: {},
    expected: {}
  }));
  const literalReport = execFileSync(executable, [literalFixture, "--format", "markdown"], {
    encoding: "utf8"
  });
  if (!literalReport.includes("## fixture \\#\\# injected \\- item \\`code\\`") || literalReport.includes("\n## injected")) {
    throw new Error("installed executable did not render fixture names as literal Markdown text");
  }
} finally {
  rmSync(packageDirectory, { recursive: true, force: true });
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files and its installed executable runs`);
