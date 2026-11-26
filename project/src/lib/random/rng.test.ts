import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('produces identical sequences for the same seed', () => {
    const a = createRng(123456);
    const b = createRng(123456);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('keeps int() within inclusive bounds across 1000 calls', () => {
    const rng = createRng(42);
    for (let i = 0; i < 1000; i++) {
      const val = rng.int(3, 9);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(9);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('preserves multiset on shuffle without mutating input', () => {
    const rng = createRng(99);
    const input = [1, 2, 2, 3, 4, 5, 5];
    const snapshot = input.slice();
    const shuffled = rng.shuffle(input);
    expect(input).toEqual(snapshot);
    expect(shuffled.slice().sort((a, b) => a - b)).toEqual(input.slice().sort((a, b) => a - b));
  });

  it('samples unique elements and throws RangeError when n > length', () => {
    const rng = createRng(7);
    const items = ['a', 'b', 'c', 'd'];
    const picked = rng.sample(items, 3);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    expect(() => rng.sample(items, 5)).toThrow(RangeError);
  });
});
