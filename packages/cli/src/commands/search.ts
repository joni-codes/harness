import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerSearch(program: Command): void {
  program
    .command('search <query>')
    .description('Search harness entries')
    .action(async (query: string) => {
      const lower = query.toLowerCase();
      for (const scope of ['personal', 'project'] as Scope[]) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        const entries = await store.allEntries(scope);
        const matches = entries.filter(e =>
          e.content.toLowerCase().includes(lower) || e.topic.toLowerCase().includes(lower)
        );
        for (const e of matches) {
          console.log(`${chalk.gray(e.id)}  ${chalk.cyan(e.scope + '/' + e.topic)}  ${e.content.slice(0, 80)}`);
        }
      }
    });
}
