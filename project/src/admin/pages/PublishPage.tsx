import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildManifest,
  validatePrePublish,
  type CmsSnapshotRows,
} from '@/admin/publish/buildManifest';
import { readEnv } from '@/lib/env';
import { getSupabase } from '@/lib/supabase/client';
import {
  insertPublication,
  listHijaiyyah,
  listMedia,
  listObjects,
  listPublications,
  listSceneAudio,
  listSpeechClips,
  listWords,
} from '@/lib/supabase/db';
import type { PublicationRow } from '@/lib/supabase/types';
import styles from './AdminPages.module.css';

export function PublishPage() {
  const [rows, setRows] = useState<CmsSnapshotRows | null>(null);
  const [publications, setPublications] = useState<PublicationRow[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [retryVersion, setRetryVersion] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [m, o, w, h, sp, sc, pub] = await Promise.all([
      listMedia(),
      listObjects(),
      listWords(),
      listHijaiyyah(),
      listSpeechClips(),
      listSceneAudio(),
      listPublications(),
    ]);
    if (
      'data' in m &&
      'data' in o &&
      'data' in w &&
      'data' in h &&
      'data' in sp &&
      'data' in sc
    ) {
      setRows({
        media: m.data,
        objects: o.data,
        words: w.data,
        hijaiyyah: h.data,
        speechClips: sp.data,
        sceneAudio: sc.data,
      });
    }
    if ('data' in pub) setPublications(pub.data);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([
      listMedia(),
      listObjects(),
      listWords(),
      listHijaiyyah(),
      listSpeechClips(),
      listSceneAudio(),
      listPublications(),
    ]).then(([m, o, w, h, sp, sc, pub]) => {
      if (!active) return;
      if (
        'data' in m &&
        'data' in o &&
        'data' in w &&
        'data' in h &&
        'data' in sp &&
        'data' in sc
      ) {
        setRows({
          media: m.data,
          objects: o.data,
          words: w.data,
          hijaiyyah: h.data,
          speechClips: sp.data,
          sceneAudio: sc.data,
        });
      }
      if ('data' in pub) setPublications(pub.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const preErrors = useMemo(() => (rows ? validatePrePublish(rows) : []), [rows]);

  const uploadManifestVersion = async (version: number, snapshot: CmsSnapshotRows) => {
    const supabase = getSupabase();
    const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;
    if (!supabase) throw new Error('CMS belum dikonfigurasi.');

    const manifest = buildManifest(snapshot, version, mediaBase);
    const manifestPath = `manifests/manifest-${version}.json`;
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });

    const { error: mErr } = await supabase.storage
      .from('content')
      .upload(manifestPath, manifestBlob, {
        cacheControl: '31536000',
        upsert: false,
        contentType: 'application/json',
      });
    if (mErr && !mErr.message.includes('already exists')) {
      throw new Error('Gagal mengunggah file manifest.');
    }

    const latestPayload = {
      schemaVersion: 1,
      version,
      manifest: manifestPath,
    };
    const latestBlob = new Blob([JSON.stringify(latestPayload)], { type: 'application/json' });
    const { error: lErr } = await supabase.storage
      .from('content')
      .upload('latest.json', latestBlob, {
        cacheControl: '60',
        upsert: true,
        contentType: 'application/json',
      });
    if (lErr) {
      throw new Error('Gagal memperbarui latest.json.');
    }
  };

  const handlePublish = async () => {
    if (!rows || preErrors.length > 0 || busy) return;
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      let version = retryVersion;
      if (version === null) {
        const counts = {
          objects: rows.objects.filter((o) => o.active).length,
          words: rows.words.filter((w) => w.active).length,
          hijaiyyah: rows.hijaiyyah.filter((h) => h.active).length,
          media: rows.media.length,
        };
        const placeholderPath = 'manifests/pending.json';
        const ins = await insertPublication(placeholderPath, counts, note.trim() || null);
        if ('error' in ins) {
          setErrorMsg(ins.error);
          setBusy(false);
          return;
        }
        version = ins.data.version;
        setRetryVersion(version);
      }

      await uploadManifestVersion(version, rows);
      setRetryVersion(null);
      setNote('');
      setStatusMsg(`Berhasil diterbitkan sebagai versi v${version} ✓`);
      await reload();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menerbitkan manifest.');
    } finally {
      setBusy(false);
    }
  };

  const handleRollback = async (pub: PublicationRow) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const confirmed = window.confirm(`Jadikan versi v${pub.version} sebagai konten aktif?`);
    if (!confirmed) return;

    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const latestPayload = {
        schemaVersion: 1,
        version: pub.version,
        manifest: `manifests/manifest-${pub.version}.json`,
      };
      const blob = new Blob([JSON.stringify(latestPayload)], { type: 'application/json' });
      const { error } = await supabase.storage
        .from('content')
        .upload('latest.json', blob, { cacheControl: '60', upsert: true, contentType: 'application/json' });
      if (error) throw new Error('Gagal rollback latest.json.');
      setStatusMsg(`Konten aktif dikembalikan ke versi v${pub.version} ✓`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal rollback.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.stack}>
      <h1 className={styles.title}>{'Terbitkan Konten'}</h1>

      {statusMsg && <div className={styles.statusOk}>{statusMsg}</div>}
      {errorMsg && <div role="alert" className={styles.alert}>{errorMsg}</div>}

      <section className={styles.card}>
        <h2>{'Validasi Pra-Terbit'}</h2>
        {preErrors.length === 0 ? (
          <span className={`${styles.badge} ${styles.badgeOk}`}>{'Semua validasi lulus ✓'}</span>
        ) : (
          <div className={styles.alert}>
            <ul>
              {preErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            placeholder="Catatan publikasi (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className={styles.btn}
            disabled={busy || preErrors.length > 0 || !rows}
            onClick={() => void handlePublish()}
          >
            {busy
              ? 'Menerbitkan…'
              : retryVersion !== null
                ? `Ulangi unggah v${retryVersion}`
                : 'Terbitkan'}
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2>{'Riwayat Versi'}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{'Versi'}</th>
              <th>{'Waktu'}</th>
              <th>{'Catatan'}</th>
              <th>{'Aksi'}</th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr key={pub.version}>
                <td><strong>{`v${pub.version}`}</strong></td>
                <td>{new Date(pub.published_at).toLocaleString('id-ID')}</td>
                <td>{pub.note ?? '—'}</td>
                <td>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    disabled={busy}
                    onClick={() => void handleRollback(pub)}
                  >
                    {'Jadikan aktif'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
