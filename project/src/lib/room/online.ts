import { readEnv } from '@/lib/env';

/**
 * Light check used by Home, Intro and routes. Deliberately does not import the
 * Supabase client so the SDK stays out of the entry bundle while the feature
 * flag is off.
 */
export function isOnlineConfigured(): boolean {
  const env = readEnv();
  if (!env.onlineRoom) return false;
  if (import.meta.env.VITE_ROOM_TRANSPORT === 'local') return true;
  return env.supabaseUrl !== null && env.supabaseAnonKey !== null;
}
