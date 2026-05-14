import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { handleHarnessSave } from '../src/tools/harnessSave.js';
import { handleHarnessContext } from '../src/tools/harnessContext.js';
import { handleHarnessList } from '../src/tools/harnessList.js';

let tmpDir: string;
const origHome = process.env['HOME'];

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'harness-mcp-test-'));
  process.env['HOME'] = tmpDir;
});

afterEach(async () => {
  process.env['HOME'] = origHome;
  await rm(tmpDir, { recursive: true });
});

describe('handleHarnessSave', () => {
  it('saves entry and returns id', async () => {
    const raw = await handleHarnessSave({ content: 'Always lead with business impact', scope: 'project' }, tmpDir);
    const result = JSON.parse(raw);
    expect(result.status).toBe('saved');
    expect(result.id).toBeDefined();
    expect(result.scope).toBe('project');
  });

  it('rejects duplicate', async () => {
    await handleHarnessSave({ content: 'Always lead with business impact', scope: 'project' }, tmpDir);
    const raw = await handleHarnessSave({ content: 'Always lead with business impact', scope: 'project' }, tmpDir);
    const result = JSON.parse(raw);
    expect(result.status).toBe('duplicate');
  });
});

describe('handleHarnessContext', () => {
  it('returns system prompt', async () => {
    const context = await handleHarnessContext({}, tmpDir);
    expect(context).toContain('HARNESS:');
  });

  it('includes index content after saving', async () => {
    await handleHarnessSave({ content: 'Be concise', topic: 'style', scope: 'project' }, tmpDir);
    const context = await handleHarnessContext({}, tmpDir);
    expect(context).toContain('Be concise');
  });
});

describe('handleHarnessList', () => {
  it('lists saved entries', async () => {
    await handleHarnessSave({ content: 'Rule one', topic: 'style', scope: 'project' }, tmpDir);
    await handleHarnessSave({ content: 'Rule two', topic: 'tone', scope: 'project' }, tmpDir);
    const raw = await handleHarnessList({ scope: 'project' }, tmpDir);
    const results = JSON.parse(raw);
    expect(results).toHaveLength(2);
  });
});
