export type Scope = 'personal' | 'project';
export type Source = 'auto' | 'manual';
export type Confidence = 'high' | 'medium';

export interface EntryFrontmatter {
  id: string;
  created: string;
  updated: string;
  scope: Scope;
  topic: string;
  source: Source;
  confidence: Confidence;
}

export interface Entry extends EntryFrontmatter {
  content: string;
  filename: string;
}

export interface IndexEntry {
  filename: string;
  summary: string;
  topic: string;
  scope: Scope;
}

export interface HarnessConfig {
  consolidation: {
    token_threshold: number;
    model: string;
    archive: boolean;
  };
}

export const DEFAULT_CONFIG: HarnessConfig = {
  consolidation: {
    token_threshold: 8000,
    model: 'claude-haiku-4-5',
    archive: true,
  },
};

export interface SaveResult {
  id: string;
  scope: Scope;
  filename: string;
  consolidated: boolean;
}
