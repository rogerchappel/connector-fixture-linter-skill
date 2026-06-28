export function toJsonReport(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function toMarkdownReport(report) {
  const lines = [
    '# Connector Fixture Lint Report',
    '',
    `Target: ${report.target}`,
    `Fixtures: ${report.summary.fixtures}`,
    `Errors: ${report.summary.errors}`,
    `Warnings: ${report.summary.warnings}`,
    ''
  ];
  for (const result of report.results) {
    lines.push(`## ${result.fixtureName}`, '', `File: ${result.file}`);
    if (!result.issues.length) {
      lines.push('', '- pass');
      continue;
    }
    lines.push('');
    for (const issue of result.issues) {
      const sample = issue.sample ? ` (${issue.sample})` : '';
      lines.push(`- ${issue.severity}: ${issue.code} at ${issue.path} - ${issue.message}${sample}`);
    }
  }
  return `${lines.join('\n')}\n`;
}
