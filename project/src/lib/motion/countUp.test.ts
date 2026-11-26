import { describe, expect, it } from 'vitest';
import { countUpValue } from './countUp';

describe('countUpValue', () => {
  it('starts at 0', () => expect(countUpValue(0, 9, 900)).toBe(0));
  it('ends on target at duration', () => expect(countUpValue(900, 9, 900)).toBe(9));
  it('never exceeds target', () => expect(countUpValue(5000, 9, 900)).toBe(9));
  it('is between at the midpoint', () => {
    const v = countUpValue(450, 9, 900);
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(8);
  });
  it('is monotonic and integer', () => {
    let prev = 0;
    for (let t = 0; t <= 900; t += 50) {
      const v = countUpValue(t, 9, 900);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    }
  });
  it('returns 0 for non-positive targets', () => {
    expect(countUpValue(100, 0, 900)).toBe(0);
    expect(countUpValue(100, -3, 900)).toBe(0);
  });
});
