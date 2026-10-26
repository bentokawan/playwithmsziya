import type { GameItem } from '../types';
import { GameCardIcon } from './GameCardIcon';
import styles from './GameCard.module.css';

interface GameCardProps {
  readonly game: GameItem;
  readonly onSelect: (gameId: string) => void;
}

export function GameCard({ game, onSelect }: GameCardProps) {
  const handleClick = () => {
    onSelect(`/game/${game.id}/intro`);
  };

  return (
    <article className={`${styles.card} ${styles[game.category]}`}>
      <div className={styles.banner}>
        <span className={styles.categoryBadge}>{game.categoryLabel}</span>
        <div className={styles.iconContainer}>
          <GameCardIcon iconType={game.iconType} />
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.description}>{game.description}</p>
        <p className={styles.byline}>{game.byline}</p>

        <div className={styles.footerRow}>
          <span className={styles.tag}>{game.ageLabel}</span>
          <span className={styles.tag}>{game.categoryLabel}</span>
          <button
            type="button"
            className={styles.playButton}
            onClick={handleClick}
            aria-label={`Mainkan ${game.title}, kategori ${game.categoryLabel}`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
