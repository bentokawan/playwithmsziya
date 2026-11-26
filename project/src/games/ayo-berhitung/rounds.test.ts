import { describe, expect, it } from 'vitest';
import { createBundledContent } from '@/lib/content/defaults';
import type { DifficultyId } from '@/lib/session/session';
import { countLayout, createAyoBerhitungRounds } from './rounds';

function cfg(difficulty: DifficultyId) {
  return {
    gameId: 'ayo-berhitung' as const,
    difficulty,
    mode: 'solo' as const,
    players: 1 as const,
    profileIds: [undefined, undefined] as const,
    locale: 'id' as const,
    seed: 101,
  };
}

describe('G01 Ayo Berhitung rounds', () => {
  it('lays out objects in rows of five', () => {
    expect(countLayout(1)).toEqual([1]);
    expect(countLayout(5)).toEqual([5]);
    expect(countLayout(7)).toEqual([5, 2]);
    expect(countLayout(10)).toEqual([5, 5]);
    expect(countLayout(12)).toEqual([5, 5, 2]);
    expect(countLayout(20)).toEqual([5, 5, 5, 5]);
  });

  it('offers exactly 3 unique options containing the answer at every level', () => {
    const content = createBundledContent();
    for (const d of ['mudah', 'sedang', 'tantang'] as const) {
      for (const r of createAyoBerhitungRounds(cfg(d), content)) {
        expect(r.options).toHaveLength(3);
        expect(new Set(r.options).size).toBe(3);
        expect(r.options).toContain(r.count);
        expect('positions' in r).toBe(false);
      }
    }
  });

  it('is deterministic for identical seeds', () => {
    const content = createBundledContent();
    expect(createAyoBerhitungRounds(cfg('mudah'), content)).toEqual(
      createAyoBerhitungRounds(cfg('mudah'), content),
    );
  });
});
