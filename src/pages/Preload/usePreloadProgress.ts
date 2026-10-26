import { useEffect, useState } from 'react';

export interface PreloadState {
  /** 0–100 */
  progress: number;
  /** Pesan status ramah anak sesuai fase muat */
  message: string;
  /** True ketika semua aset selesai dimuat */
  isReady: boolean;
}

const MESSAGES: Array<{ until: number; id: string }> = [
  { until: 30, id: 'Menyiapkan aset…' },
  { until: 60, id: 'Memuat suara & huruf…' },
  { until: 90, id: 'Menggambar bintang…' },
  { until: 100, id: 'Hampir siap! Tersenyumlah… ✨' },
];

function messageFor(progress: number): string {
  return MESSAGES.find((m) => progress < m.until)?.id ?? MESSAGES[MESSAGES.length - 1].id;
}

/**
 * Simulasi pemuatan aset dasar (font, audio, ikon).
 * Ganti isi efek dengan pemuatan aset nyata (Phaser loader / document.fonts.ready)
 * tanpa mengubah kontrak hook.
 */
export function usePreloadProgress(): PreloadState {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + 2 + Math.random() * 4));
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  return {
    progress,
    message: messageFor(progress),
    isReady: progress >= 100,
  };
}
