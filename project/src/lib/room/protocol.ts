import { isGameId, type GameId } from '@/games/ids';
import type { ResolvedContent } from '@/lib/content/types';
import {
  isAnimalId,
  isPlayerColor,
  MAX_PROFILE_NAME_LEN,
  type AnimalId,
  type PlayerColor,
} from '@/lib/profiles/profiles';
import type { Rng } from '@/lib/random/rng';
import type { DifficultyId, Locale } from '@/lib/session/session';

export const RECONNECT_GRACE_MS = 30_000;
export const HEARTBEAT_MS = 2_000;
export const PEER_STALE_MS = 6_000;
export const COUNTDOWN_MS = 3_000;
export const LAST_CALL_MS = 15_000;
export const ROOM_SESSION_MAX_AGE_MS = 600_000;
export const MAX_SNAP_ROUNDS = 50;

export interface RoomPlayerInfo {
  readonly name: string;
  readonly avatar: AnimalId;
  readonly color: PlayerColor;
}

export type RoomRole = 'host' | 'guest';

export interface Snapshot {
  readonly matchId: string;
  readonly roundsDone: number;
  readonly score: number;
  readonly finished: boolean;
  readonly elapsedMs: number;
}

export interface GameInfoSummary {
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
}

export interface StartMsgBody {
  readonly t: 'start';
  readonly matchId: string;
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
  readonly seed: number;
  readonly locale: Locale;
  readonly totalRounds: number;
  readonly countdownMs: number;
}

export type FinalWinner = 'host' | 'guest' | 'seri' | null;
export type FinalReason = 'all-done' | 'last-call' | 'peer-gone';

export interface FinalMsgBody {
  readonly t: 'final';
  readonly matchId: string;
  readonly scores: {
    readonly host: number;
    readonly guest: number;
  };
  readonly maxScore: number;
  readonly winner: FinalWinner;
  readonly reason: FinalReason;
}

export type RoomMsgBody =
  | {
      readonly t: 'hello';
      readonly role: RoomRole;
      readonly player: RoomPlayerInfo;
      readonly content: string;
      readonly resume?: Snapshot;
      readonly gameInfo?: GameInfoSummary;
    }
  | {
      readonly t: 'ready';
      readonly ready: boolean;
    }
  | StartMsgBody
  | ({ readonly t: 'snap' } & Snapshot)
  | FinalMsgBody
  | {
      readonly t: 'sync';
      readonly start: StartMsgBody;
      readonly hostSnap: Snapshot | null;
      readonly hostPlayer?: RoomPlayerInfo;
    }
  | {
      readonly t: 'rematch';
      readonly matchId: string;
    }
  | {
      readonly t: 'bye';
    };

export type RoomMsg = {
  readonly v: 2;
  readonly seq: number;
  readonly sid: string;
} & RoomMsgBody;

const DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];
const REASONS: readonly FinalReason[] = ['all-done', 'last-call', 'peer-gone'];

function isFiniteNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isNonNegInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0;
}

function parsePlayerInfo(raw: unknown): RoomPlayerInfo | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.name !== 'string') return null;
  const name = obj.name.trim();
  if (name.length === 0 || name.length > MAX_PROFILE_NAME_LEN) return null;
  if (!isAnimalId(obj.avatar) || !isPlayerColor(obj.color)) return null;
  return { name, avatar: obj.avatar, color: obj.color };
}

function parseSnapshot(raw: unknown): Snapshot | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.matchId !== 'string' || obj.matchId.length === 0 || obj.matchId.length > 32) {
    return null;
  }
  if (!isNonNegInt(obj.roundsDone) || obj.roundsDone > MAX_SNAP_ROUNDS) return null;
  if (!isFiniteNum(obj.score) || obj.score < 0) return null;
  if (typeof obj.finished !== 'boolean') return null;
  if (!isFiniteNum(obj.elapsedMs) || obj.elapsedMs < 0) return null;
  return {
    matchId: obj.matchId,
    roundsDone: obj.roundsDone,
    score: obj.score,
    finished: obj.finished,
    elapsedMs: obj.elapsedMs,
  };
}

function parseStartBody(obj: Record<string, unknown>): StartMsgBody | null {
  if (typeof obj.matchId !== 'string' || obj.matchId.length === 0 || obj.matchId.length > 32) {
    return null;
  }
  if (typeof obj.gameId !== 'string' || !isGameId(obj.gameId)) return null;
  if (!DIFFICULTIES.includes(obj.difficulty as DifficultyId)) return null;
  if (!isFiniteNum(obj.seed)) return null;
  if (obj.locale !== 'id' && obj.locale !== 'en') return null;
  if (!isNonNegInt(obj.totalRounds) || obj.totalRounds < 1 || obj.totalRounds > MAX_SNAP_ROUNDS) {
    return null;
  }
  if (!isNonNegInt(obj.countdownMs)) return null;
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

function parseGameInfo(raw: unknown): GameInfoSummary | undefined | null {
  if (raw === undefined) return undefined;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.gameId !== 'string' || !isGameId(obj.gameId)) return null;
  if (!DIFFICULTIES.includes(obj.difficulty as DifficultyId)) return null;
  return { gameId: obj.gameId, difficulty: obj.difficulty as DifficultyId };
}

