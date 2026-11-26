import { describe, expect, it } from 'vitest';
import type { Glyph } from '@/content/glyphs/types';
import {
  INITIAL_TRACE_STATE,
  pointerDown,
  pointerMove,
  pointerUp,
  prepareGlyph,
  toleranceForLevel,
} from './tracing';

const FIXTURE_A: Glyph = {
  id: 'A',
  strokes: [
    { points: [[50, 12], [22, 88]] },
    { points: [[50, 12], [78, 88]] },
    { points: [[33, 62], [67, 62]] },
  ],
};

const FIXTURE_1: Glyph = {
  id: '1',
  strokes: [{ points: [[38, 26], [52, 12], [52, 88]] }],
};

const FIXTURE_BA: Glyph = {
  id: 'ba',
  strokes: [
    { points: [[86, 46], [84, 58], [76, 64], [50, 66], [24, 64], [16, 58], [14, 48]] },
    { points: [[50, 80]], dot: true },
  ],
};

function traceStroke(
  state: typeof INITIAL_TRACE_STATE,
  prepared: ReturnType<typeof prepareGlyph>,
  strokeIdx: number,
  tol = 14,
) {
  const samples = prepared.strokes[strokeIdx].samples;
  let cur = pointerDown(state, prepared, samples[0], tol).state;
  for (let i = 1; i < samples.length; i++) {
    cur = pointerMove(cur, prepared, samples[i], tol).state;
  }
  return pointerUp(cur);
}

describe('tracing engine (§T)', () => {
  it('toleranceForLevel returns forgiving tolerances per level and thickLines', () => {
    expect(toleranceForLevel('mudah')).toBe(14);
    expect(toleranceForLevel('sedang')).toBe(11);
    expect(toleranceForLevel('tantang')).toBe(9);
    expect(toleranceForLevel('mudah', true)).toBeCloseTo(18.2);
  });

  it('accepts a start press within 2.5×tol of the current target', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const s0 = prep.strokes[0].samples[0];
    const p = { x: s0.x + 14 * 2.4, y: s0.y };
    expect(pointerDown(INITIAL_TRACE_STATE, prep, p, 14).accepted).toBe(true);
  });

  it('rejects a start press beyond 2.5×tol and counts it', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const s0 = prep.strokes[0].samples[0];
    const r = pointerDown(INITIAL_TRACE_STATE, prep, { x: s0.x + 14 * 2.6, y: s0.y }, 14);
    expect(r.accepted).toBe(false);
    expect(r.state.rejectedStarts).toBe(1);
  });

  it('advances across a 20-unit jump in one move', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const samples = prep.strokes[0].samples;
    const down = pointerDown(INITIAL_TRACE_STATE, prep, samples[0], 14).state;
    const res = pointerMove(down, prep, samples[10], 14);
    expect(res.state.progress).toBeGreaterThanOrEqual(10);
  });

  it('completes a stroke at 90% progress', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const samples = prep.strokes[0].samples;
    const idx = Math.ceil(0.9 * (samples.length - 1));
    let cur = pointerDown(INITIAL_TRACE_STATE, prep, samples[0], 4).state;
    let last = { state: cur, strokeCompleted: false };
    for (let i = 1; i <= idx; i++) {
      last = pointerMove(cur, prep, samples[i], 4);
      cur = last.state;
      if (last.strokeCompleted) break;
    }
    expect(last.strokeCompleted).toBe(true);
    expect(last.state.done).toBe(true);
  });

  it('resumes from progress after pointer up', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const samples = prep.strokes[0].samples;
    let cur = pointerDown(INITIAL_TRACE_STATE, prep, samples[0], 14).state;
    for (let i = 1; i <= 8; i++) {
      cur = pointerMove(cur, prep, samples[i], 14).state;
    }
    const saved = cur.progress;
    expect(saved).toBeGreaterThanOrEqual(8);
    cur = pointerUp(cur);
    const r = pointerDown(cur, prep, samples[saved], 14);
    expect(r.accepted).toBe(true);
    expect(r.state.progress).toBe(saved);
  });

  it('completes straight glyph 1 from start to end', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const done = traceStroke(INITIAL_TRACE_STATE, prep, 0);
    expect(done.done).toBe(true);
    expect(done.rejectedStarts).toBe(0);
  });

  it('rejects starting at the wrong end', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const lastPt = prep.strokes[0].samples.at(-1)!;
    const res = pointerDown(INITIAL_TRACE_STATE, prep, lastPt, 14);
    expect(res.accepted).toBe(false);
    expect(res.state.rejectedStarts).toBe(1);
    expect(res.state.done).toBe(false);
  });

  it('does not complete on random off-path zig-zag strokes', () => {
    const prep = prepareGlyph(FIXTURE_1);
    let cur = pointerDown(INITIAL_TRACE_STATE, prep, prep.strokes[0].samples[0], 14).state;
    for (let i = 0; i < 10; i++) {
      cur = pointerMove(cur, prep, { x: i % 2 === 0 ? 10 : 90, y: 10 + i * 7 }, 11).state;
    }
    expect(cur.done).toBe(false);
  });

  it('enforces stroke order on A (stroke 2 cannot be filled before stroke 1)', () => {
    const prep = prepareGlyph(FIXTURE_A);
    // Attempt stroke 2 (index 1) first -> starts at [50, 12] which is also stroke 1 start,
    // so move along stroke 2's right leg [78, 88]: stroke 1 should NOT complete.
    let cur = pointerDown(INITIAL_TRACE_STATE, prep, { x: 50, y: 12 }, 11).state;
    for (const pt of prep.strokes[1].samples) {
      cur = pointerMove(cur, prep, pt, 11).state;
    }
    expect(cur.strokeIndex).toBe(0);
    expect(cur.done).toBe(false);

    // Now trace all 3 strokes in order
    let s = INITIAL_TRACE_STATE;
    s = traceStroke(s, prep, 0, 14);
    s = traceStroke(s, prep, 1, 14);
    s = traceStroke(s, prep, 2, 14);
    expect(s.done).toBe(true);
  });

  it('accepts lifting and resuming from last progress', () => {
    const prep = prepareGlyph(FIXTURE_1);
    const samples = prep.strokes[0].samples;
    const mid = Math.floor(samples.length / 2);

    let cur = pointerDown(INITIAL_TRACE_STATE, prep, samples[0], 14).state;
    for (let i = 1; i <= mid; i++) {
      cur = pointerMove(cur, prep, samples[i], 14).state;
    }
    cur = pointerUp(cur);
    const savedProgress = cur.progress;
    expect(savedProgress).toBeGreaterThanOrEqual(mid);
    expect(savedProgress).toBeLessThan(samples.length - 1);

    const resume = pointerDown(cur, prep, samples[savedProgress], 14);
    expect(resume.accepted).toBe(true);
    cur = resume.state;
    for (let i = savedProgress + 1; i < samples.length; i++) {
      cur = pointerMove(cur, prep, samples[i], 14).state;
    }
    expect(cur.done).toBe(true);
  });

  it('completes dot stroke on hijaiyyah ba with a single tap', () => {
    const prep = prepareGlyph(FIXTURE_BA);
    const cur = traceStroke(INITIAL_TRACE_STATE, prep, 0, 14);
    expect(cur.strokeIndex).toBe(1);
    expect(cur.done).toBe(false);

    const tap = pointerDown(cur, prep, { x: 50, y: 80 }, 14);
    expect(tap.accepted).toBe(true);
    expect(tap.strokeCompleted).toBe(true);
    expect(tap.state.done).toBe(true);
  });
});
