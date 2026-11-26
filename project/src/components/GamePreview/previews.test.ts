import { describe, expect, it } from 'vitest';
import { CATALOG } from '@/games/catalog';
import { GAME_IDS } from '@/games/ids';
import { PREVIEW_BY_GAME, previewCount, previewGlyph } from './previews';

describe('previews', () => {
  it('covers every game id', () => {
    expect(Object.keys(PREVIEW_BY_GAME).sort()).toEqual([...GAME_IDS].sort());
  });

  it('uses the trace template only for tracing games', () => {
    for (const id of GAME_IDS) {
      const isTracing = CATALOG[id].mechanic === 'tracing';
      expect(PREVIEW_BY_GAME[id].template === 'trace').toBe(isTracing);
    }
  });

  it('maps level to a preview object count of 3, 5 and 8', () => {
    expect(previewCount('mudah')).toBe(3);
    expect(previewCount('sedang')).toBe(5);
    expect(previewCount('tantang')).toBe(8);
  });

  it('resolves every declared glyph to a real glyph with strokes', () => {
    for (const id of GAME_IDS) {
      const spec = PREVIEW_BY_GAME[id];
      if (spec.template !== 'trace') continue;
      expect(spec.glyph).toBeTruthy();
      const glyph = previewGlyph(spec.glyph as string);
      expect(glyph?.strokes.length).toBeGreaterThan(0);
    }
  });

  it('returns null for an unknown glyph id', () => {
    expect(previewGlyph('nope')).toBeNull();
  });
});