export function parseRoomMsg(raw: unknown): RoomMsg | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (obj.v !== 2 || !isNonNegInt(obj.seq) || obj.seq < 1) return null;
  if (typeof obj.sid !== 'string' || obj.sid.trim().length === 0 || obj.sid.length > 64) {
    return null;
  }
  if (typeof obj.t !== 'string') return null;
  const base = { v: 2 as const, seq: obj.seq, sid: obj.sid };

  switch (obj.t) {
    case 'hello': {
      if (obj.role !== 'host' && obj.role !== 'guest') return null;
      const player = parsePlayerInfo(obj.player);
      if (!player || typeof obj.content !== 'string' || obj.content.length === 0) return null;
      let resume: Snapshot | undefined;
      if (obj.resume !== undefined) {
        const parsedSnap = parseSnapshot(obj.resume);
        if (!parsedSnap) return null;
        resume = parsedSnap;
      }
      const gameInfo = parseGameInfo(obj.gameInfo);
      if (gameInfo === null) return null;
      return {
        ...base,
        t: 'hello',
        role: obj.role,
        player,
        content: obj.content,
        ...(resume ? { resume } : {}),
        ...(gameInfo ? { gameInfo } : {}),
      };
    }
    case 'ready': {
      if (typeof obj.ready !== 'boolean') return null;
      return { ...base, t: 'ready', ready: obj.ready };
    }
    case 'start': {
      const start = parseStartBody(obj);
      if (!start) return null;
      return { ...base, ...start };
    }
    case 'snap': {
      const snap = parseSnapshot(obj);
      if (!snap) return null;
      return { ...base, t: 'snap', ...snap };
    }
    case 'final': {
      if (typeof obj.matchId !== 'string' || obj.matchId.length === 0 || obj.matchId.length > 32) {
        return null;
      }
      if (!obj.scores || typeof obj.scores !== 'object' || Array.isArray(obj.scores)) return null;
      const scoresObj = obj.scores as Record<string, unknown>;
      if (
        !isFiniteNum(scoresObj.host) ||
        scoresObj.host < 0 ||
        !isFiniteNum(scoresObj.guest) ||
        scoresObj.guest < 0
      ) {
        return null;
      }
      if (!isFiniteNum(obj.maxScore) || obj.maxScore < 0) return null;
      const winner = obj.winner;
      if (winner !== 'host' && winner !== 'guest' && winner !== 'seri' && winner !== null) {
        return null;
      }
      if (!REASONS.includes(obj.reason as FinalReason)) return null;
      return {
        ...base,
        t: 'final',
        matchId: obj.matchId,
        scores: { host: scoresObj.host, guest: scoresObj.guest },
        maxScore: obj.maxScore,
        winner,
        reason: obj.reason as FinalReason,
      };
    }
    case 'sync': {
      if (!obj.start || typeof obj.start !== 'object' || Array.isArray(obj.start)) return null;
      const start = parseStartBody(obj.start as Record<string, unknown>);
      if (!start) return null;
      let hostSnap: Snapshot | null = null;
      if (obj.hostSnap !== null) {
        const parsed = parseSnapshot(obj.hostSnap);
        if (!parsed) return null;
        hostSnap = parsed;
      }
      let hostPlayer: RoomPlayerInfo | undefined;
      if (obj.hostPlayer !== undefined) {
        const parsedPlayer = parsePlayerInfo(obj.hostPlayer);
        if (!parsedPlayer) return null;
        hostPlayer = parsedPlayer;
      }
      return { ...base, t: 'sync', start, hostSnap, ...(hostPlayer ? { hostPlayer } : {}) };
    }
    case 'rematch': {
      if (typeof obj.matchId !== 'string' || obj.matchId.length === 0 || obj.matchId.length > 32) {
        return null;
      }
      return { ...base, t: 'rematch', matchId: obj.matchId };
    }
    case 'bye':
      return { ...base, t: 'bye' };
    default:
      return null;
  }
}

export function newRoomCode(rng?: Rng): string {
  const n = rng
    ? rng.int(0, 9999)
    : typeof globalThis.crypto?.getRandomValues === 'function'
      ? globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % 10000
      : Math.floor(Math.random() * 10000);
  return String(n).padStart(4, '0');
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function contentFingerprint(content: ResolvedContent): string {
  const objIds = Array.from(content.objects.keys()).sort();
  const wordKeys = content.words
    .map((w) => `${w.locale}:${w.word}:${w.objectId}`)
    .sort();
  const hijaIds = Array.from(content.hijaiyyah.keys()).sort();
  return fnv1a(`${objIds.join(',')}|${wordKeys.join(',')}|${hijaIds.join(',')}`);
}
