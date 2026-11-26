import { describe, expect, it } from 'vitest';
import { createBundledContent } from '@/lib/content/defaults';
import { createSusunKataRounds } from './rounds';

describe('G03 Susun Kata rounds', () => {
  it('generates exact word letters for mudah/sedang and adds 2 non-member distractors for tantang', () => {
    const content = createBundledContent();
    const easy = createSusunKataRounds(
      {
        gameId: 'susun-kata',
        difficulty: 'mudah',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'id',
        seed: 9,
      },
      content,
    );
    expect(easy).toHaveLength(3);
    for (const r of easy) {
      expect(r.word).toHaveLength(3);
      expect(r.showGhost).toBe(true);
      expect(r.tiles).toHaveLength(3);
      expect(r.tiles.map((t) => t.letter).sort()).toEqual(r.word.split('').sort());
    }

    const hard = createSusunKataRounds(
      {
        gameId: 'susun-kata',
        difficulty: 'tantang',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'en',
        seed: 9,
      },
      content,
    );
    expect(hard).toHaveLength(5);
    for (const r of hard) {
      expect(r.word).toHaveLength(5);
      expect(r.showGhost).toBe(false);
      expect(r.tiles).toHaveLength(7);
      expect(new Set(r.tiles.map((t) => t.id)).size).toBe(7);
    }
  });
});
