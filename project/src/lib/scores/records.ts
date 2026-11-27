import { isGameId, type GameId } from '@/games/ids';
import type { DifficultyId } from '@/lib/session/session';
import { readJSON, writeJSON } from '@/lib/storage/storage';
import type { PlayMode } from './scoring';

export const SCORES_STORAGE_KEY = 'msz:scores:v1';
export const MAX_SCORE_RECORDS = 2000;
const TRIM_ON_QUOTA = 500;

export interface SessionRecord {
  readonly id: string;
  readonly profileId: string;
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
  readonly mode: PlayMode;
  readonly score: number;
  readonly maxScore: number;
  readonly firstTryCount: number;
  readonly rounds: number;
  readonly finishedAt: string;
  readonly won?: boolean;
}

const VALID_DIFFICULTIES: readonly DifficultyId[] = ['mudah', 'sedang', 'tantang'];
const VALID_MODES: readonly PlayMode[] = ['solo', 'giliran', 'layar', 'online'];

function generateRecordId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `r-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function parseRecordItem(raw: unknown): SessionRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || obj.id.length === 0) return null;
  if (typeof obj.profileId !== 'string' || obj.profileId.length === 0) return null;
  if (typeof obj.gameId !== 'string' || !isGameId(obj.gameId)) return null;
  if (!VALID_DIFFICULTIES.includes(obj.difficulty as DifficultyId)) return null;
  if (!VALID_MODES.includes(obj.mode as PlayMode)) return null;
  if (
    typeof obj.score !== 'number' ||
    typeof obj.maxScore !== 'number' ||
    typeof obj.firstTryCount !== 'number' ||
    typeof obj.rounds !== 'number' ||
    typeof obj.finishedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: obj.id,
    profileId: obj.profileId,
    gameId: obj.gameId,
    difficulty: obj.difficulty as DifficultyId,
    mode: obj.mode as PlayMode,
    score: obj.score,
    maxScore: obj.maxScore,
    firstTryCount: obj.firstTryCount,
    rounds: obj.rounds,
    finishedAt: obj.finishedAt,
    ...(typeof obj.won === 'boolean' ? { won: obj.won } : {}),
  };
}

function parseEnvelope(raw: unknown): SessionRecord[] | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const env = raw as Record<string, unknown>;
  if (env.schemaVersion !== 1 || !Array.isArray(env.records)) return null;
  const out: SessionRecord[] = [];
  for (const item of env.records) {
    const rec = parseRecordItem(item);
    if (rec) out.push(rec);
  }
  return out;
}

export function loadRecords(): SessionRecord[] {
  return readJSON('local', SCORES_STORAGE_KEY, parseEnvelope) ?? [];
}

export function clearRecords(): void {
  writeJSON('local', SCORES_STORAGE_KEY, {
    schemaVersion: 1,
    records: [],
  });
}

function saveRecordsWithRetry(records: readonly SessionRecord[]): void {
  const ok = writeJSON('local', SCORES_STORAGE_KEY, {
    schemaVersion: 1,
    records,
  });
  if (!ok && records.length > TRIM_ON_QUOTA) {
    const trimmed = records.slice(TRIM_ON_QUOTA);
    writeJSON('local', SCORES_STORAGE_KEY, {
      schemaVersion: 1,
      records: trimmed,
    });
  }
}

export function appendRecord(
  input: Omit<SessionRecord, 'id'> & { readonly id?: string },
): {
  readonly record: SessionRecord;
  readonly isPersonalBest: boolean;
  readonly improvement: number;
} {
  const existing = loadRecords();
  const prevSame = existing.filter(
    (r) =>
      r.profileId === input.profileId &&
      r.gameId === input.gameId &&
      r.difficulty === input.difficulty,
  );

  let isPersonalBest: boolean;
  let improvement: number;

  if (prevSame.length === 0) {
    isPersonalBest = true;
    improvement = 0;
  } else {
    const prevBest = Math.max(...prevSame.map((r) => r.score));
    if (input.score > prevBest) {
      isPersonalBest = true;
      improvement = input.score - prevBest;
    } else {
      isPersonalBest = false;
      improvement = 0;
    }
  }

  const record: SessionRecord = {
    ...input,
    id: input.id ?? generateRecordId(),
  };

  let next = [...existing, record];
  if (next.length > MAX_SCORE_RECORDS) {
    next = next.slice(next.length - MAX_SCORE_RECORDS);
  }
  saveRecordsWithRetry(next);

  return { record, isPersonalBest, improvement };
}
