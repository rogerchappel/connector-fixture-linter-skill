import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function readFixtureFiles(target) {
  const stats = statSync(target);
  const files = stats.isDirectory() ? collectJson(target) : [target];
  if (files.length === 0) {
    throw new Error(`no JSON fixture files found in ${target}`);
  }
  return files.map((file) => ({
    file,
    data: JSON.parse(readFileSync(file, 'utf8'))
  }));
}

function collectJson(directory) {
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJson(path));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(path);
    }
  }
  return results.sort();
}
