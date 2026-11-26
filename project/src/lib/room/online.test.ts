import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppEnv } from '@/lib/env';

const base: AppEnv = {
  supabaseUrl: 'https://x.supabase.co',
  supabaseAnonKey: 'anon',
  contentBaseUrl: null,
  adminEmailDomain: null,
  onlineRoom: true,
};

async function withEnv(env: AppEnv) {
  vi.resetModules();
  vi.doMock('@/lib/env', () => ({ readEnv: () => env }));
  return import('./online');
}

afterEach(() => {
  vi.doUnmock('@/lib/env');
  vi.resetModules();
});

describe('isOnlineConfigured', () => {
  it('is false when the feature flag is off, even with Supabase configured', async () => {
    const { isOnlineConfigured } = await withEnv({ ...base, onlineRoom: false });
    expect(isOnlineConfigured()).toBe(false);
  });

  it('is true when the flag is on and Supabase URL and key exist', async () => {
    const { isOnlineConfigured } = await withEnv(base);
    expect(isOnlineConfigured()).toBe(true);
  });

  it('is false when the flag is on but the key is missing', async () => {
    const { isOnlineConfigured } = await withEnv({ ...base, supabaseAnonKey: null });
    expect(isOnlineConfigured()).toBe(false);
  });
});
