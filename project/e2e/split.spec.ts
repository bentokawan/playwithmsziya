import { expect, test } from '@playwright/test';

test.describe('Split-screen race mode (Task 7)', () => {
  test('two panes race independently, show last-call, and crown winner on Result', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Split-screen desktop only');

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
      window.localStorage.setItem(
        'msz:profiles:v1',
        JSON.stringify({
          schemaVersion: 1,
          profiles: [
            {
              id: 'p1',
              name: 'Ana',
              avatar: 'kelinci',
              color: 'biru',
              createdAt: '2026-11-26T00:00:00Z',
              archived: false,
            },
            {
              id: 'p2',
              name: 'Budi',
              avatar: 'kucing',
              color: 'merah',
              createdAt: '2026-11-26T00:01:00Z',
              archived: false,
            },
          ],
        }),
      );
    });

    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=layar&p1=p1&p2=p2&seed=7');
    await expect(page.locator('[data-pane]')).toHaveCount(2);

    // Anti-cheat: P1 and P2 receive distinct rounds/options on round 1
    const p1Opts = await page.locator('[data-pane="1"] [data-choice="true"]').allTextContents();
    const p2Opts = await page.locator('[data-pane="2"] [data-choice="true"]').allTextContents();
    expect(p1Opts.length).toBe(3);
    expect(p2Opts.length).toBe(3);
    expect(p1Opts.map((s) => s.trim())).not.toEqual(p2Opts.map((s) => s.trim()));

    // Solve all 3 rounds for Player 1
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(1, { firstTry: true, attempts: 1 });
        }
      });
      await page.waitForTimeout(100);
    }

    await expect(page.locator('[data-last-call="true"]')).toBeVisible();

    // Solve all 3 rounds for Player 2 with lower score (attempts: 2)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(2, { firstTry: false, attempts: 2 });
        }
      });
      await page.waitForTimeout(100);
    }

    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);
    await expect(page.getByText('Ana')).toBeVisible();
    await expect(page.getByText('Budi')).toBeVisible();
    await expect(page.locator('[data-crown="true"]')).toHaveCount(1);
  });
});
