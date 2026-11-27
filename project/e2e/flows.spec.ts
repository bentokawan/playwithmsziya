import { expect, test, type Page } from '@playwright/test'

async function enableTestMode(page: Page) {
  await page.addInitScript(() => {
    window.__MSZ_TEST__ = {}
  })
}

async function seedPrefs(page: Page, locale: 'id' | 'en' = 'id') {
  await page.addInitScript((loc) => {
    window.__MSZ_TEST__ = {}
    try {
      window.localStorage.setItem(
        'msz:prefs',
        JSON.stringify({
          schemaVersion: 1,
          locale: loc,
          muted: false,
          musicOn: true,
          calmMotion: true,
          thickLines: false,
          hijaiyyahNatureOnly: false,
        })
      )
    } catch {
      /* ignore when localStorage is blocked */
    }
  }, locale)
}

async function solveAllRounds(page: Page, maxRounds = 20) {
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
        (typeof window.__MSZ_TEST__ === 'object' &&
          typeof window.__MSZ_TEST__?.solveRound === 'function'),
      { timeout: 10_000 }
    )
    if (page.url().includes('/result')) return
    if (await readyBtn.isVisible().catch(() => false)) {
      await readyBtn.click()
      await page.waitForTimeout(100)
      continue
    }
    await page.evaluate(() => {
      if (typeof window.__MSZ_TEST__ === 'object') {
        window.__MSZ_TEST__?.solveRound?.()
      }
    })
    await page.waitForTimeout(250)
  }
}

