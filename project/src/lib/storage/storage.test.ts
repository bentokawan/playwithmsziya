import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryFallback, readJSON, removeKey, writeJSON } from './storage';

function createMockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

describe('storage', () => {
  const originalLocal = globalThis.localStorage;
  const originalSession = globalThis.sessionStorage;

  beforeEach(() => {
    clearMemoryFallback();
    Object.defineProperty(globalThis, 'localStorage', {
      value: createMockStorage(),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: createMockStorage(),
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocal,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: originalSession,
      configurable: true,
      writable: true,
    });
  });

  it('roundtrips valid JSON data', () => {
    const ok = writeJSON('local', 'msz:prefs', { schemaVersion: 1, muted: true });
    expect(ok).toBe(true);
    const value = readJSON('local', 'msz:prefs', (raw) => {
      if (raw && typeof raw === 'object' && 'muted' in raw) {
        return raw as { schemaVersion: number; muted: boolean };
      }
      return null;
    });
    expect(value).toEqual({ schemaVersion: 1, muted: true });
  });

  it('returns null for corrupt JSON', () => {
    globalThis.localStorage.setItem('msz:bad', '{not-json');
    expect(readJSON('local', 'msz:bad', (raw) => raw)).toBeNull();
  });

  it('falls back to in-memory storage when native storage throws', () => {
    const throwingStorage: Storage = {
      length: 0,
      clear: () => {
        throw new Error('blocked');
      },
      getItem: () => {
        throw new Error('blocked');
      },
      key: () => null,
      removeItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: throwingStorage,
      configurable: true,
      writable: true,
    });

    expect(writeJSON('local', 'msz:fallback', { ok: 1 })).toBe(false);
    expect(readJSON('local', 'msz:fallback', (raw) => raw)).toEqual({ ok: 1 });
    removeKey('local', 'msz:fallback');
    expect(readJSON('local', 'msz:fallback', (raw) => raw)).toBeNull();
  });

  it('returns null when parser rejects data', () => {
    writeJSON('session', 'msz:outcome', { wrong: true });
    expect(readJSON('session', 'msz:outcome', () => null)).toBeNull();
  });
});
