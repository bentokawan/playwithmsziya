import { expect, test } from '@playwright/test';

test.describe('Admin login & route guard (C7.2)', () => {
  test('redirects unauthenticated /admin/objek to /admin/login with next param', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
    });
    await page.route('**/auth/v1/**', (route) =>
      route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
    );
    await page.goto('/admin/objek');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole('heading', { name: /masuk admin/i })).toBeVisible();
  });

  test('invalid username shows local validation error without network call', async ({ page }) => {
    let authCalled = false;
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
    });
    await page.route('**/auth/v1/**', (route) => {
      authCalled = true;
      return route.fulfill({ status: 400, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /masuk admin|cms belum/i })).toBeVisible();
    const userInput = page.getByLabel(/username/i);
    const passInput = page.getByLabel(/^password$/i);
    if (!(await userInput.isVisible().catch(() => false))) {
      test.skip(true, 'VITE_SUPABASE_* not configured in this build');
      return;
    }

    await userInput.fill('a!');
    await passInput.fill('secret123');
    await page.getByRole('button', { name: /^masuk$/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    expect(authCalled).toBe(false);
  });

  test('handles 400 invalid credentials and 429 rate limit', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
    });
    let mode: '400' | '429' = '400';
    await page.route('**/auth/v1/token**', (route) => {
      if (mode === '400') {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login' }),
        });
      }
      return route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'over_request_rate_limit' }),
      });
    });

    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: /masuk admin|cms belum/i })).toBeVisible();
    const userInput = page.getByLabel(/username/i);
    const passInput = page.getByLabel(/^password$/i);
    if (!(await userInput.isVisible().catch(() => false))) {
      test.skip(true, 'VITE_SUPABASE_* not configured in this build');
      return;
    }

    await userInput.fill('ziya_admin');
    await passInput.fill('wrongpass');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page.getByText(/salah/i)).toBeVisible();

    mode = '429';
    await passInput.fill('wrongpass2');
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await expect(page.getByText(/terlalu banyak/i)).toBeVisible();
  });
});
