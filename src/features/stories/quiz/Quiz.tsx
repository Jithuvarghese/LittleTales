import { useEffect, useReducer, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { QuizOption, QuizPage } from '@/content/schema';
import { Prop } from '@/art/props';
import { Face } from '@/art/Faces';
import { CharacterHost } from '@/components/CharacterHost';
import { BigButton } from '@/components/BigButton';
import { Tile } from '@/components/Tile';
import { Celebration } from '@/components/Celebration';
import { AudioManager } from '@/services/AudioManager';
import { sfxNames, type SfxName } from '@/services/synth';
import { strings } from '@/strings';
import { numbers } from '@/content/loaders';
import { ArrowRightIcon, QuestionIcon, SkipIcon } from '@/art/Icons';
import { uiLineSrc } from '@/content/voicing';
import { initialQuiz, isFinished, quizReducer } from './quizLogic';

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M10 24h10l14-12v40L20 40H10z" fill="#ffcb47" />
      <path d="M42 22q8 10 0 20M48 16q14 16 0 32" />
    </svg>
  );
}

function OptionArt({ o }: { o: QuizOption }) {
  if (o.face) return <Face face={o.face} />;
  if (o.shape) return <Prop id={o.shape} color={o.color} />;
  if (o.prop && o.color) return <Prop id={o.prop} color={o.color} />;
  if (o.prop) return <Prop id={o.prop} />;
  return <span className="font-ui text-3xl font-bold">{o.label}</span>;
}

type Props = { page: QuizPage; onDone: (stars: number) => void };

