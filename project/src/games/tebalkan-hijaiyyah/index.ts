import type { GameModule } from '@/games/types';
import { createTebalkanHijaiyyahRounds, type TraceHijaiyyahRound } from './rounds';
import { TebalkanHijaiyyahRound } from './TebalkanHijaiyyahRound';

const tebalkanHijaiyyahModule: GameModule<TraceHijaiyyahRound> = {
  turnMode: 'per-round',
  createRounds: (config, content) => createTebalkanHijaiyyahRounds(config, content),
  speechFor: (round) => [{ kind: 'hija', key: round.id }],
  Round: TebalkanHijaiyyahRound,
};

export default tebalkanHijaiyyahModule;
