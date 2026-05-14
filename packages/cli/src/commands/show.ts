import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';

export function registerShow(program: Command): void {
  program
    .command('show <filename>')
    .description('Show a harness entry by filename')
    .action(async (filename: string) => {
      for (const scope of ['personal', 'project'] as Scope[]) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        try {
          const entry = await store.loadEntry(filename);
          console.log(`ID: ${entry.id}\nScope: ${entry.scope}\nTopic: ${entry.topic}\nCreated: ${entry.created}\n\n${entry.content}`);
          return;
        } catch { /* try next scope */ }
      }
      console.error(`Entry not found: ${filename}`);
    });
}
