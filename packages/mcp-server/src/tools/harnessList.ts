import { homedir } from 'os';
import { join } from 'path';
import { FileStore } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';

interface ListArgs {
  scope?: Scope;
  topic?: string;
}

export async function handleHarnessList(args: ListArgs, projectDir: string): Promise<string> {
  const scopes: Scope[] = args.scope ? [args.scope] : ['personal', 'project'];
  const results: object[] = [];

  for (const scope of scopes) {
    const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(projectDir, '.harness');
    const store = new FileStore(baseDir);
    const entries = await store.allEntries(scope);
    const filtered = args.topic ? entries.filter(e => e.topic.includes(args.topic!)) : entries;
    results.push(...filtered.map(e => ({
      id: e.id, scope: e.scope, topic: e.topic,
      filename: e.filename, preview: e.content.slice(0, 100),
    })));
  }

  return JSON.stringify(results);
}
