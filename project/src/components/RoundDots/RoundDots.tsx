import { useT } from '@/i18n/useT';
import type { PlayerNumber } from '@/lib/session/session';
import styles from './RoundDots.module.css';

export interface RoundDotsProps {
  readonly total: number;
  readonly done: number;
  readonly player?: PlayerNumber;
}

export function RoundDots({ total, done, player = 1 }: RoundDotsProps) {
  const t = useT();
  const current = Math.min(done + 1, total);

  return (
    <div
      className={styles.dots}
      role="img"
      aria-label={t('play.round', { n: current, total })}
    >
      {Array.from({ length: total }, (_, idx) => {
        const isDone = idx < done;
        const isActive = idx === done;
        return (
          <span
            key={idx}
            className={[
              styles.dot,
              isDone ? (player === 2 ? styles['done-p2'] : styles['done-p1']) : '',
              isActive ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        );
      })}
    </div>
  );
}
