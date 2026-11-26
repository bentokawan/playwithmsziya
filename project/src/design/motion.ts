export const DUR = {
  tap: 0.09,
  fast: 0.18,
  base: 0.26,
  celebrate: 0.6,
} as const;

export const SPRING = {
  press: { type: 'spring' as const, stiffness: 700, damping: 30 },
  bouncy: { type: 'spring' as const, stiffness: 420, damping: 16, mass: 0.8 },
  gentle: { type: 'spring' as const, stiffness: 260, damping: 24 },
} as const;

export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

export function pressProps(calm: boolean) {
  return {
    whileTap: calm ? undefined : { scale: 0.96, y: 4 },
    transition: calm ? { duration: 0 } : SPRING.press,
  };
}

export const STAGGER_S = 0.04;

export const ENTER = { opacity: 0, y: 12 } as const;

export function enterProps(calm: boolean, index: number) {
  return {
    initial: calm ? (false as const) : ENTER,
    animate: { opacity: 1, y: 0 },
    transition: calm
      ? { duration: 0 }
      : { ...SPRING.gentle, delay: Math.min(index, 9) * STAGGER_S },
  };
}
