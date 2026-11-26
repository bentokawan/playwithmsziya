export const WORLD_IDS = ['angka', 'huruf', 'hijaiyyah', 'memori'] as const;
export type WorldId = (typeof WORLD_IDS)[number];

export const GAME_IDS = [
  'ayo-berhitung',
  'menulis-angka',
  'susun-kata',
  'bunyi-awal',
  'menulis-huruf',
  'dengar-temukan',
  'tebalkan-hijaiyyah',
  'kartu-kembar',
  'petualangan-labirin',
] as const;
export type GameId = (typeof GAME_IDS)[number];

export const isGameId = (v: string): v is GameId =>
  (GAME_IDS as readonly string[]).includes(v);

export const isWorldId = (v: string): v is WorldId =>
  (WORLD_IDS as readonly string[]).includes(v);
