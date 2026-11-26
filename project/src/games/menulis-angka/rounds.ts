import { DIGIT_GLYPHS } from '@/content/glyphs/digits';
import type { Glyph } from '@/content/glyphs/types';
import { TRACE_NUMBER_POOLS } from '@/content/numbers';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface TraceNumberRound {
  readonly num: number;
  readonly glyph: Glyph;
}

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

function glyphForNumber(n: number): Glyph {
  return DIGIT_GLYPHS[String(n)];
}

export function createMenulisAngkaRounds(config: SessionConfig): TraceNumberRound[] {
  const rng = createRng(config.seed);
  const pool = TRACE_NUMBER_POOLS[config.difficulty];
  const chosen = rng.sample(pool, ROUND_COUNTS[config.difficulty]);
  return chosen.map((num) => ({
    num,
    glyph: glyphForNumber(num),
  }));
}
