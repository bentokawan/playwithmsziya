import { useEffect, useMemo, useRef, useState } from 'react';
import { processRecordedBlob } from './audioProcess';
import styles from './VoiceRecorder.module.css';

export interface VoiceRecorderProps {
  readonly filename?: string;
  readonly onRecorded: (file: File) => void;
}

type RecStatus = 'idle' | 'countdown' | 'recording' | 'processing' | 'preview';

export function VoiceRecorder({ filename = 'rekaman.wav', onRecorded }: VoiceRecorderProps) {
  const [status, setStatus] = useState<RecStatus>('idle');
  const [count, setCount] = useState(3);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimerRef = useRef<number | null>(null);

  const previewUrl = useMemo(
    () => (recordedFile ? URL.createObjectURL(recordedFile) : null),
    [recordedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const cleanupStream = () => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => () => cleanupStream(), []);

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    cleanupStream();
  };

  const startCapture = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Browser ini tidak mendukung perekaman mikrofon.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Izinkan mikrofon di pengaturan browser.');
      return;
    }

    streamRef.current = stream;
    setStatus('countdown');
    for (const n of [3, 2, 1]) {
      setCount(n);
      await new Promise((r) => window.setTimeout(r, 700));
    }

    const chunks: Blob[] = [];
    const rec = new MediaRecorder(stream);
    recorderRef.current = rec;
    rec.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunks.push(ev.data);
    };
    rec.onstop = () => {
      setStatus('processing');
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      void processRecordedBlob(blob, filename)
        .then((wavFile) => {
          setRecordedFile(wavFile);
          setStatus('preview');
        })
        .catch(() => {
          setError('Gagal memproses rekaman audio.');
          setStatus('idle');
        });
    };

    setStatus('recording');
    rec.start();
    stopTimerRef.current = window.setTimeout(stopRecording, 4000);
  };

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        {status === 'idle' && (
          <button type="button" className={styles.btn} onClick={() => void startCapture()}>
            {'Rekam'}
          </button>
        )}
        {status === 'countdown' && <strong>{`${count}…`}</strong>}
        {status === 'recording' && (
          <button type="button" className={styles.btn} onClick={stopRecording}>
            {'Stop (maks 4 dtk)'}
          </button>
        )}
        {status === 'processing' && <span>{'Memproses audio…'}</span>}
      </div>

      {status === 'preview' && previewUrl && recordedFile && (
        <div className={styles.row}>
          <audio controls src={previewUrl} />
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => {
              setRecordedFile(null);
              setStatus('idle');
            }}
          >
            {'Ulangi'}
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              onRecorded(recordedFile);
              setRecordedFile(null);
              setStatus('idle');
            }}
          >
            {'Pakai rekaman ini'}
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className={styles.err}>
          {error}
        </div>
      )}
    </div>
  );
}
