import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { HintBubble } from '@/components/HintBubble/HintBubble';
import { Icon } from '@/components/icons/Icon';
import { Tile } from '@/components/Tile/Tile';
import type { HijaiyyahId } from '@/content/hijaiyyah';
import arenaStyles from '@/games/Arena.module.css';
import { evaluate } from '@/games/engines/choice/choice';
import { useRoundMachine } from '@/games/engines/choice/useRoundMachine';
import type { RoundProps } from '@/games/types';
import { Lulu } from '@/worlds/characters/Lulu';
import type { ListenRound } from './rounds';

export function DengarTemukanRound({ round, config, calmMotion, onComplete }: RoundProps<ListenRound>) {
  const audio = useAudio();
  const [chosen, setChosen] = useState<HijaiyyahId | null>(null);
  const [idleLevel, setIdleLevel] = useState<0 | 1 | 2>(0);

  const speakTarget = useCallback(() => {
    void audio.speak({ kind: 'hija', key: round.target });
  }, [audio, round.target]);

  useEffect(() => {
    speakTarget();
  }, [speakTarget]);

  const handleIdle = useCallback(
    (level: 1 | 2) => {
      setIdleLevel(level);
      if (level === 1) speakTarget();
    },
    [speakTarget],
  );

  const { phase, locked, submit, resetIdle } = useRoundMachine({
    calmMotion,
    onComplete,
    onIdle: handleIdle,
  });

  const handlePick = (id: HijaiyyahId) => {
    if (locked) return;
    setIdleLevel(0);
    setChosen(id);
    const ok = evaluate(round.target, id);
    submit(ok, {
      onCorrect: () => audio.sfx('correct'),
      onWrong: () => audio.sfx('retry'),
    });
  };

  const mood = phase === 'celebrating' ? 'wow' : phase === 'retry' ? 'thinking' : 'happy';

  return (
    <div className={arenaStyles.arena} onPointerDown={resetIdle}>
      <div className={arenaStyles.prompt}>
        <HintBubble onListen={speakTarget} speaking={idleLevel === 1}>
          <Icon name="sound-on" size={56} />
        </HintBubble>
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Lulu mood={mood} size={96} />
        </div>
      </div>

      <div className={`${arenaStyles.tray} ${locked ? arenaStyles.locked : ''}`}>
        <div className={arenaStyles.options}>
          {round.options.map((opt) => {
            const isChosen = chosen === opt.id;
            const state =
              phase === 'celebrating' && isChosen
                ? 'correct'
                : phase === 'retry' && isChosen
                  ? 'retry'
                  : idleLevel === 2 && config.difficulty === 'mudah' && opt.id === round.target
                    ? 'selected'
                    : 'idle';
            return (
              <Tile
                key={opt.id}
                char={opt.char}
                color="lantern"
                state={state}
                lang="ar"
                onPress={() => handlePick(opt.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
