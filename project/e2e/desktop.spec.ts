import { expect, test } from '@playwright/test'
import { DIGIT_GLYPHS } from '../src/content/glyphs/digits'

test.describe('Desktop mouse tracing', () => {
  test.beforeEach(({ page }, testInfo) => {
    void page
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Desktop mouse only'
    )
  })

  test('solo arena uses the screen', async ({ page }) => {
    await page.goto('/game/ayo-berhitung/play?level=mudah&players=1&seed=3')
    const tile = page.locator('[data-choice]').first()
    await expect(tile).toBeVisible()
    await page.waitForTimeout(500)
    const tileBox = await tile.boundingBox()
    const trayBox = await page.locator('[class*="tray"]').first().boundingBox()
    expect(tileBox!.height).toBeGreaterThanOrEqual(104)
    expect(trayBox!.y + trayBox!.height).toBeGreaterThanOrEqual(0.5 * 768)
  })

  test('canvas is painted on desktop', async ({ page }) => {
    await page.goto(
      '/game/menulis-angka/play?level=mudah&players=1&lang=id&seed=7'
    )
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
    await page.waitForTimeout(200)

    const nonTransparent = await canvas.evaluate((el) => {
      const c = el as HTMLCanvasElement
      const ctx = c.getContext('2d')
      if (!ctx || c.width === 0 || c.height === 0) return 0
      const data = ctx.getImageData(0, 0, c.width, c.height).data
      let count = 0
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) count++
      }
      return count
    })

    expect(nonTransparent).toBeGreaterThan(0)
  })

  test('mouse can trace a full number', async ({ page }) => {
    await page.goto(
      '/game/menulis-angka/play?level=mudah&players=1&lang=id&seed=7'
    )
    const wrap = page.locator('[data-glyph-id]').first()
    await expect(wrap).toBeVisible({ timeout: 3000 })
    const glyphId = await wrap.getAttribute('data-glyph-id')
    expect(glyphId).toBeTruthy()

    const glyph = DIGIT_GLYPHS[glyphId!]
    expect(glyph).toBeDefined()

    const canvas = wrap.locator('canvas')
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()

    const toPx = (pt: readonly [number, number]) => ({
      x: box!.x + (pt[0] / 100) * box!.width,
      y: box!.y + (pt[1] / 100) * box!.height,
    })

    for (const stroke of glyph.strokes) {
      const start = toPx(stroke.points[0])
      await page.mouse.move(start.x, start.y)
      await page.mouse.down()
      for (let i = 1; i < stroke.points.length; i++) {
        const pt = toPx(stroke.points[i])
        await page.mouse.move(pt.x, pt.y, { steps: 8 })
      }
      await page.mouse.up()
    }

    await expect(page.locator('[data-done="true"]').first()).toBeVisible({
      timeout: 2000,
    })
  })
})

const READY_GAME_IDS = [
  'ayo-berhitung',
  'menulis-angka',
  'susun-kata',
  'bunyi-awal',
  'menulis-huruf',
  'dengar-temukan',
  'kartu-kembar',
  'petualangan-labirin',
] as const

test.describe('Responsive play pages', () => {
  test('no horizontal overflow in play pages', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop' &&
        testInfo.project.name !== 'chromium-phone',
      'Desktop and phone projects only'
    )
    for (const id of READY_GAME_IDS) {
      await page.goto(`/game/${id}/play?level=mudah&players=1&lang=id&seed=7`)
      await expect(page.locator('main')).toBeVisible()
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      )
      expect(overflow, `horizontal overflow on ${id}`).toBe(false)
    }
  })
})

test.describe('G01 Ayo Berhitung', () => {
  test('double click submits once', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Desktop mouse only'
    )
    await page.addInitScript(() => {
      window.__MSZ_TEST__ = {}
    })
    await page.goto(
      '/game/ayo-berhitung/play?level=mudah&players=1&lang=id&seed=7'
    )

    const choices = page.locator('[data-choice="true"]')
    await expect(choices).toHaveCount(3)
    const objectCount = await page.locator('main').getByRole('img').count()
    expect(objectCount).toBeGreaterThan(0)

    let wrongIndex = 0
    for (let i = 0; i < 3; i++) {
      const text = (await choices.nth(i).textContent())?.trim()
      if (Number(text) !== objectCount) {
        wrongIndex = i
        break
      }
    }

    await choices.nth(wrongIndex).dblclick()
    await page.waitForTimeout(1000)

    await expect(page.getByLabel(/ronde 1 dari/i)).toBeVisible()
    const retryCount = await page.locator('[data-state="retry"]').count()
    const correctCount = await page.locator('[data-state="correct"]').count()
    expect(retryCount).toBeLessThanOrEqual(1)
    expect(correctCount).toBe(0)
  })
})

