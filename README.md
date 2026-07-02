# Connector Fixture Linter Skill

Local-first CLI and skill instructions for checking connector action fixtures before dry-run rehearsals or release-candidate evidence.

## Quickstart

```bash
npm install
node bin/connector-fixture-lint.js test/fixtures/good --format markdown
```

## CLI

```bash
connector-fixture-lint <file-or-directory> [--format json|markdown]
```

The linter validates:

- Required fields: `connector`, `action`, `mode`, `scopes`, `approval`, `input`, `expected`
- Mode values: `dry-run`, `read-only`, or `write`
- Approval metadata for write-like actions
- Likely secrets and personal data inside fixture inputs

## Reports

JSON output is intended for scripts. Markdown output is intended for PR bodies and release-candidate reviews.

## Safety Notes

- The tool reads local JSON and writes reports to stdout.
- It does not call connectors or mutate fixture files.
- Sensitive-value detection is heuristic and should be reviewed by a human.
- A passing fixture lint is not approval to run a live external action.

## Development

```bash
npm test
npm run check
npm run lint
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

`npm run release:check` is the broadest local gate. It runs syntax checks, tests, the build check, fixture-backed smoke, and package contents validation.
