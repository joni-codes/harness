import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore, ConsolidationEngine, countTokensForEntries } from '@jonicodes/harness-core';
import { loadConfig } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';
import chalk from 'chalk';

export function registerConsolidate(program: Command): void {
  program
    .command('consolidate')
    .description('Consolidate harness entries')
    .option('-s, --scope <scope>', 'personal or project')
    .option('--dry-run', 'Preview without writing')
    .action(async (opts: { scope?: Scope; dryRun?: boolean }) => {
      const scopes: Scope[] = opts.scope ? [opts.scope] : ['personal', 'project'];
      for (const scope of scopes) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        const entries = await store.allEntries(scope);
        if (entries.length === 0) { console.log(`${scope}: nothing to consolidate`); continue; }

        const tokens = countTokensForEntries(entries.map(e => e.content));
        console.log(`${chalk.bold(scope)}: ${entries.length} entries (~${tokens} tokens)`);

        if (opts.dryRun) { console.log(chalk.yellow('Dry run — no changes.')); continue; }

        const engine = new ConsolidationEngine(store, loadConfig(process.cwd()));
        await engine.consolidate(scope, baseDir);
        console.log(chalk.green('Consolidated.'));
      }
    });
}
