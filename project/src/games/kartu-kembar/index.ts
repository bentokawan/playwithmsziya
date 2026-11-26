import type { GameModule } from '@/games/types';
import { KartuKembarRound } from './KartuKembarRound';
import { createKartuKembarRounds, type MemoryRound } from './rounds';

const kartuKembarModule: GameModule<MemoryRound> = {
  turnMode: 'in-game',
  createRounds: createKartuKembarRounds,
  Round: KartuKembarRound,
};

export default kartuKembarModule;
