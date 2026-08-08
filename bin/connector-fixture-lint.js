#!/usr/bin/env node
import { lintPath } from '../src/linter.js';
import { toJsonReport, toMarkdownReport } from '../src/reporters.js';

function usage() {
  return `Usage: connector-fixture-lint <file-or-directory> [--format json|markdown]

Validates local connector action fixtures. No connector calls are made.`;
}

class UsageError extends Error {}

function parseArgs(argv) {
  const args = { target: null, format: 'json' };
  let formatSeen = false;

  if (argv.includes('--help') || argv.includes('-h')) {
    if (argv.length !== 1) {
      throw new UsageError('--help must be used by itself');
    }
    return { ...args, help: true };
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--format') {
      if (formatSeen) {
        throw new UsageError('--format may only be specified once');
      }
      const format = argv[index + 1];
      if (!format || format.startsWith('-')) {
        throw new UsageError('Missing value for --format');
      }
      args.format = format;
      formatSeen = true;
      index += 1;
    } else if (value.startsWith('-')) {
      throw new UsageError(`Unknown option: ${value}`);
    } else if (!args.target) {
      args.target = value;
    } else {
      throw new UsageError(`Unexpected argument: ${value}`);
    }
  }
  if (!['json', 'markdown'].includes(args.format)) {
    throw new UsageError('--format must be json or markdown');
  }
  if (!args.target) {
    throw new UsageError('Missing file-or-directory target');
  }
  return args;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }
  const report = lintPath(args.target);
  console.log(args.format === 'markdown' ? toMarkdownReport(report) : toJsonReport(report));
  process.exit(report.summary.errors > 0 ? 1 : 0);
} catch (error) {
  console.error(`connector-fixture-lint: ${error.message}`);
  if (error instanceof UsageError) {
    console.error(`\n${usage()}`);
    process.exit(2);
  }
  process.exit(1);
}
