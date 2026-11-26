import { useReducedMotion } from 'motion/react';
import { usePreferences } from '@/app/providers/usePreferences';

export function useCalmMotion(): boolean {
  const systemReduced = useReducedMotion();
  const { prefs } = usePreferences();
  return Boolean(systemReduced) || prefs.calmMotion;
}
