import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildManifest, type CmsSnapshotRows } from '@/admin/publish/buildManifest';
import { importBundledMedia } from '@/admin/publish/importBundled';
import { CATALOG_LIST } from '@/games/catalog';
import { createBundledContent } from '@/lib/content/defaults';
import { computeReadiness } from '@/lib/content/readiness';
import { resolveManifest } from '@/lib/content/resolve';
import { readEnv } from '@/lib/env';
import {
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

export function DashboardPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CmsSnapshotRows | null>(null);
  const [latestPub, setLatestPub] = useState<PublicationRow | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);

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
    if ('data' in pub && pub.data.length > 0) {
      setLatestPub(pub.data[0]);
    }
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
      if ('data' in pub && pub.data.length > 0) {
        setLatestPub(pub.data[0]);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const { readinessList, changedCount } = useMemo(() => {
    if (!rows) return { readinessList: [], changedCount: 0 };
    const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;
    const manifest = buildManifest(rows, (latestPub?.version ?? 0) + 1, mediaBase);
    const resolved = resolveManifest(manifest, createBundledContent(), 'cms');
    const list = CATALOG_LIST.map((entry) => ({
      entry,
      readiness: computeReadiness(resolved, entry.id, { production: true }),
    }));

    const since = latestPub ? Date.parse(latestPub.published_at) : 0;
    const allDates = [
      ...rows.objects.map((r) => r.updated_at),
      ...rows.words.map((r) => r.updated_at),
      ...rows.hijaiyyah.map((r) => r.updated_at),
      ...rows.speechClips.map((r) => r.updated_at),
      ...rows.sceneAudio.map((r) => r.updated_at),
    ];
    const changed = allDates.filter((d) => Date.parse(d) > since).length;
    return { readinessList: list, changedCount: changed };
  }, [rows, latestPub]);

  const handleImport = async () => {
    setImporting(true);
    setImportMsg(null);
    const res = await importBundledMedia();
    setImporting(false);
    if (res.error) {
      setImportMsg(res.error);
    } else {
      setImportMsg(`${res.imported} diimpor, ${res.skipped} dilewati`);
      await reload();
    }
  };

  return (
    <div className={styles.stack}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{'Dasbor CMS'}</h1>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={importing}
            onClick={() => void handleImport()}
          >
            {importing ? 'Mengimpor…' : 'Impor media bawaan'}
          </button>
          <button type="button" className={styles.btn} onClick={() => navigate('/admin/terbitkan')}>
            {'Ke Terbitkan'}
          </button>
        </div>
      </div>

      {importMsg && <div className={styles.statusOk}>{importMsg}</div>}

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <span className={styles.badge}>
            {latestPub
              ? `Versi terbit terakhir: v${latestPub.version} (${new Date(latestPub.published_at).toLocaleString('id-ID')})`
              : 'Belum diterbitkan'}
          </span>
          <span className={`${styles.badge} ${changedCount > 0 ? styles.badgeWarn : styles.badgeOk}`}>
            {`${changedCount} baris berubah sejak terbit terakhir`}
          </span>
        </div>
      </section>

      <div className={styles.gridCards}>
        {readinessList.map(({ entry, readiness }) => (
          <article key={entry.id} className={styles.card}>
            <div className={styles.headerRow}>
              <strong>{`${entry.code} · ${entry.id}`}</strong>
              <span className={`${styles.badge} ${readiness.ready ? styles.badgeOk : styles.badgeWarn}`}>
                {readiness.ready ? 'Siap ✓' : 'Belum siap'}
              </span>
            </div>
            {readiness.missing.length > 0 && (
              <ul>
                {readiness.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
