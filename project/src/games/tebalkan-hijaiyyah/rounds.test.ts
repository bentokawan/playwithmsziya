import { describe, expect, it } from 'vitest';
import { createBundledContent } from '@/lib/content/defaults';
import { createTebalkanHijaiyyahRounds } from './rounds';

describe('G07 Tebalkan Hijaiyyah rounds', () => {
  it('selects hijaiyyah by traceGroup in dev and in prod (bundled glyphs count as reviewed)', () => {
    const content = createBundledContent();
    const devRounds = createTebalkanHijaiyyahRounds(
      {
        gameId: 'tebalkan-hijaiyyah',
        difficulty: 'mudah',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'id',
        seed: 4,
      },
      content,
      false,
    );
    expect(devRounds).toHaveLength(3);
    expect(devRounds.every((r) => r.glyph.strokes.length >= 1)).toBe(true);

    const prodRounds = createTebalkanHijaiyyahRounds(
      {
        gameId: 'tebalkan-hijaiyyah',
        difficulty: 'mudah',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'id',
        seed: 4,
      },
      content,
      true,
    );
    expect(prodRounds).toHaveLength(3);

    const unreviewed = createBundledContent();
    for (const [id, h] of unreviewed.hijaiyyah) {
      unreviewed.hijaiyyah.set(id, { ...h, traceReviewed: false });
    }
    expect(
      createTebalkanHijaiyyahRounds(
        {
          gameId: 'tebalkan-hijaiyyah',
          difficulty: 'mudah',
          mode: 'solo',
          players: 1,
          profileIds: [undefined, undefined],
          locale: 'id',
          seed: 4,
        },
        unreviewed,
        true,
      ),
    ).toHaveLength(0);
  });
});
