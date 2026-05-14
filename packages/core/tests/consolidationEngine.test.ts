import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileStore } from '../src/fileStore.js';
import { ConsolidationEngine } from '../src/consolidationEngine.js';
import type { HarnessConfig } from '../src/types.js';

let tmpDir: string;
let store: FileStore;
let engine: ConsolidationEngine;

const config: HarnessConfig = {
  consolidation: { token_threshold: 100, model: 'claude-haiku-4-5', archive: true },
};

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'harness-consolidation-'));
  store = new FileStore(tmpDir);
  engine = new ConsolidationEngine(store, config);
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true });
});

describe('ConsolidationEngine.needsConsolidation', () => {
  it('returns false when under threshold', async () => {
    await store.save({ scope: 'personal', topic: 'style', content: 'Short rule.', source: 'auto', confidence: 'high' });
    const needs = await engine.needsConsolidation('personal');
    expect(needs).toBe(false);
  });

  it('returns true when entries exceed token threshold', async () => {
    const longContent = 'word '.repeat(200);
    for (let i = 0; i < 3; i++) {
      await store.save({ scope: 'personal', topic: 'style', content: longContent, source: 'auto', confidence: 'high' });
    }
    const needs = await engine.needsConsolidation('personal');
    expect(needs).toBe(true);
  });
});

describe('ConsolidationEngine.archivePath', () => {
  it('returns date-stamped archive path', () => {
    const path = engine.archivePath('personal');
    expect(path).toMatch(/archive\/\d{4}-\d{2}-\d{2}\/personal/);
  });
});
