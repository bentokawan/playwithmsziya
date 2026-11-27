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

  test('GrownUpGate shows corrective feedback on wrong answer and passes on right answer', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Desktop run');
    await seedPrefs(page);
    await page.goto('/home');

    const trigger = page.getByRole('button', { name: /pengaturan pendamping/i });
    await expect(trigger).toBeVisible();
    const box = await trigger.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(2150);
    await page.mouse.up();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const heading = (await dialog.locator('#gate-title').textContent()) ?? '';
    const match = heading.match(/(\d+)\s*\+\s*(\d+)/);
    expect(match).not.toBeNull();
    const answer = Number(match![1]) + Number(match![2]);

    const optionButtons = dialog.getByRole('button');
    const count = await optionButtons.count();
    let wrongIdx = -1;
    let secondWrongIdx = -1;
    let rightIdx = -1;
    for (let i = 0; i < count; i++) {
      const val = Number((await optionButtons.nth(i).textContent())?.trim());
      if (val === answer) rightIdx = i;
      else if (wrongIdx === -1) wrongIdx = i;
      else if (secondWrongIdx === -1) secondWrongIdx = i;
    }
    expect(wrongIdx).toBeGreaterThanOrEqual(0);
    expect(secondWrongIdx).toBeGreaterThanOrEqual(0);
    expect(rightIdx).toBeGreaterThanOrEqual(0);

    // Click wrong answer: dialog stays open, alert appears, wrong option disabled
    await optionButtons.nth(wrongIdx).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('alert')).toContainText(/belum tepat, coba lagi/i);
    await expect(optionButtons.nth(wrongIdx)).toBeDisabled();

    // No serious/critical axe violations while alert is shown
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);

    // 2nd wrong answer swaps to a fresh problem and re-enables all buttons
    await optionButtons.nth(secondWrongIdx).click();
    await expect(dialog).toBeVisible();
    const newHeading = (await dialog.locator('#gate-title').textContent()) ?? '';
    expect(newHeading).not.toBe(heading);
    const newMatch = newHeading.match(/(\d+)\s*\+\s*(\d+)/);
    expect(newMatch).not.toBeNull();
    const newAnswer = Number(newMatch![1]) + Number(newMatch![2]);
    for (let i = 0; i < count; i++) {
      await expect(optionButtons.nth(i)).toBeEnabled();
    }

    // Click right answer on new problem -> opens Parents page
    await dialog.getByRole('button', { name: new RegExp(`^${newAnswer}$`) }).click();
    await expect(page).toHaveURL(/\/pendamping$/);
  });
});
