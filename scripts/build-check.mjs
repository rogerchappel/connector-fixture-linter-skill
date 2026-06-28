import { accessSync, constants } from 'node:fs';

const required = [
  'README.md',
  'SKILL.md',
  'docs/PRD.md',
  'docs/TASKS.md',
  'docs/ORCHESTRATION.md',
  'docs/RELEASE_CANDIDATE.md',
  'bin/connector-fixture-lint.js',
  'src/linter.js',
  'src/rules.js',
  'src/reporters.js',
  'test/linter.test.js'
];

for (const file of required) {
  accessSync(file, constants.R_OK);
}

console.log(`build-check: ${required.length} required files present`);
