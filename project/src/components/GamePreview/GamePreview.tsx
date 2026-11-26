import { useCalmMotion } from '@/design/useCalmMotion';
import type { GameId } from '@/games/ids';
import type { DifficultyId } from '@/lib/session/session';
import { PREVIEW_BY_GAME } from './previews';
import styles from './GamePreview.module.css';
import { Count } from './templates/Count';
import { Letters } from './templates/Letters';
import { Maze } from './templates/Maze';
import { Memory } from './templates/Memory';
import { Sound } from './templates/Sound';
import { Trace } from './templates/Trace';

export interface GamePreviewProps {
  readonly gameId: GameId;
  readonly level: DifficultyId;
}

export function GamePreview({ gameId, level }: GamePreviewProps) {
  const calm = useCalmMotion();
  const spec = PREVIEW_BY_GAME[gameId];
  const props = { spec, level, calm };

  return (
    <div className={styles.stage} data-preview={spec.template} aria-hidden="true">
      {/* key restarts the animation when the level changes */}
      <div key={level} className={styles.inner}>
        {spec.template === 'count' && <Count {...props} />}
        {spec.template === 'trace' && <Trace {...props} />}
        {spec.template === 'letters' && <Letters {...props} />}
        {spec.template === 'sound' && <Sound {...props} />}
        {spec.template === 'memory' && <Memory {...props} />}
        {spec.template === 'maze' && <Maze {...props} />}
      </div>
      <span className={styles.ground} />
    </div>
  );
}

export default GamePreview;
