import styles from './LoadingBar.module.css';

interface LoadingBarProps {
  /** Kemajuan 0–100 */
  value: number;
}

export function LoadingBar({ value }: LoadingBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  );
}
