export type CharacterMood = 'happy' | 'thinking' | 'wow';

export interface CharacterProps {
  readonly mood: CharacterMood;
  readonly size: number;
  readonly className?: string;
}
