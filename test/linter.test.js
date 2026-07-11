import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { lintPath } from '../src/linter.js';
import { toMarkdownReport } from '../src/reporters.js';

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

test('directory traversal includes nested fixture files', () => {
  const report = lintPath('test/fixtures');
  assert.equal(report.summary.fixtures, 4);
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
