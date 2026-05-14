import { homedir } from 'os';
import { join } from 'path';
import {
  FileStore,
  ConsolidationEngine,
  resolveScope,
  isDuplicate,
} from '@jonicodes/harness-core';
import { loadConfig } from '@jonicodes/harness-core';
import type { Scope } from '@jonicodes/harness-core';

interface SaveArgs {
  content: string;
  scope?: string;
  topic?: string;
}

export async function handleHarnessSave(args: SaveArgs, projectDir: string): Promise<string> {
  const scope = resolveScope(args.content, args.scope as Scope | undefined);
  const baseDir = scope === 'personal' ? join(homedir(), '.harness') : join(projectDir, '.harness');
  const store = new FileStore(baseDir);
  const engine = new ConsolidationEngine(store, loadConfig(projectDir));

  const index = await store.loadIndex(scope);
  if (isDuplicate(args.content, index.map(i => i.summary))) {
    return JSON.stringify({ status: 'duplicate', message: 'Similar entry already exists.' });
  }

  const topic = args.topic ?? inferTopic(args.content);
  const entry = await store.save({ scope, topic, content: args.content, source: 'auto', confidence: 'high' });

  let consolidated = false;
  if (await engine.needsConsolidation(scope)) {
    await engine.consolidate(scope, baseDir);
    consolidated = true;
  }

  return JSON.stringify({ status: 'saved', id: entry.id, scope, filename: entry.filename, consolidated });
}

function inferTopic(content: string): string {
  const words = content.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  return words.slice(0, 2).join('-') || 'general';
}
