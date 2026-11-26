import { m } from 'motion/react';
import { AnimalAvatar } from '@/components/Avatar/AnimalAvatar';
import { SPRING } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { AnimalId, PlayerColor } from '@/lib/profiles/profiles';
import styles from './RaceBar.module.css';

export interface RaceBarPlayer {
  readonly name: string;
  readonly avatar: AnimalId;
  readonly color: PlayerColor;
  readonly progress: number;
}

export interface PeerConnectionBadge {
  readonly connected: boolean;
  readonly graceRemainingSec?: number;
}

export interface RaceBarProps {
  readonly orientation: 'vertical' | 'horizontal';
  readonly total: number;
  readonly p1: RaceBarPlayer;
  readonly p2: RaceBarPlayer;
  readonly peerStatus?: PeerConnectionBadge;
}

export function RaceBar({ orientation, total, p1, p2, peerStatus }: RaceBarProps) {
  const t = useT();
  const calm = useCalmMotion();
  const safeTotal = Math.max(1, total);
  const pct1 = Math.min(100, Math.round((p1.progress / safeTotal) * 100));
  const pct2 = Math.min(100, Math.round((p2.progress / safeTotal) * 100));
  const isVert = orientation === 'vertical';
  const peerConnected = peerStatus ? peerStatus.connected : true;

  return (
    <div
      className={`${styles.bar} ${isVert ? styles.vertical : styles.horizontal}`}
      aria-label={`${p1.name} ${pct1}% · ${p2.name} ${pct2}%`}
    >
      <div className={styles.track}>
        <m.div
          className={styles.runner}
          style={{ background: `var(--player-${p1.color})` }}
          animate={isVert ? { bottom: `${pct1}%` } : { left: `${pct1}%` }}
          transition={calm ? { duration: 0 } : SPRING.gentle}
          data-race-runner="1"
          data-progress={p1.progress}
        >
          <AnimalAvatar animal={p1.avatar} size={28} />
        </m.div>
      </div>

      <div className={styles.track}>
        <m.div
          className={`${styles.runner} ${!peerConnected ? styles.peerFaded : ''}`}
          style={{ background: `var(--player-${p2.color})` }}
          animate={isVert ? { bottom: `${pct2}%` } : { left: `${pct2}%` }}
          transition={calm ? { duration: 0 } : SPRING.gentle}
          data-race-runner="2"
          data-progress={p2.progress}
          data-peer-progress={p2.progress}
          data-peer-connected={String(peerConnected)}
        >
          {!peerConnected && <span className={styles.graceRing} aria-hidden="true" />}
          <AnimalAvatar animal={p2.avatar} size={28} />
        </m.div>
      </div>

      {!peerConnected && (
        <span className={styles.peerBadge} data-peer-reconnecting="true" role="status">
          {t('room.reconnectingPeer')}
          {peerStatus?.graceRemainingSec !== undefined ? ` (${peerStatus.graceRemainingSec}s)` : ''}
        </span>
      )}
    </div>
  );
}
