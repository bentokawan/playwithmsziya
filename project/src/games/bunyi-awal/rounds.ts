import { pickDistractors } from '@/games/engines/choice/choice';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface InitialRound {
  readonly word: string;
  readonly objectId: string;
  readonly options: readonly string[];
}

const CONFUSABLE_GROUPS: readonly (readonly string[])[] = [
  ['B', 'D', 'P'],
  ['M', 'N', 'W'],
  ['I', 'J', 'L'],
  ['C', 'G', 'O'],
  ['U', 'V'],
  ['E', 'F'],
];

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

function sameConfusableGroup(a: string, b: string): boolean {
  return CONFUSABLE_GROUPS.some((g) => g.includes(a) && g.includes(b));
}

export function createBunyiAwalRounds(
  config: SessionConfig,
  content: ResolvedContent,
): InitialRound[] {
  const rng = createRng(config.seed);
  const eligible = content.words.filter((w) => {
    if (w.locale !== config.locale || !w.initial) return false;
    const obj = content.objects.get(w.objectId);
    return Boolean(obj?.imageUrl);
  });

  const count = Math.min(ROUND_COUNTS[config.difficulty], eligible.length);
  const chosenWords = rng.sample(eligible, count);
  const letterPool = Array.from(new Set(eligible.map((w) => w.word[0])));

  const optionCount = config.difficulty === 'mudah' ? 2 : config.difficulty === 'sedang' ? 3 : 4;

  return chosenWords.map((item) => {
    const answer = item.word[0];
    const distractors = pickDistractors(answer, letterPool, optionCount - 1, rng, {
      exclude:
        config.difficulty === 'mudah'
          ? (c) => sameConfusableGroup(answer, c)
          : undefined,
      requireOneOf:
        config.difficulty === 'tantang'
          ? (c) => sameConfusableGroup(answer, c)
          : undefined,
    });
    return {
      word: item.word,
      objectId: item.objectId,
      options: rng.shuffle([answer, ...distractors]),
    };
  });
}
