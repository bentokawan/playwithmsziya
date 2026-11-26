import { useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { Tile } from '@/components/Tile/Tile';
import arenaStyles from '@/games/Arena.module.css';
import { TracingCanvas } from '@/games/engines/tracing/TracingCanvas';
import type { RoundProps } from '@/games/types';
import { Lulu } from '@/worlds/characters/Lulu';
import type { TraceHijaiyyahRound } from './rounds';

export function TebalkanHijaiyyahRound({
  round,
  config,
  player,
  calmMotion,
  thickLines,
  pane,
  onComplete,
}: RoundProps<TraceHijaiyyahRound>) {
  const audio = useAudio();
  const [mood, setMood] = useState<'happy' | 'wow'>('happy');

  const handleDone = (info: { readonly attempts: number; readonly firstTry: boolean }) => {
    setMood('wow');
    if (!pane?.quiet) {
      void audio.speak({ kind: 'hija', key: round.id });
    }
    onComplete(info);
  };

  return (
    <div className={arenaStyles.arena}>
      <div className={arenaStyles.prompt}>
        <Tile
          char={round.char}
          color="lantern"
          state={mood === 'wow' ? 'correct' : 'idle'}
          lang="ar"
          onPress={() => void audio.speak({ kind: 'hija', key: round.id })}
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
          <Lulu mood={mood} size={96} />
        </div>
      </div>
    </div>
  );
}
