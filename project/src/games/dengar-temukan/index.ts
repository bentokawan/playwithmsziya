import type { GameModule } from '@/games/types';
import { DengarTemukanRound } from './DengarTemukanRound';
import { createDengarTemukanRounds, type ListenRound } from './rounds';

const dengarTemukanModule: GameModule<ListenRound> = {
  turnMode: 'per-round',
  createRounds: (config, content) => createDengarTemukanRounds(config, content),
  speechFor: (round) => [{ kind: 'hija', key: round.target }],
  Round: DengarTemukanRound,
};

export default dengarTemukanModule;
