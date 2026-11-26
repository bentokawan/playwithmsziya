import { useCallback, useEffect, useMemo, useState } from 'react';
import { MediaField } from '@/admin/media/MediaField';
import { WORLD_IDS } from '@/games/ids';
import { readEnv } from '@/lib/env';
import { listMedia, listObjects, listWords, upsertObject } from '@/lib/supabase/db';
import type { MediaRow, ObjectRow, WordRow } from '@/lib/supabase/types';
import { WorldBackground } from '@/worlds/WorldBackground';
import styles from './AdminPages.module.css';

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function ObjectsPage() {
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [mediaMap, setMediaMap] = useState<Map<string, MediaRow>>(new Map());
  const [words, setWords] = useState<WordRow[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'no-image' | 'inactive'>('all');
  const [editing, setEditing] = useState<ObjectRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;

  const reload = useCallback(async () => {
    const [oRes, mRes, wRes] = await Promise.all([listObjects(), listMedia(), listWords()]);
    if ('data' in oRes) setObjects(oRes.data);
    if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
    if ('data' in wRes) setWords(wRes.data);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([listObjects(), listMedia(), listWords()]).then(([oRes, mRes, wRes]) => {
      if (!active) return;
      if ('data' in oRes) setObjects(oRes.data);
      if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
      if ('data' in wRes) setWords(wRes.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return objects.filter((o) => {
      if (filter === 'no-image' && o.image_id) return false;
      if (filter === 'inactive' && o.active) return false;
      if (q && !o.id.includes(q) && !o.name_id.toLowerCase().includes(q) && !o.name_en.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [objects, search, filter]);

  const openNew = () => {
    setIsNew(true);
    setStatusMsg(null);
    setErrorMsg(null);
    setEditing({
      id: '',
      name_id: '',
      name_en: '',
      image_id: null,
      countable: false,
      card_face: false,
      maze_goal: false,
      active: true,
      updated_at: '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!ID_RE.test(editing.id)) {
      setErrorMsg('ID harus kebab-case huruf kecil/angka (contoh: ice-cream).');
      return;
    }
    if (!editing.name_id.trim() || !editing.name_en.trim()) {
      setErrorMsg('Nama ID dan EN wajib diisi.');
      return;
    }
    setErrorMsg(null);
    const res = await upsertObject({
      id: editing.id,
      name_id: editing.name_id.trim(),
      name_en: editing.name_en.trim(),
      image_id: editing.image_id,
      countable: editing.countable,
      card_face: editing.card_face,
      maze_goal: editing.maze_goal,
      active: editing.active,
    });
    if ('error' in res) {
      setErrorMsg(res.error);
      return;
    }
    setStatusMsg('Tersimpan ✓');
    setEditing(null);
    await reload();
  };

  const imageUrlFor = (imageId: string | null): string | null => {
    if (!imageId) return null;
    const m = mediaMap.get(imageId);
    return m ? `${mediaBase}${m.storage_path}` : null;
  };

  const affectedWords = editing && !editing.active
    ? words.filter((w) => w.active && w.object_id === editing.id)
    : [];

  return (
    <div className={styles.stack}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{'Objek Ilustrasi'}</h1>
        <button type="button" className={styles.btn} onClick={openNew}>
          {'+ Objek baru'}
        </button>
      </div>

      {statusMsg && <div className={styles.statusOk}>{statusMsg}</div>}
      {errorMsg && <div role="alert" className={styles.alert}>{errorMsg}</div>}

      {editing && (
        <section className={styles.card}>
          <h2>{isNew ? 'Objek Baru' : `Edit: ${editing.id}`}</h2>
          <div className={styles.toolbar}>
            <input
              className={styles.input}
              placeholder="id (kebab-case)"
              value={editing.id}
              disabled={!isNew}
              onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase() })}
            />
            <input
              className={styles.input}
              placeholder="Nama ID"
              value={editing.name_id}
              onChange={(e) => setEditing({ ...editing, name_id: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder="Nama EN"
              value={editing.name_en}
              onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
            />
          </div>

          <div className={styles.toolbar}>
            <label>
              <input
                type="checkbox"
                checked={editing.countable}
                onChange={(e) => setEditing({ ...editing, countable: e.target.checked })}
              />{' '}
              {'Bisa dihitung (G01)'}
            </label>
            <label>
              <input
                type="checkbox"
                checked={editing.card_face}
                onChange={(e) => setEditing({ ...editing, card_face: e.target.checked })}
              />{' '}
              {'Wajah kartu (G08)'}
            </label>
            <label>
              <input
                type="checkbox"
                checked={editing.maze_goal}
                onChange={(e) => setEditing({ ...editing, maze_goal: e.target.checked })}
              />{' '}
              {'Tujuan labirin (G09)'}
            </label>
            <label>
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />{' '}
              {'Aktif'}
            </label>
          </div>

          {affectedWords.length > 0 && (
            <div className={styles.alert}>
              {`Peringatan: masih dipakai kata aktif: ${affectedWords.map((w) => w.word).join(', ')}`}
            </div>
          )}

          {editing.id && ID_RE.test(editing.id) && (
            <MediaField
              type="object-image"
              storagePrefix={`images/objects/${editing.id}`}
              onUploaded={(m) => {
                setMediaMap((prev) => new Map(prev).set(m.id, m));
                setEditing((prev) => (prev ? { ...prev, image_id: m.id } : null));
              }}
            />
          )}

          {imageUrlFor(editing.image_id) && (
            <div className={styles.worldPreviewRow}>
              {WORLD_IDS.map((w) => (
                <div key={w} className={styles.worldPreviewBox}>
                  <WorldBackground worldId={w} variant="home-door" />
                  <img src={imageUrlFor(editing.image_id) ?? ''} alt="" className={styles.worldPreviewImg} />
                </div>
              ))}
            </div>
          )}

          <div className={styles.toolbar}>
            <button type="button" className={styles.btn} onClick={() => void handleSave()}>
              {'Simpan'}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => setEditing(null)}
            >
              {'Batal'}
            </button>
          </div>
        </section>
      )}

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <input
            className={styles.input}
            placeholder="Cari objek…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'no-image' | 'inactive')}
          >
            <option value="all">{'Semua'}</option>
            <option value="no-image">{'Tanpa gambar'}</option>
            <option value="inactive">{'Nonaktif'}</option>
          </select>
          <span className={styles.badge}>{`${filtered.length} objek`}</span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>{'Gambar'}</th>
              <th>{'ID'}</th>
              <th>{'ID / EN'}</th>
              <th>{'Flag'}</th>
              <th>{'Status'}</th>
              <th>{'Aksi'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map((o) => {
              const url = imageUrlFor(o.image_id);
              return (
                <tr key={o.id}>
                  <td>{url ? <img src={url} alt={o.name_id} className={styles.thumb} /> : '—'}</td>
                  <td><code>{o.id}</code></td>
                  <td>{`${o.name_id} / ${o.name_en}`}</td>
                  <td>
                    {[o.countable && 'G01', o.card_face && 'G08', o.maze_goal && 'G09']
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${o.active ? styles.badgeOk : styles.badgeWarn}`}>
                      {o.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => {
                        setIsNew(false);
                        setEditing(o);
                      }}
                    >
                      {'Edit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
