# Example Report Notes

The smoke command scans both passing and failing fixtures. It is expected to exit non-zero when the full fixture corpus includes intentionally bad examples; use the report to verify that missing fields, approval failures, and sensitive inputs are detected.

For release checks on a real fixture directory, errors should be resolved before evidence is used in a connector readiness PR.
