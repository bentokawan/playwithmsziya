import { describe, expect, it } from 'vitest';
import {
  createInitialRaceState,
  LAST_CALL_MS,
  raceReducer,
  raceWinner,
} from './raceReducer';

describe('raceReducer (Task 7)', () => {
  it('moves from countdown to racing on GO', () => {
    const s0 = createInitialRaceState(false);
    expect(s0.status).toBe('countdown');
    const s1 = raceReducer(s0, { type: 'GO' });
    expect(s1.status).toBe('racing');
  });

  it('enters last-call when first player finishes and finishes after 45s TICK', () => {
    let s = createInitialRaceState(true);
    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 1,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 2,
      now: 1000,
    });
    expect(s.status).toBe('racing');
    expect(s.players[1].score).toBe(3);

    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 1,
      result: { firstTry: false, attempts: 2 },
      totalRounds: 2,
      now: 2000,
    });
    expect(s.status).toBe('last-call');
    expect(s.lastCallEndsAt).toBe(2000 + LAST_CALL_MS);
    expect(s.players[1].score).toBe(5);
    expect(s.players[1].finishedAt).toBe(2000);

    // Extra ROUND_DONE for already-finished player is ignored
    const dup = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 1,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 2,
      now: 3000,
    });
    expect(dup.players[1].score).toBe(5);

    // TICK before deadline stays in last-call
    const before = raceReducer(s, { type: 'TICK', now: 2000 + LAST_CALL_MS - 1 });
    expect(before.status).toBe('last-call');

    // TICK past deadline finishes the race
    const after = raceReducer(s, { type: 'TICK', now: 2000 + LAST_CALL_MS });
    expect(after.status).toBe('finished');
  });

  it('finishes immediately when both players finish and breaks score ties by finishedAt', () => {
    let s = createInitialRaceState(true);
    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 1,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 1,
      now: 1000,
    });
    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 2,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 1,
      now: 1500,
    });
    expect(s.status).toBe('finished');
    expect(raceWinner(s)).toBe(1);
  });

  it('returns seri when both score and finishedAt are equal', () => {
    let s = createInitialRaceState(true);
    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 1,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 1,
      now: 1000,
    });
    s = raceReducer(s, {
      type: 'ROUND_DONE',
      player: 2,
      result: { firstTry: true, attempts: 1 },
      totalRounds: 1,
      now: 1000,
    });
    expect(raceWinner(s)).toBe('seri');
  });
});
