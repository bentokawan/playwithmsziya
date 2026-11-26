import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearMemoryFallback, writeJSON } from '@/lib/storage/storage';
import { CONTENT_CACHE_KEY, loadContent } from './loader';
import { SAMPLE_MANIFEST } from './manifest.test';

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

describe('loadContent', () => {
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
    vi.useRealTimers();
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocal,
      configurable: true,
      writable: true,
    });
  });

  it('returns bundled content when baseUrl is null', async () => {
    const res = await loadContent({ baseUrl: null });
    expect(res.source).toBe('bundled');
    expect(res.content.source).toBe('bundled');
  });

  it('loads manifest from CMS and caches it locally', async () => {
    const mockFetch = vi.fn(async (url: string | URL | Request) => {
      const s = String(url);
      if (s.endsWith('/content/latest.json')) {
        return {
          ok: true,
          json: async () => ({
            schemaVersion: 1,
            version: 2,
            manifest: 'manifests/manifest-2.json',
          }),
        };
      }
      if (s.endsWith('/content/manifests/manifest-2.json')) {
        return { ok: true, json: async () => SAMPLE_MANIFEST };
      }
      return { ok: false, status: 404, json: async () => null };
    }) as unknown as typeof fetch;

    const res = await loadContent({ baseUrl: 'https://cdn.example.com', fetch: mockFetch });
    expect(res.source).toBe('cms');
    expect(res.content.version).toBe(2);
    expect(res.content.objects.get('mango')?.name.id).toBe('mangga');
  });

  it('falls back to cache when fetch times out, or bundled when no cache exists', async () => {
    vi.useFakeTimers();

    const hangingFetch = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    ) as unknown as typeof fetch;

    const noCachePromise = loadContent({
      baseUrl: 'https://cdn.example.com',
      fetch: hangingFetch,
      timeoutMs: 2500,
    });
    await vi.advanceTimersByTimeAsync(2600);
    const noCacheRes = await noCachePromise;
    expect(noCacheRes.source).toBe('bundled');

    writeJSON('local', CONTENT_CACHE_KEY, { version: 2, manifest: SAMPLE_MANIFEST });
    const cachedPromise = loadContent({
      baseUrl: 'https://cdn.example.com',
      fetch: hangingFetch,
      timeoutMs: 2500,
    });
    await vi.advanceTimersByTimeAsync(2600);
    const cachedRes = await cachedPromise;
    expect(cachedRes.source).toBe('cache');
    expect(cachedRes.content.version).toBe(2);
  });
});
