import type { ReactNode } from 'react';
import styles from './Slot.module.css';

export type SlotState = 'empty' | 'filled' | 'correct' | 'hint';

export interface SlotProps {
  readonly state: SlotState;
  readonly children?: ReactNode;
  readonly ghostChar?: string;
}

export function Slot({ state, children, ghostChar }: SlotProps) {
  return (
    <div className={`${styles.slot} ${styles[`state-${state}`]}`}>
      {children ?? (ghostChar ? <span className={styles.ghost}>{ghostChar}</span> : null)}
    </div>
  );
}
