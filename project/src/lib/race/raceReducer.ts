import type { RoundResult } from '@/games/types';
import { roundPoints } from '@/lib/scores/scoring';

export const LAST_CALL_MS = 45_000;

export interface RacePlayer {
  readonly roundIndex: number;
  readonly results: readonly RoundResult[];
  readonly score: number;
  readonly finishedAt: number | null;
}

export interface RaceState {
  readonly status: 'countdown' | 'racing' | 'last-call' | 'finished';
  readonly players: Record<1 | 2, RacePlayer>;
  readonly lastCallEndsAt: number | null;
  readonly sessionMs: number | null;
  readonly sessionEndsAt: number | null;
}

export type RaceAction =
  | { readonly type: 'GO'; readonly now?: number }
  | {
      readonly type: 'ROUND_DONE';
      readonly player: 1 | 2;
      readonly result: RoundResult;
      readonly totalRounds: number;
      readonly now: number;
    }
  | { readonly type: 'TICK'; readonly now: number }
  /** Adds paused time (ms) back to the last-call deadline. */
  | { readonly type: 'EXTEND_LAST_CALL'; readonly ms: number }
  /** Adds paused time (ms) back to active session & last-call deadlines. */
  | { readonly type: 'EXTEND_SESSION'; readonly ms: number };

const EMPTY_PLAYER: RacePlayer = {
  roundIndex: 0,
  results: [],
  score: 0,
  finishedAt: null,
};

export function createInitialRaceState(
  skipCountdown = false,
  sessionMs?: number,
  now?: number,
): RaceState {
  const validSessionMs = sessionMs !== undefined && sessionMs > 0 ? sessionMs : null;
  const sessionEndsAt =
    skipCountdown && validSessionMs !== null ? (now ?? Date.now()) + validSessionMs : null;

  return {
    status: skipCountdown ? 'racing' : 'countdown',
    players: { 1: EMPTY_PLAYER, 2: EMPTY_PLAYER },
    lastCallEndsAt: null,
    sessionMs: validSessionMs,
    sessionEndsAt,
  };
}

export function effectiveRaceDeadline(state: RaceState): number | null {
  if (state.lastCallEndsAt !== null && state.sessionEndsAt !== null) {
    return Math.min(state.lastCallEndsAt, state.sessionEndsAt);
  }
  return state.lastCallEndsAt ?? state.sessionEndsAt;
}

export function raceReducer(state: RaceState, action: RaceAction): RaceState {
  if (state.status === 'finished') return state;

  switch (action.type) {
    case 'GO': {
      if (state.status !== 'countdown') return state;
      const now = action.now ?? Date.now();
      return {
        ...state,
        status: 'racing',
        sessionEndsAt: state.sessionMs !== null ? now + state.sessionMs : null,
      };
    }

    case 'ROUND_DONE': {
      if (state.status !== 'racing' && state.status !== 'last-call') return state;
      const cur = state.players[action.player];
      if (cur.finishedAt !== null) return state;

      const nextRoundIndex = cur.roundIndex + 1;
      const isFinished = nextRoundIndex >= action.totalRounds;
      const nextPlayer: RacePlayer = {
        roundIndex: nextRoundIndex,
        results: [...cur.results, action.result],
        score: cur.score + roundPoints(action.result),
        finishedAt: isFinished ? action.now : null,
      };
      const players: Record<1 | 2, RacePlayer> = {
        ...state.players,
        [action.player]: nextPlayer,
      };

      const other: 1 | 2 = action.player === 1 ? 2 : 1;
      const bothDone = players[1].finishedAt !== null && players[2].finishedAt !== null;

      if (bothDone) {
        return { ...state, status: 'finished', players };
      }

      if (isFinished && players[other].finishedAt === null && state.lastCallEndsAt === null) {
        const rawLastCall = action.now + LAST_CALL_MS;
        const cappedLastCall =
          state.sessionEndsAt !== null ? Math.min(rawLastCall, state.sessionEndsAt) : rawLastCall;
        return {
          ...state,
          status: 'last-call',
          players,
          lastCallEndsAt: cappedLastCall,
        };
      }

      return { ...state, players };
    }

    case 'EXTEND_LAST_CALL': {
      if (state.status !== 'last-call' || state.lastCallEndsAt === null) return state;
      const delta = Math.max(0, action.ms);
      return {
        ...state,
        lastCallEndsAt: state.lastCallEndsAt + delta,
        sessionEndsAt: state.sessionEndsAt !== null ? state.sessionEndsAt + delta : null,
      };
    }

    case 'EXTEND_SESSION': {
      if (state.status !== 'racing' && state.status !== 'last-call') return state;
      const delta = Math.max(0, action.ms);
      if (delta === 0) return state;
      return {
        ...state,
        lastCallEndsAt: state.lastCallEndsAt !== null ? state.lastCallEndsAt + delta : null,
        sessionEndsAt: state.sessionEndsAt !== null ? state.sessionEndsAt + delta : null,
      };
    }

    case 'TICK': {
      if (state.status !== 'racing' && state.status !== 'last-call') return state;
      const deadline = effectiveRaceDeadline(state);
      if (deadline !== null && action.now >= deadline) {
        return { ...state, status: 'finished' };
      }
      return state;
    }
  }
}

export function raceWinner(state: RaceState): 1 | 2 | 'seri' | null {
  if (state.status !== 'finished') return null;
  const p1 = state.players[1];
  const p2 = state.players[2];
  if (p1.score > p2.score) return 1;
  if (p2.score > p1.score) return 2;
  if (p1.finishedAt !== null && p2.finishedAt !== null) {
    if (p1.finishedAt < p2.finishedAt) return 1;
    if (p2.finishedAt < p1.finishedAt) return 2;
    return 'seri';
  }
  if (p1.finishedAt !== null) return 1;
  if (p2.finishedAt !== null) return 2;
  return 'seri';
}
