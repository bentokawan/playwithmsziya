import { BlockButton } from '@/components/BlockButton/BlockButton';
import type { IconName } from '@/components/icons/Icon';
import { MsZiya } from '@/worlds/characters/MsZiya';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  readonly message: string;
  readonly actionLabel?: string;
  readonly actionIcon?: IconName;
  readonly onAction?: () => void;
}

export function EmptyState({
  message,
  actionLabel,
  actionIcon = 'play',
  onAction,
}: EmptyStateProps) {
  return (
    <div className={styles.root} data-empty-state>
      <MsZiya mood="happy" size={96} />
      <p className={`t-body ${styles.message}`}>{message}</p>
      {actionLabel && onAction && (
        <BlockButton
          variant="primary"
          size="choice"
          icon={actionIcon}
          label={actionLabel}
          onPress={onAction}
        />
      )}
    </div>
  );
}