/** Renders any of the 7 quiz types from JSON. Never blocks: skip is always available. */
export function Quiz({ page, onDone }: Props) {
  const [state, dispatch] = useReducer(quizReducer, initialQuiz);
  const [counted, setCounted] = useState<number[]>([]);
  const doneRef = useRef(false);

  const playSound = () => {
    if (page.quizType !== 'sound-choice') return;
    if (sfxNames.includes(page.sound as SfxName)) AudioManager.sfx(page.sound);
    else AudioManager.say(page.sound, { channel: 'narration' });
  };
  const ask = () => {
    AudioManager.say(page.question, {
      src: page.questionAudio,
      role: 'quizHost',
      delivery: 'gentle',
      onEnd: page.quizType === 'sound-choice' ? playSound : undefined,
    });
  };

  useEffect(() => {
    dispatch({ type: 'reset' });
    setCounted([]);
    doneRef.current = false;
    const t = setTimeout(ask, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const options: QuizOption[] =
    page.quizType === 'count'
      ? page.choices.map((n) => ({ label: String(n), correct: n === page.count }))
      : page.quizType === 'drag-drop'
        ? page.targets
        : page.options;
  const correctIndex = options.findIndex((o) => o.correct);

  useEffect(() => {
    if (!isFinished(state) || doneRef.current) return;
    doneRef.current = true;
    AudioManager.sfx('tada');
    const label = options[correctIndex]?.label ?? '';
    const line = state.status === 'correct' ? strings.quiz.great : strings.quiz.itWas(label);
    let t: ReturnType<typeof setTimeout> | undefined;
    AudioManager.say(line, {
      role: 'quizHost',
      delivery: 'excited',
      src: state.status === 'correct' ? uiLineSrc(line) : undefined,
      onEnd: () => (t = setTimeout(() => onDone(page.reward.stars), 800)),
    });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const answer = (i: number) => {
    if (isFinished(state)) return;
    const correct = i === correctIndex;
    if (!correct) {
      AudioManager.sfx('boop');
      if (state.misses === 0) AudioManager.say(strings.quiz.tryAgain, { role: 'quizHost', delivery: 'gentle', src: uiLineSrc(strings.quiz.tryAgain) });
    }
    dispatch({ type: 'answer', correct, index: i });
  };

  const tileState = (i: number) => {
    if (state.status === 'correct' || state.status === 'revealed') return i === correctIndex ? 'right' : 'dim';
    if (state.status === 'hint' && i === correctIndex) return 'hint';
    if (state.lastWrong === i) return 'wrong';
    return 'idle';
  };

  const finished = isFinished(state);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-4">
      {finished && <Celebration />}
      <div className="flex items-center gap-4">
        <h2 className="story-text text-center font-bold" style={{ fontSize: 'calc(var(--story-size) * 0.8)' }}>
          {page.question}
        </h2>
        <BigButton size="tap" label={strings.replay} icon={<SpeakerIcon />} onClick={ask} />
      </div>

      {/* Per-type prompt area */}
      {page.quizType === 'count' && (
        <div className="flex flex-wrap justify-center gap-3" aria-label={strings.quiz.countAloud}>
          {Array.from({ length: page.count }, (_, i) => (
            <motion.button
              type="button"
              key={i}
              aria-label={`${page.prop} ${i + 1}`}
              className={`h-24 w-24 rounded-blob p-1 ${counted.includes(i) ? 'bg-accent/60' : ''}`}
              whileTap={{ scale: 0.85 }}
              onClick={() => {
                if (counted.includes(i)) return;
                const next = [...counted, i];
                setCounted(next);
                AudioManager.sfx('pop');
                AudioManager.say(`${numbers[next.length]?.word ?? next.length}!`, { role: 'teacher', src: numbers[next.length]?.audio, queue: true });
              }}
            >
              <Prop id={page.prop} />
            </motion.button>
          ))}
        </div>
      )}
      {page.quizType === 'sound-choice' && (
        <BigButton size="big" label={strings.replay} icon={<SpeakerIcon />} onClick={playSound} />
      )}
      {page.quizType === 'match' && (
        <div className="h-32 w-32 rounded-blob border-[5px] border-dashed border-outline bg-surface p-2">
          <OptionArt o={page.target} />
        </div>
      )}
      {page.quizType === 'sequence' && (
        <div className="flex items-center gap-2">
          {page.shown.map((p, i) => (
            <div key={`${p}-${i}`} className="flex items-center gap-2">
              <div className="h-24 w-24 rounded-blob bg-surface p-2"><Prop id={p} /></div>
              <span className="h-10 w-10" aria-hidden><ArrowRightIcon /></span>
            </div>
          ))}
          <div className="flex h-24 w-24 items-center justify-center rounded-blob border-[5px] border-dashed border-outline p-3"><QuestionIcon /></div>
        </div>
      )}
      {page.quizType === 'feelings' && <CharacterHost character={page.character} expression="idle" size={150} />}
      {page.quizType === 'drag-drop' && !finished && (
        <motion.div
          drag
          dragSnapToOrigin
          whileDrag={{ scale: 1.15, zIndex: 50 }}
          className="h-28 w-28 cursor-grab touch-none"
          aria-hidden
          onDragEnd={(_, info) => {
            const el = document
              .elementsFromPoint(info.point.x - window.scrollX, info.point.y - window.scrollY)
              .find((e) => (e as HTMLElement).dataset?.target);
            if (el) answer(Number((el as HTMLElement).dataset.target));
          }}
        >
          <Prop id={page.item} />
        </motion.div>
      )}

      <div className="mt-2 flex flex-wrap justify-center gap-5">
        {options.map((o, i) => (
          <div key={`${o.label}-${i}`} data-target={page.quizType === 'drag-drop' ? i : undefined}>
            <Tile
              label={o.label}
              state={tileState(i)}
              onClick={() => answer(i)}
              className={page.quizType === 'count' ? 'h-28 w-28' : 'h-36 w-36 sm:h-44 sm:w-44'}
            >
              <span data-target={page.quizType === 'drag-drop' ? i : undefined} className="flex h-full w-full items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                {page.quizType === 'count' ? <span className="font-ui text-6xl font-extrabold">{o.label}</span> : <OptionArt o={o} />}
              </span>
            </Tile>
          </div>
        ))}
      </div>

      {!finished && (
        <button
          type="button"
          onClick={() => onDone(0)}
          className="mt-auto flex items-center gap-2 self-end rounded-full px-4 py-2 font-ui text-lg opacity-60 hover:opacity-100"
          aria-label={strings.skip}
        >
          {strings.skip} <span className="h-7 w-7" aria-hidden><SkipIcon /></span>
        </button>
      )}
    </div>
  );
}
