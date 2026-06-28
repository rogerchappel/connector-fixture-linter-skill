# Orchestration

## Inputs

- A local connector fixture JSON file or directory

## Flow

1. Discover fixture JSON files locally.
2. Parse fixture content.
3. Validate required fields and mode values.
4. Check approval metadata for write-like actions.
5. Scan fixture inputs for likely sensitive values.
6. Emit a report for release-candidate review.

## Side Effects

The CLI reads local files and writes only to stdout. It does not call connectors, mutate fixtures, or approve external actions.

## Failure Handling

Invalid JSON, missing files, and lint errors return a non-zero exit code. Warnings alone do not fail the process.
