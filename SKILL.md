# Connector Fixture Linter Skill

Use this skill before relying on connector or action fixtures as release evidence, especially when a fixture claims dry-run safety or documents approval boundaries.

## Required Inputs

- A local connector fixture JSON file or a directory containing fixture JSON files

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

## Validation

Run:

```bash
npm test
npm run check
npm run build
npm run smoke
```
