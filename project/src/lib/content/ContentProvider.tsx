import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePreferences } from '@/app/providers/usePreferences';
import type { GameId } from '@/games/ids';
import { BUNDLED_AUDIO_FILES } from '@/lib/audio/bundledFiles';
import { createBundledContent } from './defaults';
import { loadContent } from './loader';
import { computeReadiness } from './readiness';
import type { ResolvedContent } from './types';
import { ContentContext } from './useContent';

export function ContentProvider({ children }: { readonly children: ReactNode }) {
  const { prefs } = usePreferences();
  const [content, setContent] = useState<ResolvedContent>(() =>
    createBundledContent({ audioFiles: BUNDLED_AUDIO_FILES }),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadContent().then((res) => {
      if (!active) return;
      setContent(res.content);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const locale = prefs.locale ?? 'id';
  const production = Boolean(import.meta.env.PROD);

  const readiness = useCallback(
    (gameId: GameId) => computeReadiness(content, gameId, { production, locale }),
    [content, production, locale],
  );

  const value = useMemo(
    () => ({ content, loading, readiness }),
    [content, loading, readiness],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
