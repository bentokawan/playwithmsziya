import type { MemoryCard } from '@/games/engines/memory/memory';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface MemoryRound {
  readonly cards: readonly MemoryCard[];
  readonly cols: number;
  readonly rows: number;
}

const GRID_SPEC: Record<DifficultyId, { readonly pairs: number; readonly cols: number; readonly rows: number }> = {
  mudah: { pairs: 3, cols: 3, rows: 2 },
  sedang: { pairs: 4, cols: 4, rows: 2 },
  tantang: { pairs: 6, cols: 4, rows: 3 },
};

export function createKartuKembarRounds(
  config: SessionConfig,
  content: ResolvedContent,
): MemoryRound[] {
  const rng = createRng(config.seed);
  const spec = GRID_SPEC[config.difficulty];
  const eligible = [...content.objects.values()].filter((o) => o.cardFace && o.imageUrl !== null);
  const faces = rng.sample(eligible, Math.min(spec.pairs, eligible.length)).map((o) => o.id);

  const deck: MemoryCard[] = [];
  for (const face of faces) {
    deck.push({ id: `${face}-a`, face });
    deck.push({ id: `${face}-b`, face });
  }

  return [
    {
      cards: rng.shuffle(deck),
      cols: spec.cols,
      rows: spec.rows,
    },
  ];
}
