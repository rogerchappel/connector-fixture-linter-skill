#!/usr/bin/env node
import { lintPath } from '../src/linter.js';
import { toJsonReport, toMarkdownReport } from '../src/reporters.js';

function usage() {
  return `Usage: connector-fixture-lint <file-or-directory> [--format json|markdown]

Validates local connector action fixtures. No connector calls are made.`;
}

function parseArgs(argv) {
  const args = { target: null, format: 'json' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--help' || value === '-h') {
      args.help = true;
    } else if (value === '--format') {
      args.format = argv[index + 1] || 'json';
      index += 1;
    } else if (!args.target) {
      args.target = value;
    } else {
      throw new Error(`Unexpected argument: ${value}`);
    }
  }
  if (!['json', 'markdown'].includes(args.format)) {
    throw new Error('--format must be json or markdown');
  }
  return args;
}

try {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    process.exit(0);
  }
  if (!args.target) {
    console.error(usage());
    process.exit(2);
  }
  const report = lintPath(args.target);
  console.log(args.format === 'markdown' ? toMarkdownReport(report) : toJsonReport(report));
  process.exit(report.summary.errors > 0 ? 1 : 0);
} catch (error) {
  console.error(`connector-fixture-lint: ${error.message}`);
  process.exit(1);
}
