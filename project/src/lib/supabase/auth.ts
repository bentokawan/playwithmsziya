import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { readEnv } from '@/lib/env';
import { getSupabase } from './client';

export const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;

export type SignInFailReason =
  | 'invalid'
  | 'not-admin'
  | 'rate-limit'
  | 'network'
  | 'not-configured';

export type SignInResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: SignInFailReason };

export function usernameToEmail(username: string, domain: string): string | null {
  const u = username.trim().toLowerCase();
  const d = domain.trim().toLowerCase();
  if (!d || !USERNAME_RE.test(u)) return null;
  return `${u}@${d}`;
}

export function mapAuthError(err: unknown): SignInFailReason {
  if (err instanceof TypeError) {
    return 'network';
  }
  if (err && typeof err === 'object') {
    const status = (err as { status?: unknown }).status;
    if (status === 429) return 'rate-limit';
    if (status === 400 || status === 401) return 'invalid';
    const name = (err as { name?: unknown }).name;
    if (name === 'AuthRetryableFetchError') return 'network';
  }
  return 'invalid';
}

export async function signIn(username: string, password: string): Promise<SignInResult> {
  const supabase = getSupabase();
  const env = readEnv();
  if (!supabase || !env.adminEmailDomain) {
    return { ok: false, reason: 'not-configured' };
  }

  const email = usernameToEmail(username, env.adminEmailDomain);
  if (!email || !password) {
    return { ok: false, reason: 'invalid' };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, reason: mapAuthError(error) };
    }

    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (rpcError) {
      await supabase.auth.signOut();
      return { ok: false, reason: mapAuthError(rpcError) };
    }
    if (!isAdmin) {
      await supabase.auth.signOut();
      return { ok: false, reason: 'not-admin' };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, reason: mapAuthError(err) };
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export interface AdminSessionState {
  readonly loading: boolean;
  readonly configured: boolean;
  readonly session: Session | null;
  readonly username: string | null;
}

export function useAdminSession(): AdminSessionState {
  const supabase = getSupabase();
  const [state, setState] = useState<AdminSessionState>(() => ({
    loading: Boolean(supabase),
    configured: Boolean(supabase),
    session: null,
    username: null,
  }));

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const verify = async (session: Session | null) => {
      if (!active) return;
      if (!session) {
        setState({ loading: false, configured: true, session: null, username: null });
        return;
      }
      const { data: adminRow } = await supabase
        .from('admins')
        .select('username')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!active) return;
      if (!adminRow) {
        await supabase.auth.signOut();
        setState({ loading: false, configured: true, session: null, username: null });
        return;
      }
      setState({
        loading: false,
        configured: true,
        session,
        username: String(adminRow.username),
      });
    };

    void supabase.auth.getSession().then(({ data }) => verify(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void verify(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}
