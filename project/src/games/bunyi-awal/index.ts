import type { GameModule } from '@/games/types';
import { BunyiAwalRound } from './BunyiAwalRound';
import { createBunyiAwalRounds, type InitialRound } from './rounds';

const bunyiAwalModule: GameModule<InitialRound> = {
  turnMode: 'per-round',
  createRounds: createBunyiAwalRounds,
  speechFor: (round, config) => [
    { kind: 'word', locale: config.locale, key: round.word.toLowerCase() },
  ],
  Round: BunyiAwalRound,
};

export default bunyiAwalModule;
