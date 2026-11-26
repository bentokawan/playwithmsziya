import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { BlockButton } from '@/components/BlockButton/BlockButton';
import { ObjectImage } from '@/components/ObjectImage/ObjectImage';
import { DUR } from '@/design/motion';
import arenaStyles from '@/games/Arena.module.css';
import {
  canMove,
  cellIndex,
  dirFromSwipe,
  dirFromTap,
  solveMaze,
  stepCell,
  WALL_E,
  WALL_N,
  WALL_S,
  WALL_W,
  type MazeDir,
} from '@/games/engines/maze/maze';
import type { RoundProps } from '@/games/types';
import { useT } from '@/i18n/useT';
import { Kuku } from '@/worlds/characters/Kuku';
import styles from './PetualanganLabirinRound.module.css';
import type { MazeRound } from './rounds';

const DIRS: readonly MazeDir[] = ['N', 'E', 'S', 'W'];

function keyMapFor(pane?: { readonly side: 'left' | 'right' }): Record<string, MazeDir> {
  if (pane?.side === 'left') {
    return { w: 'N', W: 'N', d: 'E', D: 'E', s: 'S', S: 'S', a: 'W', A: 'W' };
  }
  return { ArrowUp: 'N', ArrowRight: 'E', ArrowDown: 'S', ArrowLeft: 'W' };
}

export function PetualanganLabirinRound({
  round,
  calmMotion,
  pane,
  onComplete,
}: RoundProps<MazeRound>) {
  const audio = useAudio();
  const t = useT();
  const [pos, setPos] = useState<readonly [number, number]>(round.start);
  const [visited, setVisited] = useState<Set<string>>(() => new Set(['0,0']));
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);
  const lastBumpRef = useRef(0);
  const completedRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ readonly x: number; readonly y: number } | null>(null);

  const resetIdle = useCallback(() => {
    setShowHint(false);
    if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
    if (completedRef.current) return;
    idleTimerRef.current = window.setTimeout(() => setShowHint(true), 8000);
  }, []);

  useEffect(() => {
    idleTimerRef.current = window.setTimeout(() => setShowHint(true), 8000);
    return () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  const move = useCallback(
    (dir: MazeDir) => {
      if (completedRef.current) return;
      resetIdle();
      if (!canMove(round, pos, dir)) {
        const now = Date.now();
        if (now - lastBumpRef.current >= 300) {
          lastBumpRef.current = now;
          audio.sfx('bump');
        }
        return;
      }
      const next = stepCell(pos, dir);
      setPos(next);
      setVisited((prev) => new Set(prev).add(`${next[0]},${next[1]}`));
      audio.sfx('step');

      if (next[0] === round.goal[0] && next[1] === round.goal[1]) {
        completedRef.current = true;
        setDone(true);
        audio.sfx('kids-yay');
        window.setTimeout(
          () => onComplete({ attempts: 1, firstTry: true }),
          calmMotion ? 0 : Math.round(DUR.celebrate * 1000),
        );
      }
    },
    [audio, calmMotion, onComplete, pos, resetIdle, round],
  );

  useEffect(() => {
    const keyMap = keyMapFor(pane);
    const onKey = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, pane]);

  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleBoardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) return;

    const swipeDir = dirFromSwipe(e.clientX - start.x, e.clientY - start.y);
    if (swipeDir) {
      move(swipeDir);
      return;
    }

    const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-x]') : null;
    if (!target) return;
    const cx = Number(target.dataset.x);
    const cy = Number(target.dataset.y);
    if (Number.isNaN(cx) || Number.isNaN(cy)) return;
    const tapDir = dirFromTap(pos, [cx, cy]);
    if (tapDir) {
      move(tapDir);
    }
  };

  const hintSet = useMemo(() => {
    if (!showHint) return new Set<string>();
    const path = solveMaze(round, pos);
    return new Set((path ?? []).slice(1, 4).map(([x, y]) => `${x},${y}`));
  }, [showHint, round, pos]);

  const openDirs = useMemo(
    () => DIRS.filter((d) => canMove(round, pos, d)).join(''),
    [round, pos],
  );

  const kukuSize = round.size <= 4 ? 52 : round.size <= 6 ? 38 : 28;

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${round.size}, 1fr)`,
            gridTemplateRows: `repeat(${round.size}, 1fr)`,
          }}
          onPointerDown={handleBoardPointerDown}
          onPointerUp={handleBoardPointerUp}
        >
          {Array.from({ length: round.size * round.size }, (_, idx) => {
            const x = idx % round.size;
            const y = Math.floor(idx / round.size);
            const mask = round.walls[cellIndex(round.size, x, y)];
            const isPlayer = pos[0] === x && pos[1] === y;
            const isGoal = round.goal[0] === x && round.goal[1] === y;
            const key = `${x},${y}`;

            return (
              <div
                key={key}
                data-x={x}
                data-y={y}
                data-player={isPlayer ? 'true' : undefined}
                data-open-dirs={isPlayer ? openDirs : undefined}
                className={[
                  styles.cell,
                  mask & WALL_N ? styles.wallN : '',
                  mask & WALL_E ? styles.wallE : '',
                  mask & WALL_S ? styles.wallS : '',
                  mask & WALL_W ? styles.wallW : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isPlayer ? (
                  <Kuku mood={done ? 'wow' : 'happy'} size={kukuSize} />
                ) : isGoal ? (
                  <ObjectImage objectId={round.goalObject} size={kukuSize} />
                ) : hintSet.has(key) ? (
                  <span className={styles.hintDot} aria-hidden="true" />
                ) : visited.has(key) ? (
                  <span className={styles.trailDot} aria-hidden="true" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={arenaStyles.tray}>
        <div className={styles.dpad}>
          <div className={styles.up}>
            <BlockButton
              variant="primary"
              size="choice"
              icon="arrow-up"
              label={t('maze.up')}
              hideLabel
              onPress={() => move('N')}
              dataChoice
            />
          </div>
          <div className={styles.left}>
            <BlockButton
              variant="primary"
              size="choice"
              icon="arrow-left"
              label={t('maze.left')}
              hideLabel
              onPress={() => move('W')}
              dataChoice
            />
          </div>
          <div className={styles.down}>
            <BlockButton
              variant="primary"
              size="choice"
              icon="arrow-down"
              label={t('maze.down')}
              hideLabel
              onPress={() => move('S')}
              dataChoice
            />
          </div>
          <div className={styles.right}>
            <BlockButton
              variant="primary"
              size="choice"
              icon="arrow-right"
              label={t('maze.right')}
              hideLabel
              onPress={() => move('E')}
              dataChoice
            />
          </div>
        </div>
      </div>
    </div>
  );
}
