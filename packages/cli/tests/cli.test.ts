import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

describe('CLI build', () => {
  it('dist/index.js exists after build', () => {
    expect(existsSync(join(import.meta.dirname, '../dist/index.js'))).toBe(true);
  });
});
