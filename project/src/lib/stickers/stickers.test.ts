import { describe, expect, it } from 'vitest';
import { STICKERS } from '@/content/stickers';
import { createRng } from '@/lib/random/rng';
import { awardSticker } from './stickers';

describe('awardSticker', () => {
  it('awards the smallest unowned sticker number in the world', () => {
    const first = awardSticker([], 'angka', createRng(1));
    expect(first).toEqual({ stickerId: 'angka-01', isNew: true });

    const third = awardSticker(['angka-01', 'angka-02'], 'angka', createRng(1));
    expect(third).toEqual({ stickerId: 'angka-03', isNew: true });

    const gap = awardSticker(['angka-01', 'angka-03'], 'angka', createRng(1));
    expect(gap).toEqual({ stickerId: 'angka-02', isNew: true });
  });

  it('returns deterministic repeat sticker when all world stickers are owned', () => {
    const allAngka = STICKERS.angka.map((s) => s.id);
    const a = awardSticker(allAngka, 'angka', createRng(42));
    const b = awardSticker(allAngka, 'angka', createRng(42));
    expect(a.isNew).toBe(false);
    expect(a).toEqual(b);
    expect(allAngka).toContain(a.stickerId);
  });
});
