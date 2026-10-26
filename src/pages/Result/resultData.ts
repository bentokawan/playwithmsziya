export interface AfterGameStats {
  starsEarned: number;
  starsTotal: number;
  accuracy: string;
  accuracySub: string;
  timeLabel: string;
  timeSub: string;
}

export interface AfterGameData {
  gameTitle: string;
  levelLabel: string;
  praiseTitle: string;
  highlightLabel: string;
  stats: AfterGameStats;
}

export const RESULT_DATA: Record<string, AfterGameData> = {
  'ayo-berhitung': {
    gameTitle: 'Ayo Berhitung',
    levelLabel: 'Level 2 Sedang',
    praiseTitle: 'Luar Biasa, Adik Bintang!',
    highlightLabel: 'Sempurna!',
    stats: {
      starsEarned: 15,
      starsTotal: 15,
      accuracy: '100% Cermat',
      accuracySub: 'Semua Jawaban Pas',
      timeLabel: 'Bermain Asyik',
      timeSub: 'Irama Santai & Tenang',
    },
  },
};
