import { useCallback, useEffect, useMemo, useState } from 'react';
import { MediaField } from '@/admin/media/MediaField';
import { VoiceRecorder } from '@/admin/media/VoiceRecorder';
import { readEnv } from '@/lib/env';
import { listMedia, listObjects, listWords, upsertWord } from '@/lib/supabase/db';
import type { MediaRow, ObjectRow, WordRow } from '@/lib/supabase/types';
import styles from './AdminPages.module.css';

const WORD_RE = /^[A-Z]{2,8}$/;

export function WordsPage() {
  const [locale, setLocale] = useState<'id' | 'en'>('id');
  const [words, setWords] = useState<WordRow[]>([]);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [mediaMap, setMediaMap] = useState<Map<string, MediaRow>>(new Map());
  const [editing, setEditing] = useState<WordRow | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;

  const reload = useCallback(async () => {
    const [wRes, oRes, mRes] = await Promise.all([listWords(locale), listObjects(), listMedia()]);
    if ('data' in wRes) setWords(wRes.data);
    if ('data' in oRes) setObjects(oRes.data.filter((o) => o.active));
    if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
  }, [locale]);

  useEffect(() => {
    let active = true;
    void Promise.all([listWords(locale), listObjects(), listMedia()]).then(([wRes, oRes, mRes]) => {
      if (!active) return;
      if ('data' in wRes) setWords(wRes.data);
      if ('data' in oRes) setObjects(oRes.data.filter((o) => o.active));
      if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const openNew = () => {
    setStatusMsg(null);
    setErrorMsg(null);
    setRecordedFile(null);
    setEditing({
      id: '',
      locale,
      word: '',
      object_id: objects[0]?.id ?? 'apple',
      use_initial: true,
      use_spell: false,
      audio_id: null,
      active: true,
      updated_at: '',
    });
  };

  const spellLengthWarn = useMemo(() => {
    if (!editing || !editing.use_spell) return false;
    return editing.word.length < 3 || editing.word.length > 5;
  }, [editing]);

  const handleSave = async () => {
    if (!editing) return;
    const cleanWord = editing.word.trim().toUpperCase();
    if (!WORD_RE.test(cleanWord)) {
      setErrorMsg('Kata harus 2–8 huruf kapital A–Z tanpa spasi.');
      return;
    }
    setErrorMsg(null);
    const res = await upsertWord({
      id: editing.id || undefined,
      locale: editing.locale,
      word: cleanWord,
      object_id: editing.object_id,
      use_initial: editing.use_initial,
      use_spell: editing.use_spell,
      audio_id: editing.audio_id,
      active: editing.active,
    });
    if ('error' in res) {
      setErrorMsg(res.error);
      return;
    }
    setStatusMsg('Tersimpan ✓');
    setEditing(null);
    setRecordedFile(null);
    await reload();
  };

  const audioUrlFor = (audioId: string | null): string | null => {
    if (!audioId) return null;
    const m = mediaMap.get(audioId);
    return m ? `${mediaBase}${m.storage_path}` : null;
  };

  return (
    <div className={styles.stack}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{'Kata Belajar'}</h1>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${locale === 'id' ? styles.btnPink : styles.btnSecondary}`}
            onClick={() => setLocale('id')}
          >
            {'Indonesia (ID)'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${locale === 'en' ? styles.btnPink : styles.btnSecondary}`}
            onClick={() => setLocale('en')}
          >
            {'English (EN)'}
          </button>
          <button type="button" className={styles.btn} onClick={openNew}>
            {'+ Kata baru'}
          </button>
        </div>
      </div>

      {statusMsg && <div className={styles.statusOk}>{statusMsg}</div>}
      {errorMsg && <div role="alert" className={styles.alert}>{errorMsg}</div>}

      {editing && (
        <section className={styles.card}>
          <h2>{editing.id ? `Edit Kata: ${editing.word}` : 'Kata Baru'}</h2>
          <div className={styles.toolbar}>
            <input
              className={styles.input}
              placeholder="KATA (A-Z)"
              value={editing.word}
              onChange={(e) => setEditing({ ...editing, word: e.target.value.toUpperCase() })}
            />
            <select
              className={styles.select}
              value={editing.object_id}
              onChange={(e) => setEditing({ ...editing, object_id: e.target.value })}
            >
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {`${o.id} (${o.name_id} / ${o.name_en})`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.toolbar}>
            <label>
              <input
                type="checkbox"
                checked={editing.use_initial}
                onChange={(e) => setEditing({ ...editing, use_initial: e.target.checked })}
              />{' '}
              {'Bunyi Awal (G04)'}
            </label>
            <label>
              <input
                type="checkbox"
                checked={editing.use_spell}
                onChange={(e) => setEditing({ ...editing, use_spell: e.target.checked })}
              />{' '}
              {'Susun Kata (G03)'}
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

          {spellLengthWarn && (
            <div className={styles.alert}>{'Peringatan: Susun Kata hanya memakai kata 3–5 huruf.'}</div>
          )}

          {WORD_RE.test(editing.word) && (
            <>
              <VoiceRecorder
                filename={`word-${editing.word.toLowerCase()}.wav`}
                onRecorded={(f) => setRecordedFile(f)}
              />
              <MediaField
                type="speech"
                storagePrefix={`audio/speech/${editing.locale}/word-${editing.word.toLowerCase()}`}
                initialFile={recordedFile}
                defaultLicense={recordedFile ? 'recorded-consent' : 'project'}
                onUploaded={(m) => {
                  setMediaMap((prev) => new Map(prev).set(m.id, m));
                  setEditing((prev) => (prev ? { ...prev, audio_id: m.id } : null));
                  setRecordedFile(null);
                }}
              />
            </>
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{'Kata'}</th>
              <th>{'Objek'}</th>
              <th>{'G04 / G03'}</th>
              <th>{'Audio'}</th>
              <th>{'Aksi'}</th>
            </tr>
          </thead>
          <tbody>
            {words.slice(0, 50).map((w) => {
              const url = audioUrlFor(w.audio_id);
              return (
                <tr key={w.id}>
                  <td><strong>{w.word}</strong></td>
                  <td><code>{w.object_id}</code></td>
                  <td>{`${w.use_initial ? '✓' : '—'} / ${w.use_spell ? '✓' : '—'}`}</td>
                  <td>
                    {url ? (
                      <audio controls src={url} />
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeWarn}`}>{'Belum ada suara'}</span>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnSecondary}`}
                      onClick={() => {
                        setRecordedFile(null);
                        setEditing(w);
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
