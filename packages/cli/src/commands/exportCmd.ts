import type { Command } from 'commander';
import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@harness/core';
import type { Scope } from '@harness/core';
import { writeFile } from 'fs/promises';

export function registerExport(program: Command): void {
  program
    .command('export')
    .description('Export harness entries')
    .option('-s, --scope <scope>', 'personal or project')
    .option('-f, --format <format>', 'markdown or json', 'markdown')
    .option('-o, --output <file>', 'output file (default: stdout)')
    .action(async (opts: { scope?: Scope; format: string; output?: string }) => {
      const scopes: Scope[] = opts.scope ? [opts.scope] : ['personal', 'project'];
      const allEntries = [];
      for (const scope of scopes) {
        const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(process.cwd(), '.harness');
        const store = new FileStore(baseDir);
        allEntries.push(...await store.allEntries(scope));
      }

      let output: string;
      if (opts.format === 'json') {
        output = JSON.stringify(allEntries, null, 2);
      } else {
        output = allEntries.map(e => `## ${e.topic} (${e.scope})\n\n${e.content}\n`).join('\n---\n\n');
      }

      if (opts.output) {
        await writeFile(opts.output, output, 'utf8');
        console.log(`Exported to ${opts.output}`);
      } else {
        process.stdout.write(output);
      }
    });
}
