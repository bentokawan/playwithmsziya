import type { GameId } from '@/games/ids';
import type { DifficultyId } from '@/lib/session/session';

export const MIN_TIMER_SEC = 10;
export const MAX_TIMER_SEC = 300;
export const TIMER_STEP_SEC = 5;

export const TIME_LIMIT_MS: Record<DifficultyId, number> = {
  mudah: 30_000,
  sedang: 45_000,
  tantang: 60_000,
};

export type TimerLimitsByDifficulty = Partial<Record<DifficultyId, number>>;
export type GameTimerOverrides = Partial<Record<GameId, TimerLimitsByDifficulty>>;

export function clampTimerSec(sec: number): number {
  const rounded = Math.round(sec);
  return Math.max(MIN_TIMER_SEC, Math.min(MAX_TIMER_SEC, rounded));
}

export function resolveSessionDurationMs(
  gameId: GameId,
  difficulty: DifficultyId,
  cfg?: {
    readonly timerLimits?: TimerLimitsByDifficulty;
    readonly gameTimers?: GameTimerOverrides;
  },
): number {
  const perGame = cfg?.gameTimers?.[gameId]?.[difficulty];
  if (typeof perGame === 'number' && Number.isFinite(perGame)) {
    return clampTimerSec(perGame) * 1000;
  }
  const globalLimit = cfg?.timerLimits?.[difficulty];
  if (typeof globalLimit === 'number' && Number.isFinite(globalLimit)) {
    return clampTimerSec(globalLimit) * 1000;
  }
  return TIME_LIMIT_MS[difficulty];
}

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
