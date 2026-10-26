import type { GameItem } from '../types';
import { GameCard } from './GameCard';
import styles from './GameGrid.module.css';

interface GameGridProps {
  readonly games: readonly GameItem[];
  readonly onSelectGame: (gameId: string) => void;
}

export function GameGrid({ games, onSelectGame }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Tidak ada permainan dalam kategori ini.</p>
      </div>
    );
  }

  return (
    <section className={styles.gridContainer} aria-label="Daftar Permainan">
      <div className={styles.grid}>
        {games.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelectGame} />
        ))}
      </div>
    </section>
  );
}
