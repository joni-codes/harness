import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import {
  loadConfig,
  saveConfig,
  resetConfig,
  globalConfigPath,
  projectConfigPath,
  DEFAULT_CONFIG,
} from '@jonicodes/harness-core';

const VALID_KEYS: Record<string, { path: string[]; type: 'number' | 'boolean' | 'string'; description: string }> = {
  'consolidation.token_threshold': { path: ['consolidation', 'token_threshold'], type: 'number', description: 'Token count before auto-consolidation triggers' },
  'consolidation.model':           { path: ['consolidation', 'model'],           type: 'string',  description: 'AI model used for consolidation' },
  'consolidation.archive':         { path: ['consolidation', 'archive'],         type: 'boolean', description: 'Archive entries before consolidating' },
};

function parseValue(key: string, raw: string): number | boolean | string {
  const spec = VALID_KEYS[key];
  if (!spec) throw new Error(`Unknown config key: ${key}`);
  if (spec.type === 'number') {
    const n = Number(raw);
    if (isNaN(n)) throw new Error(`${key} must be a number`);
    return n;
  }
  if (spec.type === 'boolean') {
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    throw new Error(`${key} must be true or false`);
  }
  return raw;
}

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    if (!cur[path[i]]) cur[path[i]] = {};
    cur = cur[path[i]] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

export function registerConfig(program: Command): void {
  const cmd = program
    .command('config')
    .description('View and edit Harness configuration');

  cmd
    .command('show')
    .description('Show current config (merged global + project)')
    .action(() => {
      const projectDir = resolve(process.cwd());
      const config = loadConfig(projectDir);
      console.log(chalk.bold('\nCurrent config (merged):'));
      console.log(chalk.dim(`  Global:  ${globalConfigPath()}`));
      console.log(chalk.dim(`  Project: ${projectConfigPath(projectDir)}\n`));
      for (const [key, spec] of Object.entries(VALID_KEYS)) {
        const parts = spec.path;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = parts.reduce((o: any, k) => o?.[k], config as unknown);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const def = parts.reduce((o: any, k) => o?.[k], DEFAULT_CONFIG as unknown);
        const marker = val !== def ? chalk.yellow(' (modified)') : '';
        console.log(`  ${chalk.cyan(key.padEnd(35))} ${val}${marker}`);
        console.log(`  ${' '.repeat(35)} ${chalk.dim(spec.description)}`);
      }
      console.log();
    });

  cmd
    .command('set <key> <value>')
    .description('Set a config value')
    .option('-s, --scope <scope>', 'global or project (default: global)', 'global')
    .action((key: string, value: string, options: { scope: string }) => {
      const projectDir = resolve(process.cwd());
      const scope = options.scope === 'project' ? 'project' : 'global';
      let parsed: number | boolean | string;
      try {
        parsed = parseValue(key, value);
      } catch (err) {
        console.error(chalk.red((err as Error).message));
        console.error(chalk.dim(`Valid keys: ${Object.keys(VALID_KEYS).join(', ')}`));
        process.exit(1);
      }
      const spec = VALID_KEYS[key];
      const update: Record<string, unknown> = {};
      setNested(update, spec.path, parsed);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      saveConfig(update as any, scope, projectDir);
      const path = scope === 'global' ? globalConfigPath() : projectConfigPath(projectDir);
      console.log(chalk.green('✓') + ` ${key} = ${parsed} (${scope}) → ${chalk.cyan(path)}`);
    });

  cmd
    .command('reset')
    .description('Reset config to defaults')
    .option('-s, --scope <scope>', 'global or project (default: global)', 'global')
    .action((options: { scope: string }) => {
      const projectDir = resolve(process.cwd());
      const scope = options.scope === 'project' ? 'project' : 'global';
      resetConfig(scope, projectDir);
      console.log(chalk.green('✓') + ` ${scope} config reset to defaults`);
    });
}
