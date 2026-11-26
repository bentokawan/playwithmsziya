import { pickDistractors } from '@/games/engines/choice/choice';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface SpellTile {
  readonly id: string;
  readonly letter: string;
}

export interface SpellRound {
  readonly word: string;
  readonly objectId: string;
  readonly tiles: readonly SpellTile[];
  readonly showGhost: boolean;
}

const ROUND_COUNTS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

const WORD_LENGTHS: Record<DifficultyId, number> = {
  mudah: 3,
  sedang: 4,
  tantang: 5,
};

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export function createSusunKataRounds(
  config: SessionConfig,
  content: ResolvedContent,
): SpellRound[] {
  const rng = createRng(config.seed);
  const targetLen = WORD_LENGTHS[config.difficulty];
  const eligible = content.words.filter((w) => {
    if (w.locale !== config.locale || !w.spell || w.word.length !== targetLen) return false;
    const obj = content.objects.get(w.objectId);
    return Boolean(obj?.imageUrl);
  });

  const count = Math.min(ROUND_COUNTS[config.difficulty], eligible.length);
  const chosen = rng.sample(eligible, count);

  return chosen.map((item) => {
    const letters = item.word.split('');
    const wordSet = new Set(letters);
    const extraLetters =
      config.difficulty === 'tantang'
        ? pickDistractors(letters[0], ALPHABET, 2, rng, {
            exclude: (c) => wordSet.has(c),
          })
        : [];
    const allLetters = [...letters, ...extraLetters];
    const tiles: SpellTile[] = rng.shuffle(
      allLetters.map((letter, idx) => ({ id: `${item.word}-${idx}-${letter}`, letter })),
    );
    return {
      word: item.word,
      objectId: item.objectId,
      tiles,
      showGhost: config.difficulty === 'mudah',
    };
  });
}
