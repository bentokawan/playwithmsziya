import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { readEnv } from '@/lib/env';

export type { RealtimeChannel, SupabaseClient };

let cachedClient: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const env = readEnv();
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'msz-admin-auth',
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return cachedClient;
}

export function resetSupabaseClient(): void {
  cachedClient = undefined;
}
