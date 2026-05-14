import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileStore } from '../src/fileStore.js';

let tmpDir: string;
let store: FileStore;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'harness-test-'));
  store = new FileStore(tmpDir);
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true });
});

describe('FileStore.save', () => {
  it('writes entry file and returns filename', async () => {
    const entry = await store.save({
      scope: 'personal', topic: 'writing-style',
      content: 'Lead with business impact.', source: 'auto', confidence: 'high',
    });
    expect(entry.filename).toMatch(/writing-style.*\.md$/);
    expect(entry.id).toHaveLength(8);
  });

  it('updates INDEX.md after save', async () => {
    await store.save({ scope: 'personal', topic: 'tone', content: 'Be direct.', source: 'manual', confidence: 'high' });
    const index = await store.loadIndex('personal');
    expect(index).toHaveLength(1);
    expect(index[0].topic).toBeTruthy();
  });
});

describe('FileStore.loadEntry', () => {
  it('round-trips content and frontmatter', async () => {
    const saved = await store.save({ scope: 'personal', topic: 'style', content: 'Short sentences.', source: 'auto', confidence: 'high' });
    const loaded = await store.loadEntry(saved.filename);
    expect(loaded.content.trim()).toBe('Short sentences.');
    expect(loaded.topic).toBe('style');
    expect(loaded.scope).toBe('personal');
  });
});

describe('FileStore.deleteEntry', () => {
  it('removes entry and updates index', async () => {
    const saved = await store.save({ scope: 'personal', topic: 'misc', content: 'Some rule.', source: 'manual', confidence: 'medium' });
    await store.deleteEntry(saved.filename);
    const index = await store.loadIndex('personal');
    expect(index).toHaveLength(0);
  });
});
