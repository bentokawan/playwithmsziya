import type { LanguageCode, NavItem } from '../types';
import { NAV_ITEMS } from '../homeData';
import mascotImg from '../../../assets/mascot-ziya.png';
import styles from './HeaderBar.module.css';

interface HeaderBarProps {
  readonly language: LanguageCode;
  readonly onToggleLanguage: () => void;
  readonly isMuted: boolean;
  readonly onToggleSound: () => void;
  readonly isFullscreen: boolean;
  readonly onToggleFullscreen: () => void;
}

const LOGO_COLORS = ['#FF6B6B', '#FFA94D', '#3CCB7F', '#4DB8FF', '#9B8CFF'];

export function HeaderBar({
  language,
  onToggleLanguage,
  isMuted,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
}: HeaderBarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brandRow}>
        <div className={styles.avatarWrapper}>
          <img src={mascotImg} alt="Ms Ziya Mascot" className={styles.avatar} />
        </div>
        <h1 className={styles.appTitle}>
          {'Play with Ms Zia'.split('').map((char, i) => (
            <span key={i} style={{ color: char === ' ' ? undefined : LOGO_COLORS[i % LOGO_COLORS.length] }}>
              {char}
            </span>
          ))}
        </h1>
      </div>

      <nav className={styles.mainNav} aria-label="Navigasi Utama">
        {NAV_ITEMS.map((item: NavItem, i) => (
          <button
            key={item.id}
            type="button"
            className={`${styles.navButton} ${i === 0 ? styles.navActive : ''}`}
            aria-current={i === 0 ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.utilityRow}>
        <button
          type="button"
          className={styles.languageButton}
          onClick={onToggleLanguage}
          title="Ubah Bahasa (Area Orang Tua)"
          aria-label={`Ubah bahasa, saat ini ${language.toUpperCase()}`}
        >
          <span className={styles.languageLabel}>ID / {language.toUpperCase()}</span>
          <span className={styles.lockIcon} aria-hidden="true">🔒</span>
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
        >
          <svg className={styles.utilSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleSound}
          title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
        >
          {isMuted ? (
            <svg className={styles.utilSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
            </svg>
          ) : (
            <svg className={styles.utilSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        <div className={styles.childAvatar} aria-hidden="true">🧒</div>
      </div>
    </header>
  );
}
