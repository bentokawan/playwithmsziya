import type { CharacterMood } from '@/worlds/characters/types';

/** Surprised ("wow") is reserved for a personal best; everything else is a smile. */
export function resultMood(o: { readonly isPersonalBest?: boolean }): Extract<CharacterMood, 'happy' | 'wow'> {
  return o.isPersonalBest ? 'wow' : 'happy';
}
