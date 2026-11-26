import { useCallback, useEffect, useState } from 'react';
import { MediaField } from '@/admin/media/MediaField';
import { VoiceRecorder } from '@/admin/media/VoiceRecorder';
import { readEnv } from '@/lib/env';
import { listHijaiyyah, listMedia, updateHijaiyyah } from '@/lib/supabase/db';
import type { HijaiyyahRow, MediaRow } from '@/lib/supabase/types';
import styles from './AdminPages.module.css';

export function HijaiyyahPage() {
  const [rows, setRows] = useState<HijaiyyahRow[]>([]);
  const [mediaMap, setMediaMap] = useState<Map<string, MediaRow>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [reviewer, setReviewer] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;

  const reload = useCallback(async () => {
    const [hRes, mRes] = await Promise.all([listHijaiyyah(), listMedia()]);
    if ('data' in hRes) setRows(hRes.data);
    if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([listHijaiyyah(), listMedia()]).then(([hRes, mRes]) => {
      if (!active) return;
      if ('data' in hRes) setRows(hRes.data);
      if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
    });
    return () => {
      active = false;
    };
  }, []);

  const audioUrlFor = (audioId: string | null): string | null => {
    if (!audioId) return null;
    const m = mediaMap.get(audioId);
    return m ? `${mediaBase}${m.storage_path}` : null;
  };

  const handleAudioUploaded = async (row: HijaiyyahRow, media: MediaRow) => {
    setErrorMsg(null);
    // Replacing audio automatically resets audio_reviewed = false (cms §6.4)
    const res = await updateHijaiyyah(row.id, {
      audio_id: media.id,
      audio_reviewed: false,
    });
    if ('error' in res) {
      setErrorMsg(res.error);
      return;
    }
    setStatusMsg(`Audio ${row.name_id} tersimpan (status review direset).`);
    setRecordedFile(null);
    await reload();
  };

  const handleToggleReview = async (
    row: HijaiyyahRow,
    field: 'audio_reviewed' | 'trace_reviewed',
    nextVal: boolean,
  ) => {
    setErrorMsg(null);
    const revName = (reviewer || row.reviewer || '').trim();
    if (nextVal && !revName) {
      setErrorMsg('Isi nama peninjau terlebih dahulu sebelum menandai sudah direview.');
      return;
    }
    const res = await updateHijaiyyah(row.id, {
      [field]: nextVal,
      reviewer: nextVal ? revName : row.reviewer,
      reviewed_at: nextVal ? new Date().toISOString() : row.reviewed_at,
    });
    if ('error' in res) {
      setErrorMsg(res.error);
      return;
    }
    setStatusMsg(`Status review ${row.name_id} tersimpan ✓`);
    await reload();
  };

  return (
    <div className={styles.stack}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{'Hijaiyyah (28 Huruf)'}</h1>
        <input
          className={styles.input}
          placeholder="Nama peninjau (ustadz/ustadzah)"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
        />
      </div>

      {statusMsg && <div className={styles.statusOk}>{statusMsg}</div>}
      {errorMsg && <div role="alert" className={styles.alert}>{errorMsg}</div>}

      <div className={styles.gridCards}>
        {rows.map((row) => {
          const url = audioUrlFor(row.audio_id);
          const isOpen = selectedId === row.id;

          return (
            <article key={row.id} className={styles.card}>
              <div className={styles.headerRow}>
                <span lang="ar" dir="rtl" className={styles.arabicBig}>
                  {row.char}
                </span>
                <div>
                  <strong>{row.name_id}</strong>
                  <div><code>{row.id}</code></div>
                </div>
              </div>

              {url ? (
                <audio controls src={url} />
              ) : (
                <span className={`${styles.badge} ${styles.badgeWarn}`}>{'Belum ada suara'}</span>
              )}

              <label>
                <input
                  type="checkbox"
                  checked={row.audio_reviewed}
                  disabled={!row.audio_id}
                  onChange={(e) => void handleToggleReview(row, 'audio_reviewed', e.target.checked)}
                />{' '}
                {row.audio_reviewed ? 'Bunyi sudah direview ✓' : 'Bunyi menunggu review'}
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={row.trace_reviewed}
                  onChange={(e) => void handleToggleReview(row, 'trace_reviewed', e.target.checked)}
                />{' '}
                {row.trace_reviewed ? 'Urutan tulis sudah direview ✓' : 'Urutan tulis menunggu review'}
              </label>

              {row.reviewer && <small>{`Peninjau: ${row.reviewer}`}</small>}

              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setSelectedId(isOpen ? null : row.id);
                  setRecordedFile(null);
                }}
              >
                {isOpen ? 'Tutup uploader' : 'Rekam / Unggah'}
              </button>

              {isOpen && (
                <>
                  <VoiceRecorder
                    filename={`hija-${row.id}.wav`}
                    onRecorded={(f) => setRecordedFile(f)}
                  />
                  <MediaField
                    type="speech"
                    storagePrefix={`audio/speech/ar/hija-${row.id}`}
                    initialFile={recordedFile}
                    defaultLicense="recorded-consent"
                    onUploaded={(m) => void handleAudioUploaded(row, m)}
                  />
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
