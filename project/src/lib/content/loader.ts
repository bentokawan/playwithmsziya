import { readContentBaseUrl } from './contentEnv';
import { readJSON, writeJSON } from '@/lib/storage/storage';
import { createBundledContent, type BundledMediaOptions } from './defaults';
import { parseManifest, type ManifestV1 } from './manifest';
import { resolveManifest } from './resolve';
import type { ResolvedContent } from './types';

export const CONTENT_CACHE_KEY = 'msz:content-cache';
const DEFAULT_TIMEOUT_MS = 2500;

interface CachedManifest {
  readonly version: number;
  readonly manifest: ManifestV1;
}

interface LatestPointer {
  readonly schemaVersion: 1;
  readonly version: number;
  readonly manifest: string;
}

function parseLatestPointer(raw: unknown): LatestPointer | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (
    obj.schemaVersion !== 1 ||
    typeof obj.version !== 'number' ||
    !Number.isInteger(obj.version) ||
    obj.version < 1 ||
    typeof obj.manifest !== 'string' ||
    obj.manifest.trim().length === 0
  ) {
    return null;
  }
  return { schemaVersion: 1, version: obj.version, manifest: obj.manifest };
}

function parseCachedManifest(raw: unknown): CachedManifest | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== 'number') return null;
  const manifest = parseManifest(obj.manifest);
  if (!manifest) return null;
  return { version: obj.version, manifest };
}

async function fetchJsonWithTimeout(
  url: string,
  fetchFn: typeof fetch,
  timeoutMs: number,
  cache?: RequestCache,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { cache, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    globalThis.clearTimeout(timer);
  }
}

export interface LoadContentOptions {
  readonly baseUrl?: string | null;
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
  readonly bundledMedia?: BundledMediaOptions;
}

export async function loadContent(
  opts: LoadContentOptions = {},
): Promise<{ readonly content: ResolvedContent; readonly source: 'cms' | 'cache' | 'bundled' }> {
  const bundled = createBundledContent(opts.bundledMedia);
  const baseUrl =
    opts.baseUrl !== undefined ? opts.baseUrl : readContentBaseUrl();

  if (!baseUrl) {
    return { content: bundled, source: 'bundled' };
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const fetchFn = opts.fetch ?? ((...args) => globalThis.fetch(...args));
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const latestRaw = await fetchJsonWithTimeout(
      `${cleanBase}/content/latest.json`,
      fetchFn,
      timeoutMs,
      'no-cache',
    );
    const pointer = parseLatestPointer(latestRaw);
    if (!pointer) throw new Error('Invalid latest.json');

    const manifestPath = pointer.manifest.replace(/^\/+/, '');
    const manifestRaw = await fetchJsonWithTimeout(
      `${cleanBase}/content/${manifestPath}`,
      fetchFn,
      timeoutMs,
    );
    const manifest = parseManifest(manifestRaw);
    if (!manifest) throw new Error('Invalid manifest');

    writeJSON('local', CONTENT_CACHE_KEY, {
      version: manifest.version,
      manifest,
    } satisfies CachedManifest);

    return {
      content: resolveManifest(manifest, bundled, 'cms'),
      source: 'cms',
    };
  } catch {
    const cached = readJSON('local', CONTENT_CACHE_KEY, parseCachedManifest);
    if (cached) {
      return {
        content: resolveManifest(cached.manifest, bundled, 'cache'),
        source: 'cache',
      };
    }
    return { content: bundled, source: 'bundled' };
  }
}
