import type { PlayerCount, PlayerNumber } from '@/lib/session/session';

export interface MemoryCard {
  readonly id: string;
  readonly face: string;
}

export interface MemoryState {
  readonly open: readonly string[];
  readonly matched: Readonly<Record<string, PlayerNumber>>;
  readonly currentPlayer: PlayerNumber;
  readonly locked: boolean;
  readonly attempts: number;
}

export const INITIAL_MEMORY_STATE: MemoryState = {
  open: [],
  matched: {},
  currentPlayer: 1,
  locked: false,
  attempts: 0,
};

export function flip(
  state: MemoryState,
  cardId: string,
  cards: readonly MemoryCard[],
): MemoryState {
  if (state.locked) return state;
  if (state.open.includes(cardId) || state.matched[cardId] !== undefined) return state;
  if (!cards.some((c) => c.id === cardId)) return state;

  const nextOpen = [...state.open, cardId];
  return {
    ...state,
    open: nextOpen,
    locked: nextOpen.length >= 2,
  };
}

export function isOpenPairMatch(state: MemoryState, cards: readonly MemoryCard[]): boolean {
  if (state.open.length !== 2) return false;
  const first = cards.find((c) => c.id === state.open[0]);
  const second = cards.find((c) => c.id === state.open[1]);
  return Boolean(first && second && first.face === second.face);
}

export function resolve(
  state: MemoryState,
  cards: readonly MemoryCard[],
  players: PlayerCount,
): MemoryState {
  if (state.open.length !== 2) return state;
  const [id1, id2] = state.open;
  const matchedPair = isOpenPairMatch(state, cards);

  if (matchedPair) {
    return {
      open: [],
      matched: {
        ...state.matched,
        [id1]: state.currentPlayer,
        [id2]: state.currentPlayer,
      },
      currentPlayer: state.currentPlayer,
      locked: false,
      attempts: state.attempts + 1,
    };
  }

  const nextPlayer: PlayerNumber =
    players === 2 ? (state.currentPlayer === 1 ? 2 : 1) : 1;

  return {
    open: [],
    matched: state.matched,
    currentPlayer: nextPlayer,
    locked: false,
    attempts: state.attempts + 1,
  };
}

export function isMemoryComplete(state: MemoryState, cards: readonly MemoryCard[]): boolean {
  return cards.length > 0 && Object.keys(state.matched).length === cards.length;
}
