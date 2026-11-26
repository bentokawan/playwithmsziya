import { describe, expect, it } from 'vitest';
import { roundPoints, scoreSession, starsFor } from './scoring';

describe('scoring (Task 2)', () => {
  it('awards 3/2/1 points based on attempts', () => {
    expect(roundPoints({ firstTry: true, attempts: 1 })).toBe(3);
    expect(roundPoints({ firstTry: false, attempts: 2 })).toBe(2);
    expect(roundPoints({ firstTry: false, attempts: 5 })).toBe(1);
  });

  it('scores regular sessions and G08 memory pairs', () => {
    expect(
      scoreSession([
        { firstTry: true, attempts: 1 },
        { firstTry: false, attempts: 2 },
        { firstTry: false, attempts: 4 },
      ]),
    ).toEqual({ score: 6, maxScore: 9 });

    expect(scoreSession([], 3, 6)).toEqual({ score: 6, maxScore: 12 });
  });

  it('computes 1–3 stars with minimum 1 star', () => {
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(6, 10)).toBe(2);
    expect(starsFor(0, 10)).toBe(1);
    expect(starsFor(0, 0)).toBe(1);
  });
});
