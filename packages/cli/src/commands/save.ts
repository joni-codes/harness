import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore, resolveScope, isDuplicate, ConsolidationEngine } from '@jonicodes/harness-core';
import { loadConfig } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerSave(program: Command): void {
  program
    .command('save <content>')
    .description('Explicitly save a learning to the harness')
    .option('-s, --scope <scope>', 'personal or project')
    .option('-t, --topic <topic>', 'topic tag')
    .action(async (content: string, opts: { scope?: string; topic?: string }) => {
      const scope = resolveScope(content, opts.scope as Scope | undefined);
      const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
      const store = new FileStore(baseDir);
      const engine = new ConsolidationEngine(store, loadConfig(process.cwd()));

      const index = await store.loadIndex(scope);
      if (isDuplicate(content, index.map(i => i.summary))) {
        console.log(chalk.yellow('Similar entry already exists. Skipping.'));
        return;
      }

      const topic = opts.topic ?? content.split(' ').slice(0, 2).join('-');
      const entry = await store.save({ scope, topic, content, source: 'manual', confidence: 'high' });
      console.log(chalk.green(`Saved [${entry.id}] → ${scope}/${entry.filename}`));

      if (await engine.needsConsolidation(scope)) {
        console.log(chalk.blue('Consolidating...'));
        await engine.consolidate(scope, baseDir);
        console.log(chalk.blue('Done.'));
      }
    });
}
