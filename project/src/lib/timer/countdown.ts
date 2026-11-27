import type { DifficultyId } from '@/lib/session/session';

export const TIME_LIMIT_MS: Record<DifficultyId, number> = {
  mudah: 60_000,
  sedang: 90_000,
  tantang: 120_000,
};

export interface Clock {
  readonly remainingMs: number;
  readonly runningSince: number | null;
}

export function createClock(durationMs: number): Clock {
  return {
    remainingMs: Math.max(0, durationMs),
    runningSince: null,
  };
}

export function remainingAt(clock: Clock, now: number): number {
  if (clock.runningSince === null) {
    return Math.max(0, clock.remainingMs);
  }
  const elapsed = Math.max(0, now - clock.runningSince);
  return Math.max(0, clock.remainingMs - elapsed);
}

export function startClock(clock: Clock, now: number): Clock {
  if (clock.runningSince !== null || clock.remainingMs <= 0) return clock;
  return {
    remainingMs: clock.remainingMs,
    runningSince: now,
  };
}

export function pauseClock(clock: Clock, now: number): Clock {
  if (clock.runningSince === null) return clock;
  return {
    remainingMs: remainingAt(clock, now),
    runningSince: null,
  };
}

export function isExpired(clock: Clock, now: number): boolean {
  return remainingAt(clock, now) <= 0;
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(Math.max(0, ms) / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
