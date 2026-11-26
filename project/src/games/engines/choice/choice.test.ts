import { describe, expect, it } from 'vitest';
import { createRng } from '@/lib/random/rng';
import { evaluate, pickDistractors } from './choice';

describe('choice engine', () => {
  it('evaluates exact equality', () => {
    expect(evaluate('A', 'A')).toBe(true);
    expect(evaluate('A', 'B')).toBe(false);
    expect(evaluate(5, 5)).toBe(true);
  });

  it('picks unique distractors excluding the answer and honoring exclude()', () => {
    const rng = createRng(42);
    const pool = ['A', 'B', 'C', 'D', 'E', 'F', 'B'];
    const res = pickDistractors('B', pool, 2, rng, {
      exclude: (c) => c === 'D' || c === 'P',
    });
    expect(res).toHaveLength(2);
    expect(new Set(res).size).toBe(2);
    expect(res).not.toContain('B');
    expect(res).not.toContain('D');
  });

  it('honors requireOneOf when possible and falls back safely when impossible', () => {
    const rng = createRng(7);
    const pool = ['A', 'B', 'D', 'K', 'M'];
    const res = pickDistractors('B', pool, 2, rng, {
      requireOneOf: (c) => c === 'D' || c === 'P',
    });
    expect(res).toHaveLength(2);
    expect(res).toContain('D');

    const fallback = pickDistractors('A', ['A', 'K', 'M'], 2, rng, {
      requireOneOf: (c) => c === 'Z',
    });
    expect(fallback).toHaveLength(2);
    expect(fallback).not.toContain('A');
  });
});
