import type { Rng } from '@/lib/random/rng';

export interface DistractorOptions<T> {
  readonly exclude?: (candidate: T) => boolean;
  readonly requireOneOf?: (candidate: T) => boolean;
}

export function evaluate<T>(answer: T, chosen: T): boolean {
  return Object.is(answer, chosen);
}

export function pickDistractors<T>(
  answer: T,
  pool: readonly T[],
  n: number,
  rng: Rng,
  opts: DistractorOptions<T> = {},
): T[] {
  if (n <= 0) return [];

  const uniquePool: T[] = [];
  const seen = new Set<T>([answer]);
  for (const item of pool) {
    if (!seen.has(item)) {
      seen.add(item);
      uniquePool.push(item);
    }
  }

  const eligible = opts.exclude ? uniquePool.filter((c) => !opts.exclude!(c)) : uniquePool;
  const fallbackPool = eligible.length >= n ? eligible : uniquePool;
  const picked: T[] = [];

  if (opts.requireOneOf) {
    const requiredCandidates = fallbackPool.filter(opts.requireOneOf);
    if (requiredCandidates.length > 0) {
      picked.push(rng.pick(requiredCandidates));
    }
  }

  const remaining = fallbackPool.filter((c) => !picked.includes(c));
  const needed = Math.min(n - picked.length, remaining.length);
  if (needed > 0) {
    picked.push(...rng.sample(remaining, needed));
  }

  return picked;
}
