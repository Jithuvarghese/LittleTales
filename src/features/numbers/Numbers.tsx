import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { numbers } from '@/content/loaders';
import { Prop } from '@/art/props';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { Tile } from '@/components/Tile';
import { BackIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { useTypingKeys } from '@/features/letters/keys';
import { strings } from '@/strings';
import { KeyboardIcon } from '@/art/Icons';
import { initialQuiz, isFinished, quizReducer } from '@/features/stories/quiz/quizLogic';

const NumGlyph = ({ text, bg }: { text: string; bg: string }) => (
  <svg viewBox="0 0 64 64" aria-hidden>
    <rect x="4" y="4" width="56" height="56" rx="14" fill={bg} stroke="var(--outline)" strokeWidth="4" />
    <text x="32" y="44" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#2b1d16" fontFamily="Andika, sans-serif">{text}</text>
  </svg>
);
const Next = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="32" cy="32" r="26" fill="#8fd18a" />
    <path d="M28 18l14 14-14 14M41 32H21" />
  </svg>
);

export function NumbersHub() {
  const navigate = useNavigate();
  const modes = [
    { to: 'meet', label: strings.numbers.meet, icon: <NumGlyph text="123" bg="#8fd18a" /> },
    { to: 'find', label: strings.numbers.find, icon: <KeyboardIcon /> },
    { to: 'count', label: strings.numbers.count, icon: <Prop id="apple" /> },
    { to: 'more', label: strings.numbers.more, icon: <NumGlyph text="<>" bg="#9fe3e0" /> },
    { to: 'add', label: strings.numbers.add, icon: <NumGlyph text="+" bg="#ff9fc4" /> },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.numbers}</h1>
      <CharacterHost character="bumble" expression="happy" size={140} />
      <div className="flex flex-wrap justify-center gap-6">
        {modes.map((m) => (
          <BigButton key={m.to} size="huge" showLabel label={m.label} icon={m.icon} onClick={() => navigate(m.to)} />
        ))}
      </div>
    </div>
  );
}

