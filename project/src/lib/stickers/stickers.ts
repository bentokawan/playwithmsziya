import { isStickerId, STICKERS, type StickerId } from '@/content/stickers';
import type { WorldId } from '@/games/ids';
import type { Rng } from '@/lib/random/rng';
import { readJSON, writeJSON } from '@/lib/storage/storage';

export const STICKERS_STORAGE_KEY = 'msz:stickers';

interface StoredStickers {
  readonly schemaVersion: 1;
  readonly owned: StickerId[];
}

function parseStoredStickers(raw: unknown): StoredStickers | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.owned)) return null;
  const unique = new Set<StickerId>();
  for (const item of obj.owned) {
    if (typeof item === 'string' && isStickerId(item)) {
      unique.add(item);
    }
  }
  return { schemaVersion: 1, owned: Array.from(unique) };
}

export function loadStickers(): StickerId[] {
  const stored = readJSON('local', STICKERS_STORAGE_KEY, parseStoredStickers);
  return stored ? stored.owned : [];
}

export function saveStickers(owned: readonly StickerId[]): boolean {
  const unique = Array.from(new Set(owned));
  return writeJSON('local', STICKERS_STORAGE_KEY, {
    schemaVersion: 1,
    owned: unique,
  } satisfies StoredStickers);
}

export function awardSticker(
  owned: readonly StickerId[],
  worldId: WorldId,
  rng: Rng,
): { readonly stickerId: StickerId; readonly isNew: boolean } {
  const ownedSet = new Set(owned);
  const worldStickers = STICKERS[worldId];
  const nextUnowned = worldStickers.find((s) => !ownedSet.has(s.id));
  if (nextUnowned) {
    return { stickerId: nextUnowned.id, isNew: true };
  }
  const picked = rng.pick(worldStickers);
  return { stickerId: picked.id, isNew: false };
}
