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
}

export type RaceAction =
  | { readonly type: 'GO' }
  | {
      readonly type: 'ROUND_DONE';
      readonly player: 1 | 2;
      readonly result: RoundResult;
      readonly totalRounds: number;
      readonly now: number;
    }
  | { readonly type: 'TICK'; readonly now: number }
  /** Adds paused time (ms) back to the last-call deadline. */
  | { readonly type: 'EXTEND_LAST_CALL'; readonly ms: number };

const EMPTY_PLAYER: RacePlayer = {
  roundIndex: 0,
  results: [],
  score: 0,
  finishedAt: null,
};

export function createInitialRaceState(skipCountdown = false): RaceState {
  return {
    status: skipCountdown ? 'racing' : 'countdown',
    players: { 1: EMPTY_PLAYER, 2: EMPTY_PLAYER },
    lastCallEndsAt: null,
  };
}

export function raceReducer(state: RaceState, action: RaceAction): RaceState {
  if (state.status === 'finished') return state;

  switch (action.type) {
    case 'GO':
      if (state.status !== 'countdown') return state;
      return { ...state, status: 'racing' };

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
        return {
          ...state,
          status: 'last-call',
          players,
          lastCallEndsAt: action.now + LAST_CALL_MS,
        };
      }

      return { ...state, players };
    }

    case 'EXTEND_LAST_CALL': {
      if (state.status !== 'last-call' || state.lastCallEndsAt === null) return state;
      return { ...state, lastCallEndsAt: state.lastCallEndsAt + Math.max(0, action.ms) };
    }

    case 'TICK': {
      if (state.status !== 'last-call' || state.lastCallEndsAt === null) return state;
      if (action.now >= state.lastCallEndsAt) {
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
