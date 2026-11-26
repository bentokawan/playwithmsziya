import type { RoundResult } from '@/games/types';
import { isGameId } from '@/games/ids';
import { isAnimalId, isPlayerColor } from '@/lib/profiles/profiles';
import { readJSON, removeKey, writeJSON } from '@/lib/storage/storage';
import type { DifficultyId } from '@/lib/session/session';
import {
  HEARTBEAT_MS,
  ROOM_SESSION_MAX_AGE_MS,
  type RoomMsgBody,
  type RoomPlayerInfo,
  type RoomRole,
  type Snapshot,
  type StartMsgBody,
} from './protocol';
import {
  createInitialRoomState,
  effectsFor,
  roomReducer,
  type HostMatchConfig,
  type RoomAction,
  type RoomError,
  type RoomState,
} from './roomReducer';
import { createRoomTransport } from './supabaseTransport';
import type { ConnStatus, RoomTransport } from './transport';

export const ROOM_ACTIVE_KEY = 'msz:room:active';
export const ROOM_SID_KEY = 'msz:room:sid';

export interface StoredLocalProgress {
  readonly roundIndex: number;
  readonly results: readonly RoundResult[];
  readonly elapsedMs: number;
}

export interface StoredRoom {
  readonly schemaVersion: 1;
  readonly code: string;
  readonly role: RoomRole;
  readonly sid: string;
  readonly savedAt: number;
  readonly match: StartMsgBody | null;
  readonly local: StoredLocalProgress | null;
  readonly localPlayer: RoomPlayerInfo;
  readonly profileId?: string;
}

const DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];

function parsePlayer(raw: unknown): RoomPlayerInfo | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) return null;
  if (!isAnimalId(obj.avatar) || !isPlayerColor(obj.color)) return null;
  return { name: obj.name.trim(), avatar: obj.avatar, color: obj.color };
}

function parseMatch(raw: unknown): StartMsgBody | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.t !== 'start' || typeof obj.matchId !== 'string' || obj.matchId.length === 0) return null;
  if (typeof obj.gameId !== 'string' || !isGameId(obj.gameId)) return null;
  if (!DIFFICULTIES.includes(obj.difficulty as DifficultyId)) return null;
  if (typeof obj.seed !== 'number' || !Number.isFinite(obj.seed)) return null;
  if (obj.locale !== 'id' && obj.locale !== 'en') return null;
  if (typeof obj.totalRounds !== 'number' || !Number.isInteger(obj.totalRounds)) return null;
  if (typeof obj.countdownMs !== 'number' || !Number.isInteger(obj.countdownMs)) return null;
  return {
    t: 'start',
    matchId: obj.matchId,
    gameId: obj.gameId,
    difficulty: obj.difficulty as DifficultyId,
    seed: obj.seed >>> 0,
    locale: obj.locale,
    totalRounds: obj.totalRounds,
    countdownMs: obj.countdownMs,
  };
}

function parseLocalProgress(raw: unknown): StoredLocalProgress | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.roundIndex !== 'number' || !Number.isInteger(obj.roundIndex) || obj.roundIndex < 0) {
    return null;
  }
  if (typeof obj.elapsedMs !== 'number' || !Number.isFinite(obj.elapsedMs) || obj.elapsedMs < 0) {
    return null;
  }
  if (!Array.isArray(obj.results)) return null;
  const results: RoundResult[] = [];
  for (const item of obj.results) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const r = item as Record<string, unknown>;
    if (typeof r.firstTry !== 'boolean' || typeof r.attempts !== 'number') return null;
    results.push({ firstTry: r.firstTry, attempts: r.attempts });
  }
  return { roundIndex: obj.roundIndex, results, elapsedMs: obj.elapsedMs };
}

