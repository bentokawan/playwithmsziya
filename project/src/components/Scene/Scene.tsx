import type { ReactNode } from 'react';
import type { WorldId } from '@/games/ids';
import { WorldBackground } from '@/worlds/WorldBackground';
import { WORLDS } from '@/worlds/worlds';
import styles from './Scene.module.css';

export interface SceneProps {
  readonly worldId: WorldId;
  readonly children: ReactNode;
}

export function Scene({ worldId, children }: SceneProps) {
  const world = WORLDS[worldId];

  return (
    <div className={styles.scene} style={{ background: world.palette.sky }}>
      <WorldBackground worldId={worldId} variant="scene" className={styles.bg} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
