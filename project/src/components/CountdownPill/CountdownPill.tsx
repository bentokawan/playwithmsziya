import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import { formatCountdown } from '@/lib/timer/countdown';
import styles from './CountdownPill.module.css';

export interface CountdownPillProps {
  readonly remainingMs: number;
  readonly warnBelowMs?: number;
}

export function CountdownPill({
  remainingMs,
  warnBelowMs = 10_000,
}: CountdownPillProps) {
  const t = useT();
  const calm = useCalmMotion();
  const isWarn = remainingMs <= warnBelowMs;

  return (
    <span
      role="timer"
      aria-live="off"
      aria-label={t('timer.label')}
      data-countdown-pill="true"
      data-warn={isWarn ? 'true' : 'false'}
      className={[
        styles.pill,
        isWarn ? styles.warn : '',
        isWarn && !calm ? styles.pulse : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" />
        <path d="M9 2h6" />
      </svg>
      <span className={styles.digits}>{formatCountdown(remainingMs)}</span>
    </span>
  );
}
