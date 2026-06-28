# Security Policy

## Supported Versions

The `main` branch receives security fixes for the current release-candidate package.

## Reporting a Vulnerability

Please report suspected vulnerabilities through GitHub Security Advisories or by opening a private issue with enough detail to reproduce the problem safely.

Do not include live secrets, customer data, or production connector payloads in reports. Redact sensitive fixture values and describe the connector/action shape instead.

## Scope

`connector-fixture-linter-skill` is a local-only CLI. It reads connector fixture files from disk and writes reports to stdout. It should not call connector APIs or mutate fixture inputs.
