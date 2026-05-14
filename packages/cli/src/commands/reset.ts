import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';
import * as readline from 'readline/promises';

export function registerReset(program: Command): void {
  program
    .command('reset')
    .description('Wipe everything including config (nuclear option)')
    .action(async () => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question(chalk.red('This will wipe ALL harness data and config. Type "reset" to confirm: '));
      rl.close();
      if (answer !== 'reset') { console.log('Cancelled.'); return; }
      const dirs = [join(homedir(), '.harness')];
      if (existsSync(join(process.cwd(), '.harness'))) dirs.push(join(process.cwd(), '.harness'));
      for (const dir of dirs) await rm(dir, { recursive: true });
      console.log(chalk.green('Reset complete. Run `harness init` to start fresh.'));
    });
}
