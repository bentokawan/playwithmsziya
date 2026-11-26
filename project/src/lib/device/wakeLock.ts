import { useEffect } from 'react'

type WakeSource = {
  request(type: 'screen'): Promise<{ release(): Promise<void> }>
}

export async function acquireWakeLock(
  source: WakeSource | undefined
): Promise<() => Promise<void>> {
  if (!source) return async () => {}
  try {
    const sentinel = await source.request('screen')
    return async () => {
      try {
        await sentinel.release()
      } catch {
        /* optional device API */
      }
    }
  } catch {
    return async () => {}
  }
}

export function createWakeLockManager(source: WakeSource | undefined) {
  let visible = false
  let stopped = false
  let pending = false
  let generation = 0
  let release: (() => Promise<void>) | null = null
  const request = async () => {
    if (!visible || stopped || pending || release) return
    pending = true
    const current = generation
    const next = await acquireWakeLock(source)
    pending = false
    if (stopped || !visible || current !== generation) {
      await next()
      void request()
    } else {
      release = next
    }
  }
  return {
    setVisible(next: boolean) {
      if (visible === next) return
      visible = next
      generation++
      if (next) void request()
      else if (release) {
        void release()
        release = null
      }
    },
    stop() {
      stopped = true
      generation++
      if (release) {
        void release()
        release = null
      }
    },
  }
}

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const manager = createWakeLockManager(navigator.wakeLock)
    const visibility = () =>
      manager.setVisible(document.visibilityState === 'visible')
    visibility()
    document.addEventListener('visibilitychange', visibility)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      manager.stop()
    }
  }, [active])
}
