import { expect, test } from '@playwright/test'

const ROTATE_TEXT = 'Putar layarmu ke samping untuk main berdua'
const TOO_SMALL_TEXT = 'Layar ini kurang lega untuk main berdua sekaligus'
const SPLIT_URL =
  '/game/ayo-berhitung/play?level=mudah&players=2&mode=layar&seed=42'

test.describe('Split screen needs a tall, wide screen', () => {
  test('landscape phone: two kids start in turns, with a note', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 740, height: 360 })
    await page.goto('/game/ayo-berhitung/intro')
    await page.getByRole('button', { name: /2 anak/i }).click()
    await expect(page.locator('[data-fallback-note="true"]')).toBeVisible()
    await page.getByRole('button', { name: /mulai berdua/i }).click()
    await expect(page).toHaveURL(/mode=giliran/)
  })

  test('split link on a small screen offers turns instead of a clipped split', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 740, height: 360 })
    await page.goto(SPLIT_URL)
    await expect(page.getByText(TOO_SMALL_TEXT)).toBeVisible()
    await expect(page.getByText(ROTATE_TEXT)).toHaveCount(0)
    await page.getByRole('button', { name: 'Main bergantian saja' }).click()
    await expect(page).toHaveURL(/mode=giliran/)
  })

  test('portrait tablet: rotating mid-game shows the prompt and keeps progress', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {}
    })
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto(SPLIT_URL)
    await expect(page.locator('[data-pane="1"]')).toBeVisible()
    await expect(page.locator('[class*="countdown"]')).toHaveCount(0, {
      timeout: 5000,
    })
    await page.evaluate(() => window.__MSZ_TEST__?.solveRound?.(1))
    await expect(
      page.locator('[data-pane="1"] [class*="scoreBadge"]')
    ).not.toContainText('0')
    const score = await page
      .locator('[data-pane="1"] [class*="scoreBadge"]')
      .innerText()

    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText(ROTATE_TEXT)).toBeVisible()

    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(page.getByText(ROTATE_TEXT)).toHaveCount(0)
    await expect(
      page.locator('[data-pane="1"] [class*="scoreBadge"]')
    ).toHaveText(score)
  })

  test('rotate prompt focuses the take-turns button and blocks the panes', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {}
    })
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto(SPLIT_URL)
    await expect(page.locator('[data-pane="1"]')).toBeVisible()
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText(ROTATE_TEXT)).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Main bergantian saja' })
    ).toBeFocused()
    await expect(page.locator('[data-pane="1"]')).toHaveAttribute('inert', '')
  })

  test('last-call timer pauses while the prompt is open', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {}
    })
    await page.clock.install()
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto(SPLIT_URL)
    await expect(page.locator('[data-pane="1"]')).toBeVisible()
    await expect
      .poll(async () => {
        await page.clock.runFor(500)
        return page.locator('[class*="countdown"]').count()
      })
      .toBe(0)
    // From here on the page clock only moves when the test says so.
    const nowMs = await page.evaluate(() => Date.now())
    await page.clock.pauseAt(nowMs + 1000)
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.__MSZ_TEST__?.solveRound?.(1))
    }
    const banner = page.locator('[data-last-call]')
    await expect(banner).toBeVisible()
    await page.clock.runFor(1000)
    const before = await banner.innerText()
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText(ROTATE_TEXT)).toBeVisible()
    await page.clock.runFor(10_000)
    await expect(page.getByText(ROTATE_TEXT)).toBeVisible()
    await page.setViewportSize({ width: 1024, height: 768 })
    await expect(page.locator('[data-last-call]')).toBeVisible()
    expect(await banner.innerText()).toBe(before)
  })
})
