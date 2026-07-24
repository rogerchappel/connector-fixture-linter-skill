import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintPath } from '../src/linter.js';
import { toMarkdownReport } from '../src/reporters.js';
import { lintFixture } from '../src/rules.js';

test('valid fixture directory passes without errors', () => {
  const report = lintPath('test/fixtures/good');
  assert.equal(report.summary.fixtures, 2);
  assert.equal(report.summary.errors, 0);
});

test('missing fields are reported as errors', () => {
  const report = lintPath('test/fixtures/bad/missing-fields.json');
  assert.ok(report.summary.errors >= 3);
  assert.match(toMarkdownReport(report), /missing_field/);
});

test('non-object fixture roots are reported as structured errors', () => {
  for (const fixture of [null, false, 42, 'fixture', []]) {
    const result = lintFixture('invalid-root.json', fixture);

    assert.equal(result.file, 'invalid-root.json');
    assert.equal(result.fixtureName, 'invalid fixture');
    assert.deepEqual(result.issues, [{
      severity: 'error',
      code: 'invalid_fixture_root',
      message: 'fixture root must be a JSON object',
      path: '$'
    }]);
  }
});

test('write-like fixtures require approval', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'approval_required'));
});

test('write fixtures declare expected writes for dry-run comparison', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'expected_writes'));
});

test('sensitive inputs are warnings', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.summary.warnings >= 2);
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'sensitive_input'));
});

test('modern OpenAI API keys are detected and masked', () => {
  for (const token of [
    'sk-abcdefghijklmnopqrstuvwxyz123456',
    'sk-proj-abcdefghijklmnopqrstuvwxyz123456'
  ]) {
    const result = lintFixture('openai.json', {
      connector: 'openai',
      action: 'list-models',
      mode: 'read-only',
      scopes: ['models.read'],
      approval: { required: false },
      input: { apiKey: token },
      expected: {}
    });
    const finding = result.issues.find((issue) => issue.code === 'sensitive_input');

    assert.ok(finding);
    assert.equal(finding.path, '$.apiKey');
    assert.notEqual(finding.sample, token);
    assert.ok(!finding.sample.includes(token));
  }
});

test('directory traversal includes nested fixture files', () => {
  const report = lintPath('test/fixtures');
  assert.equal(report.summary.fixtures, 4);
});

test('empty fixture directories fail library and CLI linting', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'connector-fixture-lint-empty-'));
  t.after(() => rmSync(directory, { recursive: true }));

  assert.throws(
    () => lintPath(directory),
    { message: `no JSON fixture files found in ${directory}` }
  );

  const result = spawnSync(process.execPath, [
    'bin/connector-fixture-lint.js',
    directory,
    '--format',
    'json'
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(
    result.stderr,
    `connector-fixture-lint: no JSON fixture files found in ${directory}\n`
  );
});

test('CLI smoke renders markdown for fixture directories', () => {
  const output = execFileSync(process.execPath, [
    'bin/connector-fixture-lint.js',
    'test/fixtures/good',
    '--format',
    'markdown'
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8'
  });

  assert.match(output, /# Connector Fixture Lint Report/);
  assert.match(output, /Errors: 0/);
});
