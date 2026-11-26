import type { GameModule } from '@/games/types';
import { AyoBerhitungRound } from './AyoBerhitungRound';
import { createAyoBerhitungRounds, type CountRound } from './rounds';

const ayoBerhitungModule: GameModule<CountRound> = {
  turnMode: 'per-round',
  createRounds: createAyoBerhitungRounds,
  speechFor: (round, config) =>
    Array.from({ length: round.count }, (_, i) => ({
      kind: 'num' as const,
      locale: config.locale,
      key: i + 1,
    })),
  Round: AyoBerhitungRound,
};

export default ayoBerhitungModule;
