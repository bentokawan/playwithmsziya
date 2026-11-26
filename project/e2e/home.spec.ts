import { expect, test, type Page } from '@playwright/test'

async function seed(page: Page, calmMotion = true) {
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

test.describe('Home', () => {
  test('home has a backdrop and loaded styles', async ({ page }) => {
    await seed(page)
    await page.goto('/home')
    await expect(page.locator('[data-backdrop]')).toHaveCount(1)
    const size = await page
      .getByRole('heading', { name: 'Mau main apa hari ini?' })
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(size).toBeGreaterThanOrEqual(28)
  })

  test('nav shows text labels on desktop', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium-desktop', 'desktop only')
    await seed(page)
    await page.goto('/home')
    await expect(page.getByRole('button', { name: 'Stiker' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Peringkat' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Pemain/ })).toContainText(
      'Pemain'
    )
    await expect(
      page.getByRole('button', { name: /^Pengaturan/ })
    ).toContainText('Pengaturan')
  })

  test('nav stays icon-only and fits on phone', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium-phone', 'phone only')
    await seed(page)
    await page.goto('/home')
    const btn = page.getByRole('button', { name: 'Peringkat' })
    await expect(btn).toHaveAttribute('aria-label', 'Peringkat')
    await expect(btn).toHaveText('')
    const sw = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(sw).toBeLessThanOrEqual(390)
  })

  test('calm home cards are visible immediately', async ({ page }) => {
    await seed(page, true)
    await page.goto('/home')
    const cards = page.locator('ul > li')
    await expect(cards.first()).toBeVisible()
    const opacities = await cards.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).opacity)
    )
    expect(opacities.length).toBeGreaterThan(0)
    for (const o of opacities) expect(o).toBe('1')
  })
})
