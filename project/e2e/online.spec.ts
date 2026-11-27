import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test'

const SEED_SCRIPT = () => {
  window.__MSZ_TEST__ = {}
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
    })
  )
}

async function openPairedLobby(browser: Browser): Promise<{
  context: BrowserContext
  host: Page
  guest: Page
  code: string
}> {
  const context = await browser.newContext()
  await context.addInitScript(SEED_SCRIPT)

  const host = await context.newPage()
  await host.goto('/game/ayo-berhitung/ruang?level=mudah&p1=ana')
  const codeEl = host.locator('[data-room-code]')
  await expect(codeEl).toBeVisible({ timeout: 5000 })
  const code = (await codeEl.getAttribute('data-room-code')) ?? ''
  expect(code).toMatch(/^\d{4}$/)

  const guest = await context.newPage()
  await guest.goto(`/gabung/${code}`)

  await expect(host.locator('[data-lobby-phase="ready-check"]')).toBeVisible({
    timeout: 5000,
  })
  await expect(guest.locator('[data-lobby-phase="ready-check"]')).toBeVisible({
    timeout: 5000,
  })

  return { context, host, guest, code }
}

test.describe('Online 2-device lobby & realtime sync (Tasks 5–6)', () => {
  test('wrong room code shows friendly error within 6 seconds', async ({
    page,
  }) => {
    await page.addInitScript(SEED_SCRIPT)
    await page.goto('/gabung')
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /^9$/ }).click()
    }
    await page.getByRole('button', { name: /^gabung$/i }).click()
    await expect(page.getByRole('alert')).toContainText(
      /tidak ditemukan|not found/i,
      {
        timeout: 6500,
      }
    )
  })

  test('ready-check requires both ready, guest departure resets host, 3rd client rejected full', async ({
    browser,
  }) => {
    test.fixme(true, 'Third-client rejection is H2 and remains on hold')
    const { context, host, guest, code } = await openPairedLobby(browser)

    // 3rd client with same code sees full
    const third = await context.newPage()
    await third.goto(`/gabung/${code}`)
    await expect(third.getByRole('alert')).toContainText(/penuh|full/i, {
      timeout: 5000,
    })
    await third.close()

    // Only host clicks Ready -> stays in ready-check without navigating
    await host.getByRole('button', { name: /siap!/i }).click()
    await expect(host.locator('[data-ready-self="true"]')).toBeVisible()
    await host.waitForTimeout(300)
    await expect(host).toHaveURL(/\/ruang/)

    // Guest leaves in ready-check -> host returns to waiting with ready reset
    await guest
      .getByRole('button', { name: /kembali|back/i })
      .first()
      .click()
    await expect(host.locator('[data-lobby-phase="waiting"]')).toBeVisible({
      timeout: 5000,
    })

    await context.close()
  })

  test('full race, reload recovery, brief drop, identical simultaneous results, and rematch', async ({
    browser,
  }) => {
    const { context, host, guest, code } = await openPairedLobby(browser)

    await host.getByRole('button', { name: /siap!/i }).click()
    await guest.getByRole('button', { name: /siap!/i }).click()

    await expect(host).toHaveURL(/mode=online/, { timeout: 8000 })
    await expect(guest).toHaveURL(/mode=online/, { timeout: 8000 })

    const hostSeed = new URL(host.url()).searchParams.get('seed')
    const guestSeed = new URL(guest.url()).searchParams.get('seed')
    expect(hostSeed).toBeTruthy()
    expect(hostSeed).toBe(guestSeed)

    // Progress: host solves round 1 -> guest sees data-peer-progress="1" <= 2s
    await host.waitForFunction(
      () => typeof window.__MSZ_TEST__?.solveRound === 'function'
    )
    await host.evaluate(() => window.__MSZ_TEST__?.solveRound?.())
    await expect(guest.locator('[data-peer-progress="1"]')).toBeVisible({
      timeout: 2000,
    })

    // Guest solves round 1 with attempts:2 (score 2) then reloads
    await guest.waitForFunction(
      () => typeof window.__MSZ_TEST__?.solveRound === 'function'
    )
    await guest.evaluate(() =>
      window.__MSZ_TEST__?.solveRound?.(1, { firstTry: false, attempts: 2 })
    )
    await expect(host.locator('[data-peer-progress="1"]')).toBeVisible({
      timeout: 2000,
    })

    await guest.reload()
    await expect(guest.locator('[data-race-runner="1"]')).toHaveAttribute(
      'data-progress',
      '1',
      {
        timeout: 5000,
      }
    )
    await expect(guest.locator('[data-peer-connected="true"]')).toBeVisible({
      timeout: 6000,
    })
    await expect(host.locator('[data-peer-connected="true"]')).toBeVisible({
      timeout: 6000,
    })

    // Brief drop on guest (3000 ms) -> host sees reconnecting badge, then recovers without finishing
    await guest.waitForFunction(
      () => typeof window.__MSZ_TEST__?.simulateRoomDrop === 'function'
    )
    await guest.evaluate(() => window.__MSZ_TEST__?.simulateRoomDrop?.(3000))
    await expect(guest.locator('[data-self-reconnecting="true"]')).toBeVisible({
      timeout: 2000,
    })
    await expect(host.locator('[data-peer-reconnecting="true"]')).toBeVisible({
      timeout: 4000,
    })
    await expect(host.locator('[data-peer-connected="true"]')).toBeVisible({
      timeout: 6000,
    })

    // Both finish remaining rounds (host solves 2 more, guest solves 2 more)
    for (let i = 0; i < 2; i++) {
      await host.waitForFunction(
        () => typeof window.__MSZ_TEST__?.solveRound === 'function'
      )
      await host.evaluate(() => window.__MSZ_TEST__?.solveRound?.())
      await host.waitForTimeout(100)
    }
    for (let i = 0; i < 2; i++) {
      await guest.waitForFunction(
        () => typeof window.__MSZ_TEST__?.solveRound === 'function'
      )
      await guest.evaluate(() => window.__MSZ_TEST__?.solveRound?.())
      await guest.waitForTimeout(100)
    }

    await expect(host).toHaveURL(/\/result/, { timeout: 6000 })
    await expect(guest).toHaveURL(/\/result/, { timeout: 6000 })

    const hostFinalText = await host.locator('[data-final="true"]').innerText()
    const guestFinalText = await guest
      .locator('[data-final="true"]')
      .innerText()
    expect(hostFinalText).toBe(guestFinalText)
    expect(hostFinalText).toContain('11')
    expect(hostFinalText).toContain('8')

    // Rematch returns both to ready-check with the same room code
    await host.getByRole('button', { name: /main lagi|play again/i }).click()
    await expect(host.locator('[data-lobby-phase="ready-check"]')).toBeVisible({
      timeout: 5000,
    })
    await expect(guest.locator('[data-lobby-phase="ready-check"]')).toBeVisible(
      { timeout: 5000 }
    )
    expect(host.url()).toContain('/ruang')
    expect(guest.url()).toContain(`/gabung/${code}`)

    await context.close()
  })

  test('peer departure during match triggers peer-gone result after 30s grace without crown', async ({
    browser,
  }) => {
    const context = await browser.newContext()
    await context.addInitScript(SEED_SCRIPT)

    const host = await context.newPage()
    await host.clock.install()
    await host.goto('/game/ayo-berhitung/ruang?level=mudah&p1=ana')
    await host.clock.runFor(250)

    const codeEl = host.locator('[data-room-code]')
    await expect(codeEl).toBeVisible()
    const code = (await codeEl.getAttribute('data-room-code')) ?? ''

    const guest = await context.newPage()
    await guest.goto(`/gabung/${code}`)
    await host.clock.runFor(200)
    await expect(host.locator('[data-lobby-phase="ready-check"]')).toBeVisible()
    await expect(
      guest.locator('[data-lobby-phase="ready-check"]')
    ).toBeVisible()

    await host.getByRole('button', { name: /siap!/i }).click()
    await guest.getByRole('button', { name: /siap!/i }).click()
    await host.clock.runFor(3500)

    await expect(host).toHaveURL(/mode=online/, { timeout: 5000 })
    await expect(guest).toHaveURL(/mode=online/, { timeout: 5000 })

    // Guest drops tab abruptly (no bye) -> host sees reconnecting, fastForward past 30s -> peer-gone Result
    await guest.close()
    await host.clock.runFor(7000)
    await expect(host.locator('[data-peer-reconnecting="true"]')).toBeVisible()

    await host.clock.fastForward(31_000)
    await expect(host).toHaveURL(/\/result/, { timeout: 5000 })
    await expect(host.locator('[data-final="true"]')).toContainText(
      /keluar|left/i
    )
    await expect(host.locator('[data-crown="true"]')).toHaveCount(0)

    await context.close()
  })
})
