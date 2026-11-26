import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { Tile } from '@/components/Tile/Tile';
import arenaStyles from '@/games/Arena.module.css';
import { TracingCanvas } from '@/games/engines/tracing/TracingCanvas';
import type { RoundProps } from '@/games/types';
import { Jeje } from '@/worlds/characters/Jeje';
import type { TraceNumberRound } from './rounds';

export function MenulisAngkaRound({
  round,
  config,
  player,
  calmMotion,
  thickLines,
  pane,
  onComplete,
}: RoundProps<TraceNumberRound>) {
  const audio = useAudio();
  const [done, setDone] = useState(false);

  const speakNumber = useCallback(() => {
    void audio.speak({ kind: 'num', locale: config.locale, key: round.num });
  }, [audio, config.locale, round.num]);

  useEffect(() => {
    if (!pane?.quiet) speakNumber();
  }, [pane?.quiet, speakNumber]);

  const handleDone = (info: { readonly attempts: number; readonly firstTry: boolean }) => {
    setDone(true);
    if (!pane?.quiet) speakNumber();
    onComplete(info);
  };

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <Tile
          char={String(round.num)}
          color={player === 2 ? 'pink' : 'blue'}
          state={done ? 'correct' : 'idle'}
          onPress={speakNumber}
        />
        <TracingCanvas
          glyph={round.glyph}
          difficulty={config.difficulty}
          player={player}
          thickLines={thickLines}
          calmMotion={calmMotion}
          onComplete={handleDone}
        />
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Jeje mood={done ? 'wow' : 'happy'} size={96} />
        </div>
      </div>
    </div>
  );
}
