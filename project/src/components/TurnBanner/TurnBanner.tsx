import { m } from 'motion/react';
import { DUR, EASE_OUT_SOFT } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { PlayerNumber } from '@/lib/session/session';
import styles from './TurnBanner.module.css';

export interface TurnBannerProps {
  readonly player: PlayerNumber;
  readonly visible: boolean;
  readonly inline?: boolean;
}

function PlayerAnimalSvg({ player }: { readonly player: PlayerNumber }) {
  if (player === 1) {
    // Simple flat bunny silhouette
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="8" rx="3" ry="7" fill="currentColor" />
        <ellipse cx="20" cy="8" rx="3" ry="7" fill="currentColor" />
        <circle cx="16" cy="20" r="8" fill="currentColor" />
      </svg>
    );
  }
  // Simple flat kitty silhouette
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M8 14L10 6L15 11H17L22 6L24 14A8 8 0 118 14Z" fill="currentColor" />
    </svg>
  );
}

export function TurnBanner({ player, visible, inline = false }: TurnBannerProps) {
  const t = useT();
  const calm = useCalmMotion();
  if (!visible) return null;

  const name = t(player === 1 ? 'play.player1' : 'play.player2');

  return (
    <m.div
      role="status"
      aria-live="polite"
      className={[styles.banner, player === 1 ? styles.p1 : styles.p2, inline ? styles.inline : '']
        .filter(Boolean)
        .join(' ')}
      initial={calm ? { opacity: 1 } : { opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={calm ? { opacity: 0 } : { opacity: 0, x: 32 }}
      transition={calm ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT_SOFT }}
    >
      <span className={styles.avatar} aria-hidden="true">
        <PlayerAnimalSvg player={player} />
      </span>
      <span>{t('play.turn', { name })}</span>
    </m.div>
  );
}
