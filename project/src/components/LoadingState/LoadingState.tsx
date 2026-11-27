import { PageBackdrop } from '@/components/PageBackdrop/PageBackdrop';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import { MsZiya } from '@/worlds/characters/MsZiya';
import styles from './LoadingState.module.css';

export interface LoadingDotsProps {
  readonly calm?: boolean;
}

export function LoadingDots({ calm }: LoadingDotsProps) {
  const calmPref = useCalmMotion();
  const isCalm = calm ?? calmPref;

  return (
    <span
      className={styles.dots}
      data-calm={isCalm ? 'true' : undefined}
      aria-hidden="true"
    >
      <span className={`${styles.dot} ${styles.dotBlue}`} />
      <span className={`${styles.dot} ${styles.dotPink}`} />
      <span className={`${styles.dot} ${styles.dotSun}`} />
    </span>
  );
}

export interface LoadingStateProps {
  /**
   * - `page`: Full-viewport (`100dvh`) centered vertically and horizontally, with `<main>` landmark.
   * - `card`: Elevated Play-with-Ms-Ziya card centered within its parent container (e.g. inside PlayPage's `<main>`).
   * - `inline`: Compact dots + label row (e.g. inside SplashPage where Ms Ziya is already shown above).
   */
  readonly variant?: 'page' | 'card' | 'inline';
  /** Custom status copy; defaults to `t('splash.loading')`. */
  readonly message?: string;
  /** Whether to show the friendly Ms Ziya mascot badge inside `page`/`card` variants. Defaults to `true`. */
  readonly showMascot?: boolean;
  /** Whether `page` variant renders the sky/cloud/hill `PageBackdrop`. Defaults to `true`. */
  readonly withBackdrop?: boolean;
}

export function LoadingState({
  variant = 'page',
  message,
  showMascot = true,
  withBackdrop = true,
}: LoadingStateProps) {
  const t = useT();
  const calm = useCalmMotion();
  const label = message ?? t('splash.loading');

  if (variant === 'inline') {
    return (
      <div
        className={styles.inline}
        role="status"
        aria-live="polite"
        aria-busy="true"
        data-loading-state="inline"
      >
        <LoadingDots calm={calm} />
        <span className={styles.inlineText}>{label}</span>
      </div>
    );
  }

  const card = (
    <div
      className={styles.card}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-loading-state={variant}
      data-calm={calm ? 'true' : undefined}
    >
      {showMascot && (
        <span className={styles.mascotBadge} aria-hidden="true">
          <MsZiya mood="happy" size={84} className={styles.mascot} />
        </span>
      )}
      <LoadingDots calm={calm} />
      <p className={styles.message}>{label}</p>
    </div>
  );

  if (variant === 'card') {
    return <div className={styles.cardWrap}>{card}</div>;
  }

  const mainContent = <main className={styles.pageCenter}>{card}</main>;

  if (withBackdrop) {
    return <PageBackdrop>{mainContent}</PageBackdrop>;
  }

  return <div className={styles.plainViewport}>{mainContent}</div>;
}
