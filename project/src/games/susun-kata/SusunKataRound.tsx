import { useCallback, useEffect, useRef, useState } from 'react';
import { m } from 'motion/react';
import { useAudio } from '@/app/providers/useAudio';
import { HintBubble } from '@/components/HintBubble/HintBubble';
import { Slot } from '@/components/Slot/Slot';
import { Tile } from '@/components/Tile/Tile';
import { DUR, SPRING } from '@/design/motion';
import arenaStyles from '@/games/Arena.module.css';
import type { RoundProps } from '@/games/types';
import { Pipi } from '@/worlds/characters/Pipi';
import type { SpellRound, SpellTile } from './rounds';

export function SusunKataRound({
  round,
  config,
  calmMotion,
  pane,
  onComplete,
}: RoundProps<SpellRound>) {
  const audio = useAudio();
  const [placed, setPlaced] = useState<(SpellTile | null)[]>(() =>
    Array.from({ length: round.word.length }, () => null),
  );
  const [retryTileId, setRetryTileId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const wrongCountRef = useRef(0);
  const completedRef = useRef(false);

  const speakWord = useCallback(() => {
    void audio.speak({ kind: 'word', locale: config.locale, key: round.word.toLowerCase() });
  }, [audio, config.locale, round.word]);

  useEffect(() => {
    if (!pane?.quiet) speakWord();
  }, [pane?.quiet, speakWord]);

  const usedIds = new Set(placed.filter((t): t is SpellTile => t !== null).map((t) => t.id));
  const nextSlot = placed.findIndex((t) => t === null);

  const handleTapTile = (tile: SpellTile) => {
    if (celebrating || retryTileId !== null || nextSlot === -1) return;
    const expectedLetter = round.word[nextSlot];

    if (tile.letter !== expectedLetter) {
      wrongCountRef.current += 1;
      setRetryTileId(tile.id);
      audio.sfx('retry');
      window.setTimeout(() => setRetryTileId(null), calmMotion ? 0 : Math.round(DUR.base * 1000));
      return;
    }

    audio.sfx('whoosh');
    if (!pane?.quiet) {
      void audio.speak({ kind: 'letter', locale: config.locale, key: tile.letter.toLowerCase() });
    }

    const nextPlaced = placed.slice();
    nextPlaced[nextSlot] = tile;
    setPlaced(nextPlaced);

    if (nextPlaced.every((t) => t !== null) && !completedRef.current) {
      completedRef.current = true;
      setCelebrating(true);
      audio.sfx('correct');
      if (!pane?.quiet) speakWord();
      const attempts = wrongCountRef.current + 1;
      window.setTimeout(
        () => onComplete({ attempts, firstTry: attempts === 1 }),
        calmMotion ? 0 : Math.round(DUR.celebrate * 1000),
      );
    }
  };

  const handleUndoSlot = (idx: number) => {
    if (celebrating || !placed[idx]) return;
    const nextPlaced = placed.slice();
    nextPlaced[idx] = null;
    setPlaced(nextPlaced);
    audio.sfx('tap');
  };

  const mood = celebrating ? 'wow' : retryTileId ? 'thinking' : 'happy';

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <HintBubble objectId={round.objectId} onListen={speakWord} />
        <div className={arenaStyles.wordRow}>
          {placed.map((tile, idx) => (
            <Slot
              key={idx}
              state={celebrating ? 'correct' : tile ? 'filled' : 'empty'}
              ghostChar={round.showGhost ? round.word[idx] : undefined}
            >
              {tile ? (
                <m.div
                  initial={calmMotion ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={calmMotion ? { duration: 0 } : SPRING.gentle}
                >
                  <Tile
                    char={tile.letter}
                    color={celebrating ? 'success' : 'blue'}
                    state={celebrating ? 'correct' : 'idle'}
                    onPress={celebrating ? undefined : () => handleUndoSlot(idx)}
                  />
                </m.div>
              ) : null}
            </Slot>
          ))}
        </div>
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Pipi mood={mood} size={140} />
        </div>
      </div>

      <div className={arenaStyles.tray}>
        <div className={arenaStyles.options}>
          {round.tiles
            .filter((t) => !usedIds.has(t.id))
            .map((tile) => (
              <Tile
                key={tile.id}
                char={tile.letter}
                color="blue"
                state={retryTileId === tile.id ? 'retry' : 'idle'}
                onPress={() => handleTapTile(tile)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
