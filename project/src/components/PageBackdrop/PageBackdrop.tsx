import type { ReactNode } from 'react';
import styles from './PageBackdrop.module.css';

export interface PageBackdropProps {
  readonly children: ReactNode;
}

function Cloud({ className }: { className: string }) {
  return (
    <svg className={`${styles.cloud} ${className}`} viewBox="0 0 120 56" aria-hidden="true">
      <path
        d="M22 52a18 18 0 0 1 2-35.9A26 26 0 0 1 74 12a22 22 0 0 1 30 18 16 16 0 0 1-4 22z"
        fill="#fff"
      />
    </svg>
  );
}

/** Decorative sky for non-game pages: gradient, three static clouds and a hill band. */
export function PageBackdrop({ children }: PageBackdropProps) {
  return (
    <div className={styles.root} data-backdrop>
      <div className={styles.deco} aria-hidden="true">
        <Cloud className={styles.c1} />
        <Cloud className={styles.c2} />
        <Cloud className={styles.c3} />
        <svg className={styles.hills} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0 70 C150 10 300 20 450 60 C600 100 750 20 900 40 C1050 60 1120 40 1200 30 V120 H0Z" fill="#bfe8c6" />
          <path d="M0 95 C200 55 380 85 560 80 C760 75 950 45 1200 80 V120 H0Z" fill="#9fd9a9" />
        </svg>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
