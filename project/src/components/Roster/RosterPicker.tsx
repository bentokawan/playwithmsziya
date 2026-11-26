import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { PlayerChip } from '@/components/Avatar/PlayerChip';
import { Icon } from '@/components/icons/Icon';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import type { Profile } from '@/lib/profiles/profiles';
import styles from './RosterPicker.module.css';

export interface RosterPickerProps {
  readonly profiles: readonly Profile[];
  readonly selected: readonly string[];
  readonly max: 1 | 2;
  readonly onChange: (ids: string[]) => void;
  readonly onAdd?: () => void;
  readonly showGuest?: boolean;
  readonly onSelectGuest?: () => void;
}

export function RosterPicker({
  profiles,
  selected,
  max,
  onChange,
  onAdd,
  showGuest = false,
  onSelectGuest,
}: RosterPickerProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();

  const toggle = (id: string) => {
    audio.sfx('tap');
    const idx = selected.indexOf(id);
    if (idx >= 0) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    if (max === 1) {
      onChange([id]);
      return;
    }
    if (selected.length < 2) {
      onChange([...selected, id]);
      return;
    }
    // 3rd tap when max=2 replaces the oldest selection
    onChange([selected[1], id]);
  };

  return (
    <div className={styles.wrap} role="group" aria-label={t('intro.whoPlays')}>
      {profiles.map((p) => {
        const idx = selected.indexOf(p.id);
        const isSelected = idx >= 0;
        const order = isSelected && max === 2 ? ((idx + 1) as 1 | 2) : undefined;
        return (
          <PlayerChip
            key={p.id}
            profile={p}
            selected={isSelected}
            order={order}
            onPress={() => toggle(p.id)}
          />
        );
      })}

      {showGuest && onSelectGuest && (
        <m.button
          type="button"
          className={`${styles.actionChip} ${selected.length === 0 ? styles.guestActive : ''}`}
          aria-pressed={selected.length === 0}
          onClick={() => {
            audio.sfx('tap');
            onSelectGuest();
          }}
          {...pressProps(calm)}
        >
          <span>{t('profiles.guest')}</span>
        </m.button>
      )}

      {onAdd && (
        <m.button
          type="button"
          className={styles.actionChip}
          onClick={() => {
            audio.sfx('tap');
            onAdd();
          }}
          {...pressProps(calm)}
        >
          <Icon name="plus" size={20} />
          <span>{t('profiles.addShort')}</span>
        </m.button>
      )}
    </div>
  );
}
