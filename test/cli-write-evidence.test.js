import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function run(fixture) {
  return spawnSync(process.execPath, ['bin/connector-fixture-lint.js', fixture, '--format', 'json'], { encoding: 'utf8' });
}

test('CLI exits nonzero and reports paths for malformed write evidence', () => {
  const result = run('test/fixtures/bad/malformed-write-evidence.json');
  assert.equal(result.status, 1);
  const paths = JSON.parse(result.stdout).results[0].issues.map((issue) => issue.path);
  for (const path of ['$.approval.reason', '$.expected.writes[0]', '$.expected.writes[1]', '$.expected.writes[2]']) {
    assert.ok(paths.includes(path), `missing ${path}`);
  }
});

test('CLI accepts valid write evidence', () => {
  const result = run('test/fixtures/good/write-note.json');
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
