import { describe, expect, it } from 'vitest';
import {
  LAST_CALL_MS,
  PEER_STALE_MS,
  RECONNECT_GRACE_MS,
  type RoomMsg,
  type Snapshot,
} from './protocol';
import { createInitialRoomState, decideFinal, effectsFor, roomReducer } from './roomReducer';

const HOST_CFG = {
  gameId: 'ayo-berhitung' as const,
  difficulty: 'mudah' as const,
  seed: 123,
  locale: 'id' as const,
  totalRounds: 3,
};

const ANA = { name: 'Ana', avatar: 'kelinci' as const, color: 'biru' as const };
const BUDI = { name: 'Budi', avatar: 'kucing' as const, color: 'merah' as const };

function makeMsg<T extends Record<string, unknown>>(seq: number, sid: string, body: T): RoomMsg {
  return { v: 2, seq, sid, ...body } as unknown as RoomMsg;
}

describe('roomReducer (Task 1)', () => {
  it('transitions waiting -> ready-check -> countdown with a single start and ignores duplicate SET_READY', () => {
    let s = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
    });
    s = roomReducer(s, { type: 'JOINED' });
    expect(s.phase).toBe('waiting');

    s = roomReducer(s, {
      type: 'MSG',
      msg: makeMsg(1, 'g1', { t: 'hello', role: 'guest', player: BUDI, content: 'fp1' }),
      now: 1000,
    });
    expect(s.phase).toBe('ready-check');

    const prev1 = s;
    s = roomReducer(s, { type: 'SET_READY', ready: true });
    expect(s.phase).toBe('ready-check');
    expect(effectsFor(prev1, s).some((m) => m.t === 'start')).toBe(false);

    const prev2 = s;
    s = roomReducer(s, {
      type: 'MSG',
      msg: makeMsg(2, 'g1', { t: 'ready', ready: true }),
      now: 1100,
    });
    expect(s.phase).toBe('countdown');
    const eff2 = effectsFor(prev2, s);
    expect(eff2.filter((m) => m.t === 'start')).toHaveLength(1);
    expect(eff2.find((m) => m.t === 'start')).toMatchObject({
      t: 'start',
      matchId: (123).toString(36),
      seed: 123,
    });

    // Repeated SET_READY in countdown produces no second start
    const prev3 = s;
    s = roomReducer(s, { type: 'SET_READY', ready: true });
    expect(effectsFor(prev3, s)).toEqual([]);
  });

  it('guest never emits start or final', () => {
    let g = createInitialRoomState({
      role: 'guest',
      code: '1234',
      sid: 'g1',
      localContent: 'fp1',
    });
    g = roomReducer(g, { type: 'JOINED' });
    g = roomReducer(g, {
      type: 'MSG',
      msg: makeMsg(1, 'h1', { t: 'hello', role: 'host', player: ANA, content: 'fp1' }),
      now: 1000,
    });
    const prev = g;
    g = roomReducer(g, { type: 'SET_READY', ready: true });
    const eff = effectsFor(prev, g);
    expect(eff.some((m) => m.t === 'start' || m.t === 'final')).toBe(false);
  });

  it('ignores duplicate or out-of-order seq numbers per sid', () => {
    let h = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
      phase: 'ready-check',
    });
    h = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(5, 'g1', { t: 'hello', role: 'guest', player: BUDI, content: 'fp1' }),
      now: 1000,
    });
    expect(h.peer?.ready).toBe(false);

    const stale = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(5, 'g1', { t: 'ready', ready: true }),
      now: 1100,
    });
    expect(stale.peer?.ready).toBe(false);

    const older = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(3, 'g1', { t: 'ready', ready: true }),
      now: 1200,
    });
    expect(older.peer?.ready).toBe(false);
  });

  it('host emits single final all-done when both finish and supports last-call timeout', () => {
    const matchId = HOST_CFG.seed.toString(36);
    let h = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
      phase: 'playing',
      match: {
        t: 'start',
        matchId,
        gameId: 'ayo-berhitung',
        difficulty: 'mudah',
        seed: 123,
        locale: 'id',
        totalRounds: 3,
        countdownMs: 3000,
      },
      peer: {
        sid: 'g1',
        player: BUDI,
        connected: true,
        lostAt: null,
        ready: true,
        snap: null,
        lastSeenAt: 1000,
      },
    });

    // Wrong matchId snap is ignored
    h = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(1, 'g1', {
        t: 'snap',
        matchId: 'old-match',
        roundsDone: 3,
        score: 9,
        finished: true,
        elapsedMs: 5000,
      }),
      now: 2000,
    });
    expect(h.peer?.snap).toBeNull();

    h = roomReducer(h, {
      type: 'LOCAL_SNAP',
      snap: { matchId, roundsDone: 3, score: 9, finished: true, elapsedMs: 12000 },
    });
    expect(h.phase).toBe('playing');

    const prev = h;
    h = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(2, 'g1', {
        t: 'snap',
        matchId,
        roundsDone: 3,
        score: 6,
        finished: true,
        elapsedMs: 15000,
      }),
      now: 15000,
    });
    expect(h.phase).toBe('finalizing');
    const eff = effectsFor(prev, h);
    expect(eff).toHaveLength(1);
    expect(eff[0]).toMatchObject({ t: 'final', reason: 'all-done', winner: 'host' });

    // Last-call path when only host finished
    let h2 = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
      phase: 'playing',
      match: prev.match,
      me: { matchId, roundsDone: 3, score: 9, finished: true, elapsedMs: 10000 },
      peer: {
        sid: 'g1',
        player: BUDI,
        connected: true,
        lostAt: null,
        ready: true,
        snap: { matchId, roundsDone: 1, score: 3, finished: false, elapsedMs: 8000 },
        lastSeenAt: 1000,
      },
    });
    h2 = roomReducer(h2, { type: 'TICK', now: 10_000 });
    expect(h2.firstFinishedAt).toBe(10_000);
    // Guest sends a progress heartbeat at 22_000 so connection stays fresh until last-call expires
    h2 = roomReducer(h2, {
      type: 'MSG',
      msg: makeMsg(9, 'g1', {
        t: 'snap',
        matchId,
        roundsDone: 2,
        score: 5,
        finished: false,
        elapsedMs: 18_000,
      }),
      now: 22_000,
    });
    const prevLc = h2;
    h2 = roomReducer(h2, { type: 'TICK', now: 10_000 + LAST_CALL_MS });
    expect(h2.phase).toBe('finalizing');
    expect(effectsFor(prevLc, h2)[0]).toMatchObject({ t: 'final', reason: 'last-call', winner: 'host' });
  });

  it('tracks peer presence loss, stale heartbeat, reconnect sync, and 30s grace timeout', () => {
    const matchId = HOST_CFG.seed.toString(36);
    const baseMatch = {
      t: 'start' as const,
      matchId,
      gameId: 'ayo-berhitung' as const,
      difficulty: 'mudah' as const,
      seed: 123,
      locale: 'id' as const,
      totalRounds: 3,
      countdownMs: 3000,
    };

    let h = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
      phase: 'playing',
      match: baseMatch,
      me: { matchId, roundsDone: 1, score: 3, finished: false, elapsedMs: 5000 },
      peer: {
        sid: 'g1',
        player: BUDI,
        connected: true,
        lostAt: null,
        ready: true,
        snap: null,
        lastSeenAt: 1000,
      },
    });

    // Stale heartbeat sets connected=false and lostAt
    h = roomReducer(h, { type: 'TICK', now: 1000 + PEER_STALE_MS + 100 });
    expect(h.peer?.connected).toBe(false);
    expect(h.peer?.lostAt).toBe(1000 + PEER_STALE_MS + 100);
    expect(h.phase).toBe('playing');

    // Guest resumes before deadline -> host emits sync
    const prevResume = h;
    h = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(1, 'g1', {
        t: 'hello',
        role: 'guest',
        player: BUDI,
        content: 'fp1',
        resume: { matchId, roundsDone: 2, score: 6, finished: false, elapsedMs: 9000 },
      }),
      now: 10_000,
    });
    expect(h.peer?.connected).toBe(true);
    expect(h.peer?.lostAt).toBeNull();
    expect(effectsFor(prevResume, h)).toEqual([{ t: 'sync', start: baseMatch, hostSnap: h.me }]);

    // Presence false -> past 30s grace -> peer-gone with winner:null
    h = roomReducer(h, { type: 'PEER_PRESENCE', sid: 'g1', present: false, now: 20_000 });
    expect(h.peer?.connected).toBe(false);
    expect(h.peer?.lostAt).toBe(20_000);
    const beforeTimeout = h;
    h = roomReducer(h, { type: 'TICK', now: 20_000 + RECONNECT_GRACE_MS });
    expect(h.phase).toBe('finalizing');
    expect(effectsFor(beforeTimeout, h)[0]).toMatchObject({
      t: 'final',
      reason: 'peer-gone',
      winner: null,
    });
  });

  it('resets host to waiting on ready-check disconnect and flags content mismatch', () => {
    let h = createInitialRoomState({
      role: 'host',
      code: '1234',
      sid: 'h1',
      localContent: 'fp1',
      hostConfig: HOST_CFG,
      phase: 'ready-check',
      meReady: true,
      peer: {
        sid: 'g1',
        player: BUDI,
        connected: true,
        lostAt: null,
        ready: false,
        snap: null,
        lastSeenAt: 1000,
      },
    });
    h = roomReducer(h, { type: 'PEER_PRESENCE', sid: 'g1', present: false, now: 2000 });
    expect(h.phase).toBe('waiting');
    expect(h.meReady).toBe(false);
    expect(h.peer).toBeNull();

    const bad = roomReducer(h, {
      type: 'MSG',
      msg: makeMsg(2, 'g2', { t: 'hello', role: 'guest', player: BUDI, content: 'fp-other' }),
      now: 3000,
    });
    expect(bad.phase).toBe('error');
    expect(bad.error).toBe('content-mismatch');
  });

  it('decideFinal awards +2 bonus to earliest finisher, ranks by score, or seri on exact tie', () => {
    const a: Snapshot = { matchId: 'm', roundsDone: 3, score: 9, finished: true, elapsedMs: 50_000 };
    const b: Snapshot = { matchId: 'm', roundsDone: 3, score: 9, finished: true, elapsedMs: 40_000 };
    const res = decideFinal(a, b, 9, 'm', 'all-done');
    expect(res.winner).toBe('guest');
    expect(res.scores).toEqual({ host: 9, guest: 11 });
    expect(res.maxScore).toBe(11);

    const tie = decideFinal(b, b, 9, 'm', 'all-done');
    expect(tie.winner).toBe('seri');
    expect(tie.scores).toEqual({ host: 9, guest: 9 });

    const gone = decideFinal(a, null, 9, 'm', 'peer-gone');
    expect(gone.winner).toBeNull();
    expect(gone.scores).toEqual({ host: 9, guest: 0 });
  });
});
