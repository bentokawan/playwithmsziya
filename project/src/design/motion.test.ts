import { describe, expect, it } from 'vitest';
import { ENTER, SPRING, STAGGER_S, enterProps } from './motion';

describe('enterProps', () => {
  it('skips the entrance and has zero duration when calm', () => {
    const p = enterProps(true, 5);
    expect(p.initial).toBe(false);
    expect(p.animate).toEqual({ opacity: 1, y: 0 });
    expect(p.transition).toEqual({ duration: 0 });
  });
  it('starts from ENTER and staggers by index when not calm', () => {
    const p = enterProps(false, 3);
    expect(p.initial).toEqual(ENTER);
    expect(p.transition).toEqual({ ...SPRING.gentle, delay: 3 * STAGGER_S });
  });
  it('caps the stagger at index 9', () => {
    expect(enterProps(false, 40).transition).toEqual({
      ...SPRING.gentle,
      delay: 9 * STAGGER_S,
    });
  });
});