function parseStoredRoomRaw(raw: unknown): StoredRoom | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.schemaVersion !== 1) return null;
  if (typeof obj.code !== 'string' || !/^\d{4}$/.test(obj.code)) return null;
  if (obj.role !== 'host' && obj.role !== 'guest') return null;
  if (typeof obj.sid !== 'string' || obj.sid.length === 0) return null;
  if (typeof obj.savedAt !== 'number' || !Number.isFinite(obj.savedAt)) return null;

  const localPlayer = parsePlayer(obj.localPlayer);
  if (!localPlayer) return null;

  let match: StartMsgBody | null = null;
  if (obj.match !== null) {
    match = parseMatch(obj.match);
    if (!match) return null;
  }

  let local: StoredLocalProgress | null = null;
  if (obj.local !== null) {
    local = parseLocalProgress(obj.local);
    if (!local) return null;
  }

  return {
    schemaVersion: 1,
    code: obj.code,
    role: obj.role,
    sid: obj.sid,
    savedAt: obj.savedAt,
    match,
    local,
    localPlayer,
    ...(typeof obj.profileId === 'string' && obj.profileId.length > 0
      ? { profileId: obj.profileId }
      : {}),
  };
}

export function loadStoredRoom(now = Date.now()): StoredRoom | null {
  const parsed = readJSON('session', ROOM_ACTIVE_KEY, parseStoredRoomRaw);
  if (!parsed) return null;
  if (now - parsed.savedAt > ROOM_SESSION_MAX_AGE_MS) {
    removeKey('session', ROOM_ACTIVE_KEY);
    return null;
  }
  return parsed;
}

export function saveStoredRoom(room: StoredRoom): void {
  writeJSON('session', ROOM_ACTIVE_KEY, room);
}

export function clearStoredRoom(): void {
  removeKey('session', ROOM_ACTIVE_KEY);
}

