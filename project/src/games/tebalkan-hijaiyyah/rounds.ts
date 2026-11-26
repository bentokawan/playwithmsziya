import { HIJAIYYAH_GLYPHS } from '@/content/glyphs/hijaiyyah';
import type { Glyph } from '@/content/glyphs/types';
import type { HijaiyyahId } from '@/content/hijaiyyah';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface TraceHijaiyyahRound {
  readonly id: HijaiyyahId;
  readonly char: string;
  readonly glyph: Glyph;
}

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

export function createTebalkanHijaiyyahRounds(
  config: SessionConfig,
  content: ResolvedContent,
  production = Boolean(import.meta.env.PROD),
): TraceHijaiyyahRound[] {
  const rng = createRng(config.seed);
  const eligible = [...content.hijaiyyah.values()].filter(
    (h) => h.traceGroup === config.difficulty && (production ? h.traceReviewed : true),
  );
  const count = Math.min(ROUND_COUNTS[config.difficulty], eligible.length);
  const chosen = rng.sample(eligible, count);

  return chosen.map((h) => ({
    id: h.id,
    char: h.char,
    glyph: HIJAIYYAH_GLYPHS[h.id],
  }));
}
