import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import { spawnSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import chalk from 'chalk';

export function registerEdit(program: Command): void {
  program
    .command('edit <filename>')
    .description('Edit a harness entry in $EDITOR')
    .action(async (filename: string) => {
      for (const scope of ['personal', 'project'] as Scope[]) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        try {
          const entry = await store.loadEntry(filename);
          const tmpFile = join(tmpdir(), `harness-edit-${Date.now()}.md`);
          writeFileSync(tmpFile, entry.content, 'utf8');
          spawnSync(process.env['EDITOR'] ?? 'vi', [tmpFile], { stdio: 'inherit' });
          const updated = readFileSync(tmpFile, 'utf8').trim();
          await store.deleteEntry(filename);
          await store.save({ scope, topic: entry.topic, content: updated, source: 'manual', confidence: 'high' });
          console.log(chalk.green('Updated.'));
          return;
        } catch { /* try next scope */ }
      }
      console.error(`Entry not found: ${filename}`);
    });
}
