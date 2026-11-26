import type { GameModule } from '@/games/types';
import { PetualanganLabirinRound } from './PetualanganLabirinRound';
import { createPetualanganLabirinRounds, type MazeRound } from './rounds';

const petualanganLabirinModule: GameModule<MazeRound> = {
  turnMode: 'per-round',
  createRounds: createPetualanganLabirinRounds,
  Round: PetualanganLabirinRound,
};

export default petualanganLabirinModule;
