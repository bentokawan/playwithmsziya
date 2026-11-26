import type { ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { useT } from '@/i18n/useT';
import styles from './HintBubble.module.css';

export interface HintBubbleProps {
  readonly objectId?: string;
  readonly children?: ReactNode;
  readonly onListen?: () => void;
  readonly speaking?: boolean;
}

export function HintBubble({ objectId, children, onListen, speaking = false }: HintBubbleProps) {
  const t = useT();
  const content = (
    <>
      {objectId ? <ObjectImage objectId={objectId} size={96} /> : children}
      {onListen && (
        <span className={styles.listenBadge} aria-hidden="true">
          <Icon name="listen" size={20} />
        </span>
      )}
    </>
  );

  const className = `${styles.bubble} ${speaking ? styles.speaking : ''}`;

  if (onListen) {
    return (
      <button type="button" className={className} onClick={onListen} aria-label={t('play.listen')}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
