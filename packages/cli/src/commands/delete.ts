import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';
import * as readline from 'readline/promises';

export function registerDelete(program: Command): void {
  program
    .command('delete <filename>')
    .description('Delete a harness entry')
    .action(async (filename: string) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question(`Delete ${filename}? (y/N) `);
      rl.close();
      if (answer.toLowerCase() !== 'y') { console.log('Cancelled.'); return; }

      for (const scope of ['personal', 'project'] as Scope[]) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        try {
          await store.deleteEntry(filename);
          console.log(chalk.green('Deleted.'));
          return;
        } catch { /* try next scope */ }
      }
      console.error(`Entry not found: ${filename}`);
    });
}
