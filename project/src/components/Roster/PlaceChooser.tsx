import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { Icon } from '@/components/icons/Icon';
import { pressProps } from '@/design/motion';
import { useCalmMotion } from '@/design/useCalmMotion';
import { useT } from '@/i18n/useT';
import styles from './PlaceChooser.module.css';

export type PlayPlace = 'satu' | 'dua';

export interface PlaceChooserProps {
  readonly value: PlayPlace;
  readonly onChange: (place: PlayPlace) => void;
  readonly online: boolean;
}

export function PlaceChooser({ value, onChange, online }: PlaceChooserProps) {
  const t = useT();
  const calm = useCalmMotion();
  const audio = useAudio();

  if (!online) return null;

  const choices: readonly { readonly id: PlayPlace; readonly icon: 'play' | 'link' }[] = [
    { id: 'satu', icon: 'play' },
    { id: 'dua', icon: 'link' },
  ];

  return (
    <div className={styles.grid} role="group" aria-label={t('intro.whereToPlay')}>
      {choices.map((item) => {
        const selected = value === item.id;
        return (
          <m.button
            key={item.id}
            type="button"
            className={`${styles.card} ${selected ? styles.selected : ''}`}
            aria-pressed={selected}
            data-place={item.id}
            onClick={() => {
              audio.sfx('tap');
              onChange(item.id);
            }}
            {...pressProps(calm)}
          >
            <span className={styles.row}>
              <Icon name={item.icon} size={22} />
              <span className={styles.label}>{t(`intro.place.${item.id}`)}</span>
            </span>
            <span className={styles.desc}>{t(`intro.place.${item.id}Desc`)}</span>
          </m.button>
        );
      })}
    </div>
  );
}
