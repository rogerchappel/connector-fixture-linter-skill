# Release Candidate Notes

## Candidate

Initial public build for `connector-fixture-linter-skill`.

The candidate supports maintained Node.js 22 and 24 release lines. CI
verification and the Node.js 24 release gate install from the committed
lockfile with `npm ci`; release-readiness checks enforce the runtime, docs, and
workflow contract against drift.

## Verification

Recorded on 2026-06-28:

- `npm test` passed, 5 tests
- `npm run check` passed syntax checks for CLI, src, and tests
- `npm run build` passed, 11 required files present
- `npm run smoke` passed against `test/fixtures/good`, 2 fixtures and 0 errors

Recorded on 2026-07-13:

- `npm run release:check` passed the metadata readiness validator, syntax checks,
  tests, build check, fixture-backed smoke, and npm package contents smoke.

Recorded on 2026-07-05:

- Added an `expected_writes` warning for live write-mode fixtures that do not declare `expected.writes`.
- `bash scripts/validate.sh` passed:
  - `npm test` passed, 6 tests
  - `npm run check` passed syntax checks for CLI, src, and tests
  - `npm run build` passed, 11 required files present
  - `npm run smoke` passed against `test/fixtures/good`, 2 fixtures and 0 errors

## Classification

ship.
