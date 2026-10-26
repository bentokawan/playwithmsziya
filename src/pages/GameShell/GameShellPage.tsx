import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getGameEntry } from '../../games/registry';
import type { DifficultyId, GameResult } from '../../games/types';
import styles from './GameShell.module.css';

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.star}
      fill={filled ? 'var(--star-gold)' : 'var(--star-empty)'}
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.35l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.5z" />
    </svg>
  );
}

/**
 * Kerangka bersama semua game: top bar (home, bintang, fullscreen, audio),
 * judul + instruksi, lalu konten game aktif dari registry.
 * Game fokus logika saja — shell tangani sisanya.
 */
export function GameShellPage() {
  const { gameId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entry = getGameEntry(gameId);

  const difficulty = (searchParams.get('level') ?? 'mudah') as DifficultyId;
  const players = Number(searchParams.get('players') ?? '1') || 1;

  const GameBody = useMemo(() => entry?.component, [entry]);

  const handleFinish = (result: GameResult) => {
    navigate(`/game/${gameId}/result`, {
      state: result,
    });
  };

  if (!entry || !GameBody) {
    return (
      <main className={styles.page}>
        <div className={styles.center}>
          <p>Permainan tidak ditemukan.</p>
          <button type="button" className={styles.pillButton} onClick={() => navigate('/')}>
            ← Semua Mainan
          </button>
        </div>
      </main>
    );
  }

  const { meta } = entry;

  return (
    <main className={styles.page}>
      {/* ===== Top bar ===== */}
      <header className={styles.topBar}>
        <button type="button" className={styles.pillButton} onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 10.5V20h13v-9.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Beranda
        </button>

        <div className={styles.starsPill} role="img" aria-label="0 dari 3 bintang">
          {[1, 2, 3].map((i) => (
            <StarIcon key={i} filled={false} />
          ))}
        </div>

        <div className={styles.topBarRight}>
          <button type="button" className={styles.iconButton} aria-label="Layar penuh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className={styles.iconButton} aria-label="Suara">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 8.5a5 5 0 010 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* ===== Judul & instruksi ===== */}
      <div className={styles.heading}>
        <h1 className={styles.title}>{meta.title}</h1>
        <p className={styles.instruction}>{meta.instruction}</p>
      </div>

      {/* ===== Konten game + panel mascot ===== */}
      <div className={styles.contentRow}>
        <section className={styles.gameCard} aria-label={`Area bermain ${meta.title}`}>
          <GameBody
            gameId={gameId}
            difficulty={difficulty}
            players={players}
            onFinish={handleFinish}
            onQuit={() => navigate('/')}
          />
        </section>

        {meta.mascotEmoji && (
          <aside className={styles.mascotPanel} aria-hidden="true">
            <span className={styles.mascotEmoji}>{meta.mascotEmoji}</span>
            {meta.mascotCaption && <p className={styles.mascotCaption}>{meta.mascotCaption}</p>}
            <button type="button" className={styles.listenButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 8.5a5 5 0 010 7" strokeLinecap="round" />
              </svg>
              Dengar lagi
            </button>
          </aside>
        )}
      </div>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.coach}>
          <span className={styles.coachAvatar}>🐱</span>
          <div>
            <p className={styles.coachName}>Ms zia</p>
            <p className={styles.coachMessage}>Pelan-pelan saja. Kamu pasti bisa!</p>
          </div>
        </div>
        <div className={styles.playerPill}>
          <span className={styles.playerDot} aria-hidden="true" />
          {players} pemain
        </div>
      </footer>
    </main>
  );
}
