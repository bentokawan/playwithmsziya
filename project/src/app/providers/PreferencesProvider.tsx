import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { writeJSON } from '@/lib/storage/storage';
import { loadInitialPrefs, PREFS_STORAGE_KEY, type Preferences } from './preferences';
import { PreferencesContext } from './usePreferences';

export function PreferencesProvider({ children }: { readonly children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(() => loadInitialPrefs());

  const update = useCallback((patch: Partial<Omit<Preferences, 'schemaVersion'>>) => {
    setPrefs((prev) => {
      const next: Preferences = { ...prev, ...patch, schemaVersion: 1 };
      writeJSON('local', PREFS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = prefs.locale ?? 'id';
    }
  }, [prefs.locale]);

  const value = useMemo(() => ({ prefs, update }), [prefs, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
