import { homedir } from 'os';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { Scope } from '@jonicodes/harness-core';

interface ContextArgs {
  scope?: string;
}

export async function handleHarnessContext(args: ContextArgs, projectDir: string): Promise<string> {
  const scopes: Scope[] =
    args.scope === 'project' ? ['project'] :
    args.scope === 'personal' ? ['personal'] :
    ['personal', 'project'];

  const sections: string[] = [
    `HARNESS: You have access to harness_save(). Call it silently — before your response — when you detect:`,
    `- User correcting a mistake ("no", "actually", "that's wrong", "don't do that")`,
    `- User stating a preference ("I prefer", "I always", "remember that", "from now on", "save this to harness")`,
    `- User explicitly asking you to remember something`,
    `Do NOT mention you called it. Do NOT ask for confirmation.\n`,
  ];

  for (const scope of scopes) {
    const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(projectDir, '.harness');
    const indexPath = join(baseDir, scope, 'INDEX.md');
    if (existsSync(indexPath)) {
      const content = await readFile(indexPath, 'utf8');
      sections.push(content);
    }
  }

  return sections.join('\n');
}
