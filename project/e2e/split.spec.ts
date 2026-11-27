import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Split-screen race mode (Task 7)', () => {
  test('two panes race independently, faster finisher earns more points, and Result cards align cleanly', async ({
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

    // Solve all 3 rounds for Player 1 first (2 firstTry + 1 secondTry = 8 + 3 speed bonus = 11)
    for (let i = 0; i < 3; i++) {
      await page.evaluate((idx) => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(
            1,
            idx === 0 ? { firstTry: false, attempts: 2 } : { firstTry: true, attempts: 1 },
          );
        }
      }, i);
      await page.waitForTimeout(100);
    }

    await expect(page.locator('[data-last-call="true"]')).toBeVisible();

    // Solve all 3 rounds for Player 2 later with perfect accuracy (3x3 = 9, no speed bonus)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(2, { firstTry: true, attempts: 1 });
        }
      });
      await page.waitForTimeout(100);
    }

    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);
    const p1Card = page.locator('[data-podium-player="1"]');
    const p2Card = page.locator('[data-podium-player="2"]');
    await expect(p1Card).toContainText('Ana');
    await expect(p1Card).toContainText('11 poin');
    await expect(p1Card.locator('[data-speed-bonus="true"]')).toContainText(/tercepat \+3/i);
    await expect(p1Card.locator('[data-crown="true"]')).toBeVisible();
    // Winner who finished first also earns full 3 stars (not fewer stars than slower opponent)
    await expect(p1Card.getByRole('img', { name: '3 ★' })).toBeVisible();

    await expect(p2Card).toContainText('Budi');
    await expect(p2Card).toContainText('9 poin');
    await expect(p2Card.locator('[data-crown="true"]')).toHaveCount(0);

    // Both podium cards are aligned at the exact same top & height (crown does not shift card content)
    const p1Box = await p1Card.boundingBox();
    const p2Box = await p2Card.boundingBox();
    expect(p1Box).not.toBeNull();
    expect(p2Box).not.toBeNull();
    expect(Math.abs(p1Box!.y - p2Box!.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(p1Box!.height - p2Box!.height)).toBeLessThanOrEqual(2);

    // All action buttons align on the same row and have matching height
    const actionBtns = page.locator('[data-result-actions="true"] button');
    await expect(actionBtns).toHaveCount(3);
    const b0 = await actionBtns.nth(0).boundingBox();
    const b1 = await actionBtns.nth(1).boundingBox();
    const b2 = await actionBtns.nth(2).boundingBox();
    expect(Math.abs(b0!.height - b1!.height)).toBeLessThanOrEqual(2);
    expect(Math.abs(b1!.height - b2!.height)).toBeLessThanOrEqual(2);

    // Zero serious/critical axe violations on 2-player result
    const axe = await new AxeBuilder({ page }).analyze();
    const blocking = axe.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);

    // Navigating to Peringkat ranks the faster winner (Ana, 11 poin) strictly #1 above Budi (9 poin)
    await page.getByRole('button', { name: /peringkat/i }).click();
    await expect(page).toHaveURL(/\/peringkat/);
    const rows = page.locator('[data-player-row]');
    await expect(rows.nth(0)).toContainText('Ana');
    await expect(rows.nth(0)).toContainText('11 poin');
    await expect(rows.nth(1)).toContainText('Budi');
    await expect(rows.nth(1)).toContainText('9 poin');
  });
});
