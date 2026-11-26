import { describe, expect, it } from 'vitest';
import { createRng } from '@/lib/random/rng';
import {
  canMove,
  dirFromSwipe,
  dirFromTap,
  generateMaze,
  solveMaze,
  stepCell,
  type MazeDir,
} from './maze';

const OPPOSITE: Record<MazeDir, MazeDir> = { N: 'S', S: 'N', E: 'W', W: 'E' };

describe('maze engine (G09)', () => {
  it('generates solvable perfect mazes for 200 seeds across sizes 4, 6, 8 with symmetric canMove', () => {
    for (const size of [4, 6, 8]) {
      for (let seed = 1; seed <= 200; seed++) {
        const maze = generateMaze(size, createRng(seed));
        const path = solveMaze(maze);
        expect(path).not.toBeNull();
        expect(path![0]).toEqual([0, 0]);
        expect(path!.at(-1)).toEqual([size - 1, size - 1]);

        if (seed <= 5) {
          for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
              for (const dir of ['N', 'E', 'S', 'W'] as const) {
                if (canMove(maze, [x, y], dir)) {
                  const next = stepCell([x, y], dir);
                  expect(canMove(maze, next, OPPOSITE[dir])).toBe(true);
                }
              }
            }
          }
        }
      }
    }
  });

  it('dirFromTap returns direction only for orthogonal immediate neighbours', () => {
    expect(dirFromTap([1, 1], [1, 0])).toBe('N');
    expect(dirFromTap([1, 1], [2, 1])).toBe('E');
    expect(dirFromTap([1, 1], [1, 2])).toBe('S');
    expect(dirFromTap([1, 1], [0, 1])).toBe('W');
    expect(dirFromTap([1, 1], [2, 2])).toBeNull();
    expect(dirFromTap([1, 1], [1, 1])).toBeNull();
    expect(dirFromTap([1, 1], [3, 1])).toBeNull();
  });

  it('dirFromSwipe resolves dominant axis beyond threshold', () => {
    expect(dirFromSwipe(40, 5)).toBe('E');
    expect(dirFromSwipe(-40, 10)).toBe('W');
    expect(dirFromSwipe(3, -50)).toBe('N');
    expect(dirFromSwipe(0, 45)).toBe('S');
    expect(dirFromSwipe(10, 12)).toBeNull();
  });
});
