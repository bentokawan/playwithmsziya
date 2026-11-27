import type { GameModule } from '@/games/types';
import type { ResolvedContent } from '@/lib/content/types';
import type { PlayerNumber, SessionConfig } from '@/lib/session/session';

const MAX_P2_ATTEMPTS = 4;

export function roundSeed(baseSeed: number, player: PlayerNumber): number {
  if (player === 1) return baseSeed;
  return (baseSeed ^ 0x9e3779b9) >>> 0;
}

function roundsCollide(a: unknown, b: unknown): boolean {
  if (JSON.stringify(a) === JSON.stringify(b)) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    if ('count' in ao && 'count' in bo && 'objectId' in ao && 'objectId' in bo) {
      return ao.count === bo.count && ao.objectId === bo.objectId;
    }
  }
  return false;
}

function countCollisions<R>(a: readonly R[], b: readonly R[]): number {
  const len = Math.min(a.length, b.length);
  let collisions = 0;
  for (let i = 0; i < len; i++) {
    if (roundsCollide(a[i], b[i])) collisions += 1;
  }
  return collisions;
}

export function createPlayerRounds<R>(
  mod: GameModule<R>,
  config: SessionConfig,
  content: ResolvedContent,
): Record<PlayerNumber, readonly R[]> {
  const p1 = mod.createRounds({ ...config, seed: roundSeed(config.seed, 1) }, content);
  if (config.players !== 2 || mod.turnMode !== 'per-round') {
    return { 1: p1, 2: p1 };
  }

  const baseP2 = roundSeed(config.seed, 2);
  let bestP2: readonly R[] = p1;
  let bestCollisions = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < MAX_P2_ATTEMPTS; attempt++) {
    const candidateSeed =
      attempt === 0 ? baseP2 : Math.imul(baseP2 ^ (attempt * 0x85ebca6b), 0xc2b2ae35) >>> 0;
    const candidate = mod.createRounds({ ...config, seed: candidateSeed }, content);
    const collisions = countCollisions(p1, candidate);
    if (collisions < bestCollisions) {
      bestCollisions = collisions;
      bestP2 = candidate;
      if (collisions === 0) break;
    }
  }

  return { 1: p1, 2: bestP2 };
}
