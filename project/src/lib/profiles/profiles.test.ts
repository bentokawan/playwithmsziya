import { beforeEach, describe, expect, it } from 'vitest';
import { clearMemoryFallback, removeKey } from '@/lib/storage/storage';
import {
  activeProfiles,
  addProfile,
  archiveProfile,
  exportProfilesJSON,
  firstFreeCombo,
  importProfilesJSON,
  loadProfiles,
  PROFILES_STORAGE_KEY,
  saveProfiles,
  updateProfile,
  type AnimalId,
  type PlayerColor,
  type Profile,
} from './profiles';

describe('profiles store (Task 1)', () => {
  beforeEach(() => {
    clearMemoryFallback();
    removeKey('local', PROFILES_STORAGE_KEY);
  });

  it('trims whitespace and validates name length (1–12)', () => {
    const ok = addProfile([], { name: '  Ana  ', avatar: 'kelinci', color: 'biru' });
    expect('list' in ok).toBe(true);
    if ('list' in ok) {
      expect(ok.list).toHaveLength(1);
      expect(ok.list[0].name).toBe('Ana');
    }

    expect(addProfile([], { name: '   ', avatar: 'kelinci', color: 'biru' })).toEqual({
      error: 'name',
    });
    expect(addProfile([], { name: '1234567890123', avatar: 'kelinci', color: 'biru' })).toEqual({
      error: 'name',
    });
  });

  it('rejects taken avatar+color among active profiles, allows after archiving', () => {
    const r1 = addProfile([], { name: 'Ana', avatar: 'kelinci', color: 'biru' });
    if (!('list' in r1)) throw new Error('expected list');

    const dup = addProfile(r1.list, { name: 'Budi', avatar: 'kelinci', color: 'biru' });
    expect(dup).toEqual({ error: 'taken' });

    const archived = archiveProfile(r1.list, r1.list[0].id);
    expect(activeProfiles(archived)).toHaveLength(0);

    const r2 = addProfile(archived, { name: 'Budi', avatar: 'kelinci', color: 'biru' });
    expect('list' in r2).toBe(true);
  });

  it('rejects the 41st active profile as full', () => {
    const animals: readonly AnimalId[] = [
      'kelinci',
      'kucing',
      'beruang',
      'panda',
      'rubah',
      'katak',
      'ayam',
      'gajah',
    ];
    const colors: readonly PlayerColor[] = [
      'merah',
      'oranye',
      'kuning',
      'hijau',
      'tosca',
      'biru',
      'ungu',
      'merah-muda',
    ];
    let list: Profile[] = [];
    for (let i = 0; i < 40; i++) {
      const res = addProfile(list, {
        name: `Anak${i}`,
        avatar: animals[i % animals.length],
        color: colors[Math.floor(i / animals.length)],
      });
      if (!('list' in res)) throw new Error(`unexpected error at ${i}: ${res.error}`);
      list = res.list;
    }

    const extra = addProfile(list, { name: 'Anak40', avatar: 'gajah', color: 'merah-muda' });
    expect(extra).toEqual({ error: 'full' });
  });

  it('updateProfile validates name and taken combo', () => {
    const r1 = addProfile([], { name: 'Ana', avatar: 'kelinci', color: 'biru' });
    if (!('list' in r1)) throw new Error('expected list');
    const r2 = addProfile(r1.list, { name: 'Budi', avatar: 'kucing', color: 'merah' });
    if (!('list' in r2)) throw new Error('expected list');

    expect(
      updateProfile(r2.list, r2.list[1].id, { avatar: 'kelinci', color: 'biru' }),
    ).toEqual({ error: 'taken' });

    const updated = updateProfile(r2.list, r2.list[0].id, { name: '  Anita  ' });
    expect('list' in updated).toBe(true);
    if ('list' in updated) {
      expect(updated.list[0].name).toBe('Anita');
    }
  });

  it('loadProfiles handles corrupt JSON, foreign schemaVersion, and drops bad items', () => {
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
      fakeStore.set(PROFILES_STORAGE_KEY, '{not json');
      expect(loadProfiles()).toEqual([]);

      fakeStore.set(PROFILES_STORAGE_KEY, JSON.stringify({ schemaVersion: 99, profiles: [] }));
      expect(loadProfiles()).toEqual([]);

      fakeStore.set(
        PROFILES_STORAGE_KEY,
        JSON.stringify({
          schemaVersion: 1,
          profiles: [
            { name: 'NoId', avatar: 'kelinci', color: 'biru', createdAt: '2026-01-01', archived: false },
            {
              id: 'p1',
              name: 'Ana',
              avatar: 'kelinci',
              color: 'biru',
              createdAt: '2026-01-01T00:00:00Z',
              archived: false,
            },
          ],
        }),
      );
      const loaded = loadProfiles();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('p1');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: orig });
    }
  });

  it('rejects duplicate names (case-insensitive) among active profiles, allows after archiving', () => {
    const r1 = addProfile([], { name: 'Ana', avatar: 'kelinci', color: 'biru' });
    if (!('list' in r1)) throw new Error('expected list');

    const dup = addProfile(r1.list, { name: '  ana ', avatar: 'kucing', color: 'merah' });
    expect(dup).toEqual({ error: 'duplicate-name' });

    const r2 = addProfile(r1.list, { name: 'Budi', avatar: 'kucing', color: 'merah' });
    if (!('list' in r2)) throw new Error('expected list');
    expect(updateProfile(r2.list, r2.list[1].id, { name: 'ANA' })).toEqual({
      error: 'duplicate-name',
    });

    const archived = archiveProfile(r1.list, r1.list[0].id);
    const reused = addProfile(archived, { name: 'Ana', avatar: 'kucing', color: 'merah' });
    expect('list' in reused).toBe(true);
  });

  it('firstFreeCombo prefers both unused animal and unused color before reusing', () => {
    const first = firstFreeCombo([]);
    const r1 = addProfile([], { name: 'Ana', ...first });
    if (!('list' in r1)) throw new Error('expected list');
    const second = firstFreeCombo(r1.list);
    expect(second.avatar).not.toBe(first.avatar);
    expect(second.color).not.toBe(first.color);
  });

  it('roundtrips export and import merging by id', () => {
    const r1 = addProfile([], { name: 'Ana', avatar: 'kelinci', color: 'biru' });
    if (!('list' in r1)) throw new Error('expected list');
    saveProfiles(r1.list);

    const exported = exportProfilesJSON();
    const r2 = addProfile(r1.list, { name: 'Budi', avatar: 'kucing', color: 'merah' });
    if (!('list' in r2)) throw new Error('expected list');
    saveProfiles(r2.list);

    const imp = importProfilesJSON(exported);
    expect('count' in imp).toBe(true);
    if ('count' in imp) {
      expect(imp.count).toBe(1);
      expect(loadProfiles()).toHaveLength(2);
    }

    expect(importProfilesJSON('not valid')).toEqual({ error: 'invalid' });
  });
});
