import { describe, expect, it } from 'vitest';
import { INITIAL_PLAY_STATE, playReducer } from './playReducer';
import { buildTurnQueue } from './turns';

const okResult = { attempts: 1, firstTry: true };

describe('playReducer', () => {
  it('advances 1-player session without turn-banner and finishes on last round', () => {
    const turns = buildTurnQueue(1, 2, 'per-round');
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });
    expect(state.status).toBe('playing');

    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 1,
    });
    expect(state.status).toBe('playing');
    expect(state.turnIndex).toBe(1);

    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 1,
      result: okResult,
      turns,
      players: 1,
    });
    expect(state.status).toBe('finished');
    expect(state.results[1]).toHaveLength(2);
  });

  it('shows turn-banner only when player switches in 2-player mode', () => {
    const turns = buildTurnQueue(2, 1, 'per-round');
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });

    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 2,
    });
    expect(state.status).toBe('turn-banner');
    expect(state.turnIndex).toBe(1);

    state = playReducer(state, { type: 'BANNER_DONE' });
    expect(state.status).toBe('playing');

    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 1,
      result: okResult,
      turns,
      players: 2,
    });
    expect(state.status).toBe('finished');
    expect(state.results[1]).toHaveLength(1);
    expect(state.results[2]).toHaveLength(1);
  });

  it('ignores duplicate ROUND_COMPLETE for the same turnIndex', () => {
    const turns = buildTurnQueue(1, 2, 'per-round');
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });
    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 1,
    });
    const afterDup = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 1,
    });
    expect(afterDup).toBe(state);
    expect(afterDup.results[1]).toHaveLength(1);
  });
});
