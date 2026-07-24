# Example Report Notes

The smoke command scans both passing and failing fixtures. It is expected to exit non-zero when the full fixture corpus includes intentionally bad examples; use the report to verify that missing fields, approval failures, and sensitive inputs are detected.

For release checks on a real fixture directory, errors should be resolved before evidence is used in a connector readiness PR.

The CLI exits `0` only when at least one JSON fixture is discovered and the
report contains no errors. Empty directories exit `1` with a diagnostic.
Fixtures whose parsed root is `null`, a scalar, or an array produce a
file-specific `invalid_fixture_root` error at `$` and also exit `1`.
