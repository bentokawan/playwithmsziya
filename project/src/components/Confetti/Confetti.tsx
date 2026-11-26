import { useMemo } from 'react';
import { m } from 'motion/react';
import { useCalmMotion } from '@/design/useCalmMotion';
import { createRng } from '@/lib/random/rng';
import styles from './Confetti.module.css';

const COLORS = ['var(--sun-400)', 'var(--pink-500)', 'var(--blue-500)', 'var(--green-400)'] as const;
const PIECES = 12;

export interface ConfettiProps {
  readonly burst: boolean;
  readonly seed?: number;
}

export function Confetti({ burst, seed = 1 }: ConfettiProps) {
  const calm = useCalmMotion();
  const pieces = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: PIECES }, (_, i) => ({
      x: (rng.next() - 0.5) * 520,
      up: 120 + rng.next() * 140,
      fall: 260 + rng.next() * 160,
      rot: (rng.next() - 0.5) * 720,
      delay: rng.next() * 0.15,
      color: COLORS[i % COLORS.length],
    }));
  }, [seed]);

  if (calm || !burst) return null;

  return (
    <div className={styles.layer} aria-hidden="true" data-confetti>
      {pieces.map((p, i) => (
        <m.span
          key={i}
          className={styles.piece}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, -p.up, p.fall],
            opacity: [1, 1, 0],
            rotate: p.rot,
          }}
          transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut', times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
