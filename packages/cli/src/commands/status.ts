import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore, countTokensForEntries } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerStatus(program: Command): void {
  program
    .command('status')
    .description('Show harness token counts and entry counts')
    .action(async () => {
      for (const scope of ['personal', 'project'] as Scope[]) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        const entries = await store.allEntries(scope);
        const tokens = countTokensForEntries(entries.map(e => e.content));
        console.log(`${chalk.bold(scope)}: ${entries.length} entries, ~${tokens} tokens`);
      }
    });
}
