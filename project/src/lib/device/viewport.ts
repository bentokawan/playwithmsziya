import { useEffect, useState } from 'react'
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
