import { describe, expect, it } from 'vitest';
import { resultMood } from './resultMood';

describe('resultMood', () => {
  it('is wow only for a personal best', () => {
    expect(resultMood({ isPersonalBest: true })).toBe('wow');
  });
  it('is happy otherwise', () => {
    expect(resultMood({})).toBe('happy');
    expect(resultMood({ isPersonalBest: false })).toBe('happy');
  });
});
