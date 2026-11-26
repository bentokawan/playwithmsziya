import { createContext, useContext } from 'react';
import type { AudioManager } from '@/lib/audio/AudioManager';

export const AudioContextReact = createContext<AudioManager | null>(null);

export function useAudio(): AudioManager {
  const ctx = useContext(AudioContextReact);
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return ctx;
}
