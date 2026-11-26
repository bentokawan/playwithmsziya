import { createContext, useContext } from 'react';
import type { Preferences } from './preferences';

export type { Preferences } from './preferences';
export { DEFAULT_PREFS } from './preferences';

export interface PreferencesContextValue {
  readonly prefs: Preferences;
  readonly update: (patch: Partial<Omit<Preferences, 'schemaVersion'>>) => void;
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return ctx;
}