test.describe('Core child flows (T7.2)', () => {
  test('online UI hidden when flag off', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/home')
    await expect(
      page.getByRole('button', { name: /gabung teman/i })
    ).toHaveCount(0)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.getByText('Main di mana?')).toHaveCount(0)
    await page.goto('/gabung/1234')
    await expect(page).toHaveURL(/\/home$/)
    await page.goto('/game/ayo-berhitung/play?mode=online&players=2')
    await expect(page).toHaveURL(/\/home$/)
  })

  test('old intro state place dua falls back to one device', async ({
    page,
  }) => {
    await seedPrefs(page)
    await page.addInitScript(() =>
      localStorage.setItem(
        'msz:intro:last',
        JSON.stringify({
          schemaVersion: 2,
          place: 'dua',
          count: 1,
          ids: [null, null],
        })
      )
    )
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.getByRole('button', { name: /mulai/i })).toBeVisible()
  })

  test('intro shows a single setup panel without step numbers', async ({
    page,
  }) => {
    await seedPrefs(page)
    await page.goto('/game/ayo-berhitung/intro')
    await expect(page.locator('[class*="stepNum"]')).toHaveCount(0)
    await expect(
      page.locator('[class*="setup"] > [class*="setupGroup"]')
    ).toHaveCount(1)
    await expect(page.getByRole('button', { name: /mulai/i })).toHaveCount(1)
    await expect(
      page.locator('[class*="heroCopy"] button[aria-label]')
    ).toHaveCount(1)
  })

  test('two kids without profiles can start', async ({ page }) => {
    await seedPrefs(page)
    await page.goto('/game/ayo-berhitung/intro')
    await page.getByRole('button', { name: /2 anak/i }).click()
    await page.getByRole('button', { name: /mulai berdua/i }).click()
    await expect(page).toHaveURL(/\/play\?.*players=2/)
  })
  test('Splash -> Language -> Home -> World -> Intro -> Play -> Result -> Replay', async ({
    page,
  }) => {
    await enableTestMode(page)
    await page.goto('/')

    // Splash play button
    const playBtn = page
      .getByRole('button', { name: /ayo main|let's play/i })
      .first()
    await expect(playBtn).toBeVisible()
    await playBtn.click()

    // First-visit language dialog
    const idBtn = page.getByRole('button', { name: /indonesia/i })
    if (await idBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await idBtn.click()
    }

    await expect(page).toHaveURL(/\/home/)

    // Open Ayo Berhitung directly from Home
    await page
      .getByRole('button', { name: /ayo berhitung/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/intro/)

    // Start game
    await page.getByRole('button', { name: /mulai/i }).first().click()
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/play/)

    await solveAllRounds(page)
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/)

    // Refresh on Result preserves outcome from sessionStorage
    await page.reload()
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/)
    await expect(page.getByRole('button', { name: /main lagi/i })).toBeVisible()

    // Replay returns to Play
    await page.getByRole('button', { name: /main lagi/i }).click()
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/play/)
  })

  test('invalid query params fallback safely', async ({ page }) => {
    await seedPrefs(page, 'id')
    await page.goto('/game/ayo-berhitung/play?level=x&players=9')
    await expect(page.locator('main')).toBeVisible()
    await solveAllRounds(page)
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/)
  })

  test('works when localStorage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {}
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Blocked', 'SecurityError')
        },
      })
    })
    await page.goto('/home')
    await expect(
      page.getByRole('button', { name: /ayo berhitung/i }).first()
    ).toBeVisible()
  })

  test('fullscreen rejection does not crash', async ({ page }) => {
    await seedPrefs(page, 'id')
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () =>
        Promise.reject(new Error('Denied'))
    })
    await page.goto('/home')
    const fsBtn = page
      .getByRole('button', { name: /layar penuh|fullscreen/i })
      .first()
    if (await fsBtn.isVisible().catch(() => false)) {
      await fsBtn.click()
    }
    await expect(
      page.getByRole('button', { name: /ayo berhitung/i }).first()
    ).toBeVisible()
  })

  test('rapid double-tap on choice evaluates cleanly', async ({ page }) => {
    await seedPrefs(page, 'id')
    await page.goto('/game/bunyi-awal/play?level=mudah&players=1')
    const firstChoice = page.locator('[data-choice]').first()
    await expect(firstChoice).toBeVisible()
    await firstChoice.dblclick()
    await expect(page.locator('main')).toBeVisible()
  })

  test('2-player mode shows TurnBanner and awards 2 stickers on Result', async ({
    page,
  }) => {
    await seedPrefs(page, 'id')
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=2')
    await solveAllRounds(page, 16)
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/result/)
    await expect(page.getByText(/stiker baru|new sticker/i)).toHaveCount(2)
  })

  test('phone pass-and-play shows profile handoff overlay and persistent turn chip', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-phone', 'Phone pass-and-play only')
    await seedPrefs(page, 'id')
    await page.addInitScript(() => {
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
      )
    })

    await page.goto('/game/ayo-berhitung/play?level=mudah&mode=giliran&p1=ana&p2=budi&seed=7')
    await expect(page.locator('[data-turn-chip="true"]')).toContainText('Ana')

    await page.waitForFunction(
      () =>
        typeof window.__MSZ_TEST__ === 'object' &&
        typeof window.__MSZ_TEST__?.solveRound === 'function',
    )
    await page.evaluate(() => {
      if (typeof window.__MSZ_TEST__ === 'object') {
        window.__MSZ_TEST__?.solveRound?.()
      }
    })

    const overlay = page.locator('[data-turn-handoff="true"]')
    await expect(overlay).toBeVisible()
    await expect(overlay).toContainText('Budi')

    const readyBtn = page.getByRole('button', { name: /aku siap!/i })
    await expect(readyBtn).toBeVisible()
    await readyBtn.click()

    await expect(overlay).toBeHidden()
    await expect(page.locator('[data-turn-chip="true"]')).toContainText('Budi')
  })

  test('English locale renders English titles', async ({ page }) => {
    await seedPrefs(page, 'en')
    await page.goto('/home')
    await expect(
      page.getByRole('button', { name: /let's count/i }).first()
    ).toBeVisible()
  })

  test('home tanpa overlay membuka game langsung dengan sekali klik', async ({
    page,
  }) => {
    await seedPrefs(page, 'id')
    await page.goto('/home')
    await expect(
      page.getByRole('button', { name: /ayo main|let's play/i })
    ).toHaveCount(0)
    await page
      .getByRole('button', { name: /ayo berhitung/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/game\/ayo-berhitung\/intro/)
  })
})
