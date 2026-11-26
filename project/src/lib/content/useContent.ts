import { createContext, useContext } from 'react';
import type { GameId } from '@/games/ids';
import type { Readiness } from './readiness';
import type { ResolvedContent } from './types';

export interface ContentContextValue {
  readonly content: ResolvedContent;
  readonly loading: boolean;
  readonly readiness: (gameId: GameId) => Readiness;
}

export const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error('useContent must be used within ContentProvider');
  }
  return ctx;
}
