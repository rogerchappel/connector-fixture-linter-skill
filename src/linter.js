import { readFixtureFiles } from './files.js';
import { lintFixture } from './rules.js';

export function lintPath(target) {
  const results = readFixtureFiles(target).map(({ file, data }) => lintFixture(file, data));
  const issues = results.flatMap((result) => result.issues);
  return {
    target,
    summary: {
      fixtures: results.length,
      errors: issues.filter((issue) => issue.severity === 'error').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length
    },
    results
  };
}
