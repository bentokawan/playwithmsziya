import { describe, expect, it } from 'vitest';
import { flip, INITIAL_MEMORY_STATE, isMemoryComplete, resolve, type MemoryCard } from './memory';

const CARDS: readonly MemoryCard[] = [
  { id: 'c1', face: 'cat' },
  { id: 'c2', face: 'cat' },
  { id: 'c3', face: 'duck' },
  { id: 'c4', face: 'duck' },
];

describe('memory engine (G08)', () => {
  it('blocks opening a 3rd card when 2 are open and ignores matched cards', () => {
    let st = flip(INITIAL_MEMORY_STATE, 'c1', CARDS);
    st = flip(st, 'c3', CARDS);
    expect(st.open).toEqual(['c1', 'c3']);
    expect(st.locked).toBe(true);

    const third = flip(st, 'c2', CARDS);
    expect(third).toBe(st);

    // Mismatch switches player in 2-player mode
    st = resolve(st, CARDS, 2);
    expect(st.open).toEqual([]);
    expect(st.currentPlayer).toBe(2);

    // Match keeps same player and prevents re-opening matched card
    st = flip(st, 'c1', CARDS);
    st = flip(st, 'c2', CARDS);
    st = resolve(st, CARDS, 2);
    expect(st.currentPlayer).toBe(2);
    expect(st.matched.c1).toBe(2);
    expect(st.matched.c2).toBe(2);

    const reopen = flip(st, 'c1', CARDS);
    expect(reopen).toBe(st);
    expect(isMemoryComplete(st, CARDS)).toBe(false);

    st = flip(st, 'c3', CARDS);
    st = flip(st, 'c4', CARDS);
    st = resolve(st, CARDS, 2);
    expect(isMemoryComplete(st, CARDS)).toBe(true);
  });
});
