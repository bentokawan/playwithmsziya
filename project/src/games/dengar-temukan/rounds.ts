import { HIJAIYYAH_EASY_POOL, type HijaiyyahId } from '@/content/hijaiyyah';
import { pickDistractors } from '@/games/engines/choice/choice';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface ListenRound {
  readonly target: HijaiyyahId;
  readonly targetChar: string;
  readonly options: readonly { readonly id: HijaiyyahId; readonly char: string }[];
}

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

export function createDengarTemukanRounds(
  config: SessionConfig,
  content: ResolvedContent,
  production = Boolean(import.meta.env.PROD),
): ListenRound[] {
  const rng = createRng(config.seed);
  const easySet = new Set<HijaiyyahId>(HIJAIYYAH_EASY_POOL);

  const allEligible = [...content.hijaiyyah.values()].filter((h) =>
    production ? h.audioReviewed && h.audioUrl !== null : true,
  );
  const pool =
    config.difficulty === 'mudah'
      ? allEligible.filter((h) => easySet.has(h.id))
      : allEligible;

  const count = Math.min(ROUND_COUNTS[config.difficulty], pool.length);
  const targets = rng.sample(pool, count);
  const optionCount = config.difficulty === 'mudah' ? 2 : config.difficulty === 'sedang' ? 3 : 4;

  return targets.map((target) => {
    const distractors = pickDistractors(target, pool, optionCount - 1, rng, {
      exclude: config.difficulty === 'mudah' ? (c) => c.family === target.family : undefined,
      requireOneOf: config.difficulty === 'tantang' ? (c) => c.family === target.family : undefined,
    });
    const options = rng.shuffle([target, ...distractors]).map((h) => ({ id: h.id, char: h.char }));
    return { target: target.id, targetChar: target.char, options };
  });
}
