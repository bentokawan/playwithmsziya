export interface AppEnv {
  readonly onlineRoom: boolean
  readonly supabaseUrl: string | null
  readonly supabaseAnonKey: string | null
  readonly contentBaseUrl: string | null
  readonly adminEmailDomain: string | null
}

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.replace(/\/+$/, '') : null
}

export function readEnv(
  source: Record<string, unknown> = import.meta.env ?? {}
): AppEnv {
  return {
    onlineRoom: source.VITE_FEATURE_ONLINE_ROOM === '1',
    supabaseUrl: clean(source.VITE_SUPABASE_URL),
    supabaseAnonKey: clean(source.VITE_SUPABASE_ANON_KEY),
    contentBaseUrl: clean(source.VITE_CONTENT_BASE_URL),
    adminEmailDomain: clean(source.VITE_ADMIN_EMAIL_DOMAIN),
  }
}
