export function toJsonReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

const MARKDOWN_PUNCTUATION = /[\\`*_[\]{}()<>#+\-.!|]/g;

function markdownLiteral(value) {
  return String(value)
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(MARKDOWN_PUNCTUATION, '\\$&');
}

export function toMarkdownReport(report) {
  const lines = [
    '# Connector Fixture Lint Report',
    '',
    `Target: ${markdownLiteral(report.target)}`,
    `Fixtures: ${report.summary.fixtures}`,
    `Errors: ${report.summary.errors}`,
    `Warnings: ${report.summary.warnings}`,
    ''
  ];
  for (const result of report.results) {
    lines.push(`## ${markdownLiteral(result.fixtureName)}`, '', `File: ${markdownLiteral(result.file)}`);
    if (!result.issues.length) {
      lines.push('', '- pass');
      continue;
    }
    lines.push('');
    for (const issue of result.issues) {
      const sample = issue.sample ? ` (${markdownLiteral(issue.sample)})` : '';
      lines.push(`- ${markdownLiteral(issue.severity)}: ${markdownLiteral(issue.code)} at ${markdownLiteral(issue.path)} - ${markdownLiteral(issue.message)}${sample}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
