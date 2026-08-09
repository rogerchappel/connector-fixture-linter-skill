# Connector Fixture Linter Skill

Use this skill before relying on connector or action fixtures as release evidence, especially when a fixture claims dry-run safety or documents approval boundaries.

## Required Inputs

- A local connector fixture JSON file or a directory containing at least one `.json` fixture

## Tools

- Local shell with Node.js 18 or newer
- No connector credentials are required
- No network access is required

## Side-Effect Boundaries

- Reads local fixture files
- Writes the lint report to stdout
- Does not call live connectors
- Does not mutate fixtures
- Does not approve, schedule, publish, send, delete, or update external records

## Approval Requirements

Any fixture that represents a write-like action must include explicit approval metadata. A human must approve any later live connector action separately; this linter only validates fixture readiness.

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
