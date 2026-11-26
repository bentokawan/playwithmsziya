import { useCallback, useEffect, useState } from 'react';
import { useAudio } from '@/app/providers/useAudio';
import { HintBubble } from '@/components/HintBubble/HintBubble';
import { Slot } from '@/components/Slot/Slot';
import { Tile } from '@/components/Tile/Tile';
import arenaStyles from '@/games/Arena.module.css';
import { evaluate } from '@/games/engines/choice/choice';
import { useRoundMachine } from '@/games/engines/choice/useRoundMachine';
import type { RoundProps } from '@/games/types';
import { Pipi } from '@/worlds/characters/Pipi';
import type { InitialRound } from './rounds';

export function BunyiAwalRound({ round, config, calmMotion, onComplete }: RoundProps<InitialRound>) {
  const audio = useAudio();
  const answer = round.word[0];
  const [chosen, setChosen] = useState<string | null>(null);
  const [idleLevel, setIdleLevel] = useState<0 | 1 | 2>(0);

  const speakWord = useCallback(() => {
    void audio.speak({ kind: 'word', locale: config.locale, key: round.word.toLowerCase() });
  }, [audio, config.locale, round.word]);

  useEffect(() => {
    speakWord();
  }, [speakWord]);

  const handleIdle = useCallback(
    (level: 1 | 2) => {
      setIdleLevel(level);
      if (level === 1) speakWord();
    },
    [speakWord],
  );

  const { phase, locked, submit, resetIdle } = useRoundMachine({
    calmMotion,
    onComplete,
    onIdle: handleIdle,
  });

  const handlePick = (letter: string) => {
    if (locked) return;
    setIdleLevel(0);
    setChosen(letter);
    const ok = evaluate(answer, letter);
    submit(ok, {
      onCorrect: () => {
        audio.sfx('correct');
        speakWord();
      },
      onWrong: () => {
        audio.sfx('retry');
      },
    });
  };

  const mood = phase === 'celebrating' ? 'wow' : phase === 'retry' ? 'thinking' : 'happy';

  return (
    <div className={arenaStyles.arena} onPointerDown={resetIdle}>
      <div className={arenaStyles.prompt}>
        <HintBubble
          objectId={round.objectId}
          onListen={speakWord}
          speaking={idleLevel === 1}
        />

        <div className={arenaStyles.wordRow}>
          <Slot
            state={
              phase === 'celebrating'
                ? 'correct'
                : idleLevel === 2 && config.difficulty === 'mudah'
                  ? 'hint'
                  : 'empty'
            }
          >
            {phase === 'celebrating' ? answer : null}
          </Slot>
          {round.word
            .slice(1)
            .split('')
            .map((ch, idx) => (
              <Tile
                key={idx}
                char={ch}
                color="white"
                state={phase === 'celebrating' ? 'correct' : 'idle'}
              />
            ))}
        </div>
        <div className={arenaStyles.buddy} aria-hidden="true">
          <Pipi mood={mood} size={140} />
        </div>
      </div>

      <div className={`${arenaStyles.tray} ${locked ? arenaStyles.locked : ''}`}>
        <div className={arenaStyles.options}>
          {round.options.map((letter) => {
            const isChosen = chosen === letter;
            const state =
              phase === 'celebrating' && isChosen
                ? 'correct'
                : phase === 'retry' && isChosen
                  ? 'retry'
                  : idleLevel === 2 && config.difficulty === 'mudah' && letter === answer
                    ? 'selected'
                    : 'idle';
            return (
              <Tile
                key={letter}
                char={letter}
                color="blue"
                state={state}
                onPress={() => handlePick(letter)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
