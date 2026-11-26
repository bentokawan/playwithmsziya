import { BlockButton } from '@/components/BlockButton/BlockButton';
import { Dialog } from '@/components/Dialog/Dialog';
import { useT } from '@/i18n/useT';
import styles from './ConfirmExit.module.css';

export interface ConfirmExitProps {
  readonly open: boolean;
  readonly onStay: () => void;
  readonly onLeave: () => void;
}

export function ConfirmExit({ open, onStay, onLeave }: ConfirmExitProps) {
  const t = useT();

  return (
    <Dialog open={open} onClose={onStay} labelledBy="confirm-exit-title">
      <div className={styles.body}>
        <h2 id="confirm-exit-title" className={styles.title}>
          {t('play.exit.title')}
        </h2>
        <div className={styles.actions}>
          <BlockButton
            variant="primary"
            size="choice"
            icon="back"
            label={t('play.exit.no')}
            onPress={onStay}
          />
          <BlockButton
            variant="white"
            size="choice"
            icon="check"
            label={t('play.exit.yes')}
            onPress={onLeave}
          />
        </div>
      </div>
    </Dialog>
  );
}