test.describe('Home & redirects', () => {
  test('old world URL redirects home', async ({ page }) => {
    await page.goto('/dunia/angka')
    await expect(page).toHaveURL(/\/home$/)
  })

  test('home shows all 9 games', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByRole('listitem')).toHaveCount(9)
  })

  test('home has no horizontal overflow', async ({ page }) => {
    await page.goto('/home')
    await expect(page.getByRole('listitem')).toHaveCount(9)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })

  test('intro is tidy', async ({ page }, testInfo) => {
    await page.goto('/game/ayo-berhitung/intro')
    const startBtn = page.getByRole('button', { name: /mulai|start/i }).first()
    await expect(startBtn).toBeVisible()

    if (testInfo.project.name === 'chromium-desktop') {
      for (const vp of [
        { width: 1366, height: 768 },
        { width: 1360, height: 640 },
      ]) {
        await page.setViewportSize(vp)
        const box = await startBtn.boundingBox()
        expect(box).not.toBeNull()
        expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height)
      }
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)

    await page
      .getByRole('button', { name: /untuk pendamping|for grown-ups/i })
      .click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('intro explicit 1-screen vs 2-device entry & zero-friction 2-player play', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop' &&
        testInfo.project.name !== 'chromium-phone',
      'Desktop and phone projects only'
    )
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
        })
      )
    })

    await page.goto('/game/ayo-berhitung/intro')

    // Without online transport configured in default build, "2 Perangkat" card is hidden
    await expect(page.locator('[data-place="dua"]')).toHaveCount(0)

    // Zero-friction: pick 2 children without needing profiles -> Start
    await page.locator('[data-player-count="2"]').click()

    if (testInfo.project.name === 'chromium-desktop') {
      await expect(page.locator('[data-fallback-note="true"]')).toHaveCount(0)
    } else {
      // Phones take turns: split needs a tall screen.
      await expect(page.locator('[data-fallback-note="true"]')).toBeVisible()
    }

    // Pick Ana for slot 1 and verify reload persists selection
    await page.locator('[data-player-slot="1"]').click()
    await page.getByRole('dialog').getByRole('button', { name: /ana/i }).click()
    await page.reload()
    await expect(page.locator('[data-player-count="2"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.locator('[data-player-slot="1"]')).toContainText('Ana')

    await page
      .getByRole('button', { name: /mulai berdua|start together/i })
      .click()
    if (testInfo.project.name === 'chromium-desktop') {
      await expect(page).toHaveURL(/mode=layar/)
      await expect(page.locator('[data-pane]')).toHaveCount(2)
    } else {
      await expect(page).toHaveURL(/mode=giliran/)
    }
  })
})

test.describe('G09 Petualangan Labirin', () => {
  test('maze accepts click on neighbour cell', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-desktop',
      'Desktop mouse only'
    )
    await page.goto(
      '/game/petualangan-labirin/play?level=mudah&players=1&lang=id&seed=7'
    )
    const playerCell = page.locator('[data-player="true"]').first()
    await expect(playerCell).toBeVisible()

    const x = Number(await playerCell.getAttribute('data-x'))
    const y = Number(await playerCell.getAttribute('data-y'))
    const openDirs = (await playerCell.getAttribute('data-open-dirs')) ?? ''
    expect(openDirs.length).toBeGreaterThan(0)

    const dir = openDirs[0]
    const delta: Record<string, readonly [number, number]> = {
      N: [0, -1],
      E: [1, 0],
      S: [0, 1],
      W: [-1, 0],
    }
    const [dx, dy] = delta[dir]
    const target = page.locator(`[data-x="${x + dx}"][data-y="${y + dy}"]`)
    await target.click()
    await expect(
      page.locator(
        `[data-x="${x + dx}"][data-y="${y + dy}"][data-player="true"]`
      )
    ).toBeVisible()
  })
})
