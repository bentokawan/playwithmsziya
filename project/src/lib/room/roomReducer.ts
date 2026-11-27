import type { GameId } from '@/games/ids';
import { FIRST_FINISH_BONUS } from '@/lib/scores/scoring';
import type { DifficultyId, Locale } from '@/lib/session/session';
import {
  COUNTDOWN_MS,
  LAST_CALL_MS,
  PEER_STALE_MS,
  RECONNECT_GRACE_MS,
  type FinalMsgBody,
  type FinalReason,
  type FinalWinner,
  type GameInfoSummary,
  type RoomMsg,
  type RoomMsgBody,
  type RoomPlayerInfo,
  type RoomRole,
  type Snapshot,
  type StartMsgBody,
} from './protocol';

export type RoomPhase =
  | 'connecting'
  | 'waiting'
  | 'ready-check'
  | 'countdown'
  | 'playing'
  | 'finalizing'
  | 'final'
  | 'closed'
  | 'error';

export type RoomError =
  | 'no-host'
  | 'full'
  | 'offline'
  | 'content-mismatch'
  | 'closed'
  | 'replaced'
  | 'timeout';

export interface PeerView {
  readonly sid: string;
  readonly player: RoomPlayerInfo;
  readonly connected: boolean;
  readonly lostAt: number | null;
  readonly ready: boolean;
  readonly snap: Snapshot | null;
  readonly lastSeenAt: number;
}

export interface HostMatchConfig {
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
  readonly seed: number;
  readonly locale: Locale;
  readonly totalRounds: number;
}

export interface RoomState {
  readonly role: RoomRole;
  readonly code: string;
  readonly sid: string;
  readonly localContent: string;
  readonly hostConfig?: HostMatchConfig;
  readonly peerGameInfo?: GameInfoSummary;
  readonly phase: RoomPhase;
  readonly error: RoomError | null;
  readonly match: StartMsgBody | null;
  readonly rematchId: string | null;
  readonly syncSeq: number;
  readonly firstFinishedAt: number | null;
  readonly firstFinisher: 'host' | 'guest' | null;
  readonly meReady: boolean;
  readonly me: Snapshot | null;
  readonly peer: PeerView | null;
  readonly final: FinalMsgBody | null;
  readonly lastSeq: Readonly<Record<string, number>>;
}

export type RoomAction =
  | { readonly type: 'JOINED' }
  | { readonly type: 'JOIN_FAILED'; readonly reason: RoomError }
  | { readonly type: 'MSG'; readonly msg: RoomMsg; readonly now: number }
  | { readonly type: 'PEER_PRESENCE'; readonly sid: string; readonly present: boolean; readonly now: number }
  | { readonly type: 'SET_READY'; readonly ready: boolean }
  | { readonly type: 'COUNTDOWN_DONE' }
  | { readonly type: 'FINALIZED' }
  | { readonly type: 'LOCAL_SNAP'; readonly snap: Snapshot; readonly now?: number }
  | { readonly type: 'TICK'; readonly now: number }
  | { readonly type: 'REMATCH'; readonly seed?: number }
  | { readonly type: 'LEAVE' };

export function decideFinal(
  host: Snapshot,
  guest: Snapshot | null,
  maxScore: number,
  matchId: string,
  reason: FinalReason,
  firstFinisher?: 'host' | 'guest' | null,
): FinalMsgBody {
  let earliest: 'host' | 'guest' | null = null;
  if (reason !== 'peer-gone' && guest !== null) {
    if (firstFinisher === 'host' || firstFinisher === 'guest') {
      earliest = firstFinisher;
    } else if (host.finished && !guest.finished) {
      earliest = 'host';
    } else if (guest.finished && !host.finished) {
      earliest = 'guest';
    } else if (host.finished && guest.finished) {
      if (host.elapsedMs < guest.elapsedMs) earliest = 'host';
      else if (guest.elapsedMs < host.elapsedMs) earliest = 'guest';
    }
  }

  let hostScore = host.score + (earliest === 'host' ? FIRST_FINISH_BONUS : 0);
  let guestScore = (guest?.score ?? 0) + (earliest === 'guest' ? FIRST_FINISH_BONUS : 0);
  if (earliest !== null && hostScore === guestScore) {
    if (earliest === 'host') hostScore += 1;
    else guestScore += 1;
  }
  const finalMaxScore = Math.max(maxScore, hostScore, guestScore);

  let winner: FinalWinner;
  if (reason === 'peer-gone' || guest === null) {
    winner = null;
  } else if (hostScore > guestScore) {
    winner = 'host';
  } else if (guestScore > hostScore) {
    winner = 'guest';
  } else if (host.elapsedMs < guest.elapsedMs) {
    winner = 'host';
  } else if (guest.elapsedMs < host.elapsedMs) {
    winner = 'guest';
  } else {
    winner = 'seri';
  }

  return {
    t: 'final',
    matchId,
    scores: { host: hostScore, guest: guestScore },
    maxScore: finalMaxScore,
    winner,
    reason,
  };
}

