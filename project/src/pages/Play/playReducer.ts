import type { RoundResult } from '@/games/types';
import type { PlayerCount, PlayerNumber } from '@/lib/session/session';
import type { Turn } from './turns';

export type PlayStatus = 'loading' | 'playing' | 'turn-banner' | 'finished' | 'error';

export interface PlayState {
  readonly status: PlayStatus;
  readonly turnIndex: number;
  readonly results: Record<PlayerNumber, readonly RoundResult[]>;
  readonly timedOut: Readonly<Record<PlayerNumber, boolean>>;
}

export type PlayAction =
  | { readonly type: 'LOADED' }
  | { readonly type: 'LOAD_FAILED' }
  | {
      readonly type: 'ROUND_COMPLETE';
      readonly turnIndex: number;
      readonly result: RoundResult;
      readonly turns: readonly Turn[];
      readonly players: PlayerCount;
    }
  | {
      readonly type: 'TIME_UP';
      readonly player: PlayerNumber;
      readonly turns: readonly Turn[];
    }
  | { readonly type: 'BANNER_DONE' };

export const INITIAL_PLAY_STATE: PlayState = {
  status: 'loading',
  turnIndex: 0,
  results: { 1: [], 2: [] },
  timedOut: { 1: false, 2: false },
};

function findNextActiveTurn(
  turns: readonly Turn[],
  startIndex: number,
  timedOut: Readonly<Record<PlayerNumber, boolean>>,
): number {
  for (let i = startIndex; i < turns.length; i++) {
    if (!timedOut[turns[i].player]) return i;
  }
  return turns.length;
}

export function playReducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case 'LOADED':
      if (state.status !== 'loading') return state;
      return { ...state, status: 'playing', turnIndex: 0 };

    case 'LOAD_FAILED':
      return { ...state, status: 'error' };

    case 'ROUND_COMPLETE': {
      if (state.status !== 'playing') return state;
      if (action.turnIndex !== state.turnIndex) return state;

      const currentTurn = action.turns[state.turnIndex];
      if (!currentTurn) return state;

      const updatedResults: Record<PlayerNumber, readonly RoundResult[]> = {
        ...state.results,
        [currentTurn.player]: [...state.results[currentTurn.player], action.result],
      };

      const nextIndex = findNextActiveTurn(action.turns, state.turnIndex + 1, state.timedOut);
      if (nextIndex >= action.turns.length) {
        return {
          ...state,
          status: 'finished',
          turnIndex: nextIndex,
          results: updatedResults,
        };
      }

      const nextTurn = action.turns[nextIndex];
      const playerChanged = action.players === 2 && nextTurn.player !== currentTurn.player;

      return {
        ...state,
        status: playerChanged ? 'turn-banner' : 'playing',
        turnIndex: nextIndex,
        results: updatedResults,
      };
    }

    case 'TIME_UP': {
      if (state.status !== 'playing') return state;
      const nextTimedOut: Readonly<Record<PlayerNumber, boolean>> = {
        ...state.timedOut,
        [action.player]: true,
      };
      const nextIndex = findNextActiveTurn(action.turns, state.turnIndex + 1, nextTimedOut);
      if (nextIndex >= action.turns.length) {
        return {
          ...state,
          status: 'finished',
          turnIndex: nextIndex,
          timedOut: nextTimedOut,
        };
      }
      const nextTurn = action.turns[nextIndex];
      return {
        ...state,
        status: nextTurn.player !== action.player ? 'turn-banner' : 'playing',
        turnIndex: nextIndex,
        timedOut: nextTimedOut,
      };
    }

    case 'BANNER_DONE':
      if (state.status !== 'turn-banner') return state;
      return { ...state, status: 'playing' };
  }
}
