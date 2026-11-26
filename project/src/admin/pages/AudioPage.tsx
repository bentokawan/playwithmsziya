import { useCallback, useEffect, useState } from 'react';
import { MediaField } from '@/admin/media/MediaField';
import type { MediaUploadType } from '@/admin/media/validate';
import { VoiceRecorder } from '@/admin/media/VoiceRecorder';
import { SCENE_AUDIO_BRIEFS } from '@/admin/strings';
import { readEnv } from '@/lib/env';
import {
  listMedia,
  listSceneAudio,
  listSpeechClips,
  updateSceneAudio,
  updateSpeechClip,
} from '@/lib/supabase/db';
import type { MediaRow, SceneAudioRow, SpeechClipRow } from '@/lib/supabase/types';
import styles from './AdminPages.module.css';

type AudioTab = 'num' | 'letter' | 'scene';

export function AudioPage() {
  const [tab, setTab] = useState<AudioTab>('num');
  const [locale, setLocale] = useState<'id' | 'en'>('id');
  const [clips, setClips] = useState<SpeechClipRow[]>([]);
  const [scenes, setScenes] = useState<SceneAudioRow[]>([]);
  const [mediaMap, setMediaMap] = useState<Map<string, MediaRow>>(new Map());
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaBase = `${readEnv().contentBaseUrl ?? ''}/media/`;

  const reload = useCallback(async () => {
    const [sRes, scRes, mRes] = await Promise.all([
      listSpeechClips(),
      listSceneAudio(),
      listMedia(),
    ]);
    if ('data' in sRes) setClips(sRes.data);
    if ('data' in scRes) setScenes(scRes.data);
    if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([listSpeechClips(), listSceneAudio(), listMedia()]).then(([sRes, scRes, mRes]) => {
      if (!active) return;
      if ('data' in sRes) setClips(sRes.data);
      if ('data' in scRes) setScenes(scRes.data);
      if ('data' in mRes) setMediaMap(new Map(mRes.data.map((m) => [m.id, m])));
    });
    return () => {
      active = false;
    };
  }, []);

  const urlFor = (audioId: string | null): string | null => {
    if (!audioId) return null;
    const m = mediaMap.get(audioId);
    return m ? `${mediaBase}${m.storage_path}` : null;
  };

  const filteredClips = clips.filter((c) => c.kind === tab && c.locale === locale);

  return (
    <div className={styles.stack}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{'Suara & Efek'}</h1>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${tab === 'num' ? styles.btnPink : styles.btnSecondary}`}
            onClick={() => {
              setTab('num');
              setActiveKey(null);
            }}
          >
            {'Angka (0–20)'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${tab === 'letter' ? styles.btnPink : styles.btnSecondary}`}
            onClick={() => {
              setTab('letter');
              setActiveKey(null);
            }}
          >
            {'Huruf (a–z)'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${tab === 'scene' ? styles.btnPink : styles.btnSecondary}`}
            onClick={() => {
              setTab('scene');
              setActiveKey(null);
            }}
          >
            {'Musik & efek'}
          </button>
        </div>
      </div>

      {tab !== 'scene' && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.btn} ${locale === 'id' ? '' : styles.btnSecondary}`}
            onClick={() => setLocale('id')}
          >
            {'ID'}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${locale === 'en' ? '' : styles.btnSecondary}`}
            onClick={() => setLocale('en')}
          >
            {'EN'}
          </button>
        </div>
      )}

      {statusMsg && <div className={styles.statusOk}>{statusMsg}</div>}
      {errorMsg && <div role="alert" className={styles.alert}>{errorMsg}</div>}

      <section className={styles.card}>
        {tab !== 'scene' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{'Klip'}</th>
                <th>{'Audio'}</th>
                <th>{'Aksi'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClips.map((clip) => {
                const rowKey = `${clip.kind}:${clip.locale}:${clip.key}`;
                const url = urlFor(clip.audio_id);
                const isOpen = activeKey === rowKey;
                return (
                  <tr key={rowKey}>
                    <td><strong>{`${clip.kind}-${clip.key} (${clip.locale})`}</strong></td>
                    <td>
                      {url ? (
                        <audio controls src={url} />
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeWarn}`}>{'Belum ada suara'}</span>
                      )}
                      {isOpen && (
                        <div className={styles.stack}>
                          <VoiceRecorder
                            filename={`${clip.kind}-${clip.key}.wav`}
                            onRecorded={(f) => setRecordedFile(f)}
                          />
                          <MediaField
                            type="speech"
                            storagePrefix={`audio/speech/${clip.locale}/${clip.kind}-${clip.key}`}
                            initialFile={recordedFile}
                            defaultLicense={recordedFile ? 'recorded-consent' : 'project'}
                            onUploaded={async (m) => {
                              const res = await updateSpeechClip(clip.kind, clip.locale, clip.key, m.id);
                              if ('error' in res) setErrorMsg(res.error);
                              else {
                                setStatusMsg(`Klip ${rowKey} tersimpan ✓`);
                                setActiveKey(null);
                                setRecordedFile(null);
                                await reload();
                              }
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => {
                          setActiveKey(isOpen ? null : rowKey);
                          setRecordedFile(null);
                        }}
                      >
                        {isOpen ? 'Tutup' : 'Rekam / Unggah'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{'ID'}</th>
                <th>{'Brief'}</th>
                <th>{'Audio'}</th>
                <th>{'Aksi'}</th>
              </tr>
            </thead>
            <tbody>
              {scenes.map((sc) => {
                const url = urlFor(sc.audio_id);
                const isOpen = activeKey === sc.id;
                const uploadType: MediaUploadType = sc.layer;
                const [, slug] = sc.id.split(':');
                return (
                  <tr key={sc.id}>
                    <td><code>{sc.id}</code></td>
                    <td>{SCENE_AUDIO_BRIEFS[sc.id] ?? '—'}</td>
                    <td>
                      {url ? (
                        <audio controls src={url} />
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeWarn}`}>{'Belum ada suara'}</span>
                      )}
                      {isOpen && (
                        <MediaField
                          type={uploadType}
                          storagePrefix={`audio/${sc.layer}/${slug}`}
                          defaultLicense="cc0"
                          onUploaded={async (m) => {
                            const res = await updateSceneAudio(sc.id, m.id);
                            if ('error' in res) setErrorMsg(res.error);
                            else {
                              setStatusMsg(`Audio ${sc.id} tersimpan ✓`);
                              setActiveKey(null);
                              await reload();
                            }
                          }}
                        />
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => setActiveKey(isOpen ? null : sc.id)}
                      >
                        {isOpen ? 'Tutup' : 'Unggah'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
