import type { RoundResult } from '@/games/types';

export type PlayMode = 'solo' | 'giliran' | 'layar' | 'online';

export function roundPoints(r: RoundResult): 1 | 2 | 3 {
  if (r.firstTry || r.attempts <= 1) return 3;
  if (r.attempts === 2) return 2;
  return 1;
}

export function scoreSession(
  results: readonly RoundResult[],
  perPlayerPairs?: number,
  totalPairs?: number,
  totalRounds?: number,
): { readonly score: number; readonly maxScore: number } {
  if (perPlayerPairs !== undefined && totalPairs !== undefined) {
    return {
      score: Math.max(0, perPlayerPairs) * 2,
      maxScore: Math.max(0, totalPairs) * 2,
    };
  }
  const score = results.reduce((sum, r) => sum + roundPoints(r), 0);
  const effectiveRounds =
    totalRounds !== undefined ? Math.max(results.length, totalRounds) : results.length;
  return {
    score,
    maxScore: effectiveRounds * 3,
  };
}

export function starsFor(score: number, maxScore: number): 1 | 2 | 3 {
  if (maxScore <= 0) return 1;
  const ratio = score / maxScore;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
