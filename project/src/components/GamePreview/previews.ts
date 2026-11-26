import type { GameId } from '@/games/ids';
import { DIGIT_GLYPHS } from '@/content/glyphs/digits';
import { HIJAIYYAH_GLYPHS } from '@/content/glyphs/hijaiyyah';
import { LATIN_LOWER_GLYPHS } from '@/content/glyphs/latin-lower';
import type { Glyph } from '@/content/glyphs/types';
import type { DifficultyId } from '@/lib/session/session';

export type PreviewTemplate = 'count' | 'trace' | 'letters' | 'sound' | 'memory' | 'maze';

export interface PreviewSpec {
  readonly template: PreviewTemplate;
  readonly objectId: string;
  /** Glyph id for the `trace` template (digit, latin lower or hijaiyyah id). */
  readonly glyph?: string;
  /** Single letter tile for the `sound` template. */
  readonly letter?: string;
  /** Word shown by the `letters` template, per locale. */
  readonly word?: { readonly id: string; readonly en: string };
}

export const PREVIEW_BY_GAME: Record<GameId, PreviewSpec> = {
  'ayo-berhitung': { template: 'count', objectId: 'apple' },
  'menulis-angka': { template: 'trace', objectId: 'star', glyph: '3' },
  'susun-kata': {
    template: 'letters',
    objectId: 'ball',
    word: { id: 'BOLA', en: 'BALL' },
  },
  'bunyi-awal': { template: 'sound', objectId: 'ball', letter: 'B' },
  'menulis-huruf': { template: 'trace', objectId: 'pencil', glyph: 'a' },
  'dengar-temukan': { template: 'sound', objectId: 'lantern' },
  'tebalkan-hijaiyyah': { template: 'trace', objectId: 'moon', glyph: 'alif' },
  'kartu-kembar': { template: 'memory', objectId: 'cat' },
  'petualangan-labirin': { template: 'maze', objectId: 'carrot' },
};

const PREVIEW_COUNT: Record<DifficultyId, 3 | 5 | 8> = {
  mudah: 3,
  sedang: 5,
  tantang: 8,
};

/** Number of objects the `count` preview shows. Preview-only, not a game rule. */
export function previewCount(level: DifficultyId): 3 | 5 | 8 {
  return PREVIEW_COUNT[level];
}

export function previewGlyph(id: string): Glyph | null {
  const digit = DIGIT_GLYPHS[id];
  if (digit) return digit;
  const latin = LATIN_LOWER_GLYPHS[id];
  if (latin) return latin;
  const hijaiyyah = (HIJAIYYAH_GLYPHS as Record<string, Glyph | undefined>)[id];
  return hijaiyyah ?? null;
}
