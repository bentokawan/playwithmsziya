import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__MSZ_TEST__ = {}
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
      })
    )
  })
})

test.describe('Sticker book', () => {
  test('sticker book shows progress bars', async ({ page }) => {
    await page.goto('/stiker')
    const bars = page.locator('[role="progressbar"]')
    await expect(bars).toHaveCount(4)
    await expect(bars.first()).toHaveAttribute('aria-valuenow', '0')
    await expect(bars.first()).toHaveAttribute('aria-valuemax', '9')
  })

  test('pages share the backdrop', async ({ page }) => {
    for (const path of ['/pemain', '/peringkat', '/stiker']) {
      await page.goto(path)
      await expect(page.locator('[data-backdrop]')).toHaveCount(1)
    }
  })
})
