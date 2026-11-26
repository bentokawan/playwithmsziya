import { describe, expect, it } from 'vitest';
import { mapAuthError, usernameToEmail } from './auth';

describe('supabase auth helpers', () => {
  it('maps valid usernames to synthetic admin emails and rejects invalid ones', () => {
    expect(usernameToEmail('Ms.Ziya_01', 'admin.playwithmsziya.local')).toBe(
      'ms.ziya_01@admin.playwithmsziya.local',
    );
    expect(usernameToEmail('  admin-1  ', 'admin.playwithmsziya.local')).toBe(
      'admin-1@admin.playwithmsziya.local',
    );
    expect(usernameToEmail('ab', 'admin.playwithmsziya.local')).toBeNull();
    expect(usernameToEmail('bad user!', 'admin.playwithmsziya.local')).toBeNull();
    expect(usernameToEmail('admin', '')).toBeNull();
  });

  it('maps auth error statuses and network errors to UI reason codes', () => {
    expect(mapAuthError({ status: 400, message: 'Invalid login credentials' })).toBe('invalid');
    expect(mapAuthError({ status: 429, message: 'Rate limit' })).toBe('rate-limit');
    expect(mapAuthError(new TypeError('Failed to fetch'))).toBe('network');
    expect(mapAuthError({ name: 'AuthRetryableFetchError' })).toBe('network');
  });
});
