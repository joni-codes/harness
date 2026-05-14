import { mkdir, readFile, writeFile, unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import type { Entry, EntryFrontmatter, IndexEntry, Scope, Source, Confidence } from './types.js';

interface SaveInput {
  scope: Scope;
  topic: string;
  content: string;
  source: Source;
  confidence: Confidence;
}

export class FileStore {
  constructor(private readonly baseDir: string) {}

  private scopeDir(scope: Scope): string {
    return join(this.baseDir, scope);
  }

  private indexPath(scope: Scope): string {
    return join(this.scopeDir(scope), 'INDEX.md');
  }

  async save(input: SaveInput): Promise<Entry> {
    const dir = this.scopeDir(input.scope);
    await mkdir(dir, { recursive: true });

    const id = uuidv4().replace(/-/g, '').slice(0, 8);
    const now = new Date().toISOString();
    const slug = input.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const filename = `${slug}-${id}.md`;
    const filepath = join(dir, filename);

    const frontmatter: EntryFrontmatter = {
      id,
      created: now,
      updated: now,
      scope: input.scope,
      topic: input.topic,
      source: input.source,
      confidence: input.confidence,
    };

    const fileContent = matter.stringify(input.content, frontmatter);
    await writeFile(filepath, fileContent, 'utf8');

    const entry: Entry = { ...frontmatter, content: input.content, filename };
    await this.rebuildIndex(input.scope);
    return entry;
  }

  async loadEntry(filename: string): Promise<Entry> {
    const scope = this.inferScope(filename);
    const filepath = join(this.scopeDir(scope), filename);
    const raw = await readFile(filepath, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as EntryFrontmatter;
    return { ...fm, content: parsed.content.trim(), filename };
  }

  async deleteEntry(filename: string): Promise<void> {
    const scope = this.inferScope(filename);
    const filepath = join(this.scopeDir(scope), filename);
    await unlink(filepath);
    await this.rebuildIndex(scope);
  }

  async loadIndex(scope: Scope): Promise<IndexEntry[]> {
    const indexPath = this.indexPath(scope);
    if (!existsSync(indexPath)) return [];
    const raw = await readFile(indexPath, 'utf8');
    return this.parseIndex(raw);
  }

  async allEntries(scope: Scope): Promise<Entry[]> {
    const dir = this.scopeDir(scope);
    if (!existsSync(dir)) return [];
    const files = await readdir(dir);
    const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    return Promise.all(mdFiles.map(f => this.loadEntry(f)));
  }

  private async rebuildIndex(scope: Scope): Promise<void> {
    const entries = await this.allEntries(scope);
    const lines = [
      `# ${scope.charAt(0).toUpperCase() + scope.slice(1)} Harness Index\n`,
      ...entries.map(e => `- [${e.filename}](${e.filename}) — ${e.content.split('\n')[0].slice(0, 80)}`),
    ];
    await writeFile(this.indexPath(scope), lines.join('\n'), 'utf8');
  }

  private parseIndex(raw: string): IndexEntry[] {
    const lines = raw.split('\n').filter(l => l.startsWith('- ['));
    return lines.map(line => {
      const match = line.match(/\[(.+?)\]\((.+?)\) — (.+)/);
      if (!match) return null;
      return {
        filename: match[2],
        summary: match[3],
        topic: match[2].split('-').slice(0, -1).join('-'),
        scope: 'personal' as Scope,
      };
    }).filter(Boolean) as IndexEntry[];
  }

  private inferScope(filename: string): Scope {
    const personalDir = this.scopeDir('personal');
    return existsSync(join(personalDir, filename)) ? 'personal' : 'project';
  }
}
