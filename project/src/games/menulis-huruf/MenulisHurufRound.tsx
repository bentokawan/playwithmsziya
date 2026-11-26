import { useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { Tile } from '@/components/Tile/Tile';
import arenaStyles from '@/games/Arena.module.css';
import { TracingCanvas } from '@/games/engines/tracing/TracingCanvas';
import type { RoundProps } from '@/games/types';
import { Pipi } from '@/worlds/characters/Pipi';
import type { TraceLetterRound } from './rounds';

export function MenulisHurufRound({
  round,
  config,
  player,
  calmMotion,
  thickLines,
  pane,
  onComplete,
}: RoundProps<TraceLetterRound>) {
  const audio = useAudio();
  const [mood, setMood] = useState<'happy' | 'wow'>('happy');

  const handleDone = (info: { readonly attempts: number; readonly firstTry: boolean }) => {
    setMood('wow');
    if (!pane?.quiet) {
      void audio.speak({ kind: 'letter', locale: config.locale, key: round.letter.toLowerCase() });
    }
    onComplete(info);
  };

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <Tile
          char={round.letter}
          color={player === 2 ? 'pink' : 'blue'}
          state={mood === 'wow' ? 'correct' : 'idle'}
          onPress={() =>
            void audio.speak({
              kind: 'letter',
              locale: config.locale,
              key: round.letter.toLowerCase(),
            })
          }
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
          <Pipi mood={mood} size={140} />
        </div>
      </div>
    </div>
  );
}