export interface CreateRoomStateOptions {
  readonly role: RoomRole;
  readonly code: string;
  readonly sid: string;
  readonly localContent: string;
  readonly hostConfig?: HostMatchConfig;
  readonly phase?: RoomPhase;
  readonly meReady?: boolean;
  readonly match?: StartMsgBody | null;
  readonly me?: Snapshot | null;
  readonly peer?: PeerView | null;
}

export function createInitialRoomState(opts: CreateRoomStateOptions): RoomState {
  return {
    role: opts.role,
    code: opts.code,
    sid: opts.sid,
    localContent: opts.localContent,
    hostConfig: opts.hostConfig,
    phase: opts.phase ?? 'connecting',
    error: null,
    match: opts.match ?? null,
    rematchId: null,
    syncSeq: 0,
    firstFinishedAt: null,
    firstFinisher: null,
    meReady: opts.meReady ?? false,
    me: opts.me ?? null,
    peer: opts.peer ?? null,
    final: null,
    lastSeq: {},
  };
}

function emptySnap(matchId: string): Snapshot {
  return { matchId, roundsDone: 0, score: 0, finished: false, elapsedMs: 0 };
}

function maybeHostStartCountdown(state: RoomState): RoomState {
  if (state.role !== 'host' || state.phase !== 'ready-check') return state;
  if (!state.meReady || !state.peer?.ready || !state.hostConfig) return state;

  const cfg = state.hostConfig;
  const matchId = state.rematchId ?? (cfg.seed >>> 0).toString(36);
  const start: StartMsgBody = {
    t: 'start',
    matchId,
    gameId: cfg.gameId,
    difficulty: cfg.difficulty,
    seed: cfg.seed >>> 0,
    locale: cfg.locale,
    totalRounds: cfg.totalRounds,
    countdownMs: COUNTDOWN_MS,
  };

  return {
    ...state,
    phase: 'countdown',
    match: start,
    me: emptySnap(matchId),
    peer: { ...state.peer, snap: null },
    final: null,
    firstFinishedAt: null,
    firstFinisher: null,
  };
}

function maybeHostFinalize(state: RoomState, now: number): RoomState {
  if (state.role !== 'host' || state.phase !== 'playing' || !state.match) return state;

  const matchId = state.match.matchId;
  const maxScore = state.match.totalRounds * 3;
  const me = state.me ?? emptySnap(matchId);
  const peerSnap = state.peer?.snap ?? null;

  let firstFinisher = state.firstFinisher;
  if (firstFinisher === null) {
    if (me.finished && !peerSnap?.finished) {
      firstFinisher = 'host';
    } else if (peerSnap?.finished && !me.finished) {
      firstFinisher = 'guest';
    }
  }

  if (me.finished && peerSnap?.finished) {
    return {
      ...state,
      firstFinisher,
      phase: 'finalizing',
      final: decideFinal(me, peerSnap, maxScore, matchId, 'all-done', firstFinisher),
    };
  }

  let firstFinishedAt = state.firstFinishedAt;
  if (firstFinishedAt === null && (me.finished || peerSnap?.finished)) {
    firstFinishedAt = now;
  }

  if (firstFinishedAt !== null && now >= firstFinishedAt + LAST_CALL_MS) {
    return {
      ...state,
      firstFinishedAt,
      firstFinisher,
      phase: 'finalizing',
      final: decideFinal(
        me,
        peerSnap ?? emptySnap(matchId),
        maxScore,
        matchId,
        'last-call',
        firstFinisher,
      ),
    };
  }

  if (firstFinishedAt !== state.firstFinishedAt || firstFinisher !== state.firstFinisher) {
    return { ...state, firstFinishedAt, firstFinisher };
  }
  return state;
}

