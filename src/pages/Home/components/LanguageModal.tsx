import { useEffect } from 'react';
import type { LanguageCode } from '../types';
import styles from './LanguageModal.module.css';

interface LanguageOption {
  readonly code: LanguageCode;
  readonly title: string;
  readonly tagline: string;
  readonly ctaLabel: string;
}

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: 'id', title: 'Bahasa Indonesia', tagline: 'Ayo belajar bersama!', ctaLabel: 'Pilih' },
  { code: 'en', title: 'English', tagline: "Let's learn & play!", ctaLabel: 'Select' },
] as const;

interface LanguageModalProps {
  readonly onSelect: (language: LanguageCode) => void;
  readonly onClose: () => void;
  readonly currentLanguage: LanguageCode;
}

export function LanguageModal({ onSelect, onClose, currentLanguage }: LanguageModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Tutup pilihan bahasa"
        >
          <svg viewBox="0 0 24 24" className={styles.closeIcon} aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>

        <div className={styles.iconBadge} aria-hidden="true">
          <svg viewBox="0 0 24 24" className={styles.translateIcon}>
            <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h9M8.5 3v2M11 5c-.5 3.5-3 6.5-6 8.5" />
              <path d="M6 9.5c1.5 2 3.5 3.5 5.5 4.5" />
              <path d="M12.5 21l4-9 4 9M13.8 18h5.4" />
            </g>
          </svg>
        </div>

        <h2 id="language-modal-title" className={styles.title}>
          Pilih Bahasa
        </h2>
        <p className={styles.subtitle}>Choose Your Learning Language</p>

        <div className={styles.optionGrid}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.code === currentLanguage;
            return (
              <button
                key={option.code}
                type="button"
                className={`${styles.optionCard} ${isActive ? styles.optionActive : ''}`}
                onClick={() => onSelect(option.code)}
              >
                <span className={styles.flagWrapper}>
                  {option.code === 'id' ? (
                    <span className={styles.flagID} aria-hidden="true" />
                  ) : (
                    <svg viewBox="0 0 60 60" className={styles.flagEN} aria-hidden="true">
                      <rect width="60" height="60" fill="#012169" />
                      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#fff" strokeWidth="10" />
                      <path d="M0,0 L60,60 M60,0 L0,60" stroke="#C8102E" strokeWidth="5" />
                      <path d="M30,0 V60 M0,30 H60" stroke="#fff" strokeWidth="16" />
                      <path d="M30,0 V60 M0,30 H60" stroke="#C8102E" strokeWidth="9" />
                    </svg>
                  )}
                </span>
                <span className={styles.optionTitle}>{option.title}</span>
                <span className={styles.optionTagline}>{option.tagline}</span>
                <span className={styles.optionCta}>
                  {option.ctaLabel}
                  <svg viewBox="0 0 24 24" className={styles.checkIcon} aria-hidden="true">
                    <path
                      d="M4 12.5l5 5L20 6.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
