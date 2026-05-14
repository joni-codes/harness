import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { FileStore } from '@harness/core';
import type { Entry } from '@harness/core';
import chalk from 'chalk';

export function registerImport(program: Command): void {
  program
    .command('import <file>')
    .description('Import entries from a JSON export file')
    .action(async (file: string) => {
      const raw = await readFile(file, 'utf8');
      const entries: Entry[] = JSON.parse(raw) as Entry[];
      let count = 0;
      for (const entry of entries) {
        const baseDir = entry.scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        await store.save({ scope: entry.scope, topic: entry.topic, content: entry.content, source: entry.source, confidence: entry.confidence });
        count++;
      }
      console.log(chalk.green(`Imported ${count} entries.`));
    });
}
