let cached: boolean | null = null

/** Whether the primary pointer can hover (checked once). */
export function canHover(): boolean {
  if (cached === null) {
    cached =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover)').matches
  }
  return cached
}
