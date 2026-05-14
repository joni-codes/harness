import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import type { Scope } from '@harness/core';
import chalk from 'chalk';
import * as readline from 'readline/promises';

export function registerClear(program: Command): void {
  program
    .command('clear')
    .description('Delete harness entries (nuclear option)')
    .option('-s, --scope <scope>', 'personal or project')
    .option('--archive', 'Delete archive only')
    .action(async (opts: { scope?: Scope; archive?: boolean }) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const target = opts.archive ? 'archive' : opts.scope ? `${opts.scope} entries` : 'ALL entries in both scopes';
      const answer = await rl.question(chalk.red(`This will permanently delete ${target}. Type "yes" to confirm: `));
      rl.close();
      if (answer !== 'yes') { console.log('Cancelled.'); return; }

      if (opts.archive) {
        const dirs = [join(homedir(), '.harness', 'archive'), join(process.cwd(), '.harness', 'archive')];
        for (const dir of dirs) { if (existsSync(dir)) await rm(dir, { recursive: true }); }
        console.log(chalk.green('Archive cleared.'));
        return;
      }

      const scopes: Scope[] = opts.scope ? [opts.scope] : ['personal', 'project'];
      for (const scope of scopes) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness', scope) : join(process.cwd(), '.harness', scope);
        if (existsSync(baseDir)) await rm(baseDir, { recursive: true });
        console.log(chalk.green(`Cleared ${scope}.`));
      }
    });
}
