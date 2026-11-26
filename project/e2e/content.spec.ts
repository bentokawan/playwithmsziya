import { expect, test } from '@playwright/test';

test.describe('Child content loader fallback & CMS manifest (C7.2)', () => {
  test('falls back to bundled content when latest.json returns 404', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: 'id',
          muted: false,
          musicOn: true,
          calmMotion: true,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        }),
      );
    });
    await page.route('**/content/latest.json', (route) =>
      route.fulfill({ status: 404, body: 'Not Found' }),
    );

    await page.goto('/home');
    await expect(page.getByRole('button', { name: /ayo berhitung/i }).first()).toBeVisible();

    await page.goto('/game/bunyi-awal/play?level=mudah&players=1');
    await expect(page.locator('[data-choice]').first()).toBeVisible();
  });

  test('loads valid manifest from CMS route without error', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: 'id',
          muted: false,
          musicOn: true,
          calmMotion: true,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        }),
      );
    });

    await page.route('**/content/latest.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schemaVersion: 1,
          version: 99,
          manifest: 'manifests/manifest-99.json',
        }),
      }),
    );

    await page.route('**/content/manifests/manifest-99.json', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          schemaVersion: 1,
          version: 99,
          publishedAt: '2026-11-25T00:00:00Z',
          mediaBase: 'https://example.test/media/',
          objects: [
            {
              id: 'apple',
              name: { id: 'Apel CMS', en: 'CMS Apple' },
              image: null,
              countable: true,
              cardFace: true,
              mazeGoal: true,
            },
          ],
          words: [
            {
              locale: 'id',
              word: 'apel',
              objectId: 'apple',
              initial: true,
              spell: true,
              audio: null,
            },
          ],
          hijaiyyah: [],
          speech: [],
          sceneAudio: [],
          credits: [],
        }),
      }),
    );

    await page.goto('/home');
    await expect(page.getByRole('button', { name: /ayo berhitung/i }).first()).toBeVisible();
  });
});
