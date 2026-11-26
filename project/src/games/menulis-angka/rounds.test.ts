import { describe, expect, it } from 'vitest';
import type { DifficultyId } from '@/lib/session/session';
import { createMenulisAngkaRounds } from './rounds';

const LEVELS: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];

function cfg(difficulty: DifficultyId) {
  return {
    gameId: 'menulis-angka' as const,
    difficulty,
    mode: 'solo' as const,
    players: 1 as const,
    profileIds: [undefined, undefined] as const,
    locale: 'id' as const,
    seed: 1,
  };
}

describe('G02 Menulis Angka rounds', () => {
  it('uses single digits only', () => {
    for (const d of LEVELS) {
      for (const r of createMenulisAngkaRounds(cfg(d))) {
        expect(r.glyph.id).toHaveLength(1);
        expect(r.num).toBeLessThanOrEqual(9);
      }
    }
  });

  it('mudah uses 1–5', () => {
    for (const r of createMenulisAngkaRounds(cfg('mudah'))) {
      expect([1, 2, 3, 4, 5]).toContain(r.num);
    }
  });

  it('never repeats a number in one session', () => {
    const nums = createMenulisAngkaRounds(cfg('tantang')).map((r) => r.num);
    expect(new Set(nums).size).toBe(nums.length);
  });
});
