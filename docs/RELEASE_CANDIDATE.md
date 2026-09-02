# Release Candidate Notes

## Candidate

Initial public build for `connector-fixture-linter-skill`.

The candidate supports maintained Node.js 22 and 24 release lines. CI
verification and the Node.js 24 release gate install from the committed
lockfile with `npm ci`; release-readiness checks enforce the runtime, docs, and
workflow contract against drift.

## Verification

Run the following commands from a clean checkout for each release candidate:

```sh
npm ci
npm run release:check
```

The release check validates package metadata and version SemVer, syntax, the
current test suite, required package contents, all current good fixtures, and
the installed-package CLI smoke test. CI runs verification on Node.js 22 and
24 and repeats the release gate on Node.js 24. Command output is the source of
truth for test and fixture totals so this document does not retain stale
snapshots as the suite grows.

## Classification

ship.
