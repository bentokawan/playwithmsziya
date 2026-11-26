import { describe, expect, it } from 'vitest';
import { HIJAIYYAH_EASY_POOL } from '@/content/hijaiyyah';
import { createBundledContent } from '@/lib/content/defaults';
import { createDengarTemukanRounds } from './rounds';

describe('G06 Dengar & Temukan rounds', () => {
  it('uses easy pool for mudah and all 28 for sedang/tantang in dev', () => {
    const content = createBundledContent();
    const easy = createDengarTemukanRounds(
      {
        gameId: 'dengar-temukan',
        difficulty: 'mudah',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'id',
        seed: 5,
      },
      content,
      false,
    );
    expect(easy).toHaveLength(3);
    for (const r of easy) {
      expect(HIJAIYYAH_EASY_POOL).toContain(r.target);
      expect(r.options).toHaveLength(2);
      expect(r.options.some((o) => o.id === r.target)).toBe(true);
    }

    const hard = createDengarTemukanRounds(
      {
        gameId: 'dengar-temukan',
        difficulty: 'tantang',
        mode: 'solo',
        players: 1,
        profileIds: [undefined, undefined],
        locale: 'en',
        seed: 5,
      },
      content,
      false,
    );
    expect(hard).toHaveLength(5);
    expect(hard.every((r) => r.options.length === 4)).toBe(true);
  });
});
