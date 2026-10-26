import styles from './StatusPill.module.css';

interface StatusPillProps {
  label: string;
  /** Tampilkan titik hijau status (default: ya) */
  showDot?: boolean;
  /** Tampilkan ikon speaker */
  showSoundIcon?: boolean;
}

export function StatusPill({ label, showDot = true, showSoundIcon = false }: StatusPillProps) {
  return (
    <span className={styles.statusPill}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      {showSoundIcon && (
        <svg
          className={styles.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        </svg>
      )}
      {label}
    </span>
  );
}
