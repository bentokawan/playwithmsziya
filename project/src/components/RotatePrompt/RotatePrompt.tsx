import { useEffect, useRef } from 'react'
import { useT } from '@/i18n/useT'
import styles from './RotatePrompt.module.css'

export interface RotatePromptProps {
  /** true = turning the screen sideways would make the split fit. */
  readonly canRotate: boolean
  readonly onTurns: () => void
}

export function RotatePrompt({ canRotate, onTurns }: RotatePromptProps) {
  const t = useT()
  const turnsRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    turnsRef.current?.focus()
  }, [])
  const message = canRotate ? t('play.rotate') : t('play.splitTooSmall')
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <p className="t-title">{message}</p>
      <button ref={turnsRef} type="button" onClick={onTurns}>
        {t('play.rotateTurns')}
      </button>
    </div>
  )
}
