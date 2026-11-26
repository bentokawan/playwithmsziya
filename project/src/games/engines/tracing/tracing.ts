import type { Glyph, GlyphPoint } from '@/content/glyphs/types';
import type { DifficultyId } from '@/lib/session/session';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface PreparedStroke {
  readonly samples: readonly Point[];
  readonly dot: boolean;
}

export interface PreparedGlyph {
  readonly id: string;
  readonly strokes: readonly PreparedStroke[];
}

export interface TraceState {
  readonly strokeIndex: number;
  readonly progress: number;
  readonly done: boolean;
  readonly rejectedStarts: number;
  readonly active: boolean;
}

export const INITIAL_TRACE_STATE: TraceState = {
  strokeIndex: 0,
  progress: 0,
  done: false,
  rejectedStarts: 0,
  active: false,
};

export const START_RADIUS_FACTOR = 2.5;
export const LOOKAHEAD_SAMPLES = 15;
export const COMPLETE_RATIO = 0.9;

export function toleranceForLevel(difficulty: DifficultyId, thickLines = false): number {
  const base = difficulty === 'mudah' ? 14 : difficulty === 'sedang' ? 11 : 9;
  return thickLines ? base * 1.3 : base;
}

export function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resamplePolyline(points: readonly GlyphPoint[], step = 2): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return [{ x: points[0][0], y: points[0][1] }];

  const out: Point[] = [{ x: points[0][0], y: points[0][1] }];
  for (let i = 1; i < points.length; i++) {
    const p0: Point = { x: points[i - 1][0], y: points[i - 1][1] };
    const p1: Point = { x: points[i][0], y: points[i][1] };
    const segLen = dist(p0, p1);
    if (segLen === 0) continue;
    const steps = Math.max(1, Math.ceil(segLen / step));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      out.push({
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
      });
    }
  }
  return out;
}

export function prepareGlyph(glyph: Glyph): PreparedGlyph {
  return {
    id: glyph.id,
    strokes: glyph.strokes.map((s) => ({
      samples: s.dot
        ? [{ x: s.points[0][0], y: s.points[0][1] }]
        : resamplePolyline(s.points, 2),
      dot: Boolean(s.dot),
    })),
  };
}

function advanceStroke(state: TraceState, prepared: PreparedGlyph): TraceState {
  const nextStroke = state.strokeIndex + 1;
  if (nextStroke >= prepared.strokes.length) {
    return {
      ...state,
      strokeIndex: nextStroke,
      progress: 0,
      done: true,
      active: false,
    };
  }
  return {
    ...state,
    strokeIndex: nextStroke,
    progress: 0,
    active: false,
  };
}

export function pointerDown(
  state: TraceState,
  prepared: PreparedGlyph,
  p: Point,
  tol: number,
): { readonly state: TraceState; readonly accepted: boolean; readonly strokeCompleted: boolean } {
  if (state.done) return { state, accepted: false, strokeCompleted: false };
  const stroke = prepared.strokes[state.strokeIndex];
  if (!stroke || stroke.samples.length === 0) {
    return { state, accepted: false, strokeCompleted: false };
  }

  const target = stroke.samples[Math.min(state.progress, stroke.samples.length - 1)];
  if (dist(p, target) <= tol * START_RADIUS_FACTOR) {
    if (stroke.dot) {
      return {
        state: advanceStroke(state, prepared),
        accepted: true,
        strokeCompleted: true,
      };
    }
    return {
      state: { ...state, active: true },
      accepted: true,
      strokeCompleted: false,
    };
  }

  return {
    state: { ...state, rejectedStarts: state.rejectedStarts + 1, active: false },
    accepted: false,
    strokeCompleted: false,
  };
}

export function pointerMove(
  state: TraceState,
  prepared: PreparedGlyph,
  p: Point,
  tol: number,
): { readonly state: TraceState; readonly strokeCompleted: boolean } {
  if (state.done || !state.active) return { state, strokeCompleted: false };
  const stroke = prepared.strokes[state.strokeIndex];
  if (!stroke) return { state, strokeCompleted: false };

  const maxLookahead = Math.min(stroke.samples.length - 1, state.progress + LOOKAHEAD_SAMPLES);
  let best = state.progress;
  for (let j = state.progress + 1; j <= maxLookahead; j++) {
    if (dist(p, stroke.samples[j]) <= tol) {
      best = j;
    }
  }

  if (best === state.progress) {
    return { state, strokeCompleted: false };
  }

  if (best >= Math.ceil(COMPLETE_RATIO * (stroke.samples.length - 1))) {
    return { state: advanceStroke(state, prepared), strokeCompleted: true };
  }

  return {
    state: { ...state, progress: best },
    strokeCompleted: false,
  };
}

export function pointerUp(state: TraceState): TraceState {
  if (!state.active) return state;
  return { ...state, active: false };
}
