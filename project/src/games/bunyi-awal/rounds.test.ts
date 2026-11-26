import { describe, expect, it } from 'vitest';
import { createBundledContent } from '@/lib/content/defaults';
import { createBunyiAwalRounds } from './rounds';

describe('G04 Bunyi Awal rounds', () => {
  it('always includes the answer, respects option counts, and omits showRest at every level', () => {
    const content = createBundledContent();
    const easyId = createBunyiAwalRounds(
      {
        gameId: 'bunyi-awal',
        difficulty: 'mudah',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'id',
        seed: 12,
      },
      content,
    );
    expect(easyId).toHaveLength(3);
    for (const r of easyId) {
      expect(r.options).toHaveLength(2);
      expect(r.options).toContain(r.word[0]);
      expect('showRest' in r).toBe(false);
    }

    const hardEn = createBunyiAwalRounds(
      {
        gameId: 'bunyi-awal',
        difficulty: 'tantang',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'en',
        seed: 12,
      },
      content,
    );
    expect(hardEn).toHaveLength(5);
    for (const r of hardEn) {
      expect(r.options).toHaveLength(4);
      expect(r.options).toContain(r.word[0]);
      expect('showRest' in r).toBe(false);
    }
  });
});
