# Changelog

## [Unreleased]

- Pin CI checkout and setup-node actions to immutable commit SHAs.
- Raise the supported runtime to Node.js 22 or newer, verify Node.js 22 and 24,
  and require lockfile-based `npm ci` installs in CI and release readiness.
- Render fixture- and diagnostic-controlled Markdown report values as normalized, escaped literal text.
- Add release-readiness checks for package metadata, pack contents, and CI verification.
- Reject empty fixture directories and report non-object JSON roots as structured lint errors.
- Validate fixture field shapes and report malformed values at field-specific JSON paths.
- Reject empty `expected.writes` arrays in write-mode fixtures as missing rehearsal evidence.
All notable changes to this project will be documented in this file.

## 0.1.0 - Initial release candidate

- Provides a local-first connector fixture linter CLI and skill.
- Checks fixture structure, approval metadata, allowed modes, and likely sensitive values.
- Includes fixture-backed tests, smoke checks, CI, and package contents validation.
