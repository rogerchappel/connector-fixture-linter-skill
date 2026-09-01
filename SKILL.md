# Connector Fixture Linter Skill

Use this skill before relying on connector or action fixtures as release evidence, especially when a fixture claims dry-run safety or documents approval boundaries.

## Required Inputs

- A local connector fixture JSON file or a directory containing at least one `.json` fixture

## Tools

- Local shell with Node.js 22 or newer
- No connector credentials are required
- No network access is required

## Side-Effect Boundaries

- Reads local fixture files
- Writes the lint report to stdout
- Does not call live connectors
- Does not mutate fixtures
- Does not approve, schedule, publish, send, delete, or update external records

## Approval Requirements

Any fixture that represents a write-like action must include explicit approval metadata. Write mode is always write-like. Otherwise, the first action word must exactly match `create`, `update`, `delete`, `send`, `post`, `publish`, `archive`, or `invite`; camel-case transitions and non-alphanumeric separators delimit action words. A human must approve any later live connector action separately; this linter only validates fixture readiness.

Set `approval.required` to `true` and provide a non-blank string
`approval.reason` for write-like actions. If any fixture supplies a reason, it
must have that same shape. For write mode, use a non-empty `expected.writes`
array. An empty array is an error because it cannot substantiate the fixture's
expected side effects. Entries are non-blank strings or JSON objects containing non-blank string
`operation` and `target` fields. Booleans, numbers, `null`, arrays, blank
strings, and malformed objects are invalid write evidence:

```json
{"approval":{"required":true,"reason":"approved in CRM-42"},"expected":{"writes":[{"operation":"create","target":"crm.note"}]}}
```

## Example

```bash
npx connector-fixture-linter-skill test/fixtures/good --format markdown
```

Supply exactly one fixture target and no more than one `--format json` or
`--format markdown` option. A format value is required. Use `--help` or `-h`
only by itself. Invalid options, duplicate format flags, extra targets, and
non-standalone help print usage to stderr and exit `2` without reading fixture
paths. Valid lint runs exit `0` when clean or `1` for lint and read failures.

## Validation

Run:

```bash
npm test
npm run check
npm run build
npm run smoke
```

Treat any non-zero CLI exit as failed validation. Empty fixture directories do
not provide release evidence, and fixture files must contain a JSON object at
their root. Each fixture needs non-empty string `connector` and `action`
identifiers, an allowed `mode`, a non-empty array of non-empty string `scopes`,
and JSON objects for `approval`, `input`, and `expected`.
