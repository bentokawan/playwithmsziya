import type { RoundResult } from '@/games/types';
import type { PlayerCount, PlayerNumber } from '@/lib/session/session';
import type { Turn } from './turns';

export type PlayStatus = 'loading' | 'playing' | 'turn-banner' | 'finished' | 'error';

export interface PlayState {
  readonly status: PlayStatus;
  readonly turnIndex: number;
  readonly results: Record<PlayerNumber, readonly RoundResult[]>;
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
  | { readonly type: 'BANNER_DONE' };

export const INITIAL_PLAY_STATE: PlayState = {
  status: 'loading',
  turnIndex: 0,
  results: { 1: [], 2: [] },
};

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

      const nextIndex = state.turnIndex + 1;
      if (nextIndex >= action.turns.length) {
        return {
          status: 'finished',
          turnIndex: nextIndex,
          results: updatedResults,
        };
      }

      const nextTurn = action.turns[nextIndex];
      const playerChanged = action.players === 2 && nextTurn.player !== currentTurn.player;

      return {
        status: playerChanged ? 'turn-banner' : 'playing',
        turnIndex: nextIndex,
        results: updatedResults,
      };
    }

    case 'BANNER_DONE':
      if (state.status !== 'turn-banner') return state;
      return { ...state, status: 'playing' };
  }
}
