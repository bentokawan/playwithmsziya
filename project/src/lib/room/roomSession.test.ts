import { beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryFallback, removeKey } from '@/lib/storage/storage';
import { ROOM_SESSION_MAX_AGE_MS } from './protocol';
import {
  clearStoredRoom,
  getOrCreateSid,
  loadStoredRoom,
  ROOM_ACTIVE_KEY,
  ROOM_SID_KEY,
  saveStoredRoom,
  type StoredRoom,
} from './roomSession';

const SAMPLE_ROOM: StoredRoom = {
  schemaVersion: 1,
  code: '4821',
  role: 'guest',
  sid: 'sid-123',
  savedAt: 1_000_000,
  match: {
    t: 'start',
    matchId: '3f',
    gameId: 'ayo-berhitung',
    difficulty: 'mudah',
    seed: 123,
    locale: 'id',
    totalRounds: 3,
    countdownMs: 3000,
  },
  local: {
    roundIndex: 1,
    results: [{ firstTry: true, attempts: 1 }],
    elapsedMs: 4200,
  },
  localPlayer: { name: 'Ana', avatar: 'kelinci', color: 'biru' },
  profileId: 'ana',
};

describe('roomSession (Task 3)', () => {
  beforeEach(() => {
    clearMemoryFallback();
    removeKey('session', ROOM_ACTIVE_KEY);
    removeKey('session', ROOM_SID_KEY);
  });

  it('round-trips saved StoredRoom within max age', () => {
    saveStoredRoom(SAMPLE_ROOM);
    const loaded = loadStoredRoom(1_000_000 + 60_000);
    expect(loaded).toEqual(SAMPLE_ROOM);
  });

  it('returns null and clears key when age exceeds ROOM_SESSION_MAX_AGE_MS (10 min)', () => {
    saveStoredRoom(SAMPLE_ROOM);
    const expired = loadStoredRoom(1_000_000 + ROOM_SESSION_MAX_AGE_MS + 60_000);
    expect(expired).toBeNull();
    // Should stay deleted even if checked with earlier timestamp
    expect(loadStoredRoom(1_000_000)).toBeNull();
  });

  it('handles corrupt JSON safely and clears cleanly', () => {
    const fakeStore = new Map<string, string>();
    const orig = globalThis.sessionStorage;
    Object.defineProperty(globalThis, 'sessionStorage', {
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
      fakeStore.set(ROOM_ACTIVE_KEY, '{corrupt json');
      expect(loadStoredRoom(1_000_000)).toBeNull();
      clearStoredRoom();
      expect(fakeStore.has(ROOM_ACTIVE_KEY)).toBe(false);
    } finally {
      Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: orig });
    }
  });

  it('keeps getOrCreateSid stable within a session', () => {
    const s1 = getOrCreateSid();
    const s2 = getOrCreateSid();
    expect(s1.length).toBeGreaterThan(0);
    expect(s2).toBe(s1);
  });
});