function generateSid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `sid-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function getOrCreateSid(): string {
  const existing = readJSON('session', ROOM_SID_KEY, (v) =>
    typeof v === 'string' && v.trim().length > 0 ? v : null,
  );
  if (existing) return existing;
  const fresh = generateSid();
  writeJSON('session', ROOM_SID_KEY, fresh);
  return fresh;
}

export interface RoomControllerOptions {
  readonly code: string;
  readonly role: RoomRole;
  readonly me: RoomPlayerInfo;
  readonly content: string;
  readonly profileId?: string;
  readonly hostConfig?: HostMatchConfig;
  readonly restore?: StoredRoom | null;
}

export interface RoomViewSnapshot {
  readonly state: RoomState;
  readonly connStatus: ConnStatus;
  readonly localProgress: StoredLocalProgress | null;
  readonly localPlayer: RoomPlayerInfo;
  readonly profileId?: string;
}

interface RoomController {
  readonly key: string;
  opts: RoomControllerOptions;
  state: RoomState;
  connStatus: ConnStatus;
  localProgress: StoredLocalProgress | null;
  transport: RoomTransport | null;
  listeners: Set<() => void>;
  tickTimer: number | null;
  heartbeatTimer: number | null;
  lastSavedMatchId: string | null;
  snapshotCache: RoomViewSnapshot;
  setOpts: (opts: RoomControllerOptions) => void;
  teardown: (sendBye: boolean) => void;
  dispatchAction: (action: RoomAction) => void;
  sendHello: (resume?: Snapshot) => void;
  setReady: (ready: boolean) => void;
  confirmCountdownDone: () => void;
  reportLocal: (snap: Snapshot, local: StoredLocalProgress) => void;
  rematch: () => void;
  leave: () => void;
}

let activeController: RoomController | null = null;

function buildSnapshotCache(ctrl: RoomController): RoomViewSnapshot {
  return {
    state: ctrl.state,
    connStatus: ctrl.connStatus,
    localProgress: ctrl.localProgress,
    localPlayer: ctrl.opts.me,
    profileId: ctrl.opts.profileId,
  };
}

function persistController(ctrl: RoomController): void {
  if (ctrl.state.phase === 'final' || ctrl.state.phase === 'closed' || ctrl.state.phase === 'error') {
    return;
  }
  if (!ctrl.state.match && !ctrl.localProgress) return;
  saveStoredRoom({
    schemaVersion: 1,
    code: ctrl.state.code,
    role: ctrl.state.role,
    sid: ctrl.state.sid,
    savedAt: Date.now(),
    match: ctrl.state.match,
    local: ctrl.localProgress,
    localPlayer: ctrl.opts.me,
    profileId: ctrl.opts.profileId,
  });
}

function createRoomController(opts: RoomControllerOptions): RoomController {
  const sid = opts.restore?.sid ?? getOrCreateSid();
  const restoreSnap: Snapshot | undefined =
    opts.restore?.match && opts.restore.local
      ? {
          matchId: opts.restore.match.matchId,
          roundsDone: opts.restore.local.roundIndex,
          score: opts.restore.local.results.reduce(
            (sum, r) => sum + (r.firstTry || r.attempts <= 1 ? 3 : r.attempts === 2 ? 2 : 1),
            0,
          ),
          finished: opts.restore.local.roundIndex >= opts.restore.match.totalRounds,
          elapsedMs: opts.restore.local.elapsedMs,
        }
      : undefined;

  const initialState = createInitialRoomState({
    role: opts.role,
    code: opts.code,
    sid,
    localContent: opts.content,
    hostConfig: opts.hostConfig,
    phase: 'connecting',
    match: opts.restore?.match ?? null,
    me: restoreSnap ?? null,
  });

  const listeners = new Set<() => void>();
  const unsubs: Array<() => void> = [];
  const transport = createRoomTransport();

  const ctrl: RoomController = {
    key: `${opts.role}:${opts.code}`,
    opts,
    state: initialState,
    connStatus: transport ? 'connecting' : 'closed',
    localProgress: opts.restore?.local ?? null,
    transport,
    listeners,
    tickTimer: null,
    heartbeatTimer: null,
    lastSavedMatchId: opts.restore?.match?.matchId ?? null,
    snapshotCache: {
      state: initialState,
      connStatus: transport ? 'connecting' : 'closed',
      localProgress: opts.restore?.local ?? null,
      localPlayer: opts.me,
      profileId: opts.profileId,
    },
    setOpts(nextOpts: RoomControllerOptions) {
      ctrl.opts = nextOpts;
    },
    teardown(sendBye: boolean) {
      if (ctrl.tickTimer !== null && typeof window !== 'undefined') {
        window.clearInterval(ctrl.tickTimer);
        ctrl.tickTimer = null;
      }
      if (ctrl.heartbeatTimer !== null && typeof window !== 'undefined') {
        window.clearInterval(ctrl.heartbeatTimer);
        ctrl.heartbeatTimer = null;
      }
      for (const u of unsubs) u();
      unsubs.length = 0;
      ctrl.transport?.leave(sendBye);
      ctrl.transport = null;
      if (typeof window !== 'undefined' && typeof window.__MSZ_TEST__ === 'object' && window.__MSZ_TEST__) {
        delete window.__MSZ_TEST__.simulateRoomDrop;
      }
      if (activeController === ctrl) {
        activeController = null;
      }
    },
    sendHello(resume?: Snapshot) {
      const body: RoomMsgBody = {
        t: 'hello',
        role: ctrl.opts.role,
        player: ctrl.opts.me,
        content: ctrl.opts.content,
        ...(resume ? { resume } : {}),
        ...(ctrl.opts.hostConfig
          ? {
              gameInfo: {
                gameId: ctrl.opts.hostConfig.gameId,
                difficulty: ctrl.opts.hostConfig.difficulty,
              },
            }
          : {}),
      };
      ctrl.transport?.send(body);
    },
    dispatchAction(action: RoomAction) {
      const prev = ctrl.state;
      let next = roomReducer(prev, action);
      const effects = effectsFor(prev, next);
      for (const eff of effects) {
        if (eff.t === 'sync') {
          ctrl.transport?.send({ ...eff, hostPlayer: ctrl.opts.me });
        } else {
          ctrl.transport?.send(eff);
        }
      }
      if (next.phase === 'finalizing') {
        next = roomReducer(next, { type: 'FINALIZED' });
      }
      ctrl.state = next;

      if (next.match && next.match.matchId !== ctrl.lastSavedMatchId) {
        ctrl.lastSavedMatchId = next.match.matchId;
        ctrl.localProgress = null;
        persistController(ctrl);
      }

      if (prev.phase !== 'final' && next.phase === 'final') {
        clearStoredRoom();
      }

      if (next !== prev || effects.length > 0) {
        ctrl.snapshotCache = buildSnapshotCache(ctrl);
        for (const cb of listeners) cb();
      }
    },
    setReady(ready: boolean) {
      ctrl.dispatchAction({ type: 'SET_READY', ready });
    },
    confirmCountdownDone() {
      ctrl.dispatchAction({ type: 'COUNTDOWN_DONE' });
    },
    reportLocal(snap: Snapshot, local: StoredLocalProgress) {
      ctrl.localProgress = local;
      ctrl.dispatchAction({ type: 'LOCAL_SNAP', snap });
      if (ctrl.state.phase === 'playing') {
        ctrl.transport?.send({ t: 'snap', ...snap });
      }
      persistController(ctrl);
    },
    rematch() {
      ctrl.localProgress = null;
      ctrl.dispatchAction({ type: 'REMATCH' });
    },
    leave() {
      clearStoredRoom();
      ctrl.dispatchAction({ type: 'LEAVE' });
      ctrl.teardown(true);
    },
  };

  if (!transport) {
    ctrl.state = roomReducer(ctrl.state, { type: 'JOIN_FAILED', reason: 'offline' });
    ctrl.snapshotCache = buildSnapshotCache(ctrl);
    return ctrl;
  }

  let prevConn: ConnStatus = 'connecting';
  unsubs.push(
    transport.onStatus((status) => {
      const wasReconnecting = prevConn === 'reconnecting';
      prevConn = status;
      ctrl.connStatus = status;
      if (status === 'closed' && ctrl.state.phase !== 'error' && ctrl.state.phase !== 'closed') {
        ctrl.dispatchAction({ type: 'JOIN_FAILED', reason: 'replaced' });
      } else if (wasReconnecting && status === 'connected') {
        ctrl.sendHello(ctrl.state.me ?? undefined);
        if (ctrl.state.phase === 'playing' && ctrl.state.me) {
          ctrl.transport?.send({ t: 'snap', ...ctrl.state.me });
        }
      }
      ctrl.snapshotCache = buildSnapshotCache(ctrl);
      for (const cb of listeners) cb();
    }),
  );

  unsubs.push(
    transport.onMessage((msg) => {
      ctrl.dispatchAction({ type: 'MSG', msg, now: Date.now() });
    }),
  );

  unsubs.push(
    transport.onPresence((peerSid, _peerRole, present) => {
      ctrl.dispatchAction({ type: 'PEER_PRESENCE', sid: peerSid, present, now: Date.now() });
      if (present) {
        ctrl.sendHello(ctrl.state.me ?? undefined);
      }
    }),
  );

  if (typeof window !== 'undefined') {
    if (typeof window.__MSZ_TEST__ === 'object' && window.__MSZ_TEST__) {
      window.__MSZ_TEST__.simulateRoomDrop = (ms: number) => {
        ctrl.transport?.simulateDrop?.(ms);
      };
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && ctrl.state.phase === 'playing') {
        ctrl.sendHello(ctrl.state.me ?? undefined);
        if (ctrl.state.me) {
          ctrl.transport?.send({ t: 'snap', ...ctrl.state.me });
        }
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    unsubs.push(() => document.removeEventListener('visibilitychange', onVisibility));

    ctrl.tickTimer = window.setInterval(() => {
      ctrl.dispatchAction({ type: 'TICK', now: Date.now() });
    }, 500);

    ctrl.heartbeatTimer = window.setInterval(() => {
      if (ctrl.state.phase === 'playing' && ctrl.state.me) {
        ctrl.transport?.send({ t: 'snap', ...ctrl.state.me });
      }
    }, HEARTBEAT_MS);
  }

  void transport.join(opts.code, opts.role, sid).then((res) => {
    if (activeController !== ctrl) return;
    if (!res.ok) {
      ctrl.dispatchAction({ type: 'JOIN_FAILED', reason: res.reason as RoomError });
      return;
    }
    ctrl.dispatchAction({ type: 'JOINED' });
    ctrl.sendHello(restoreSnap);
  });

  return ctrl;
}

export function getOrCreateRoomController(opts: RoomControllerOptions): RoomController {
  const key = `${opts.role}:${opts.code}`;
  if (activeController && activeController.key === key && activeController.state.phase !== 'closed') {
    activeController.opts = opts;
    return activeController;
  }
  activeController?.teardown(false);
  activeController = createRoomController(opts);
  return activeController;
}

export function getActiveRoomController(): RoomController | null {
  return activeController;
}

export function resetRoomControllerForTest(): void {
  activeController?.teardown(false);
  activeController = null;
}
