import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Viewport } from '@/games/catalog'

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({
    w: typeof window === 'undefined' ? 1024 : window.innerWidth,
    h: typeof window === 'undefined' ? 768 : window.innerHeight,
  }))
  useEffect(() => {
    const resize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  return vp
}

/** True when the viewport is at least `px` wide (re-renders on change). */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
