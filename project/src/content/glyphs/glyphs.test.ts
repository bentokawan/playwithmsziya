import { describe, expect, it } from 'vitest';
import { HIJAIYYAH_IDS } from '@/content/hijaiyyah';
import { DIGIT_GLYPHS } from './digits';
import { HIJAIYYAH_GLYPHS } from './hijaiyyah';
import { LATIN_LOWER_GLYPHS } from './latin-lower';
import { LATIN_UPPER_GLYPHS } from './latin-upper';
import type { Glyph } from './types';

function assertValidGlyph(glyph: Glyph) {
  expect(glyph.strokes.length).toBeGreaterThanOrEqual(1);
  for (const s of glyph.strokes) {
    expect(s.points.length).toBeGreaterThanOrEqual(1);
    if (s.dot) expect(s.points).toHaveLength(1);
    for (const [x, y] of s.points) {
      expect(x).toBeGreaterThanOrEqual(10);
      expect(x).toBeLessThanOrEqual(90);
      expect(y).toBeGreaterThanOrEqual(10);
      expect(y).toBeLessThanOrEqual(90);
    }
  }
}

describe('glyph datasets', () => {
  it('defines valid digits 0-9', () => {
    for (let d = 0; d <= 9; d++) {
      const g = DIGIT_GLYPHS[String(d)];
      expect(g).toBeDefined();
      assertValidGlyph(g);
    }
  });

  it('defines valid Latin A-Z and a-z', () => {
    for (let i = 0; i < 26; i++) {
      const up = String.fromCharCode(65 + i);
      const lo = String.fromCharCode(97 + i);
      expect(LATIN_UPPER_GLYPHS[up]).toBeDefined();
      expect(LATIN_LOWER_GLYPHS[lo]).toBeDefined();
      assertValidGlyph(LATIN_UPPER_GLYPHS[up]);
      assertValidGlyph(LATIN_LOWER_GLYPHS[lo]);
    }
  });

  it('defines all 28 valid hijaiyyah glyphs', () => {
    expect(Object.keys(HIJAIYYAH_GLYPHS)).toHaveLength(28);
    for (const id of HIJAIYYAH_IDS) {
      expect(HIJAIYYAH_GLYPHS[id]).toBeDefined();
      assertValidGlyph(HIJAIYYAH_GLYPHS[id]);
    }
  });
});
