import type { GameEntry } from './types';
import { MenulisHurufGame } from './MenulisHuruf/MenulisHurufGame';

/**
 * Registry semua game. Nambah game baru:
 *   1. Buat folder src/games/<NamaGame>/ berisi komponen bertipe GameProps
 *   2. Tambahkan satu entri di sini — sisanya (route, shell, result) otomatis
 */
export const GAME_REGISTRY: Record<string, GameEntry> = {
  'menulis-huruf': {
    meta: {
      title: 'Menulis Huruf',
      instruction: 'Ikuti garis huruf A, mulai dari titik hijau, ya.',
      mascotEmoji: '🍎',
      mascotCaption: 'A untuk apel',
    },
    component: MenulisHurufGame,
  },
} as const;

export function getGameEntry(gameId: string): GameEntry | undefined {
  return GAME_REGISTRY[gameId];
}
