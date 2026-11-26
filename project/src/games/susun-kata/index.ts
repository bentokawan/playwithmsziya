import type { GameModule } from '@/games/types';
import { createSusunKataRounds, type SpellRound } from './rounds';
import { SusunKataRound } from './SusunKataRound';

const susunKataModule: GameModule<SpellRound> = {
  turnMode: 'per-round',
  createRounds: createSusunKataRounds,
  speechFor: (round, config) => [
    { kind: 'word', locale: config.locale, key: round.word.toLowerCase() },
  ],
  Round: SusunKataRound,
};

export default susunKataModule;
