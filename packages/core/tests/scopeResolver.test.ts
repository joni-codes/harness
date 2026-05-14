import { describe, it, expect } from 'vitest';
import { resolveScope } from '../src/scopeResolver.js';

describe('resolveScope', () => {
  it('returns personal for style/preference content', () => {
    expect(resolveScope('I prefer shorter sentences in my writing')).toBe('personal');
    expect(resolveScope('Always lead with impact, not implementation')).toBe('personal');
    expect(resolveScope('My style is to be direct and avoid filler words')).toBe('personal');
  });

  it('returns project for codebase-anchored content', () => {
    expect(resolveScope('In this repo we use camelCase for all variables')).toBe('project');
    expect(resolveScope('Our API returns snake_case JSON keys')).toBe('project');
    expect(resolveScope('This codebase uses Kotlin with coroutines')).toBe('project');
  });

  it('returns personal for ambiguous content', () => {
    expect(resolveScope('Keep things simple')).toBe('personal');
  });

  it('honors explicit override', () => {
    expect(resolveScope('In this repo we always...', 'personal')).toBe('personal');
  });
});
