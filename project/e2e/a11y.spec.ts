import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function seedPrefs(page: Page) {
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
}

const ROUTES = [
  '/',
  '/home',
  '/game/ayo-berhitung/intro',
  '/game/ayo-berhitung/play?level=mudah&players=1',
  '/stiker',
  '/pemain',
  '/peringkat',
  '/pendamping',
];

test.describe('Accessibility (T7.3)', () => {
  for (const route of ROUTES) {
    test(`no serious or critical axe violations on ${route}`, async ({ page }) => {
      await seedPrefs(page);
      await page.goto(route);
      await page.waitForTimeout(700);

      const results = await new AxeBuilder({ page }).analyze();
      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }

  test('keyboard navigation Home -> Intro and Dialog Escape restore', async ({ page }) => {
    await seedPrefs(page);
    await page.goto('/home');

    const gameBtn = page.getByRole('button', { name: /ayo berhitung/i }).first();
    await gameBtn.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/intro/);

    // Open ConfirmExit dialog on Play and close with Escape
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1');
    const backBtn = page.getByRole('button', { name: /kembali/i }).first();
    await backBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
