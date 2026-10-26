import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAME_INTRO_DATA, type DifficultyOption } from './gameIntroData';
import styles from './GameIntro.module.css';

function Stars({ filled, color }: { filled: number; color: string }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={styles.star}
          fill={i <= filled ? color : 'var(--star-empty)'}
        >
          <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}

function DifficultyCard({
  option,
  active,
  onSelect,
}: {
  option: DifficultyOption;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.difficultyCard} ${active ? styles.difficultyActive : ''}`}
      style={
        {
          '--diff-color': option.color,
          '--diff-tint': option.tint,
        } as React.CSSProperties
      }
      onClick={onSelect}
      aria-pressed={active}
    >
      <Stars filled={option.stars} color={option.color} />
      <span className={styles.difficultyLabel}>{option.label}</span>
      <span className={styles.difficultyLevel}>{option.levelLabel}</span>
    </button>
  );
}

export function GameIntroPage() {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const data = GAME_INTRO_DATA[gameId];
  const [selected, setSelected] = useState<DifficultyOption['id']>('mudah');

  const difficulty = useMemo(
    () => data?.difficultyOptions.find((d) => d.id === selected) ?? null,
    [data, selected],
  );

  if (!data) {
    return (
      <main className={styles.page}>
        <div className={styles.center}>
          <p>Permainan tidak ditemukan.</p>
          <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
            ← Semua Mainan
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M19 12H5m0 0l6-6m-6 6l6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Semua Mainan
        </button>

        <section className={styles.card} aria-label={`Intro permainan ${data.title}`}>
          {/* Banner ilustrasi */}
          <div className={styles.banner} style={{ background: data.bannerGradient }}>
            <span className={styles.categoryBadge}>
              <span
                className={styles.categoryDot}
                style={{ background: data.categoryColor }}
                aria-hidden="true"
              />
              {data.categoryLabel}
            </span>
            <button type="button" className={styles.settingsButton} aria-label="Pengaturan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Ilustrasi karakter */}
            <div className={styles.characters} aria-hidden="true">
              <div className={`${styles.charCard}`}>
                <span className={styles.charFace}>🍎</span>
              </div>
              <div className={`${styles.charCard}`}>
                <span className={styles.charFace}>🐱</span>
              </div>
              <div className={`${styles.charCard}`}>
                <span className={styles.charFace}>🐶</span>
              </div>
            </div>
            <div className={styles.shadow} aria-hidden="true" />
          </div>

          {/* Body */}
          <div className={styles.body}>
            <h1 className={styles.title}>{data.title}</h1>
            <p className={styles.description}>{data.description}</p>

            <hr className={styles.divider} />

            <h2 className={styles.sectionTitle}>Pilih tingkat bermain</h2>
            <div className={styles.difficultyRow} role="group" aria-label="Tingkat bermain">
              {data.difficultyOptions.map((option) => (
                <DifficultyCard
                  key={option.id}
                  option={option}
                  active={option.id === selected}
                  onSelect={() => setSelected(option.id)}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.playButton}
              disabled={!difficulty}
              onClick={() => navigate(`/game/${gameId}/play?level=${selected}`)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
              Mulai Bermain
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
