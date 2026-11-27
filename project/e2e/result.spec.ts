import { expect, test, type Page } from '@playwright/test'

async function seed(page: Page, calmMotion: boolean, extra?: () => void) {
  await page.addInitScript((calm) => {
    window.__MSZ_TEST__ = {}
    try {
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: 'id',
          muted: true,
          musicOn: false,
          calmMotion: calm,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        })
      )
    } catch {
      /* storage may be blocked */
    }
  }, calmMotion)
  if (extra) await page.addInitScript(extra)
}

async function solveAll(page: Page, maxRounds = 20) {
  for (let i = 0; i < maxRounds; i++) {
    if (page.url().includes('/result')) return
    const readyBtn = page.getByRole('button', { name: /aku siap!|i'm ready!/i })
    if (await readyBtn.isVisible().catch(() => false)) {
      await readyBtn.click()
      await page.waitForTimeout(100)
    }
    if (page.url().includes('/result')) return
    await page.waitForFunction(
      () =>
        window.location.pathname.includes('/result') ||
        Boolean(document.querySelector('[data-turn-handoff="true"]')) ||
        typeof window.__MSZ_TEST__?.solveRound === 'function',
      { timeout: 10_000 }
    )
    if (page.url().includes('/result')) return
    if (await readyBtn.isVisible().catch(() => false)) {
      await readyBtn.click()
      await page.waitForTimeout(100)
      continue
    }
    await page.evaluate(() => window.__MSZ_TEST__?.solveRound?.())
    await page.waitForTimeout(250)
  }
}

test.describe('Result page', () => {
  test('result celebrates with confetti and a happy mascot', async ({ page }) => {
    await seed(page, false)
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1')
    await solveAll(page)
    await expect(page).toHaveURL(/\/result/)
    await expect(page.locator('[data-confetti]')).toHaveCount(1)
    // No profile → never a personal best → the mascot must not look surprised.
    await expect(page.locator('svg[data-mood="happy"]').first()).toBeVisible()
    await expect(page.locator('svg[data-mood="wow"]')).toHaveCount(0)
    await expect(page.getByText('9 poin')).toBeVisible({ timeout: 2500 })
  })

  test('calm result shows final score immediately', async ({ page }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1')
    await solveAll(page)
    await expect(page).toHaveURL(/\/result/)
    await expect(page.locator('[data-confetti]')).toHaveCount(0)
    await expect(page.getByText('9 poin')).toBeVisible({ timeout: 300 })
  })

  test('character sticker renders the world character, not a star', async ({
    page,
  }) => {
    await seed(page, true, () => {
      window.localStorage.setItem(
        'msz:stickers',
        JSON.stringify({ schemaVersion: 1, owned: ['angka-01'] })
      )
    })
    await page.goto('/stiker')
    const first = page.locator('main button').first()
    await expect(first).toBeVisible()
    await expect(first).not.toContainText('★')
    await expect(first.locator('svg')).toHaveCount(1)
  })

  test('two-player result shows both players without a surprised face', async ({
    page,
  }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=2&mode=giliran')
    await solveAll(page, 16)
    await expect(page).toHaveURL(/\/result/)
    await expect(page.locator('[class*="podiumCard"]')).toHaveCount(2)
    await expect(page.locator('svg[data-mood="wow"]')).toHaveCount(0)
  })

  test('result has no horizontal scroll on 390x844', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium-phone', 'phone only')
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1')
    await solveAll(page)
    await expect(page).toHaveURL(/\/result/)
    const sw = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(sw).toBeLessThanOrEqual(390)
  })
})
