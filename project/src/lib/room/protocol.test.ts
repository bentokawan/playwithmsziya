import { describe, expect, it } from 'vitest';
import { createBundledContent } from '@/lib/content/defaults';
import { createRng } from '@/lib/random/rng';
import { contentFingerprint, newRoomCode, parseRoomMsg } from './protocol';

describe('room protocol v2 (Task 1)', () => {
  it('parses valid v2 messages and rejects invalid versions, seq, rounds, and winner', () => {
    expect(
      parseRoomMsg({
        v: 2,
        seq: 1,
        sid: 's-host',
        t: 'hello',
        role: 'host',
        player: { name: 'Ana', avatar: 'kelinci', color: 'biru' },
        content: 'abc',
      }),
    ).not.toBeNull();

    // v:1 rejected
    expect(parseRoomMsg({ v: 1, t: 'bye' })).toBeNull();
    // negative or non-integer seq rejected
    expect(parseRoomMsg({ v: 2, seq: -1, sid: 's1', t: 'bye' })).toBeNull();
    expect(parseRoomMsg({ v: 2, seq: 1.5, sid: 's1', t: 'bye' })).toBeNull();
    expect(parseRoomMsg({ v: 2, seq: 0, sid: 's1', t: 'bye' })).toBeNull();
    // snap roundsDone > 50 rejected
    expect(
      parseRoomMsg({
        v: 2,
        seq: 2,
        sid: 's1',
        t: 'snap',
        matchId: 'm1',
        roundsDone: 51,
        score: 3,
        finished: false,
        elapsedMs: 1000,
      }),
    ).toBeNull();
    // final winner outside enum rejected
    expect(
      parseRoomMsg({
        v: 2,
        seq: 3,
        sid: 's1',
        t: 'final',
        matchId: 'm1',
        scores: { host: 9, guest: 6 },
        maxScore: 9,
        winner: 'draw',
        reason: 'all-done',
      }),
    ).toBeNull();
    // name > 12 rejected
    expect(
      parseRoomMsg({
        v: 2,
        seq: 1,
        sid: 's1',
        t: 'hello',
        role: 'guest',
        player: { name: '1234567890123', avatar: 'kelinci', color: 'biru' },
        content: 'abc',
      }),
    ).toBeNull();
  });

  it('generates 4-digit room codes', () => {
    const rng = createRng(42);
    for (let i = 0; i < 50; i++) {
      expect(newRoomCode(rng)).toMatch(/^\d{4}$/);
    }
  });

  it('produces a deterministic contentFingerprint regardless of insertion order', () => {
    const c1 = createBundledContent();
    const c2 = {
      ...c1,
      words: [...c1.words].reverse(),
    };
    expect(contentFingerprint(c1)).toBe(contentFingerprint(c2));
    expect(contentFingerprint(c1).length).toBeGreaterThan(0);
  });
});