export function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'JOINED': {
      if (state.phase !== 'connecting') return state;
      const nextPhase: RoomPhase = state.match
        ? 'playing'
        : state.peer
          ? 'ready-check'
          : 'waiting';
      return { ...state, phase: nextPhase, error: null };
    }

    case 'JOIN_FAILED': {
      return { ...state, phase: 'error', error: action.reason };
    }

    case 'SET_READY': {
      if (state.phase !== 'ready-check') return state;
      return maybeHostStartCountdown({ ...state, meReady: action.ready });
    }

    case 'COUNTDOWN_DONE': {
      if (state.phase !== 'countdown') return state;
      return { ...state, phase: 'playing' };
    }

    case 'FINALIZED': {
      if (state.phase !== 'finalizing') return state;
      return { ...state, phase: 'final' };
    }

    case 'LOCAL_SNAP': {
      if (state.phase !== 'playing' && state.phase !== 'countdown') return state;
      if (state.match && action.snap.matchId !== state.match.matchId) return state;
      const next: RoomState = { ...state, me: action.snap };
      return maybeHostFinalize(next, action.now ?? Date.now());
    }

    case 'REMATCH': {
      if (state.phase !== 'final' && state.phase !== 'finalizing') return state;
      if (state.role !== 'host' || !state.hostConfig) return state;
      const nextSeed = action.seed !== undefined ? action.seed >>> 0 : (state.hostConfig.seed + 1) >>> 0;
      const nextMatchId = nextSeed.toString(36);
      return {
        ...state,
        phase: state.peer ? 'ready-check' : 'waiting',
        hostConfig: { ...state.hostConfig, seed: nextSeed },
        match: null,
        rematchId: nextMatchId,
        firstFinishedAt: null,
        firstFinisher: null,
        meReady: false,
        me: null,
        final: null,
        peer: state.peer ? { ...state.peer, ready: false, snap: null } : null,
      };
    }

    case 'LEAVE': {
      return { ...state, phase: 'closed' };
    }

    case 'PEER_PRESENCE': {
      if (action.sid === state.sid) return state;

      if (action.present) {
        if (state.peer && state.peer.sid === action.sid) {
          return {
            ...state,
            peer: { ...state.peer, connected: true, lostAt: null, lastSeenAt: action.now },
          };
        }
        return state;
      }

      // Peer left presence
      if (!state.peer || state.peer.sid !== action.sid) return state;

      if (state.phase === 'ready-check' || state.phase === 'waiting') {
        if (state.role === 'host') {
          return { ...state, phase: 'waiting', meReady: false, peer: null };
        }
        return { ...state, phase: 'error', error: 'closed', peer: null };
      }

      if (state.phase === 'countdown' || state.phase === 'playing') {
        return {
          ...state,
          peer: {
            ...state.peer,
            connected: false,
            lostAt: state.peer.lostAt ?? action.now,
          },
        };
      }

      return state;
    }

    case 'TICK': {
      if (state.phase !== 'playing') return state;

      let next = state;
      if (next.peer) {
        let peerView = next.peer;
        const isStale = action.now > peerView.lastSeenAt + PEER_STALE_MS;
        if (isStale && peerView.connected) {
          peerView = {
            ...peerView,
            connected: false,
            lostAt: peerView.lostAt ?? action.now,
          };
          next = { ...next, peer: peerView };
        }

        if (peerView.lostAt !== null && action.now >= peerView.lostAt + RECONNECT_GRACE_MS) {
          const matchId = next.match?.matchId ?? '';
          const maxScore = (next.match?.totalRounds ?? 3) * 3;
          const meSnap = next.me ?? emptySnap(matchId);

          if (next.role === 'host') {
            return {
              ...next,
              phase: 'finalizing',
              final: decideFinal(meSnap, peerView.snap, maxScore, matchId, 'peer-gone'),
            };
          }

          return {
            ...next,
            phase: 'final',
            final: {
              t: 'final',
              matchId,
              scores: { host: peerView.snap?.score ?? 0, guest: meSnap.score },
              maxScore,
              winner: null,
              reason: 'peer-gone',
            },
          };
        }
      }

      return maybeHostFinalize(next, action.now);
    }

    case 'MSG': {
      const { msg, now } = action;
      if (msg.sid === state.sid) return state;
      const prevSeq = state.lastSeq[msg.sid] ?? 0;
      const isResumeHello = msg.t === 'hello' && msg.resume !== undefined;
      if (!isResumeHello && msg.seq <= prevSeq) return state;
      const lastSeq = { ...state.lastSeq, [msg.sid]: msg.seq };

      switch (msg.t) {
        case 'hello': {
          if (msg.content !== state.localContent) {
            return { ...state, lastSeq, phase: 'error', error: 'content-mismatch' };
          }
          const incomingSnap =
            msg.resume && state.match && msg.resume.matchId === state.match.matchId
              ? msg.resume
              : state.peer?.snap ?? null;

          const peer: PeerView = {
            sid: msg.sid,
            player: msg.player,
            connected: true,
            lostAt: null,
            ready: state.peer?.sid === msg.sid ? state.peer.ready : false,
            snap: incomingSnap,
            lastSeenAt: now,
          };

          const isActiveMatch =
            state.phase === 'countdown' || state.phase === 'playing' || state.phase === 'finalizing';
          const shouldSync = state.role === 'host' && isActiveMatch && msg.resume !== undefined;

          return {
            ...state,
            lastSeq,
            peer,
            peerGameInfo: msg.gameInfo ?? state.peerGameInfo,
            phase: state.phase === 'waiting' ? 'ready-check' : state.phase,
            error: null,
            syncSeq: shouldSync ? state.syncSeq + 1 : state.syncSeq,
          };
        }

        case 'ready': {
          if (!state.peer || state.peer.sid !== msg.sid) {
            return { ...state, lastSeq };
          }
          const updated: RoomState = {
            ...state,
            lastSeq,
            peer: { ...state.peer, ready: msg.ready, connected: true, lostAt: null, lastSeenAt: now },
          };
          return maybeHostStartCountdown(updated);
        }

        case 'start': {
          if (state.role !== 'guest') return { ...state, lastSeq };
          if (state.phase === 'countdown' || state.phase === 'playing') return { ...state, lastSeq };
          return {
            ...state,
            lastSeq,
            phase: 'countdown',
            match: {
              t: 'start',
              matchId: msg.matchId,
              gameId: msg.gameId,
              difficulty: msg.difficulty,
              seed: msg.seed,
              locale: msg.locale,
              totalRounds: msg.totalRounds,
              countdownMs: msg.countdownMs,
            },
            me: emptySnap(msg.matchId),
            peer: state.peer
              ? { ...state.peer, snap: null, connected: true, lostAt: null, lastSeenAt: now }
              : null,
            final: null,
            firstFinishedAt: null,
          };
        }

        case 'snap': {
          if (!state.peer || !state.match || msg.matchId !== state.match.matchId) {
            return { ...state, lastSeq };
          }
          const incoming: Snapshot = {
            matchId: msg.matchId,
            roundsDone: msg.roundsDone,
            score: msg.score,
            finished: msg.finished,
            elapsedMs: msg.elapsedMs,
          };
          const prevSnap = state.peer.snap;
          const merged: Snapshot = prevSnap
            ? {
                matchId: incoming.matchId,
                roundsDone: Math.max(prevSnap.roundsDone, incoming.roundsDone),
                score: Math.max(prevSnap.score, incoming.score),
                finished: prevSnap.finished || incoming.finished,
                elapsedMs: incoming.finished ? incoming.elapsedMs : Math.max(prevSnap.elapsedMs, incoming.elapsedMs),
              }
            : incoming;

          const updated: RoomState = {
            ...state,
            lastSeq,
            peer: { ...state.peer, snap: merged, connected: true, lostAt: null, lastSeenAt: now },
          };
          return maybeHostFinalize(updated, now);
        }

        case 'sync': {
          if (state.role !== 'guest') return { ...state, lastSeq };
          const peerSnap = msg.hostSnap ?? state.peer?.snap ?? null;
          const peer: PeerView | null = state.peer
            ? { ...state.peer, snap: peerSnap, connected: true, lostAt: null, lastSeenAt: now }
            : msg.hostPlayer
              ? {
                  sid: msg.sid,
                  player: msg.hostPlayer,
                  connected: true,
                  lostAt: null,
                  ready: true,
                  snap: peerSnap,
                  lastSeenAt: now,
                }
              : null;
          return {
            ...state,
            lastSeq,
            match: msg.start,
            phase:
              state.phase === 'connecting' || state.phase === 'waiting' || state.phase === 'ready-check'
                ? 'playing'
                : state.phase,
            peer,
          };
        }

        case 'final': {
          if (state.role !== 'guest') return { ...state, lastSeq };
          if (state.phase === 'final') return { ...state, lastSeq };
          if (state.match && msg.matchId !== state.match.matchId) return { ...state, lastSeq };
          return {
            ...state,
            lastSeq,
            phase: 'final',
            final: {
              t: 'final',
              matchId: msg.matchId,
              scores: msg.scores,
              maxScore: msg.maxScore,
              winner: msg.winner,
              reason: msg.reason,
            },
          };
        }

        case 'rematch': {
          if (state.role !== 'guest') return { ...state, lastSeq };
          return {
            ...state,
            lastSeq,
            phase: 'ready-check',
            match: null,
            rematchId: msg.matchId,
            firstFinishedAt: null,
            firstFinisher: null,
            meReady: false,
            me: null,
            final: null,
            peer: state.peer
              ? { ...state.peer, ready: false, snap: null, connected: true, lostAt: null, lastSeenAt: now }
              : null,
          };
        }

        case 'bye': {
          if (state.phase === 'ready-check' || state.phase === 'waiting') {
            if (state.role === 'host') {
              return { ...state, lastSeq, phase: 'waiting', meReady: false, peer: null };
            }
            return { ...state, lastSeq, phase: 'error', error: 'closed', peer: null };
          }
          if (state.phase === 'playing' || state.phase === 'countdown') {
            const matchId = state.match?.matchId ?? '';
            const maxScore = (state.match?.totalRounds ?? 3) * 3;
            const meSnap = state.me ?? emptySnap(matchId);
            if (state.role === 'host') {
              return {
                ...state,
                lastSeq,
                phase: 'finalizing',
                final: decideFinal(meSnap, state.peer?.snap ?? null, maxScore, matchId, 'peer-gone'),
              };
            }
            return {
              ...state,
              lastSeq,
              phase: 'final',
              final: {
                t: 'final',
                matchId,
                scores: { host: state.peer?.snap?.score ?? 0, guest: meSnap.score },
                maxScore,
                winner: null,
                reason: 'peer-gone',
              },
            };
          }
          return { ...state, lastSeq };
        }
      }
    }
  }
}

export function effectsFor(prev: RoomState, next: RoomState): RoomMsgBody[] {
  const out: RoomMsgBody[] = [];

  if (prev.meReady !== next.meReady && (next.phase === 'ready-check' || next.phase === 'countdown')) {
    out.push({ t: 'ready', ready: next.meReady });
  }

  if (next.role === 'host' && prev.phase !== 'countdown' && next.phase === 'countdown' && next.match) {
    out.push(next.match);
  }

  if (next.role === 'host' && next.syncSeq > prev.syncSeq && next.match) {
    out.push({ t: 'sync', start: next.match, hostSnap: next.me });
  }

  if (next.role === 'host' && prev.phase !== 'finalizing' && next.phase === 'finalizing' && next.final) {
    out.push(next.final);
  }

  if (
    next.role === 'host' &&
    (prev.phase === 'final' || prev.phase === 'finalizing') &&
    (next.phase === 'ready-check' || next.phase === 'waiting') &&
    next.rematchId &&
    next.rematchId !== prev.rematchId
  ) {
    out.push({ t: 'rematch', matchId: next.rematchId });
  }

  return out;
}
