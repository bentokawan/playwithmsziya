import { m } from 'motion/react'
import { useAudio } from '@/app/providers/useAudio'
import { Icon } from '@/components/icons/Icon'
import { pressProps } from '@/design/motion'
import { useCalmMotion } from '@/design/useCalmMotion'
import { useT } from '@/i18n/useT'
import type { DifficultyId } from '@/lib/session/session'
import styles from './LevelPicker.module.css'

export interface LevelPickerProps {
  readonly value: DifficultyId
  readonly onChange: (level: DifficultyId) => void
  readonly size?: 'default' | 'compact'
}

const LEVELS: readonly { readonly id: DifficultyId; readonly stars: number }[] =
  [
    { id: 'mudah', stars: 1 },
    { id: 'sedang', stars: 2 },
    { id: 'tantang', stars: 3 },
  ]

export function LevelPicker({
  value,
  onChange,
  size = 'default',
}: LevelPickerProps) {
  const t = useT()
  const calm = useCalmMotion()
  const audio = useAudio()

  return (
    <div className={styles.group} role="group" aria-label={t('intro.level')}>
      {LEVELS.map((lvl) => {
        const selected = value === lvl.id
        return (
          <m.button
            key={lvl.id}
            type="button"
            className={`${styles.option} ${selected ? styles.selected : ''} ${size === 'compact' ? styles.compact : ''}`}
            aria-pressed={selected}
            onClick={() => {
              audio.sfx('tap')
              onChange(lvl.id)
            }}
            {...pressProps(calm)}
          >
            {selected && (
              <span className={styles.check} aria-hidden="true">
                <Icon name="check" size={18} />
              </span>
            )}
            <span className={styles.stars} aria-hidden="true">
              {Array.from({ length: lvl.stars }, (_, i) => (
                <Icon key={i} name="star" size={20} />
              ))}
            </span>
            <span>{t(`intro.level.${lvl.id}`)}</span>
          </m.button>
        )
      })}
    </div>
  )
}
