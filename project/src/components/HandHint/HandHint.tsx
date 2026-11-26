import { m } from 'motion/react';
import { Icon } from '@/components/icons/Icon';
import { useCalmMotion } from '@/design/useCalmMotion';
import styles from './HandHint.module.css';

export interface HandHintProps {
  readonly target: DOMRect | null;
  readonly mode: 'point' | 'trace';
  readonly inline?: boolean;
}

export function HandHint({ target, mode, inline = false }: HandHintProps) {
  const calm = useCalmMotion();
  if (!target && !inline) return null;

  const style = target
    ? { left: target.left + target.width / 2 - 28, top: target.top + target.height / 2 - 28 }
    : undefined;

  const animate = calm
    ? undefined
    : mode === 'point'
      ? { y: [0, -10, 0, -10, 0] }
      : { x: [0, 32, 0, 32, 0] };

  return (
    <m.div
      className={`${styles.hand} ${inline ? styles.inline : ''}`}
      style={style}
      aria-hidden="true"
      animate={animate}
      transition={calm ? { duration: 0 } : { duration: 1.2, ease: 'easeInOut' }}
    >
      <Icon name="hand-point" size={32} />
    </m.div>
  );
}
