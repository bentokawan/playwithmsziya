import { useEffect, useState, type ReactNode } from 'react';
import { AudioManager } from '@/lib/audio/AudioManager';
import { useContent } from '@/lib/content/useContent';
import { AudioContextReact } from './useAudio';
import { usePreferences } from './usePreferences';

export function AudioProvider({ children }: { readonly children: ReactNode }) {
  const { prefs } = usePreferences();
  const { content } = useContent();
  const [manager] = useState(() => new AudioManager());

  useEffect(() => {
    manager.setUrlResolver(content);
  }, [manager, content]);

  useEffect(() => {
    manager.applyPrefs(prefs);
  }, [manager, prefs]);

  useEffect(() => {
    if (manager.unlocked) return;
    let active = true;
    const onGesture = () => {
      if (!active) return;
      void manager.unlock().then(() => {
        if (manager.unlocked) {
          window.removeEventListener('pointerdown', onGesture, true);
          window.removeEventListener('keydown', onGesture, true);
        }
      });
    };
    window.addEventListener('pointerdown', onGesture, { capture: true });
    window.addEventListener('keydown', onGesture, { capture: true });
    return () => {
      active = false;
      window.removeEventListener('pointerdown', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
    };
  }, [manager]);

  useEffect(() => {
    return () => {
      manager.dispose();
    };
  }, [manager]);

  return <AudioContextReact.Provider value={manager}>{children}</AudioContextReact.Provider>;
}
