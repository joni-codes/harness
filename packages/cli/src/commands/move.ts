import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerMove(program: Command): void {
  program
    .command('move <filename>')
    .description('Move an entry between scopes')
    .requiredOption('-s, --scope <scope>', 'Target scope: personal or project')
    .action(async (filename: string, opts: { scope: Scope }) => {
      for (const sourceScope of ['personal', 'project'] as Scope[]) {
        const sourceBase = sourceScope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const targetBase = opts.scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const sourceStore = new FileStore(sourceBase);
        const targetStore = new FileStore(targetBase);
        try {
          const entry = await sourceStore.loadEntry(filename);
          await sourceStore.deleteEntry(filename);
          await targetStore.save({ scope: opts.scope, topic: entry.topic, content: entry.content, source: entry.source, confidence: entry.confidence });
          console.log(chalk.green(`Moved to ${opts.scope}.`));
          return;
        } catch { /* try next scope */ }
      }
      console.error(`Entry not found: ${filename}`);
    });
}
