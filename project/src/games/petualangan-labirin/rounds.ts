import { generateMaze, type MazeData } from '@/games/engines/maze/maze';
import type { ResolvedContent } from '@/lib/content/types';
import { createRng } from '@/lib/random/rng';
import type { DifficultyId, SessionConfig } from '@/lib/session/session';

export interface MazeRound extends MazeData {
  readonly goalObject: string;
}

const SPEC: Record<DifficultyId, { readonly size: number; readonly rounds: number }> = {
  mudah: { size: 4, rounds: 2 },
  sedang: { size: 6, rounds: 2 },
  tantang: { size: 8, rounds: 3 },
};

export function createPetualanganLabirinRounds(
  config: SessionConfig,
  content: ResolvedContent,
): MazeRound[] {
  const rng = createRng(config.seed);
  const { size, rounds } = SPEC[config.difficulty];
  const goals = [...content.objects.values()].filter((o) => o.mazeGoal && o.imageUrl !== null);

  return Array.from({ length: rounds }, () => {
    const maze = generateMaze(size, rng);
    const goalObj = goals.length > 0 ? rng.pick(goals).id : 'apple';
    return { ...maze, goalObject: goalObj };
  });
}
