import { readJSON, writeJSON } from '@/lib/storage/storage';

export const ANIMAL_IDS = [
  'kelinci',
  'kucing',
  'beruang',
  'panda',
  'rubah',
  'katak',
  'ayam',
  'gajah',
  'singa',
  'penguin',
] as const;
export type AnimalId = (typeof ANIMAL_IDS)[number];

export const PLAYER_COLORS = [
  'merah',
  'oranye',
  'kuning',
  'hijau',
  'tosca',
  'biru',
  'ungu',
  'merah-muda',
] as const;
export type PlayerColor = (typeof PLAYER_COLORS)[number];

export interface Profile {
  readonly id: string;
  readonly name: string;
  readonly avatar: AnimalId;
  readonly color: PlayerColor;
  readonly createdAt: string;
  readonly archived: boolean;
}

export interface ProfileInput {
  readonly name: string;
  readonly avatar: AnimalId;
  readonly color: PlayerColor;
}

export const PROFILES_STORAGE_KEY = 'msz:profiles:v1';
export const MAX_ACTIVE_PROFILES = 40;
export const MAX_PROFILE_NAME_LEN = 12;

let persistRequested = false;

export function isAnimalId(v: unknown): v is AnimalId {
  return typeof v === 'string' && (ANIMAL_IDS as readonly string[]).includes(v);
}

export function isPlayerColor(v: unknown): v is PlayerColor {
  return typeof v === 'string' && (PLAYER_COLORS as readonly string[]).includes(v);
}

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function parseProfileItem(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || obj.id.trim().length === 0) return null;
  if (typeof obj.name !== 'string') return null;
  const name = obj.name.trim();
  if (name.length === 0 || name.length > MAX_PROFILE_NAME_LEN) return null;
  if (!isAnimalId(obj.avatar) || !isPlayerColor(obj.color)) return null;
  if (typeof obj.createdAt !== 'string' || obj.createdAt.length === 0) return null;
  const archived = typeof obj.archived === 'boolean' ? obj.archived : false;
  return {
    id: obj.id,
    name,
    avatar: obj.avatar,
    color: obj.color,
    createdAt: obj.createdAt,
    archived,
  };
}

function parseEnvelope(raw: unknown): Profile[] | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const env = raw as Record<string, unknown>;
  if (env.schemaVersion !== 1 || !Array.isArray(env.profiles)) return null;
  const out: Profile[] = [];
  const seen = new Set<string>();
  for (const item of env.profiles) {
    const p = parseProfileItem(item);
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

export function loadProfiles(): Profile[] {
  return readJSON('local', PROFILES_STORAGE_KEY, parseEnvelope) ?? [];
}

export function activeProfiles(list: readonly Profile[]): Profile[] {
  return list
    .filter((p) => !p.archived)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function isComboTaken(
  list: readonly Profile[],
  avatar: AnimalId,
  color: PlayerColor,
  excludeId?: string,
): boolean {
  return list.some(
    (p) => !p.archived && p.id !== excludeId && p.avatar === avatar && p.color === color,
  );
}

export function isNameTaken(
  list: readonly Profile[],
  name: string,
  excludeId?: string,
): boolean {
  const norm = name.trim().toLocaleLowerCase();
  if (norm.length === 0) return false;
  return list.some(
    (p) => !p.archived && p.id !== excludeId && p.name.trim().toLocaleLowerCase() === norm,
  );
}

export function addProfile(
  list: readonly Profile[],
  input: ProfileInput,
):
  | { readonly list: Profile[]; readonly profile: Profile }
  | { readonly error: 'name' | 'duplicate-name' | 'taken' | 'full' } {
  const name = input.name.trim();
  if (name.length === 0 || name.length > MAX_PROFILE_NAME_LEN) {
    return { error: 'name' };
  }
  if (activeProfiles(list).length >= MAX_ACTIVE_PROFILES) {
    return { error: 'full' };
  }
  if (isNameTaken(list, name)) {
    return { error: 'duplicate-name' };
  }
  if (isComboTaken(list, input.avatar, input.color)) {
    return { error: 'taken' };
  }

  const profile: Profile = {
    id: generateId(),
    name,
    avatar: input.avatar,
    color: input.color,
    createdAt: new Date().toISOString(),
    archived: false,
  };
  return { list: [...list, profile], profile };
}

export function updateProfile(
  list: readonly Profile[],
  id: string,
  patch: Partial<ProfileInput>,
):
  | { readonly list: Profile[] }
  | { readonly error: 'name' | 'duplicate-name' | 'taken' | 'not-found' } {
  const existing = list.find((p) => p.id === id);
  if (!existing) return { error: 'not-found' };

  const nextName = patch.name !== undefined ? patch.name.trim() : existing.name;
  if (nextName.length === 0 || nextName.length > MAX_PROFILE_NAME_LEN) {
    return { error: 'name' };
  }
  if (!existing.archived && isNameTaken(list, nextName, id)) {
    return { error: 'duplicate-name' };
  }

  const nextAvatar = patch.avatar ?? existing.avatar;
  const nextColor = patch.color ?? existing.color;
  if (!existing.archived && isComboTaken(list, nextAvatar, nextColor, id)) {
    return { error: 'taken' };
  }

  return {
    list: list.map((p) =>
      p.id === id ? { ...p, name: nextName, avatar: nextAvatar, color: nextColor } : p,
    ),
  };
}

export function archiveProfile(list: readonly Profile[], id: string): Profile[] {
  return list.map((p) => (p.id === id ? { ...p, archived: true } : p));
}

export function saveProfiles(list: readonly Profile[]): boolean {
  if (!persistRequested && typeof navigator !== 'undefined' && navigator.storage?.persist) {
    persistRequested = true;
    void navigator.storage.persist().catch(() => {});
  }
  return writeJSON('local', PROFILES_STORAGE_KEY, {
    schemaVersion: 1,
    profiles: list,
  });
}

export function firstFreeCombo(
  list: readonly Profile[],
): { readonly avatar: AnimalId; readonly color: PlayerColor } {
  const active = list.filter((p) => !p.archived);
  const usedAvatars = new Set(active.map((p) => p.avatar));
  const usedColors = new Set(active.map((p) => p.color));

  for (const avatar of ANIMAL_IDS) {
    if (usedAvatars.has(avatar)) continue;
    for (const color of PLAYER_COLORS) {
      if (!usedColors.has(color)) {
        return { avatar, color };
      }
    }
  }

  for (const color of PLAYER_COLORS) {
    for (const avatar of ANIMAL_IDS) {
      if (!isComboTaken(list, avatar, color)) {
        return { avatar, color };
      }
    }
  }
  return { avatar: ANIMAL_IDS[0], color: PLAYER_COLORS[0] };
}

export function exportProfilesJSON(list?: readonly Profile[]): string {
  const profiles = list ?? loadProfiles();
  return JSON.stringify({ schemaVersion: 1, profiles }, null, 2);
}

export function importProfilesJSON(
  text: string,
): { readonly count: number; readonly list: Profile[] } | { readonly error: 'invalid' } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'invalid' };
  }

  const incoming = parseEnvelope(parsed);
  if (!incoming) return { error: 'invalid' };

  const current = loadProfiles();
  const byId = new Map<string, Profile>();
  for (const p of current) byId.set(p.id, p);
  for (const p of incoming) byId.set(p.id, p);

  const merged = Array.from(byId.values());
  saveProfiles(merged);
  return { count: incoming.length, list: merged };
}
