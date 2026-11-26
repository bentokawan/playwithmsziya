import { useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Icon } from '@/components/icons/Icon';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { DUR, pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import type { CatalogEntry } from '@/games/catalog';
import { useT } from '@/i18n/useT';
import { WORLDS } from '@/worlds/worlds';
import styles from './GameCard.module.css';

export interface GameCardProps {
  readonly entry: CatalogEntry;
  readonly onOpen: (entry: CatalogEntry) => void;
  readonly isReady?: boolean;
  readonly layout?: 'grid' | 'compact';
}

export function GameCard({ entry, onOpen, isReady, layout = 'grid' }: GameCardProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();
  const [shaking, setShaking] = useState(false);

  const playable = isReady ?? entry.status === 'ready';
  const sky = WORLDS[entry.worldId].palette.sky;
  const isCompact = layout === 'compact';

  const handleClick = () => {
    if (!playable) {
      audio.sfx('retry');
      if (!calm) {
        setShaking(true);
        window.setTimeout(() => setShaking(false), 300);
      }
      return;
    }
    audio.sfx('tap');
    onOpen(entry);
  };

  return (
    <m.button
      type="button"
      className={[styles.card, isCompact ? styles.compact : '', playable ? '' : styles.soon]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      aria-disabled={!playable || undefined}
      animate={shaking && !calm ? { rotate: [0, -4, 4, -4, 0] } : { rotate: 0 }}
      transition={calm ? { duration: 0 } : { duration: DUR.base }}
      {...(playable ? pressProps(calm) : {})}
    >
      {!playable && (
        <span className={styles.lockBadge}>
          <Icon name="lock" size={18} />
          <span>{t('game.soon')}</span>
        </span>
      )}
      <div className={styles.art} style={{ background: sky }}>
        <ObjectImage objectId={entry.icon} size={isCompact ? 72 : 96} decorative />
      </div>
      <div className={styles.text}>
        <span className={styles.title}>{t(`game.${entry.id}.title`)}</span>
        <span className={styles.tagline}>{t(`game.${entry.id}.tagline`)}</span>
      </div>
    </m.button>
  );
}
