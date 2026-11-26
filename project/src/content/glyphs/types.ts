export type GlyphPoint = readonly [number, number];

export interface GlyphStroke {
  /** Polyline points in logical 100x100 box (x right, y down), ordered by write direction. */
  readonly points: readonly GlyphPoint[];
  /** true = single-tap dot (nuqthah), points has 1 point. */
  readonly dot?: boolean;
}

export interface Glyph {
  readonly id: string;
  readonly strokes: readonly GlyphStroke[];
}
