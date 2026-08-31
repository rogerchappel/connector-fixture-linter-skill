import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lintPath } from '../src/linter.js';
import { toMarkdownReport } from '../src/reporters.js';
import { lintFixture } from '../src/rules.js';

test('valid fixture directory passes without errors', () => {
  const report = lintPath('test/fixtures/good');
  assert.equal(report.summary.fixtures, 3);
  assert.equal(report.summary.errors, 0);
});

test('missing fields are reported as errors', () => {
  const report = lintPath('test/fixtures/bad/missing-fields.json');
  assert.ok(report.summary.errors >= 3);
  assert.match(toMarkdownReport(report), /missing\\_field/);
});

test('Markdown reports render fixture-controlled values as literal text', () => {
  const output = toMarkdownReport({
    target: 'fixtures\n# injected [target](https://example.com)',
    summary: { fixtures: 1, errors: 1, warnings: 0 },
    results: [{
      fixtureName: 'fixture\n## heading - list `code`',
      file: 'fixtures/[link](destination).json',
      issues: [{
        severity: 'error',
        code: 'bad`code',
        path: '$.input\n- item',
        message: 'message\n# heading [link](destination) `code`',
        sample: 'sample *emphasis* `tick`'
      }]
    }]
  });

  assert.ok(output.includes('Target: fixtures \\# injected \\[target\\]\\(https://example\\.com\\)'));
  assert.ok(output.includes('## fixture \\#\\# heading \\- list \\`code\\`'));
  assert.ok(output.includes('File: fixtures/\\[link\\]\\(destination\\)\\.json'));
  assert.ok(output.includes('bad\\`code at $\\.input \\- item'));
  assert.ok(output.includes('message \\# heading \\[link\\]\\(destination\\) \\`code\\`'));
  assert.ok(output.includes('sample \\*emphasis\\* \\`tick\\`'));
  assert.doesNotMatch(output, /\n# injected|\n## heading|\n- item/);
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

test('malformed field shapes are reported with field-specific paths', () => {
  const result = lintFixture('malformed.json', {
    connector: {},
    action: [],
    mode: 42,
    scopes: ['customers.read', ''],
    approval: [],
    input: 'not-an-object',
    expected: null
  });

  assert.equal(result.fixtureName, 'unknown:unknown');
  assert.deepEqual(
    result.issues.filter((issue) => issue.severity === 'error'),
    [
      ['invalid_connector', '$.connector'],
      ['invalid_action', '$.action'],
      ['invalid_mode', '$.mode'],
      ['invalid_scope', '$.scopes[1]'],
      ['invalid_approval', '$.approval'],
      ['invalid_input', '$.input'],
      ['invalid_expected', '$.expected']
    ].map(([code, path]) => ({
      severity: 'error',
      code,
      message: result.issues.find((issue) => issue.code === code).message,
      path
    }))
  );
});

test('all supported fields reject invalid present values', () => {
  const cases = [
    ['connector', '', 'invalid_connector', '$.connector'],
    ['action', null, 'invalid_action', '$.action'],
    ['mode', {}, 'invalid_mode', '$.mode'],
    ['scopes', 'customers.read', 'invalid_scopes', '$.scopes'],
    ['scopes', [], 'invalid_scopes', '$.scopes'],
    ['scopes', [7], 'invalid_scope', '$.scopes[0]'],
    ['approval', null, 'invalid_approval', '$.approval'],
    ['input', [], 'invalid_input', '$.input'],
    ['expected', 'result', 'invalid_expected', '$.expected']
  ];

  for (const [field, value, code, path] of cases) {
    const fixture = {
      connector: 'crm',
      action: 'read-customer',
      mode: 'read-only',
      scopes: ['customers.read'],
      approval: { required: false },
      input: {},
      expected: {}
    };
    fixture[field] = value;
    const result = lintFixture(`${field}.json`, fixture);
    assert.ok(
      result.issues.some((issue) => issue.severity === 'error' && issue.code === code && issue.path === path),
      `${field}=${JSON.stringify(value)} should produce ${code} at ${path}`
    );
  }
});

test('malformed field shapes make JSON and Markdown CLI reports exit 1', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'connector-fixture-lint-shapes-'));
  const fixturePath = join(directory, 'malformed.json');
  t.after(() => rmSync(directory, { recursive: true }));
  writeFileSync(fixturePath, JSON.stringify({
    connector: {},
    action: [],
    mode: 'dry-run',
    scopes: [''],
    approval: [],
    input: 'not-an-object',
    expected: null
  }));

  for (const format of ['json', 'markdown']) {
    const result = spawnSync(process.execPath, [
      'bin/connector-fixture-lint.js',
      fixturePath,
      '--format',
      format
    ], {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8'
    });

    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /\[object Object\]/);
    const connectorCode = format === 'markdown' ? /invalid\\_connector/ : /invalid_connector/;
    const scopeCode = format === 'markdown' ? /invalid\\_scope/ : /invalid_scope/;
    assert.match(result.stdout, connectorCode);
    assert.match(result.stdout, scopeCode);
  }
});

test('write-like fixtures require approval', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'approval_required'));
});

test('write-action classification uses a leading verb boundary', () => {
  const fixture = {
    connector: 'forum',
    mode: 'read-only',
    scopes: ['history.read'],
    approval: { required: false },
    input: {},
    expected: {}
  };

  for (const action of ['read_post_history', 'repost_summary', 'updated_record']) {
    const result = lintFixture(`${action}.json`, { ...fixture, action });
    assert.equal(
      result.issues.some((issue) => issue.code === 'approval_required'),
      false,
      `${action} must remain read-like`
    );
  }

  for (const action of ['post_message', 'createNote', 'delete']) {
    const result = lintFixture(`${action}.json`, { ...fixture, action });
    assert.ok(
      result.issues.some((issue) => issue.code === 'approval_required'),
      `${action} must remain write-like`
    );
  }
});

test('write fixtures declare expected writes for dry-run comparison', () => {
  const report = lintPath('test/fixtures/bad/unsafe-write.json');
  assert.ok(report.results[0].issues.some((issue) => issue.code === 'expected_writes'));
});

test('malformed nested write evidence has path-specific errors', () => {
  const report = lintPath('test/fixtures/bad/malformed-write-evidence.json');
  const errors = report.results[0].issues.filter((issue) => issue.severity === 'error');
  assert.deepEqual(errors.map((issue) => issue.path), [
    '$.approval.reason',
    '$.expected.writes[0]',
    '$.expected.writes[1]',
    '$.expected.writes[2]'
  ]);
});

test('expected writes accept only documented string and object shapes', () => {
  const result = lintFixture('write-evidence.json', {
    connector: 'crm',
    action: 'createNote',
    mode: 'write',
    scopes: ['crm.write'],
    approval: { required: true, reason: 'approved in CRM-42' },
    input: {},
    expected: {
      writes: [
        'audit event CRM-42',
        { operation: 'create', target: 'crm.note' },
        false,
        0,
        true,
        null,
        [],
        '   ',
        {},
        { operation: '', target: 'crm.note' },
        { operation: 'create', target: 42 }
      ]
    }
  });

  assert.deepEqual(
    result.issues.filter((issue) => issue.code === 'invalid_expected_write').map((issue) => issue.path),
    Array.from({ length: 9 }, (_, index) => `$.expected.writes[${index + 2}]`)
  );
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
  assert.equal(report.summary.fixtures, 6);
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
