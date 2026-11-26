import type { GameModule } from '@/games/types';
import { MenulisHurufRound } from './MenulisHurufRound';
import { createMenulisHurufRounds, type TraceLetterRound } from './rounds';

const menulisHurufModule: GameModule<TraceLetterRound> = {
  turnMode: 'per-round',
  createRounds: (config) => createMenulisHurufRounds(config),
  speechFor: (round, config) => [
    { kind: 'letter', locale: config.locale, key: round.letter.toLowerCase() },
  ],
  Round: MenulisHurufRound,
};

export default menulisHurufModule;
