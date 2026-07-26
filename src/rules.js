import { findSensitiveValues } from './sensitive.js';

const REQUIRED = ['connector', 'action', 'mode', 'scopes', 'approval', 'input', 'expected'];
const WRITE_ACTIONS = ['create', 'update', 'delete', 'send', 'post', 'publish', 'archive', 'invite'];

export function lintFixture(file, fixture) {
  if (!isFixtureObject(fixture)) {
    return {
      file,
      fixtureName: 'invalid fixture',
      issues: [error('invalid_fixture_root', 'fixture root must be a JSON object', '$')]
    };
  }

  const issues = [];
  for (const field of REQUIRED) {
    if (!(field in fixture)) {
      issues.push(error('missing_field', `${field} is required`, `$.${field}`));
    }
  }
  if ('connector' in fixture && !isNonEmptyString(fixture.connector)) {
    issues.push(error('invalid_connector', 'connector must be a non-empty string', '$.connector'));
  }
  if ('action' in fixture && !isNonEmptyString(fixture.action)) {
    issues.push(error('invalid_action', 'action must be a non-empty string', '$.action'));
  }
  if ('mode' in fixture && !['dry-run', 'read-only', 'write'].includes(fixture.mode)) {
    issues.push(error('invalid_mode', 'mode must be dry-run, read-only, or write', '$.mode'));
  }
  if ('scopes' in fixture && (!Array.isArray(fixture.scopes) || fixture.scopes.length === 0)) {
    issues.push(error('invalid_scopes', 'scopes must be a non-empty array', '$.scopes'));
  } else if (Array.isArray(fixture.scopes)) {
    fixture.scopes.forEach((scope, index) => {
      if (!isNonEmptyString(scope)) {
        issues.push(error('invalid_scope', 'scope must be a non-empty string', `$.scopes[${index}]`));
      }
    });
  }
  for (const field of ['approval', 'input', 'expected']) {
    if (field in fixture && !isFixtureObject(fixture[field])) {
      issues.push(error(`invalid_${field}`, `${field} must be a JSON object`, `$.${field}`));
    }
  }
  issues.push(...approvalIssues(fixture));
  issues.push(...expectedWriteIssues(fixture));
  const sensitiveTarget = isFixtureObject(fixture.input) ? fixture.input : fixture;
  issues.push(...findSensitiveValues(sensitiveTarget).map((finding) => warning(
    'sensitive_input',
    `fixture contains likely ${finding.code}`,
    finding.path,
    finding.sample
  )));
  return { file, fixtureName: fixtureDisplayName(fixture), issues };
}

function isFixtureObject(fixture) {
  return fixture !== null && typeof fixture === 'object' && !Array.isArray(fixture);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function fixtureDisplayName(fixture) {
  if (isNonEmptyString(fixture.name)) return fixture.name;
  const connector = isNonEmptyString(fixture.connector) ? fixture.connector : 'unknown';
  const action = isNonEmptyString(fixture.action) ? fixture.action : 'unknown';
  return `${connector}:${action}`;
}

function approvalIssues(fixture) {
  const issues = [];
  const actionName = isNonEmptyString(fixture.action) ? fixture.action.toLowerCase() : '';
  const looksWrite = fixture.mode === 'write' || WRITE_ACTIONS.some((word) => actionName.includes(word));
  if (!looksWrite) return issues;
  if (!isFixtureObject(fixture.approval)) {
    if ('approval' in fixture) return issues;
    return [error('missing_approval', 'write-like actions require approval metadata', '$.approval')];
  }
  if (fixture.approval.required !== true) {
    issues.push(error('approval_required', 'write-like actions must set approval.required true', '$.approval.required'));
  }
  if (!fixture.approval.reason) {
    issues.push(warning('approval_reason', 'approval metadata should include a reason', '$.approval.reason'));
  }
  return issues;
}

function expectedWriteIssues(fixture) {
  if (fixture.mode !== 'write') return [];
  if (!isFixtureObject(fixture.expected)) return [];
  if (!Array.isArray(fixture.expected.writes)) {
    return [warning('expected_writes', 'write fixtures should declare expected.writes for dry-run comparison', '$.expected.writes')];
  }
  return [];
}

function error(code, message, path) {
  return { severity: 'error', code, message, path };
}

function warning(code, message, path, sample) {
  return { severity: 'warning', code, message, path, sample };
}
