import { HIJAIYYAH_EASY_POOL } from '@/content/hijaiyyah';
import { CATALOG } from '@/games/catalog';
import type { GameId } from '@/games/ids';
import type { DifficultyId, Locale } from '@/lib/session/session';
import type { ResolvedContent } from './types';

export interface LevelReadiness {
  readonly have: number;
  readonly need: number;
}

export interface Readiness {
  readonly gameId: GameId;
  readonly ready: boolean;
  readonly perLevel: Record<DifficultyId, LevelReadiness>;
  readonly missing: readonly string[];
}

const ALL_LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
const NUMBERS_MUDAH = [1, 2, 3, 4, 5];
const NUMBERS_SEDANG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const NUMBERS_TANTANG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const LETTERS_MUDAH = ['e', 'f', 'h', 'i', 'l', 't', 'a', 'k', 'm', 'n', 'v', 'w', 'x', 'y', 'z'];
const LETTERS_SEDANG = ['b', 'c', 'd', 'g', 'j', 'o', 'p', 'q', 'r', 's', 'u'];

function countSpeech(
  content: ResolvedContent,
  kind: 'num' | 'letter',
  locale: Locale,
  keys: readonly (number | string)[],
  production: boolean,
): number {
  if (!production) return keys.length;
  return keys.filter((key) =>
    kind === 'num'
      ? content.speechUrl({ kind: 'num', locale, key: key as number }) !== null
      : content.speechUrl({ kind: 'letter', locale, key: key as string }) !== null,
  ).length;
}

