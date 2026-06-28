const PATTERNS = [
  { code: 'secret_token', pattern: /\b(?:sk|ghp|gho|xoxb|xoxp)_[A-Za-z0-9_=-]{12,}\b/g },
  { code: 'bearer_token', pattern: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/g },
  { code: 'email', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  { code: 'phone', pattern: /\b(?:\+?\d[\d .()-]{8,}\d)\b/g }
];

export function findSensitiveValues(value, path = '$') {
  const findings = [];
  if (typeof value === 'string') {
    for (const { code, pattern } of PATTERNS) {
      if (pattern.test(value)) {
        findings.push({ path, code, sample: mask(value) });
      }
      pattern.lastIndex = 0;
    }
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findings.push(...findSensitiveValues(item, `${path}[${index}]`)));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => findings.push(...findSensitiveValues(item, `${path}.${key}`)));
  }
  return findings;
}

function mask(value) {
  return value.length > 10 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '***';
}
