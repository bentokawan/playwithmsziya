import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { RESULT_DATA } from './resultData';
import type { GameResult } from '../../games/types';
import styles from './Result.module.css';

function Star({ size = 'small', filled = true }: { size?: 'small' | 'large'; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${styles.starSvg} ${size === 'large' ? styles.starSvgLarge : ''}`}
      fill={filled ? 'var(--star-gold)' : 'var(--star-empty)'}
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
    </svg>
  );
}

export function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId = '' } = useParams();
  const data = RESULT_DATA[gameId] ?? Object.values(RESULT_DATA)[0];
  const { stats } = data;
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hasil nyata dari GameShell (location.state), fallback ke data contoh
  const result = (location.state as GameResult | null) ?? { stars: 3, score: 100 };
  const starsEarned = Math.max(1, Math.min(3, result.stars));

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        {/* ===== Top bar ===== */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.homePill}
              onClick={() => navigate('/')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                aria-hidden="true"
              >
                <path
                  d="M19 12H5m0 0l6-6m-6 6l6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Beranda
            </button>
          </div>

          <div className={styles.sessionPill}>
            <span className={styles.sessionDot} aria-hidden="true" />
            {data.levelLabel}
          </div>

          <div className={styles.topBarRight}>

            {/* Settings + menu tooltip */}
            <div className={styles.settingsWrap}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Pengaturan"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3.2" />
                  <path
                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {settingsOpen && (
                <div className={styles.settingsMenu} role="menu">
                  <button type="button" className={styles.settingsItem} role="menuitem">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className={styles.settingsItemIcon}
                    >
                      <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a3.5 3.5 0 00-2-3.15v6.3a3.5 3.5 0 002-3.15z" />
                    </svg>
                    Suara Aktif
                  </button>
                  <button type="button" className={styles.settingsItem} role="menuitem">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      className={styles.settingsItemIcon}
                    >
                      <path
                        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Layar Penuh
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===== Result card ===== */}
        <section className={styles.card} aria-label="Hasil permainan">
          <div className={styles.glow} aria-hidden="true" />

          <h1 className={styles.title}>{data.praiseTitle}</h1>

          {/* ===== Stars ===== */}
          <div className={styles.starsRow}>
            <div className={styles.starSlot}>
              <Star filled={starsEarned >= 1} />
              <span className={styles.starLabel}>Bintang 1</span>
            </div>
            <div className={styles.starSlot}>
              <Star size="large" filled={starsEarned >= 2} />
              <span className={styles.starLabelActive}>{data.highlightLabel}</span>
            </div>
            <div className={styles.starSlot}>
              <Star filled={starsEarned >= 3} />
              <span className={styles.starLabel}>Bintang 3</span>
            </div>
          </div>

          {/* ===== Stats (menyamping) ===== */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={`${styles.statIcon} ${styles.statIconGold}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="var(--star-gold)"
                  aria-hidden="true"
                >
                  <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
                </svg>
              </span>
              <div className={styles.statBody}>
                <span className={styles.statLabel}>Perolehan Bintang</span>
                <span className={styles.statValueRow}>
                  <span className={styles.statValue}>{stats.starsEarned} Bintang</span>
                  {starsEarned >= 3 && <span className={styles.statBadge}>+3 Baru!</span>}
                </span>
                <span className={styles.statSub}>Bintang Terkumpul</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <span className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--feedback-success)"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M8.5 12.5l2.5 2.5 4.5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className={styles.statBody}>
                <span className={styles.statLabel}>Ketepatan</span>
                <span className={styles.statValueRow}>
                  <span className={styles.statValue}>{stats.accuracy}</span>
                </span>
                <span className={styles.statSub}>{stats.accuracySub}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <span className={`${styles.statIcon} ${styles.statIconBlue}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--cat-angka)"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="M12 7v5l3.5 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className={styles.statBody}>
                <span className={styles.statLabel}>Waktu Bermain</span>
                <span className={styles.statValueRow}>
                  <span className={styles.statValue}>{stats.timeLabel}</span>
                </span>
                <span className={styles.statSub}>{stats.timeSub}</span>
              </div>
            </div>
          </div>

          {/* ===== Actions ===== */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.playAgainButton}
              onClick={() => navigate(`/game/${gameId}/play`)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              Main Lagi
            </button>
            <button
              type="button"
              className={styles.menuButton}
              onClick={() => navigate('/')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Menu Utama
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
