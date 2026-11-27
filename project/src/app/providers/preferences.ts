import { isGameId, type GameId } from '@/games/ids';
import type { DifficultyId, Locale } from '@/lib/session/session';
import { readJSON } from '@/lib/storage/storage';
import {
  clampTimerSec,
  type GameTimerOverrides,
  type TimerLimitsByDifficulty,
} from '@/lib/timer/countdown';

export const PREFS_STORAGE_KEY = 'msz:prefs';
const LEGACY_LANG_KEY = 'lang';
const DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];

export interface Preferences {
  readonly schemaVersion: 1;
  readonly locale: Locale | null;
  readonly muted: boolean;
  readonly musicOn: boolean;
  readonly hijaiyyahNatureOnly: boolean;
  readonly calmMotion: boolean;
  readonly thickLines: boolean;
  readonly timerOn: boolean;
  /** Optional custom default timer durations (seconds) per difficulty. */
  readonly timerLimits?: TimerLimitsByDifficulty;
  /** Optional custom timer durations (seconds) per game and difficulty. */
  readonly gameTimers?: GameTimerOverrides;
}

export const DEFAULT_PREFS: Preferences = {
  schemaVersion: 1,
  locale: null,
  muted: false,
  musicOn: true,
  hijaiyyahNatureOnly: false,
  calmMotion: false,
  thickLines: false,
  timerOn: true,
};

function parseLocale(val: unknown): Locale | null {
  if (val === 'id' || val === 'en') return val;
  return null;
}

function parseBool(val: unknown, fallback: boolean): boolean {
  return typeof val === 'boolean' ? val : fallback;
}

function parseDifficultySeconds(raw: unknown): TimerLimitsByDifficulty | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const out: Partial<Record<DifficultyId, number>> = {};
  let hasAny = false;
  for (const diff of DIFFICULTIES) {
    const val = obj[diff];
    if (typeof val === 'number' && Number.isFinite(val)) {
      out[diff] = clampTimerSec(val);
      hasAny = true;
    }
  }
  return hasAny ? out : undefined;
}

function parseGameTimers(raw: unknown): GameTimerOverrides | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const obj = raw as Record<string, unknown>;
  const out: Partial<Record<GameId, TimerLimitsByDifficulty>> = {};
  let hasAny = false;
  for (const [key, val] of Object.entries(obj)) {
    if (!isGameId(key)) continue;
    const parsed = parseDifficultySeconds(val);
    if (parsed) {
      out[key] = parsed;
      hasAny = true;
    }
  }
  return hasAny ? out : undefined;
}

export function parsePrefs(raw: unknown): Preferences | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const timerLimits = parseDifficultySeconds(obj.timerLimits);
  const gameTimers = parseGameTimers(obj.gameTimers);
  return {
    schemaVersion: 1,
    locale: parseLocale(obj.locale),
    muted: parseBool(obj.muted, DEFAULT_PREFS.muted),
    musicOn: parseBool(obj.musicOn, DEFAULT_PREFS.musicOn),
    hijaiyyahNatureOnly: parseBool(obj.hijaiyyahNatureOnly, DEFAULT_PREFS.hijaiyyahNatureOnly),
    calmMotion: parseBool(obj.calmMotion, DEFAULT_PREFS.calmMotion),
    thickLines: parseBool(obj.thickLines, DEFAULT_PREFS.thickLines),
    timerOn: parseBool(obj.timerOn, DEFAULT_PREFS.timerOn),
    ...(timerLimits ? { timerLimits } : {}),
    ...(gameTimers ? { gameTimers } : {}),
  };
}

function readLegacyLang(): Locale | null {
  try {
    const val = globalThis.localStorage?.getItem(LEGACY_LANG_KEY);
    return val === 'id' || val === 'en' ? val : null;
  } catch {
    return null;
  }
}

export function loadInitialPrefs(): Preferences {
  const stored = readJSON('local', PREFS_STORAGE_KEY, parsePrefs);
  if (stored) return stored;

  const legacyLang = readLegacyLang();
  if (legacyLang) {
    return { ...DEFAULT_PREFS, locale: legacyLang };
  }
  return DEFAULT_PREFS;
}
