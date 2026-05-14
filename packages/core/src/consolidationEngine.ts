import { mkdir, copyFile, readdir } from 'fs/promises';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';
import type { FileStore } from './fileStore.js';
import type { HarnessConfig, Scope } from './types.js';
import { countTokens } from './tokenCounter.js';

export class ConsolidationEngine {
  private client: Anthropic;

  constructor(
    private readonly store: FileStore,
    private readonly config: HarnessConfig,
  ) {
    this.client = new Anthropic();
  }

  async needsConsolidation(scope: Scope): Promise<boolean> {
    const entries = await this.store.allEntries(scope);
    const total = entries.reduce((sum, e) => sum + countTokens(e.content), 0);
    return total > this.config.consolidation.token_threshold;
  }

  archivePath(scope: Scope): string {
    const date = new Date().toISOString().split('T')[0];
    return join('archive', date, scope);
  }

  async consolidate(scope: Scope, baseDir: string): Promise<void> {
    const entries = await this.store.allEntries(scope);
    if (entries.length === 0) return;

    if (this.config.consolidation.archive) {
      const archiveDir = join(baseDir, this.archivePath(scope));
      await mkdir(archiveDir, { recursive: true });
      for (const entry of entries) {
        await copyFile(
          join(baseDir, scope, entry.filename),
          join(archiveDir, entry.filename),
        );
      }
    }

    const grouped = entries.reduce((acc, e) => {
      (acc[e.topic] = acc[e.topic] || []).push(e);
      return acc;
    }, {} as Record<string, typeof entries>);

    for (const [topic, group] of Object.entries(grouped)) {
      const combined = group.map(e => e.content).join('\n\n');
      const consolidated = await this.rewriteWithAI(topic, combined);

      for (const entry of group) {
        await this.store.deleteEntry(entry.filename);
      }

      await this.store.save({
        scope,
        topic,
        content: consolidated,
        source: 'auto',
        confidence: 'high',
      });
    }
  }

  private async rewriteWithAI(topic: string, content: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.config.consolidation.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are consolidating AI memory entries about "${topic}". Merge the following entries into a single, dense, clear rule. Remove duplicates. Keep the most specific and actionable version. Return only the consolidated text, no preamble.\n\n${content}`,
      }],
    });

    const block = message.content[0];
    return block.type === 'text' ? block.text.trim() : content;
  }
}