/** Objects appear one by one while being counted aloud. */
export function MeetNumber() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(1);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState(0);
  const entry = numbers[n]!;

  useEffect(() => {
    setShown(0);
    useProgress.getState().practiseNumber(n);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const step = reduce ? 500 : 750;
    for (let i = 1; i <= n; i++) {
      timers.push(
        setTimeout(() => {
          setShown(i);
          AudioManager.sfx('pop');
          AudioManager.say(numbers[i]!.word, { channel: 'letters', rate: 0.9 });
        }, i * step),
      );
    }
    timers.push(setTimeout(() => AudioManager.say(`${entry.word}!`, { channel: 'letters', src: entry.audio }), (n + 1) * step + 300));
    if (n === 0) AudioManager.say('Zero. Nothing at all!', { channel: 'letters', src: entry.audio });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, run]);

  useTypingKeys((k) => /\d/.test(k) && setN(Number(k)));

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-4">
      <h1 className="sr-only">{strings.numbers.meet}</h1>
      <div className="grid grid-cols-2 items-center justify-items-center gap-4 sm:flex sm:gap-8">
        <BigButton label={strings.previous} icon={<BackIcon />} onClick={() => setN((x) => (x + 20) % 21)} className="order-2 sm:order-none" />
        <button type="button" onClick={() => setRun((r) => r + 1)} aria-label={`${n}, ${entry.word}`} className="order-1 col-span-2 flex flex-col items-center sm:order-none">
          <span className="font-story font-bold leading-none" style={{ fontSize: 'clamp(6rem, min(24vw, 32vh), 15rem)' }}>{n}</span>
          <span className="font-story text-4xl">{entry.word}</span>
        </button>
        <BigButton label={strings.next} icon={<Next />} onClick={() => setN((x) => (x + 1) % 21)} className="order-3 sm:order-none" />
      </div>
      <div className="flex max-w-4xl flex-wrap justify-center gap-2">
        {Array.from({ length: shown }, (_, i) => (
          <motion.div key={`${n}-${i}`} initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} className="h-16 w-16 sm:h-20 sm:w-20">
            <Prop id={entry.prop} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const pick = (max: number, min = 1) => min + Math.floor(Math.random() * (max - min + 1));
const PROPS = ['apple', 'duck', 'star', 'fish', 'ball', 'flower', 'mango', 'balloon'];

/** Tap each object; the running count is spoken. */
export function CountAndTap() {
  const [round, setRound] = useState(0);
  const { total, prop } = useMemo(() => ({ total: pick(8, 2), prop: PROPS[round % PROPS.length]! }), [round]);
  const [tapped, setTapped] = useState<number[]>([]);
  const done = tapped.length === total;

  useEffect(() => {
    setTapped([]);
    AudioManager.say(strings.quiz.countAloud);
  }, [round]);
  useEffect(() => {
    if (!done) return;
    AudioManager.sfx('tada');
    setTimeout(() => AudioManager.say(`${numbers[total]!.word}! ${strings.praise[round % strings.praise.length]}`), 600);
    useProgress.getState().practiseNumber(total);
    useProgress.getState().addStars(1);
    const t = setTimeout(() => setRound((r) => r + 1), 3200);
    return () => clearTimeout(t);
  }, [done, total, round]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      {done && <Celebration />}
      <h1 className="sr-only">{strings.numbers.count}</h1>
      <span className="font-story text-8xl font-bold" aria-live="polite">{tapped.length}</span>
      <div className="flex max-w-4xl flex-wrap justify-center gap-4">
        {Array.from({ length: total }, (_, i) => (
          <motion.button
            type="button"
            key={`${round}-${i}`}
            aria-label={`${prop} ${i + 1}`}
            whileTap={{ scale: 0.85 }}
            animate={tapped.includes(i) ? { y: [0, -16, 0] } : undefined}
            className={`h-28 w-28 rounded-blob p-2 ${tapped.includes(i) ? 'bg-accent/60' : 'bg-surface'}`}
            onClick={() => {
              if (tapped.includes(i)) return;
              const next = [...tapped, i];
              setTapped(next);
              AudioManager.sfx('pop');
              AudioManager.say(numbers[next.length]!.word, { channel: 'letters' });
            }}
          >
            <Prop id={prop} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ChoiceRound({ question, options, correct, render, onNext }: { question: string; options: number[]; correct: number; render: (v: number) => React.ReactNode; onNext: () => void }) {
  const [state, dispatch] = useState(initialQuiz);
  useEffect(() => {
    dispatch(initialQuiz);
    AudioManager.say(question);
  }, [question, options, correct]);
  useEffect(() => {
    if (!isFinished(state)) return;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(1);
    const t = setTimeout(onNext, 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      {isFinished(state) && <Celebration />}
      <p className="story-text text-center font-bold" style={{ fontSize: 'calc(var(--story-size) * 0.8)' }}>{question}</p>
      <div className="flex flex-wrap justify-center gap-6">
        {options.map((v, i) => {
          const s = isFinished(state) ? (i === correct ? 'right' : 'dim') : state.status === 'hint' && i === correct ? 'hint' : state.lastWrong === i ? 'wrong' : 'idle';
          return (
            <Tile key={i} label={String(v)} state={s} className="min-h-[160px] min-w-[200px] max-w-md" onClick={() => {
              if (isFinished(state)) return;
              if (i !== correct) AudioManager.sfx('boop');
              dispatch(quizReducer(state, { type: 'answer', correct: i === correct, index: i }));
            }}>
              {render(v)}
            </Tile>
          );
        })}
      </div>
    </div>
  );
}

function Group({ n, prop }: { n: number; prop: string }) {
  return (
    <div className="flex max-w-[260px] flex-wrap justify-center gap-1">
      {Array.from({ length: n }, (_, i) => <div key={i} className="h-12 w-12"><Prop id={prop} /></div>)}
    </div>
  );
}

/** Compare two groups and tap the bigger one. */
export function WhichHasMore() {
  const [round, setRound] = useState(0);
  const data = useMemo(() => {
    const a = pick(6, 1);
    let b = pick(8, 1);
    while (b === a) b = pick(8, 1);
    return { options: [a, b], correct: a > b ? 0 : 1, prop: PROPS[round % PROPS.length]! };
  }, [round]);
  return (
    <ChoiceRound question={strings.numbers.whichMore} options={data.options} correct={data.correct} render={(v) => <Group n={v} prop={data.prop} />} onNext={() => setRound((r) => r + 1)} />
  );
}

/** Picture addition for 6–7 year olds: 2 apples + 1 apple. */
export function AddPictures() {
  const [round, setRound] = useState(0);
  const data = useMemo(() => {
    const a = pick(4, 1);
    const b = pick(3, 1);
    const sum = a + b;
    const opts = [...new Set([sum, sum + 1, Math.max(1, sum - 1)])].sort(() => Math.random() - 0.5);
    return { a, b, sum, opts, prop: PROPS[round % PROPS.length]! };
  }, [round]);
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex items-center gap-4 pt-4" aria-label={`${data.a} plus ${data.b}`}>
        <Group n={data.a} prop={data.prop} />
        <span className="font-ui text-6xl font-bold">+</span>
        <Group n={data.b} prop={data.prop} />
      </div>
      <ChoiceRound
        question={strings.numbers.howMany}
        options={data.opts}
        correct={data.opts.indexOf(data.sum)}
        render={(v) => <span className="font-story text-7xl font-bold">{v}</span>}
        onNext={() => setRound((r) => r + 1)}
      />
    </div>
  );
}
