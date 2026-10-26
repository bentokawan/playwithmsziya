export interface DifficultyOption {
  readonly id: 'mudah' | 'sedang' | 'tantang';
  readonly label: string;
  readonly levelLabel: string;
  readonly stars: number;
  /** Warna aksen kartu: border, teks, dan tint saat aktif */
  readonly color: string;
  /** Warna latar saat aktif (tint lembut) */
  readonly tint: string;
}

export interface GameIntroData {
  readonly title: string;
  readonly categoryLabel: string;
  readonly categoryColor: string;
  /** Warna latar banner ilustrasi */
  readonly bannerGradient: string;
  readonly description: string;
  readonly difficultyOptions: readonly DifficultyOption[];
}

export const GAME_INTRO_DATA: Record<string, GameIntroData> = {
  'menulis-huruf': {
    title: 'Menulis Huruf',
    categoryLabel: 'Huruf & Kata',
    categoryColor: '#ff5a5f',
    bannerGradient: 'linear-gradient(180deg, #e4e1fc 0%, #d6d3f6 100%)',
    description:
      'Perhatikan cara menulis hurufnya, lalu tebalkan dengan jarimu mulai dari titik hijau ya!',
    difficultyOptions: [
      {
        id: 'mudah',
        label: 'Mudah',
        levelLabel: 'Level 1 • Easy',
        stars: 1,
        color: '#f5b942',
        tint: '#fdf6e3',
      },
      {
        id: 'sedang',
        label: 'Sedang',
        levelLabel: 'Level 2 • Med',
        stars: 2,
        color: '#3ccb7f',
        tint: '#e9f9f0',
      },
      {
        id: 'tantang',
        label: 'Tantang',
        levelLabel: 'Level 3 • Tricky',
        stars: 3,
        color: '#ff9f43',
        tint: '#fff4e5',
      },
    ],
  },
};
