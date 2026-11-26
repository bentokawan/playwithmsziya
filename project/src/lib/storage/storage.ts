export type StorageArea = 'local' | 'session';

const memoryFallback: Record<StorageArea, Map<string, string>> = {
  local: new Map(),
  session: new Map(),
};

function getNativeStorage(area: StorageArea): Storage | null {
  try {
    const storage = area === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
    if (!storage) return null;
    return storage;
  } catch {
    return null;
  }
}

export function readJSON<T>(
  area: StorageArea,
  key: string,
  parse: (raw: unknown) => T | null,
): T | null {
  let rawText: string | null;
  const storage = getNativeStorage(area);
  if (storage) {
    try {
      rawText = storage.getItem(key);
    } catch {
      rawText = memoryFallback[area].get(key) ?? null;
    }
  } else {
    rawText = memoryFallback[area].get(key) ?? null;
  }

  if (rawText === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return null;
  }

  try {
    return parse(parsed);
  } catch {
    return null;
  }
}

export function writeJSON(area: StorageArea, key: string, value: unknown): boolean {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    return false;
  }

  const storage = getNativeStorage(area);
  if (storage) {
    try {
      storage.setItem(key, serialized);
      return true;
    } catch {
      memoryFallback[area].set(key, serialized);
      return false;
    }
  }

  memoryFallback[area].set(key, serialized);
  return false;
}

export function removeKey(area: StorageArea, key: string): void {
  memoryFallback[area].delete(key);
  const storage = getNativeStorage(area);
  if (storage) {
    try {
      storage.removeItem(key);
    } catch {
      /* ignore storage errors */
    }
  }
}

export function clearMemoryFallback(): void {
  memoryFallback.local.clear();
  memoryFallback.session.clear();
}
