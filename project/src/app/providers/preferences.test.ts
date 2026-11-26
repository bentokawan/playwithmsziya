import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryFallback } from '@/lib/storage/storage';
import { DEFAULT_PREFS, loadInitialPrefs, parsePrefs, PREFS_STORAGE_KEY } from './preferences';

function createMockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

describe('preferences', () => {
  const originalLocal = globalThis.localStorage;

  beforeEach(() => {
    clearMemoryFallback();
    Object.defineProperty(globalThis, 'localStorage', {
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
  });

  it('returns default preferences when storage is empty', () => {
    expect(loadInitialPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('fills defaults for invalid or missing fields', () => {
    expect(parsePrefs('bad')).toBeNull();
    expect(
      parsePrefs({
        schemaVersion: 99,
        locale: 'fr',
        muted: 'yes',
        musicOn: false,
        calmMotion: true,
      }),
    ).toEqual({
      schemaVersion: 1,
      locale: null,
      muted: false,
      musicOn: false,
      hijaiyyahNatureOnly: false,
      calmMotion: true,
      thickLines: false,
    });
  });

  it('migrates legacy localStorage.lang when msz:prefs is absent', () => {
    globalThis.localStorage.setItem('lang', 'en');
    expect(loadInitialPrefs()).toEqual({
      ...DEFAULT_PREFS,
      locale: 'en',
    });

    globalThis.localStorage.setItem(
      PREFS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_PREFS, locale: 'id' }),
    );
    expect(loadInitialPrefs().locale).toBe('id');
  });
});
