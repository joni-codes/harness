import { homedir } from 'os';
import { join } from 'path';
import { FileStore, ConsolidationEngine, DEFAULT_CONFIG } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';

interface ConsolidateArgs {
  scope?: Scope;
}

export async function handleHarnessConsolidate(args: ConsolidateArgs, projectDir: string): Promise<string> {
  const scopes: Scope[] = args.scope ? [args.scope] : ['personal', 'project'];
  for (const scope of scopes) {
    const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(projectDir, '.harness');
    const store = new FileStore(baseDir);
    const engine = new ConsolidationEngine(store, DEFAULT_CONFIG);
    await engine.consolidate(scope, baseDir);
  }
  return JSON.stringify({ status: 'consolidated', scopes });
}
