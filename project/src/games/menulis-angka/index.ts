import type { GameModule } from '@/games/types';
import { MenulisAngkaRound } from './MenulisAngkaRound';
import { createMenulisAngkaRounds, type TraceNumberRound } from './rounds';

const menulisAngkaModule: GameModule<TraceNumberRound> = {
  turnMode: 'per-round',
  createRounds: (config) => createMenulisAngkaRounds(config),
  speechFor: (round, config) => [{ kind: 'num', locale: config.locale, key: round.num }],
  Round: MenulisAngkaRound,
};

export default menulisAngkaModule;
