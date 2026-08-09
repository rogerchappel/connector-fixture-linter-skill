import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/connector-fixture-lint.js', import.meta.url));
const goodFixtures = fileURLToPath(new URL('./fixtures/good', import.meta.url));

function run(...args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
}

test('CLI help entrypoint prints usage', () => {
  const result = run('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: connector-fixture-lint/);
  assert.match(result.stdout, /--format json\|markdown/);
  assert.equal(result.stderr, '');
});

test('CLI accepts documented JSON and Markdown invocations', () => {
  for (const format of ['json', 'markdown']) {
    const result = run(goodFixtures, '--format', format);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
  }
});

for (const [name, args, diagnostic] of [
  ['missing target', [], 'Missing file-or-directory target'],
  ['missing --format value', [goodFixtures, '--format'], 'Missing value for --format'],
  ['option used as --format value', [goodFixtures, '--format', '--help'], '--help must be used by itself'],
  ['invalid --format value', [goodFixtures, '--format', 'yaml'], '--format must be json or markdown'],
  ['duplicate --format flags', [goodFixtures, '--format', 'json', '--format', 'json'], '--format may only be specified once'],
  ['conflicting --format flags', [goodFixtures, '--format', 'json', '--format', 'markdown'], '--format may only be specified once'],
  ['unknown option', ['--bogus'], 'Unknown option: --bogus'],
  ['unknown option after target', [goodFixtures, '--bogus'], 'Unknown option: --bogus'],
  ['extra target', [goodFixtures, goodFixtures], 'Unexpected argument'],
  ['help with a target', ['--help', goodFixtures], '--help must be used by itself'],
  ['help with a format', ['--help', '--format', 'json'], '--help must be used by itself']
]) {
  test(`CLI rejects ${name} as usage error before linting`, () => {
    const result = run(...args);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, new RegExp(diagnostic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(result.stderr, /Usage: connector-fixture-lint/);
    assert.doesNotMatch(result.stderr, /ENOENT/);
  });
}
