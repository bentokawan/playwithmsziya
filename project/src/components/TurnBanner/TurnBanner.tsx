import { m } from 'motion/react';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { DUR, EASE_OUT_SOFT } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { Profile } from '@/lib/profiles/profiles';
import styles from './TurnBanner.module.css';

export interface TurnBannerProps {
  readonly profile: Pick<Profile, 'name' | 'avatar' | 'color'>;
  readonly visible: boolean;
  readonly variant: 'handoff' | 'chip';
  readonly onReady?: () => void;
}

export function TurnBanner({ profile, visible, variant, onReady }: TurnBannerProps) {
  const t = useT();
  const calm = useCalmMotion();
  if (!visible) return null;

  const bg = `var(--player-${profile.color})`;

  if (variant === 'chip') {
    return (
      <span
        className={styles.chip}
        style={{ background: bg }}
        data-turn-chip="true"
        aria-label={t('play.turn', { name: profile.name })}
      >
        <span className={styles.chipAvatar} aria-hidden="true">
          <AnimalAvatar animal={profile.avatar} size={28} />
        </span>
        <span className={styles.chipName}>{profile.name}</span>
      </span>
    );
  }

  return (
    <m.div
      role="status"
      aria-live="polite"
      data-turn-handoff="true"
      className={styles.handoff}
      style={{ background: bg }}
      initial={calm ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={calm ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={calm ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT_SOFT }}
    >
      <div className={styles.handoffInner}>
        <span className={styles.handoffAvatar} aria-hidden="true">
          <AnimalAvatar animal={profile.avatar} size={120} />
        </span>
        <p className={`t-display ${styles.handoffTitle}`}>
          {t('play.turn', { name: profile.name })}
        </p>
        {onReady && (
          <BlockButton
            variant="white"
            size="primary"
            icon="play"
            label={t('play.turnReady')}
            onPress={onReady}
          />
        )}
      </div>
    </m.div>
  );
}
