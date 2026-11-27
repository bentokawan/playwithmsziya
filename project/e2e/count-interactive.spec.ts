import { expect, test } from '@playwright/test';

test.describe('G01 interactive tray during auto-count', () => {
  test('allows tapping the correct tile while auto-count is running and advances once', async ({
    page,
  }, testInfo) => {
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
          calmMotion: false,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        }),
      );
    });

    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1&lang=id&seed=7');

    const choices = page.locator('[data-choice="true"]');
    await expect(choices).toHaveCount(3);

    const objectCount = await page.locator('main').getByRole('img').count();
    expect(objectCount).toBeGreaterThanOrEqual(2);

    let wrongIdx = -1;
    let rightIdx = -1;
    for (let i = 0; i < 3; i++) {
      const val = Number((await choices.nth(i).textContent())?.trim());
      if (val === objectCount) rightIdx = i;
      else if (wrongIdx === -1) wrongIdx = i;
    }
    expect(wrongIdx).toBeGreaterThanOrEqual(0);
    expect(rightIdx).toBeGreaterThanOrEqual(0);

    // Tap wrong option -> triggers auto-count starting with badge 1
    await choices.nth(wrongIdx).click();
    const badgeOne = page.locator('[class*="badge"]', { hasText: /^1$/ }).first();
    await expect(badgeOne).toBeVisible({ timeout: 1000 });

    // Within <= 300ms while auto-count is still running, tap the correct option
    await choices.nth(rightIdx).click({ timeout: 300 });
    await expect(choices.nth(rightIdx)).toHaveAttribute('data-state', 'correct');

    // Round advances cleanly to Round 2 (and not further)
    await expect(page.getByLabel(/ronde 2 dari/i)).toBeVisible({ timeout: 2500 });
  });

  test('restarts auto-count cleanly on repeated wrong taps without orphaned round advances', async ({
    page,
  }, testInfo) => {
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
          calmMotion: false,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        }),
      );
    });

    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1&lang=id&seed=7');

    const choices = page.locator('[data-choice="true"]');
    await expect(choices).toHaveCount(3);
    const objectCount = await page.locator('main').getByRole('img').count();

    const wrongIndices: number[] = [];
    let rightIdx = -1;
    for (let i = 0; i < 3; i++) {
      const val = Number((await choices.nth(i).textContent())?.trim());
      if (val === objectCount) rightIdx = i;
      else wrongIndices.push(i);
    }

    // Tap first wrong, then rapidly tap second wrong during auto-count
    await choices.nth(wrongIndices[0]).click();
    await expect(page.locator('[class*="badge"]', { hasText: /^1$/ }).first()).toBeVisible();
    await choices.nth(wrongIndices[1]).click({ timeout: 300 });
    await expect(page.locator('[class*="badge"]', { hasText: /^1$/ }).first()).toBeVisible();

    // Now tap right option and verify round advances exactly once to Round 2
    await choices.nth(rightIdx).click({ timeout: 300 });
    await expect(choices.nth(rightIdx)).toHaveAttribute('data-state', 'correct');
    await expect(page.getByLabel(/ronde 2 dari/i)).toBeVisible({ timeout: 2500 });
    await page.waitForTimeout(700);
    await expect(page.getByLabel(/ronde 2 dari/i)).toBeVisible();
  });
});
