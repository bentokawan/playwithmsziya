import type { ComponentType } from 'react';

/** Tingkat kesulitan yang dipilih di halaman intro */
export type DifficultyId = 'mudah' | 'sedang' | 'tantang';

export interface GameResult {
  /** 0-3 bintang */
  readonly stars: number;
  /** Skor/progress untuk halaman hasil */
  readonly score: number;
}

export interface GameProps {
  /** Id game dari URL, mis. 'menulis-huruf' */
  readonly gameId: string;
  /** Tingkat kesulitan terpilih dari halaman intro */
  readonly difficulty: DifficultyId;
  /** Jumlah pemain (untuk game duel) */
  readonly players: number;
  /** Panggil saat selesai → shell pindah ke halaman result */
  readonly onFinish: (result: GameResult) => void;
  /** Panggil untuk kembali ke beranda */
  readonly onQuit: () => void;
}

export type GameComponent = ComponentType<GameProps>;

export interface GameMeta {
  readonly title: string;
  /** Instruksi singkat di bawah judul */
  readonly instruction: string;
  /** Emoji maskot/tema untuk sisi kanan (opsional) */
  readonly mascotEmoji?: string;
  readonly mascotCaption?: string;
}

/**
 * Kontrak satu game:
 *   1. Buat folder di src/games/<NamaGame>/
 *   2. Export komponen yang menerima GameProps
 *   3. Daftarkan di registry.ts
 * Shell (HUD bintang, audio, home, jumlah pemain) sudah ditangani GameShell.
 */
export interface GameEntry {
  readonly meta: GameMeta;
  readonly component: GameComponent;
}
