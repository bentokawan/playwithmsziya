import { CATALOG } from '@/games/catalog';
import type { GameId } from '@/games/ids';
import type { PlayMode } from '@/lib/scores/scoring';

export type DifficultyId = 'mudah' | 'sedang' | 'tantang';
export type PlayerCount = 1 | 2;
export type PlayerNumber = 1 | 2;
export type Locale = 'id' | 'en';

export interface SessionConfig {
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
  readonly mode: PlayMode;
  readonly players: PlayerCount;
  readonly profileIds: readonly [string | undefined, string | undefined];
  readonly room?: string;
  readonly locale: Locale;
  readonly seed: number;
}

const DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];
const PLAY_MODES: readonly PlayMode[] = ['solo', 'giliran', 'layar', 'online'];
const ROOM_RE = /^\d{4}$/;

function parseSeed(raw: string | null): number {
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 0 || n > 0xffffffff) return 1;
  return n >>> 0;
}

function resolveMode(gameId: GameId, search: URLSearchParams): PlayMode {
  const supported = CATALOG[gameId].modes;
  const rawMode = search.get('mode');
  if (rawMode && PLAY_MODES.includes(rawMode as PlayMode)) {
    const mode = rawMode as PlayMode;
    if (supported.includes(mode)) return mode;
    if (mode === 'layar' && supported.includes('giliran')) return 'giliran';
    return 'solo';
  }
  if (search.get('players') === '2' && supported.includes('giliran')) {
    return 'giliran';
  }
  return 'solo';
}

export function parseSessionConfig(
  gameId: GameId,
  search: URLSearchParams,
  knownProfileIds?: ReadonlySet<string>,
): SessionConfig {
  const level = search.get('level');
  const difficulty = DIFFICULTIES.includes(level as DifficultyId)
    ? (level as DifficultyId)
    : 'mudah';

  const mode = resolveMode(gameId, search);
  const players: PlayerCount = mode === 'giliran' || mode === 'layar' ? 2 : 1;

  const rawP1 = search.get('p1');
  const rawP2 = search.get('p2');
  const p1 = rawP1 && knownProfileIds?.has(rawP1) ? rawP1 : undefined;
  const p2 = rawP2 && knownProfileIds?.has(rawP2) ? rawP2 : undefined;

  const rawRoom = search.get('room');
  const room = rawRoom && ROOM_RE.test(rawRoom) ? rawRoom : undefined;

  return {
    gameId,
    difficulty,
    mode,
    players,
    profileIds: [p1, p2],
    ...(room ? { room } : {}),
    locale: search.get('lang') === 'en' ? 'en' : 'id',
    seed: parseSeed(search.get('seed')),
  };
}

export function buildSessionSearch(config: SessionConfig): string {
  const params = new URLSearchParams();
  params.set('level', config.difficulty);
  params.set('mode', config.mode);
  params.set('players', String(config.players));
  if (config.profileIds[0]) params.set('p1', config.profileIds[0]);
  if (config.profileIds[1]) params.set('p2', config.profileIds[1]);
  if (config.room && ROOM_RE.test(config.room)) params.set('room', config.room);
  params.set('lang', config.locale);
  params.set('seed', String(config.seed >>> 0));
  return params.toString();
}

/**
 * Generates a uint32 session seed. Only call from Intro or Result when starting a new session.
 */
export function newSeed(): number {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] >>> 0;
  }
  return (Date.now() >>> 0) || 1;
}
