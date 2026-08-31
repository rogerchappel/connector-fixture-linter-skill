# Connector Fixture Linter Skill

Local-first CLI and skill instructions for checking connector action fixtures before dry-run rehearsals or release-candidate evidence.

Requires Node.js 22 or newer. CI verifies the supported Node.js 22 and 24
release lines from the committed lockfile.

## Quickstart

```bash
npm ci
node bin/connector-fixture-lint.js test/fixtures/good --format markdown
```

## Verification

Run the same checks used for release-readiness before publishing or opening a release PR:

```bash
npm run check
npm test
npm run build
npm run smoke
npm run release:check
npm pack --dry-run
```

## CLI

```bash
connector-fixture-lint <file-or-directory> [--format json|markdown]
```

The CLI accepts exactly one target and at most one `--format` option. The
format option requires an explicit `json` or `markdown` value. `--help` and
`-h` are valid only as standalone arguments; unknown options, duplicate format
flags, and extra targets are rejected before the filesystem is accessed.

The linter validates:

- At least one `.json` fixture is discovered when the target is a directory
- Each parsed fixture has a JSON object at its root
- Required fields: `connector`, `action`, `mode`, `scopes`, `approval`, `input`, `expected`
- Non-empty string values for `connector` and `action`
- A `mode` value of `dry-run`, `read-only`, or `write`
- A non-empty `scopes` array whose entries are non-empty strings
- JSON objects for `approval`, `input`, and `expected` (arrays and `null` are not objects)
- Approval metadata for write-like actions
- Structured write approval and rehearsal evidence
- Likely secrets and personal data inside fixture inputs

Write-like actions require `approval.required: true` and a non-blank string
`approval.reason`. An action is write-like when its mode is `write`, or when
its first action word is `create`, `update`, `delete`, `send`, `post`,
`publish`, `archive`, or `invite`. Camel-case transitions and non-alphanumeric
separators delimit words, so `createNote` and `post_message` are write-like,
while `read_post_history` and `repost_summary` are not. When
`approval.reason` is supplied on any fixture, it must be a non-blank string.
Write-mode fixtures should declare an `expected.writes` array. Each entry must
be either a non-blank string shorthand or a JSON object with non-blank string
`operation` and `target` fields. Numbers, booleans, `null`, arrays, blank
strings, and objects missing either required field are invalid:

```json
{"approval":{"required":true,"reason":"approved in CRM-42"},"expected":{"writes":[{"operation":"create","target":"crm.note"},"audit event CRM-42"]}}
```

## Reports

JSON output is intended for scripts. Markdown output is intended for PR bodies and release-candidate reviews.
In Markdown reports, target paths, fixture names, file paths, and diagnostic
fields are treated as literal text: line breaks and surrounding whitespace are
normalized, and Markdown punctuation is backslash-escaped. This prevents
fixture-controlled headings, lists, links, emphasis, or code spans while
preserving the displayed text. JSON output retains the original values.

The CLI exits `0` only when it discovers at least one fixture and the report has
no errors. It exits `1` for lint errors, invalid JSON, non-object fixture roots,
empty fixture directories, and other read failures. Usage errors, such as a
missing target or malformed options, print the usage summary to stderr and exit
`2`. Non-object roots are represented in reports as an
`invalid_fixture_root` error at JSON path `$`.

Malformed fields are errors at their exact JSON paths. For example, an empty
second scope is reported as `invalid_scope` at `$.scopes[1]`. Report headings
use only valid string identifiers, so malformed connector or action values are
shown as `unknown` rather than being coerced into text.

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

`npm run release:readiness` verifies public package metadata, the CLI bin target,
supporting docs, fixture presence, npm files allowlist, and CI workflow before
runtime checks execute.

`npm run package:smoke` also verifies that the release tarball includes the code
of conduct and support files without bundling the test suite.

## CI checks

Run the same local gates that CI runs before opening a PR:

```bash
npm run check --if-present
npm run build --if-present
npm test --if-present
npm run smoke --if-present
```

## Package contents

The npm package is intentionally limited to the CLI, source, fixtures, docs, and release/support files. Check the publish preview with:

```bash
npm pack --dry-run
```
