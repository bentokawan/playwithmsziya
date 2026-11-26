import { expect, test, type Page } from '@playwright/test'

async function seed(page: Page, calmMotion: boolean) {
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
}

test.describe('Intro layout and preview (desktop)', () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', `desktop layout (${browserName})`)
  })

  test('intro has no step numbers, no hero card, one start button', async ({
    page,
  }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[class*="stepNum"]')).toHaveCount(0)
    await expect(page.locator('[class*="mascotBubble"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^mulai/i })).toHaveCount(1)

    const hero = page.locator('[class*="hero"]').first()
    const style = await hero.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { shadow: cs.boxShadow, bg: cs.backgroundColor }
    })
    expect(style.shadow).toBe('none')
    expect(style.bg).toBe('rgba(0, 0, 0, 0)')
  })

  test('intro spacing is generous', async ({ page }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/intro')
    const copy = await page.locator('[class*="heroCopy"]').boundingBox()
    const panel = await page.locator('[class*="setup"]').first().boundingBox()
    const start = await page.getByRole('button', { name: /^mulai/i }).boundingBox()
    const level = await page.getByRole('group', { name: /level/i }).boundingBox()
    expect(copy && panel).toBeTruthy()
    expect(panel!.x - (copy!.x + copy!.width)).toBeGreaterThanOrEqual(40)
    expect(start!.height).toBeGreaterThanOrEqual(72)
    if (level) {
      expect(start!.y - (level.y + level.height)).toBeGreaterThanOrEqual(24)
    }
  })

  // Other games are not playable in the production build (audio readiness), so their
  // templates are covered by previews.test.ts and the dev-server visual check.
  test('preview follows the game and level', async ({ page }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[data-preview="count"]')).toBeVisible()
    await expect(page.locator('[data-preview-item]')).toHaveCount(3)
    await page.getByRole('button', { name: /sedang/i }).click()
    await expect(page.locator('[data-preview-item]')).toHaveCount(5)

  })

  test('calm motion renders the final static frame', async ({ page }) => {
    await seed(page, true)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[data-preview="count"]')).toBeVisible()
    const opacities = await page
      .locator('[data-preview-item]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))
    expect(opacities.length).toBeGreaterThan(0)
    for (const o of opacities) expect(o).toBe('1')
    // Scoped to the hero + preview: ambient world decoration may animate on its own.
    const running = await page.evaluate(() => {
      const hero = document.querySelector('[data-preview]')?.closest('div[class*="hero"]')
      return (hero?.getAnimations({ subtree: true }) ?? []).filter(
        (a) => a.playState === 'running'
      ).length
    })
    expect(running).toBe(0)
  })

  test('motion runs when calm is off and ends on the full frame', async ({
    page,
  }) => {
    await seed(page, false)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[data-preview="count"]')).toBeVisible()
    await expect
      .poll(
        async () =>
          page
            .locator('[data-preview-item]')
            .evaluateAll((els) =>
              els.every((el) => getComputedStyle(el).opacity === '1')
            ),
        { timeout: 6000 }
      )
      .toBe(true)
  })

  test('start button does not shift when switching 1/2 kids', async ({
    page,
  }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/intro')
    const before = await page.getByRole('button', { name: /^mulai/i }).boundingBox()
    await page.getByRole('button', { name: /2 anak/i }).click()
    const after = await page.getByRole('button', { name: /^mulai/i }).boundingBox()
    expect(after!.y).toBe(before!.y)
  })
})

test.describe('Intro on a short landscape phone', () => {
  test.use({ viewport: { width: 740, height: 360 } })
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-phone', `phone only (${browserName})`)
  })

  test('intro fits short landscape', async ({ page }) => {
    await seed(page, true)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[data-preview="static"]')).toBeVisible()
    const start = page.getByRole('button', { name: /^mulai/i })
    await expect(start).toBeVisible()
    const box = await start.boundingBox()
    expect(box!.y + box!.height).toBeLessThanOrEqual(360)
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight)
    ).toBeLessThanOrEqual(360)
  })
})
