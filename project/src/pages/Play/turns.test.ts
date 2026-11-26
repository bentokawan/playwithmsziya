import { describe, expect, it } from 'vitest';
import { buildTurnQueue } from './turns';

describe('buildTurnQueue', () => {
  it('creates sequential rounds for 1 player', () => {
    expect(buildTurnQueue(1, 3, 'per-round')).toEqual([
      { player: 1, roundIndex: 0 },
      { player: 1, roundIndex: 1 },
      { player: 1, roundIndex: 2 },
    ]);
  });

  it('alternates players per round for 2 players', () => {
    expect(buildTurnQueue(2, 2, 'per-round')).toEqual([
      { player: 1, roundIndex: 0 },
      { player: 2, roundIndex: 0 },
      { player: 1, roundIndex: 1 },
      { player: 2, roundIndex: 1 },
    ]);
  });

  it('creates a single turn for in-game turnMode', () => {
    expect(buildTurnQueue(2, 1, 'in-game')).toEqual([{ player: 1, roundIndex: 0 }]);
  });
});
