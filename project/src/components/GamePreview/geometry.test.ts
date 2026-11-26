import { describe, expect, it } from 'vitest';
import { smoothPath } from './geometry';

describe('smoothPath', () => {
  it('returns empty string for no points', () => {
    expect(smoothPath([])).toBe('');
  });
  it('moves to a single point', () => {
    expect(smoothPath([[0, 0]])).toBe('M 0 0');
  });
  it('draws a line for two points', () => {
    expect(
      smoothPath([
        [0, 0],
        [10, 0],
      ]),
    ).toBe('M 0 0 L 10 0');
  });
  it('rounds corners with quadratic segments for 3+ points', () => {
    expect(
      smoothPath([
        [0, 0],
        [10, 0],
        [10, 10],
      ]),
    ).toBe('M 0 0 Q 10 0 10 5 L 10 10');
  });
});