export function computeReadiness(
  content: ResolvedContent,
  gameId: GameId,
  opts: { readonly production: boolean; readonly locale?: Locale },
): Readiness {
  const { production } = opts;
  const locales: readonly Locale[] = opts.locale ? [opts.locale] : ['id', 'en'];
  const rounds = CATALOG[gameId].rounds;
  const missing: string[] = [];

  if (gameId === 'ayo-berhitung') {
    const have = [...content.objects.values()].filter(
      (o) => o.countable && o.imageUrl !== null,
    ).length;
    const need = 4;
    if (have < need) missing.push(`countable objects (${have}/${need})`);
    return {
      gameId,
      ready: have >= need,
      perLevel: {
        mudah: { have, need },
        sedang: { have, need },
        tantang: { have, need },
      },
      missing,
    };
  }

  if (gameId === 'menulis-angka') {
    const mudahHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'num', loc, NUMBERS_MUDAH, production)),
    );
    const sedangHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'num', loc, NUMBERS_SEDANG, production)),
    );
    const tantangHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'num', loc, NUMBERS_TANTANG, production)),
    );
    const perLevel: Record<DifficultyId, LevelReadiness> = {
      mudah: { have: mudahHave, need: rounds.mudah },
      sedang: { have: sedangHave, need: rounds.sedang },
      tantang: { have: tantangHave, need: rounds.tantang },
    };
    for (const lvl of ['mudah', 'sedang', 'tantang'] as const) {
      if (perLevel[lvl].have < perLevel[lvl].need) {
        missing.push(`num audio ${lvl} (${perLevel[lvl].have}/${perLevel[lvl].need})`);
      }
    }
    return { gameId, ready: missing.length === 0, perLevel, missing };
  }

  if (gameId === 'menulis-huruf') {
    const mudahHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'letter', loc, LETTERS_MUDAH, production)),
    );
    const sedangHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'letter', loc, LETTERS_SEDANG, production)),
    );
    const tantangHave = Math.min(
      ...locales.map((loc) => countSpeech(content, 'letter', loc, ALL_LETTERS, production)),
    );
    const perLevel: Record<DifficultyId, LevelReadiness> = {
      mudah: { have: mudahHave, need: rounds.mudah },
      sedang: { have: sedangHave, need: rounds.sedang },
      tantang: { have: tantangHave, need: rounds.tantang },
    };
    for (const lvl of ['mudah', 'sedang', 'tantang'] as const) {
      if (perLevel[lvl].have < perLevel[lvl].need) {
        missing.push(`letter audio ${lvl} (${perLevel[lvl].have}/${perLevel[lvl].need})`);
      }
    }
    return { gameId, ready: missing.length === 0, perLevel, missing };
  }

  if (gameId === 'susun-kata') {
    const lengths: Record<DifficultyId, number> = { mudah: 3, sedang: 4, tantang: 5 };
    const need = 6;
    const perLevel = {} as Record<DifficultyId, LevelReadiness>;
    for (const lvl of ['mudah', 'sedang', 'tantang'] as const) {
      const len = lengths[lvl];
      const counts = locales.map((loc) =>
        content.words.filter((w) => {
          if (w.locale !== loc || !w.spell || w.word.length !== len) return false;
          const obj = content.objects.get(w.objectId);
          if (!obj || obj.imageUrl === null) return false;
          if (production && w.audioUrl === null) return false;
          return true;
        }).length,
      );
      const have = Math.min(...counts);
      perLevel[lvl] = { have, need };
      if (have < need) missing.push(`spell words ${lvl} (${have}/${need})`);
    }
    return { gameId, ready: missing.length === 0, perLevel, missing };
  }

  if (gameId === 'bunyi-awal') {
    const need = 8;
    const minLetters = 4;
    let minHave = Infinity;
    for (const loc of locales) {
      const eligible = content.words.filter((w) => {
        if (w.locale !== loc || !w.initial) return false;
        const obj = content.objects.get(w.objectId);
        if (!obj || obj.imageUrl === null) return false;
        if (production && w.audioUrl === null) return false;
        return true;
      });
      const distinctInitials = new Set(eligible.map((w) => w.word[0])).size;
      minHave = Math.min(minHave, eligible.length);
      if (eligible.length < need) {
        missing.push(`initial words ${loc} (${eligible.length}/${need})`);
      }
      if (distinctInitials < minLetters) {
        missing.push(`distinct initials ${loc} (${distinctInitials}/${minLetters})`);
      }
    }
    const have = Number.isFinite(minHave) ? minHave : 0;
    return {
      gameId,
      ready: missing.length === 0,
      perLevel: {
        mudah: { have, need },
        sedang: { have, need },
        tantang: { have, need },
      },
      missing,
    };
  }

  if (gameId === 'dengar-temukan') {
    const allEligible = [...content.hijaiyyah.values()].filter((h) =>
      production ? h.audioReviewed && h.audioUrl !== null : true,
    );
    const easySet = new Set<string>(HIJAIYYAH_EASY_POOL);
    const easyHave = allEligible.filter((h) => easySet.has(h.id)).length;
    const allHave = allEligible.length;
    const perLevel: Record<DifficultyId, LevelReadiness> = {
      mudah: { have: easyHave, need: 10 },
      sedang: { have: allHave, need: 12 },
      tantang: { have: allHave, need: 12 },
    };
    if (easyHave < 10) missing.push(`hijaiyyah easy audio (${easyHave}/10)`);
    if (allHave < 12) missing.push(`hijaiyyah audio (${allHave}/12)`);
    return { gameId, ready: missing.length === 0, perLevel, missing };
  }

  if (gameId === 'tebalkan-hijaiyyah') {
    const perLevel = {} as Record<DifficultyId, LevelReadiness>;
    for (const lvl of ['mudah', 'sedang', 'tantang'] as const) {
      const have = [...content.hijaiyyah.values()].filter(
        (h) => h.traceGroup === lvl && (production ? h.traceReviewed : true),
      ).length;
      const need = rounds[lvl];
      perLevel[lvl] = { have, need };
      if (have < need) missing.push(`hijaiyyah trace ${lvl} (${have}/${need})`);
    }
    return { gameId, ready: missing.length === 0, perLevel, missing };
  }

  if (gameId === 'kartu-kembar') {
    const have = [...content.objects.values()].filter(
      (o) => o.cardFace && o.imageUrl !== null,
    ).length;
    const need = 6;
    if (have < need) missing.push(`card face objects (${have}/${need})`);
    return {
      gameId,
      ready: have >= need,
      perLevel: {
        mudah: { have, need },
        sedang: { have, need },
        tantang: { have, need },
      },
      missing,
    };
  }

  // petualangan-labirin (G09)
  const have = [...content.objects.values()].filter(
    (o) => o.mazeGoal && o.imageUrl !== null,
  ).length;
  const need = 1;
  if (have < need) missing.push(`maze goal objects (${have}/${need})`);
  return {
    gameId,
    ready: have >= need,
    perLevel: {
      mudah: { have, need },
      sedang: { have, need },
      tantang: { have, need },
    },
    missing,
  };
}
