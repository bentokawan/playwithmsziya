import { expect, it, vi } from 'vitest'
import { acquireWakeLock, createWakeLockManager } from './wakeLock'

it('requests a screen wake lock and releases it', async () => {
  const release = vi.fn().mockResolvedValue(undefined)
  const request = vi.fn().mockResolvedValue({ release })
  const stop = await acquireWakeLock({ request })
  expect(request).toHaveBeenCalledWith('screen')
  await stop()
  expect(release).toHaveBeenCalledOnce()
})

it('ignores unsupported or rejected wake locks', async () => {
  expect(await acquireWakeLock(undefined)).toBeTypeOf('function')
  expect(
    await acquireWakeLock({
      request: vi.fn().mockRejectedValue(new Error('denied')),
    })
  ).toBeTypeOf('function')
})

it('releases a late hidden request and acquires again when visible', async () => {
  let resolveFirst!: (value: { release(): Promise<void> }) => void
  const first = new Promise<{ release(): Promise<void> }>((resolve) => {
    resolveFirst = resolve
  })
  const oldRelease = vi.fn().mockResolvedValue(undefined)
  const newRelease = vi.fn().mockResolvedValue(undefined)
  const request = vi
    .fn()
    .mockReturnValueOnce(first)
    .mockResolvedValueOnce({ release: newRelease })
  const manager = createWakeLockManager({ request })
  manager.setVisible(true)
  manager.setVisible(false)
  manager.setVisible(true)
  resolveFirst({ release: oldRelease })
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2))
  expect(oldRelease).toHaveBeenCalledOnce()
  manager.stop()
  await vi.waitFor(() => expect(newRelease).toHaveBeenCalledOnce())
})
