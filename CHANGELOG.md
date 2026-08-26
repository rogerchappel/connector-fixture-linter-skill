# Changelog

## [Unreleased]

- Pin CI checkout and setup-node actions to immutable commit SHAs.
- Verify the fixture linter on Node.js 18, 20, and 22 with explicit check, test, smoke, and build gates before the release-readiness check.
- Render fixture- and diagnostic-controlled Markdown report values as normalized, escaped literal text.
- Add release-readiness checks for package metadata, pack contents, and CI verification.
- Reject empty fixture directories and report non-object JSON roots as structured lint errors.
- Validate fixture field shapes and report malformed values at field-specific JSON paths.
All notable changes to this project will be documented in this file.

## 0.1.0 - Initial release candidate

- Provides a local-first connector fixture linter CLI and skill.
- Checks fixture structure, approval metadata, allowed modes, and likely sensitive values.
- Includes fixture-backed tests, smoke checks, CI, and package contents validation.
