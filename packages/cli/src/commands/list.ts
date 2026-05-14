import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerList(program: Command): void {
  program
    .command('list')
    .description('List harness entries')
    .option('-s, --scope <scope>', 'personal or project')
    .option('-t, --topic <topic>', 'filter by topic')
    .action(async (opts: { scope?: Scope; topic?: string }) => {
      const scopes: Scope[] = opts.scope ? [opts.scope] : ['personal', 'project'];
      for (const scope of scopes) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        const entries = await store.allEntries(scope);
        const filtered = opts.topic ? entries.filter(e => e.topic.includes(opts.topic!)) : entries;
        if (filtered.length === 0) continue;
        console.log(chalk.bold(`\n${scope.toUpperCase()}`));
        for (const e of filtered) {
          console.log(`  ${chalk.gray(e.id)}  ${chalk.cyan(e.topic.padEnd(20))}  ${e.content.split('\n')[0].slice(0, 60)}`);
        }
      }
    });
}
