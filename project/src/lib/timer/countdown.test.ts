import { describe, expect, it } from 'vitest';
import {
  createClock,
  formatCountdown,
  isExpired,
  pauseClock,
  remainingAt,
  startClock,
  TIME_LIMIT_MS,
} from './countdown';

describe('countdown', () => {
  it('defines difficulty-based limits (30s / 45s / 60s)', () => {
    expect(TIME_LIMIT_MS).toEqual({
      mudah: 30_000,
      sedang: 45_000,
      tantang: 60_000,
    });
  });

  it('counts down linearly and clamps at 0', () => {
    const c0 = createClock(10_000);
    expect(remainingAt(c0, 5_000)).toBe(10_000);
    expect(isExpired(c0, 5_000)).toBe(false);

    const c1 = startClock(c0, 1_000);
    expect(remainingAt(c1, 4_500)).toBe(6_500);
    expect(isExpired(c1, 10_999)).toBe(false);
    expect(remainingAt(c1, 11_000)).toBe(0);
    expect(isExpired(c1, 11_000)).toBe(true);
    expect(remainingAt(c1, 99_000)).toBe(0);
  });

  it('preserves remaining time across pause and resume', () => {
    let c = createClock(60_000);
    c = startClock(c, 1_000);
    c = pauseClock(c, 11_000); // 10s elapsed -> 50s left
    expect(c.runningSince).toBeNull();
    expect(remainingAt(c, 50_000)).toBe(50_000);

    // Resume after a long pause (e.g. hidden tab or rotate prompt)
    c = startClock(c, 100_000);
    expect(remainingAt(c, 105_000)).toBe(45_000);
    expect(isExpired(c, 149_999)).toBe(false);
    expect(isExpired(c, 150_000)).toBe(true);
  });

  it('formats milliseconds as m:ss rounding up partial seconds', () => {
    expect(formatCountdown(60_000)).toBe('1:00');
    expect(formatCountdown(59_100)).toBe('1:00');
    expect(formatCountdown(9_001)).toBe('0:10');
    expect(formatCountdown(500)).toBe('0:01');
    expect(formatCountdown(0)).toBe('0:00');
  });
});
