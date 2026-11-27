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

  it('finishes solo session on TIME_UP', () => {
    const turns = buildTurnQueue(1, 3, 'per-round');
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });
    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 1,
    });
    state = playReducer(state, { type: 'TIME_UP', player: 1, turns });
    expect(state.status).toBe('finished');
    expect(state.results[1]).toHaveLength(1);
  });

  it('skips remaining turns for timed-out P1 in 2-player turns while P2 continues', () => {
    const turns = buildTurnQueue(2, 2, 'per-round'); // [P1r0, P2r0, P1r1, P2r1]
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });

    // P1 times out on turn 0 -> handoff to P2r0
    state = playReducer(state, { type: 'TIME_UP', player: 1, turns });
    expect(state.status).toBe('turn-banner');
    expect(turns[state.turnIndex].player).toBe(2);
    expect(turns[state.turnIndex].roundIndex).toBe(0);

    state = playReducer(state, { type: 'BANNER_DONE' });
    expect(state.status).toBe('playing');

    // P2 finishes r0 -> skips P1r1 and stays on P2r1 without extra banner
    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: state.turnIndex,
      result: okResult,
      turns,
      players: 2,
    });
    expect(state.status).toBe('playing');
    expect(turns[state.turnIndex].player).toBe(2);
    expect(turns[state.turnIndex].roundIndex).toBe(1);

    // P2 finishes r1 -> finished
    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: state.turnIndex,
      result: okResult,
      turns,
      players: 2,
    });
    expect(state.status).toBe('finished');
    expect(state.results[1]).toHaveLength(0);
    expect(state.results[2]).toHaveLength(2);
  });

  it('stays in turn-banner until BANNER_DONE is dispatched', () => {
    const turns = buildTurnQueue(2, 2, 'per-round');
    let state = playReducer(INITIAL_PLAY_STATE, { type: 'LOADED' });
    state = playReducer(state, {
      type: 'ROUND_COMPLETE',
      turnIndex: 0,
      result: okResult,
      turns,
      players: 2,
    });
    expect(state.status).toBe('turn-banner');

    // Non-BANNER_DONE actions cannot dismiss the handoff banner
    expect(
      playReducer(state, {
        type: 'ROUND_COMPLETE',
        turnIndex: state.turnIndex,
        result: okResult,
        turns,
        players: 2,
      }),
    ).toBe(state);
    expect(playReducer(state, { type: 'TIME_UP', player: 2, turns })).toBe(state);
    expect(playReducer(state, { type: 'LOADED' })).toBe(state);

    const next = playReducer(state, { type: 'BANNER_DONE' });
    expect(next.status).toBe('playing');
  });
});
