import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import type { HarnessConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge(base: HarnessConfig, override: DeepPartial<HarnessConfig>): HarnessConfig {
  return {
    consolidation: { ...base.consolidation, ...(override.consolidation ?? {}) },
  };
}

function readJson(path: string): DeepPartial<HarnessConfig> {
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as DeepPartial<HarnessConfig>;
  } catch {
    return {};
  }
}

export function globalConfigPath(): string {
  return join(homedir(), '.harness', 'config.json');
}

export function projectConfigPath(projectDir: string): string {
  return join(projectDir, '.harness', 'config.json');
}

export function loadConfig(projectDir: string): HarnessConfig {
  const global = existsSync(globalConfigPath()) ? readJson(globalConfigPath()) : {};
  const project = existsSync(projectConfigPath(projectDir)) ? readJson(projectConfigPath(projectDir)) : {};
  return deepMerge(deepMerge(DEFAULT_CONFIG, global), project);
}

export function saveConfig(config: DeepPartial<HarnessConfig>, scope: 'global' | 'project', projectDir: string): void {
  const path = scope === 'global' ? globalConfigPath() : projectConfigPath(projectDir);
  const dir = path.substring(0, path.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const existing = existsSync(path) ? readJson(path) : {};
  const merged: DeepPartial<HarnessConfig> = {
    ...existing,
    ...config,
    consolidation: { ...(existing.consolidation ?? {}), ...(config.consolidation ?? {}) },
  };
  writeFileSync(path, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
}

export function resetConfig(scope: 'global' | 'project', projectDir: string): void {
  const path = scope === 'global' ? globalConfigPath() : projectConfigPath(projectDir);
  if (existsSync(path)) writeFileSync(path, '{}\n', 'utf-8');
}
