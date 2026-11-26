import type { DifficultyId } from '@/lib/session/session';

export const COUNT_RANGES: Record<DifficultyId, readonly [number, number]> = {
  mudah: [1, 5],
  sedang: [1, 10],
  tantang: [6, 20],
} as const;

export const TRACE_NUMBER_POOLS: Record<DifficultyId, readonly number[]> = {
  mudah: [1, 2, 3, 4, 5],
  sedang: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  tantang: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
} as const;
