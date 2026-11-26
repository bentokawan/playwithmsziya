import { COUNT_RANGES } from '@/content/numbers';
import { pickDistractors } from '@/games/engines/choice/choice';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface CountRound {
  readonly objectId: string;
  readonly count: number;
  readonly options: readonly number[];
}

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

export function countLayout(count: number): readonly number[] {
  const rows: number[] = [];
  let remaining = Math.max(0, count);
  while (remaining > 0) {
    const take = Math.min(5, remaining);
    rows.push(take);
    remaining -= take;
  }
  return rows;
}

export function createAyoBerhitungRounds(
  config: SessionConfig,
  content: ResolvedContent,
): CountRound[] {
  const rng = createRng(config.seed);
  const [minCount, maxCount] = COUNT_RANGES[config.difficulty];
  const allCounts = Array.from({ length: maxCount - minCount + 1 }, (_, i) => minCount + i);
  const roundCount = ROUND_COUNTS[config.difficulty];
  const chosenCounts = rng.sample(allCounts, Math.min(roundCount, allCounts.length));

  const countable = [...content.objects.values()].filter((o) => o.countable && o.imageUrl !== null);
  const optionCount = 3;

  return chosenCounts.map((count) => {
    const obj = countable.length > 0 ? rng.pick(countable) : { id: 'apple' };
    const nearby: number[] = [];
    for (const delta of [-2, -1, 1, 2, -3, 3]) {
      const cand = count + delta;
      if (cand >= 1 && cand <= 20) nearby.push(cand);
    }
    const distractors = pickDistractors(count, nearby, optionCount - 1, rng);
    return {
      objectId: obj.id,
      count,
      options: rng.shuffle([count, ...distractors]),
    };
  });
}
