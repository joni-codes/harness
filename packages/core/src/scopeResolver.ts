import type { Scope } from './types.js';

const PROJECT_SIGNALS = [
  'in this repo', 'in this codebase', 'our codebase', 'our api', 'our team',
  'this project', 'this repo', 'this codebase', 'in the codebase', 'our stack', 'our database',
  'this service', 'our service', 'our conventions', 'in this app',
];

const PERSONAL_SIGNALS = [
  'i prefer', 'my style', 'for me', 'i always', 'i like', 'i want',
  'my preference', 'generally i', 'always ', 'never ', 'from now on',
];

export function resolveScope(content: string, override?: Scope): Scope {
  if (override) return override;

  const lower = content.toLowerCase();

  for (const signal of PROJECT_SIGNALS) {
    if (lower.includes(signal)) return 'project';
  }

  for (const signal of PERSONAL_SIGNALS) {
    if (lower.includes(signal)) return 'personal';
  }

  return 'personal';
}
