import test from 'node:test';
import assert from 'node:assert/strict';
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

test('sensitive inputs are warnings', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.summary.warnings >= 2);
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'sensitive_input'));
});

test('directory traversal includes nested fixture files', () => {
  const report = lintPath('test/fixtures');
  assert.equal(report.summary.fixtures, 4);
});
