export { FileStore } from './fileStore.js';
export { resolveScope } from './scopeResolver.js';
export { isDuplicate } from './deduplicator.js';
export { countTokens, countTokensForEntries } from './tokenCounter.js';
export { ConsolidationEngine } from './consolidationEngine.js';
export type { Entry, Scope, Source, Confidence, HarnessConfig, SaveResult, IndexEntry, EntryFrontmatter } from './types.js';
export { DEFAULT_CONFIG } from './types.js';
export { loadConfig, saveConfig, resetConfig, globalConfigPath, projectConfigPath } from './configLoader.js';
