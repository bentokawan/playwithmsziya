import { LATIN_LOWER_GLYPHS } from '@/content/glyphs/latin-lower';
import { LATIN_UPPER_GLYPHS } from '@/content/glyphs/latin-upper';
import type { Glyph } from '@/content/glyphs/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface TraceLetterRound {
  readonly letter: string;
  readonly glyph: Glyph;
}

const POOLS: Record<DifficultyId, readonly string[]> = {
  mudah: ['E', 'F', 'H', 'I', 'L', 'T', 'A', 'K', 'M', 'N', 'V', 'W', 'X', 'Y', 'Z'],
  sedang: ['B', 'C', 'D', 'G', 'J', 'O', 'P', 'Q', 'R', 'S', 'U'],
  tantang: Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
};

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

export function createMenulisHurufRounds(config: SessionConfig): TraceLetterRound[] {
  const rng = createRng(config.seed);
  const pool = POOLS[config.difficulty];
  const count = ROUND_COUNTS[config.difficulty];
  const chosen = rng.sample(pool, count);

  return chosen.map((letter) => ({
    letter,
    glyph:
      config.difficulty === 'tantang'
        ? LATIN_LOWER_GLYPHS[letter]
        : LATIN_UPPER_GLYPHS[letter],
  }));
}
