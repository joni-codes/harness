import { describe, it, expect } from 'vitest';
import { isDuplicate } from '../src/deduplicator.js';
import { countTokens } from '../src/tokenCounter.js';

describe('isDuplicate', () => {
  it('returns true for near-identical content', () => {
    const existing = ['Lead with business impact, not implementation details.'];
    expect(isDuplicate('Lead with business impact not implementation.', existing)).toBe(true);
  });

  it('returns false for clearly different content', () => {
    const existing = ['Use short sentences.'];
    expect(isDuplicate('Always lead with the business impact.', existing)).toBe(false);
  });

  it('returns false for empty existing list', () => {
    expect(isDuplicate('Some new rule.', [])).toBe(false);
  });
});

describe('countTokens', () => {
  it('estimates token count as approximately chars/4', () => {
    const text = 'a'.repeat(400);
    const count = countTokens(text);
    expect(count).toBeGreaterThanOrEqual(90);
    expect(count).toBeLessThanOrEqual(110);
  });
});
