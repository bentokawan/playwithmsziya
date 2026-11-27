import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Leaderboard & score recording (Task 8)', () => {
  test('records personal best, improvement chip, and positive leaderboard', async ({ page }) => {
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
              id: 'ana',
              name: 'Ana',
              avatar: 'kelinci',
              color: 'biru',
              createdAt: '2026-11-26T00:00:00Z',
              archived: false,
            },
            {
              id: 'budi',
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

    // Ana plays G01 solo with attempts:2 (score = 6)
    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=solo&p1=ana&seed=1');
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction(
        () =>
          typeof window.__MSZ_TEST__ === 'object' &&
          typeof window.__MSZ_TEST__?.solveRound === 'function',
      );
      await page.evaluate(() => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(1, { firstTry: false, attempts: 2 });
        }
      });
      await page.waitForTimeout(150);
    }
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);
    await expect(page.getByText(/rekor baru!/i)).toBeVisible();

    // Ana plays again with attempts:1 (score = 9, +3)
    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=solo&p1=ana&seed=2');
    for (let i = 0; i < 3; i++) {
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
      await page.waitForTimeout(150);
    }
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);
    await expect(page.getByText(/\+3/)).toBeVisible();

    // Budi plays with lower score (attempts:3 -> score = 3)
    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=solo&p1=budi&seed=3');
    for (let i = 0; i < 3; i++) {
      await page.waitForFunction(
        () =>
          typeof window.__MSZ_TEST__ === 'object' &&
          typeof window.__MSZ_TEST__?.solveRound === 'function',
      );
      await page.evaluate(() => {
        if (typeof window.__MSZ_TEST__ === 'object') {
          window.__MSZ_TEST__?.solveRound?.(1, { firstTry: false, attempts: 3 });
        }
      });
      await page.waitForTimeout(150);
    }
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/);

    // Default leaderboard view shows overall earned points (Ana: 6 + 9 = 15 poin, Budi: 3 poin)
    await page.goto('/peringkat');
    await expect(page.getByRole('tab', { name: /keseluruhan poin/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const overallItems = page.getByRole('listitem');
    await expect(overallItems).toHaveCount(2);
    await expect(overallItems.nth(0)).toContainText('Ana');
    await expect(overallItems.nth(0)).toContainText('15 poin');
    await expect(overallItems.nth(1)).toContainText('Budi');
    await expect(overallItems.nth(1)).toContainText('3 poin');

    // Switch to per-game leaderboard via URL
    await page.goto('/peringkat?game=ayo-berhitung&level=mudah');
    await expect(page.getByRole('tab', { name: /per game/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText('Ana');
    await expect(items.nth(0)).toContainText('9 poin');
    await expect(items.nth(1)).toContainText('Budi');

    const bodyText = await page.locator('main').innerText();
    expect(bodyText.toLowerCase()).not.toContain('terakhir');
    expect(bodyText).not.toMatch(/-\d+/);
  });

  test('empty leaderboard without profiles offers Tambah Peserta CTA to /pemain', async ({
    page,
  }) => {
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
        }),
      );
    });
    await page.goto('/peringkat');
    await expect(page.getByText(/belum ada peserta/i)).toBeVisible();
    await page.getByRole('button', { name: 'Tambah Peserta' }).click();
    await expect(page).toHaveURL(/\/pemain$/);
  });

  test('lists all active profiles with 0 poin when nobody has played yet', async ({ page }) => {
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
            {
              id: 'budi',
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

    await page.goto('/peringkat');
    const items = page.getByRole('listitem');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText('Ana');
    await expect(items.nth(0)).toContainText('0 poin');
    await expect(items.nth(1)).toContainText('Budi');
    await expect(items.nth(1)).toContainText('0 poin');

    await page.getByRole('button', { name: 'Ayo main' }).click();
    await expect(page).toHaveURL(/\/home$/);
  });

  test('clicking a player row opens detailed per-game and per-session point breakdown without overflow or a11y violations', async ({
    page,
  }) => {
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
        }),
      );
      window.localStorage.setItem(
        'msz:profiles:v1',
        JSON.stringify({
          schemaVersion: 1,
          profiles: [
            {
              id: 'gavin',
              name: 'Gavin',
              avatar: 'kelinci',
              color: 'merah',
              createdAt: '2026-11-26T00:00:00Z',
              archived: false,
            },
            {
              id: 'zia',
              name: 'Zia',
              avatar: 'kucing',
              color: 'biru',
              createdAt: '2026-11-26T00:01:00Z',
              archived: false,
            },
          ],
        }),
      );
      window.localStorage.setItem(
        'msz:scores:v1',
        JSON.stringify({
          schemaVersion: 1,
          records: [
            {
              id: 's1',
              profileId: 'gavin',
              gameId: 'ayo-berhitung',
              difficulty: 'mudah',
              mode: 'solo',
              score: 6,
              maxScore: 9,
              firstTryCount: 1,
              rounds: 3,
              finishedAt: '2026-11-26T09:00:00Z',
            },
            {
              id: 's2',
              profileId: 'gavin',
              gameId: 'ayo-berhitung',
              difficulty: 'mudah',
              mode: 'solo',
              score: 9,
              maxScore: 9,
              firstTryCount: 3,
              rounds: 3,
              finishedAt: '2026-11-27T08:30:00Z',
            },
            {
              id: 's3',
              profileId: 'gavin',
              gameId: 'menulis-angka',
              difficulty: 'sedang',
              mode: 'layar',
              score: 9,
              maxScore: 12,
              firstTryCount: 2,
              rounds: 4,
              finishedAt: '2026-11-27T09:15:00Z',
              won: true,
            },
          ],
        }),
      );
    });

    await page.goto('/peringkat');
    await page.locator('[data-player-row="gavin"]').click();
    await expect(page).toHaveURL(/\/peringkat\/gavin$/);

    // Hero shows Gavin & total 24 poin
    await expect(page.getByRole('heading', { name: 'Gavin' })).toBeVisible();
    await expect(page.locator('[data-total-points="true"]')).toContainText('24 poin');

    // Mode breakdown
    const modeSection = page.locator('[data-mode-breakdown="true"]');
    await expect(modeSection).toContainText(/main sendiri/i);
    await expect(modeSection).toContainText('15 poin');
    await expect(modeSection).toContainText(/main layar dibagi/i);
    await expect(modeSection).toContainText('9 poin');

    // Per-game card & bucket line matching "Ayo Berhitung main sendiri (Mudah)"
    const g01Card = page.locator('[data-game-card="ayo-berhitung"]');
    await expect(g01Card).toContainText('Ayo Berhitung main sendiri (Mudah)');
    await expect(g01Card).toContainText('15 poin');
    await expect(g01Card.locator('[data-session-row="true"]')).toHaveCount(2);
    await expect(g01Card).toContainText('+9 poin');
    await expect(g01Card).toContainText('+6 poin');

    const g02Card = page.locator('[data-game-card="menulis-angka"]');
    await expect(g02Card).toContainText('Menulis Angka main layar dibagi (Sedang)');
    await expect(g02Card).toContainText('Juara');

    // No horizontal overflow
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);

    // Zero serious/critical axe violations
    const axe = await new AxeBuilder({ page }).analyze();
    const blocking = axe.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);

    // Back returns to /peringkat, and clicking unplayed Zia shows friendly empty state
    await page.getByRole('button', { name: /kembali/i }).click();
    await expect(page).toHaveURL(/\/peringkat$/);

    await page.locator('[data-player-row="zia"]').click();
    await expect(page).toHaveURL(/\/peringkat\/zia$/);
    await expect(page.locator('[data-total-points="true"]')).toContainText('0 poin');
    await expect(page.getByText(/belum ada poin untuk zia/i)).toBeVisible();
  });
});
