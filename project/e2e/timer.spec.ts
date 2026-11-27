import { expect, test } from '@playwright/test';

test.describe('Session countdown timer', () => {
  test('finishes solo G01 easy session after 30s and scores only completed rounds', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Desktop run');

    await page.clock.install();
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: 'id',
          muted: true,
          musicOn: false,
          calmMotion: true,
          thickLines: false,
          hijaiyyahNatureOnly: false,
          timerOn: true,
        }),
      );
      window.localStorage.setItem(
        'msz:profiles:v1',
        JSON.stringify({
          schemaVersion: 1,
          profiles: [
            {
              id: 'ana',
              name: 'Ana',
              avatar: 'kelinci',
              color: 'biru',
              createdAt: '2026-11-26T00:00:00Z',
              archived: false,
            },
          ],
        }),
      );
    });

    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=solo&p1=ana&seed=7');

    const pill = page.locator('[data-countdown-pill="true"]');
    await expect(pill).toBeVisible();
    await expect(pill).toContainText('0:30');

    // Solve exactly 1 round (firstTry -> 3 points)
    await page.waitForFunction(
      () =>
        typeof window.__MSZ_TEST__ === 'object' &&
        typeof window.__MSZ_TEST__?.solveRound === 'function',
    );
    await page.evaluate(() => {
      if (typeof window.__MSZ_TEST__ === 'object') {
        window.__MSZ_TEST__?.solveRound?.(1, { firstTry: true, attempts: 1 });
      }
    });
    await expect(page.getByLabel(/ronde 2 dari/i)).toBeVisible();

    // Fast-forward past 30s + 1.2s time-up overlay
    await page.clock.fastForward(31_000);
    await page.clock.fastForward(1_500);

    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);
    await expect(page.getByText(/3 poin/i)).toBeVisible();
  });

  test('hides countdown timer when timerOn preference is false', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Desktop run');

    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {};
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: 'id',
          muted: true,
          musicOn: false,
          calmMotion: true,
          thickLines: false,
          hijaiyyahNatureOnly: false,
          timerOn: false,
        }),
      );
    });

    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=solo&seed=7');
    await expect(page.locator('[data-choice="true"]').first()).toBeVisible();
    await expect(page.locator('[data-countdown-pill="true"]')).toHaveCount(0);
  });
});
