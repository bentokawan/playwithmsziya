import { beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryFallback, removeKey } from '@/lib/storage/storage';
import { appendRecord, loadRecords, MAX_SCORE_RECORDS, SCORES_STORAGE_KEY } from './records';

describe('score records (Task 2)', () => {
  beforeEach(() => {
    clearMemoryFallback();
    removeKey('local', SCORES_STORAGE_KEY);
  });

  it('tracks personal best and non-negative improvement', () => {
    const base = {
      profileId: 'p1',
      gameId: 'ayo-berhitung' as const,
      difficulty: 'mudah' as const,
      mode: 'solo' as const,
      maxScore: 9,
      firstTryCount: 1,
      rounds: 3,
      finishedAt: '2026-11-26T10:00:00Z',
    };

    const first = appendRecord({ ...base, score: 5 });
    expect(first.isPersonalBest).toBe(true);
    expect(first.improvement).toBe(0);

    const higher = appendRecord({ ...base, score: 8, finishedAt: '2026-11-26T10:05:00Z' });
    expect(higher.isPersonalBest).toBe(true);
    expect(higher.improvement).toBe(3);

    const lower = appendRecord({ ...base, score: 6, finishedAt: '2026-11-26T10:10:00Z' });
    expect(lower.isPersonalBest).toBe(false);
    expect(lower.improvement).toBe(0);
  });

  it('caps stored records at 2000 dropping oldest', () => {
    const fakeStore = new Map<string, string>();
    const orig = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => fakeStore.get(k) ?? null,
        setItem: (k: string, v: string) => {
          fakeStore.set(k, v);
        },
        removeItem: (k: string) => {
          fakeStore.delete(k);
        },
      },
    });
    try {
      const seedRecords = Array.from({ length: MAX_SCORE_RECORDS }, (_, i) => ({
        id: `r-${i}`,
        profileId: 'p1',
        gameId: 'ayo-berhitung',
        difficulty: 'mudah',
        mode: 'solo',
        score: 5,
        maxScore: 9,
        firstTryCount: 1,
        rounds: 3,
        finishedAt: '2026-11-26T10:00:00Z',
      }));
      fakeStore.set(SCORES_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, records: seedRecords }));

      appendRecord({
        id: 'r-new',
        profileId: 'p1',
        gameId: 'ayo-berhitung',
        difficulty: 'mudah',
        mode: 'solo',
        score: 9,
        maxScore: 9,
        firstTryCount: 3,
        rounds: 3,
        finishedAt: '2026-11-26T11:00:00Z',
      });

      const loaded = loadRecords();
      expect(loaded).toHaveLength(MAX_SCORE_RECORDS);
      expect(loaded[0].id).toBe('r-1');
      expect(loaded.at(-1)?.id).toBe('r-new');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: orig });
    }
  });

  it('trims 500 oldest records and retries once when storage write fails', () => {
    let attempts = 0;
    let savedLen = 0;
    const fakeStore = new Map<string, string>();
    const orig = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => fakeStore.get(k) ?? null,
        setItem: (k: string, v: string) => {
          attempts += 1;
          if (attempts === 1) throw new DOMException('QuotaExceededError', 'QuotaExceededError');
          const parsed = JSON.parse(v) as { records: unknown[] };
          savedLen = parsed.records.length;
          fakeStore.set(k, v);
        },
        removeItem: (k: string) => {
          fakeStore.delete(k);
        },
      },
    });
    try {
      const seedRecords = Array.from({ length: 700 }, (_, i) => ({
        id: `r-${i}`,
        profileId: 'p1',
        gameId: 'ayo-berhitung',
        difficulty: 'mudah',
        mode: 'solo',
        score: 5,
        maxScore: 9,
        firstTryCount: 1,
        rounds: 3,
        finishedAt: '2026-11-26T10:00:00Z',
      }));
      fakeStore.set(SCORES_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, records: seedRecords }));

      appendRecord({
        id: 'r-extra',
        profileId: 'p1',
        gameId: 'ayo-berhitung',
        difficulty: 'mudah',
        mode: 'solo',
        score: 8,
        maxScore: 9,
        firstTryCount: 2,
        rounds: 3,
        finishedAt: '2026-11-26T11:00:00Z',
      });

      expect(attempts).toBe(2);
      expect(savedLen).toBe(201);
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: orig });
    }
  });
});
