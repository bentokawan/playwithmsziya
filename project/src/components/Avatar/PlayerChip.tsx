import { m } from 'motion/react';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import type { Profile } from '@/lib/profiles/profiles';
import { AnimalAvatar } from './AnimalAvatar';
import styles from './PlayerChip.module.css';

export interface PlayerChipProps {
  readonly profile: Pick<Profile, 'name' | 'avatar' | 'color'>;
  readonly selected?: boolean;
  readonly order?: 1 | 2;
  readonly onPress?: () => void;
  readonly compact?: boolean;
}

export function PlayerChip({
  profile,
  selected = false,
  order,
  onPress,
  compact = false,
}: PlayerChipProps) {
  const calm = useCalmMotion();
  const bgVar = `var(--player-${profile.color})`;
  const cls = [
    styles.chip,
    selected ? styles.selected : '',
    compact ? styles.compact : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className={styles.avatarWrap} style={{ background: bgVar }}>
        <AnimalAvatar animal={profile.avatar} size={compact ? 32 : 40} />
      </span>
      <span className={styles.name}>{profile.name}</span>
      {order !== undefined && <span className={styles.order}>{order}</span>}
    </>
  );

  if (!onPress) {
    return (
      <div
        className={cls}
        style={selected ? { background: bgVar, color: 'var(--white)' } : undefined}
      >
        {content}
      </div>
    );
  }

  return (
    <m.button
      type="button"
      className={cls}
      style={selected ? { background: bgVar, color: 'var(--white)' } : undefined}
      aria-pressed={selected}
      onClick={onPress}
      {...pressProps(calm)}
    >
      {content}
    </m.button>
  );
}
