# Connector Fixture Linter Skill PRD

## Goal

Provide a local-first CLI and reusable skill instructions for checking connector fixtures before they are used in dry-run rehearsals or release-candidate evidence.

## Scope

- Read one fixture JSON file or a directory of fixture JSON files
- Validate required connector/action fields
- Detect write-like actions with missing approval metadata
- Warn on likely secrets and personal data in inputs
- Emit JSON and markdown reports

## Out of Scope

- Live connector calls
- Schema registry integration
- Automatic fixture mutation

## Acceptance

- Fixture-backed tests cover valid fixtures, missing fields, unsafe writes, sensitive inputs, and directory traversal
- Smoke command produces a markdown report
- Skill instructions explain side-effect and approval boundaries
