import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { flags, type FlagEntry } from '@/content/loaders';
import { Flag } from '@/art/flags';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { Tile } from '@/components/Tile';
import { BackIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';
import { finishActivity } from '@/features/rewards/reward';
import { initialQuiz, isFinished, quizReducer } from '@/features/stories/quiz/quizLogic';

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
export const findFlagSrc = (f: FlagEntry) => `audio/flags/en/find-${f.id}.mp3`;

/** "This is the flag of India! India is in Asia." */
export function sayFlag(f: FlagEntry, onEnd?: () => void) {
  AudioManager.say(strings.flags.intro(f.name, f.continent), { role: 'teacher', delivery: 'excited', src: f.audio, talker: 'pip', onEnd });
}

const Globe = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <circle cx="32" cy="32" r="26" fill="#6bc1ff" />
    <path d="M18 18q8 2 10 10t-6 10q-4 6 2 12M40 10q-6 8 2 12t12 4M44 44q-6 0-6 8" fill="#8fd18a" />
  </svg>
);
const Pairs = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="3.5" strokeLinejoin="round">
    <rect x="4" y="14" width="26" height="36" rx="5" fill="#fff4e3" />
    <rect x="34" y="14" width="26" height="36" rx="5" fill="#fff4e3" />
    <rect x="8" y="24" width="18" height="12" fill="#BC002D" stroke="none" />
    <rect x="38" y="24" width="18" height="12" fill="#BC002D" stroke="none" />
  </svg>
);

export function FlagsHub() {
  const navigate = useNavigate();
  const modes = [
    { to: 'meet', label: strings.flags.meet, icon: <Globe />, tint: '#e6f6ff' },
    { to: 'find', label: strings.flags.find, icon: <Flag id="india" className="h-full w-full" />, tint: '#fff1c4' },
    { to: 'pairs', label: strings.flags.pairs, icon: <Pairs />, tint: '#ffe1d6' },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.flags}</h1>
      <CharacterHost character="pip" pose="wave" size={130} />
      <div className="flex flex-wrap justify-center gap-5">
        {modes.map((m) => <BigButton key={m.to} size="huge" showLabel label={m.label} icon={m.icon} tint={m.tint} onClick={() => navigate(m.to)} />)}
      </div>
    </div>
  );
}

const NextIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="32" cy="32" r="26" fill="#8fd18a" /><path d="M28 18l14 14-14 14M41 32H21" />
  </svg>
);

/** One flag at a time: it waves, its country is named, and the continent is said. */
export function MeetFlag() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const f = flags[i]!;
  useEffect(() => {
    const t = setTimeout(() => sayFlag(f), 300);
    return () => {
      clearTimeout(t);
      AudioManager.stopVoice();
    };
  }, [f, run]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-4">
      <h1 className="sr-only">{strings.flags.meet}</h1>
      <div className="grid grid-cols-2 items-center justify-items-center gap-4 sm:flex sm:gap-10">
        <BigButton label={strings.previous} icon={<BackIcon />} onClick={() => setI((x) => (x + flags.length - 1) % flags.length)} className="order-2 sm:order-none" />
        <motion.button
          type="button"
          key={`${f.id}-${run}`}
          aria-label={f.name}
          onClick={() => setRun((r) => r + 1)}
          className="order-1 col-span-2 flex flex-col items-center gap-3 sm:order-none"
          initial={reduce ? false : { scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        >
          {/* The flag waves gently on its pole */}
          <div className="flex items-start">
            <div className="h-[min(18rem,40vh)] w-3 rounded-full border-2 border-outline bg-[#b8b0a8]" />
            <motion.div
              className="w-[min(22rem,62vw)] origin-left drop-shadow-md"
              animate={reduce ? undefined : { skewY: [0, 2.5, 0, -2.5, 0], scaleX: [1, 0.97, 1, 0.98, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flag id={f.id} title={f.name} className="w-full" />
            </motion.div>
          </div>
          <span className="font-story text-4xl font-bold sm:text-5xl">{cap(f.name.replace(/^the /, ''))}</span>
          <span className="font-ui text-xl opacity-80">{f.continent}</span>
        </motion.button>
        <BigButton label={strings.next} icon={<NextIcon />} onClick={() => setI((x) => (x + 1) % flags.length)} className="order-3 sm:order-none" />
      </div>
    </div>
  );
}

/** Three flags; find the one asked for. Hint, then reveal; never a failure. */
export function FindFlag() {
  const [round, setRound] = useState(0);
  const { options, target } = useMemo(() => {
    const pick = [...flags].sort(() => Math.random() - 0.5).slice(0, 3);
    return { options: pick, target: pick[Math.floor(Math.random() * 3)]! };
  }, [round]);
  const [state, setState] = useState(initialQuiz);
  const busy = useRef(false);

  useEffect(() => {
    setState(initialQuiz);
    busy.current = false;
    AudioManager.say(strings.flags.findPrompt(target.name), { role: 'quizHost', delivery: 'excited', src: findFlagSrc(target), talker: 'pip' });
  }, [round, target]);

  useEffect(() => {
    if (!isFinished(state) || busy.current) return;
    busy.current = true;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(1);
    sayFlag(target, () => setTimeout(() => setRound((r) => r + 1), 700));
  }, [state, target]);

  const correct = options.indexOf(target);
  return (
    <div className="flex flex-1 flex-col items-center gap-5 p-4">
      {isFinished(state) && <Celebration count={12} />}
      <h1 className="sr-only">{strings.flags.find}</h1>
      <div className="flex items-center gap-3">
        <CharacterHost character="pip" pose={isFinished(state) ? 'cheer' : state.status === 'hint' ? 'wave' : 'talk'} size={100} />
        <button type="button" onClick={() => AudioManager.say(strings.flags.findPrompt(target.name), { role: 'quizHost', src: findFlagSrc(target), talker: 'pip' })} className="story-text rounded-blob bg-surface px-5 py-3 font-bold" style={{ fontSize: 'calc(var(--story-size) * 0.7)' }}>
          {strings.flags.findPrompt(target.name)}
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-5">
        {options.map((f, i) => {
          const s = isFinished(state) ? (i === correct ? 'right' : 'dim') : state.status === 'hint' && i === correct ? 'hint' : state.lastWrong === i ? 'wrong' : 'idle';
          return (
            <Tile key={`${round}-${f.id}`} label={f.name} state={s} className="h-auto w-[min(15rem,42vw)] p-3" onClick={() => {
              if (isFinished(state)) return;
              if (i !== correct) {
                AudioManager.sfx('oops');
                AudioManager.say(strings.flags.thatIs(f.name), { role: 'quizHost', delivery: 'gentle', talker: 'pip' });
              }
              setState((st) => quizReducer(st, { type: 'answer', correct: i === correct, index: i }));
            }}>
              <Flag id={f.id} className="w-full" />
            </Tile>
          );
        })}
      </div>
    </div>
  );
}

/** Memory game with flags: turn two cards, find the matching pair. */
export function FlagPairs() {
  const reduce = useReducedMotion();
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => {
    const picked = [...flags].sort(() => Math.random() - 0.5).slice(0, 4);
    return [...picked, ...picked].map((f, n) => ({ n, f })).sort(() => Math.random() - 0.5);
  }, [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const busy = useRef(false);
  const won = found.length === 4;

  useEffect(() => {
    setOpen([]);
    setFound([]);
    busy.current = false;
  }, [seed]);
  useEffect(() => {
    if (!won) return;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(3);
    finishActivity();
    AudioManager.react('pip', 'yay');
    AudioManager.say(strings.games.allMatched, { role: 'quizHost', delivery: 'excited', queue: true });
  }, [won]);

  const flip = (n: number, f: FlagEntry) => {
    if (busy.current || open.includes(n) || found.includes(f.id)) return;
    AudioManager.sfx('click', 'ui');
    const nowOpen = [...open, n];
    setOpen(nowOpen);
    if (nowOpen.length < 2) return AudioManager.say(cap(f.name.replace(/^the /, '')), { role: 'teacher' });
    busy.current = true;
    const other = deck.find((d) => d.n === nowOpen[0])!.f;
    if (other.id === f.id) {
      AudioManager.sfx('chime');
      sayFlag(f, () => {
        setFound((x) => [...x, f.id]);
        setOpen([]);
        busy.current = false;
      });
    } else {
      AudioManager.say(cap(f.name.replace(/^the /, '')), {
        role: 'teacher',
        onEnd: () => setTimeout(() => { setOpen([]); busy.current = false; }, 700),
      });
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-3 pb-6">
      {won && <Celebration count={20} />}
      <h1 className="sr-only">{strings.flags.pairs}</h1>
      <div className="grid w-full max-w-2xl grid-cols-4 gap-3">
        {deck.map(({ n, f }) => {
          const up = open.includes(n) || found.includes(f.id);
          return (
            <motion.button
              key={`${seed}-${n}`}
              type="button"
              aria-label={up ? f.name : strings.games.hidden}
              onClick={() => flip(n, f)}
              animate={reduce ? undefined : { rotateY: up ? 0 : 180 }}
              transition={{ duration: 0.35 }}
              className={`flex aspect-[3/4] items-center justify-center rounded-2xl border-[5px] border-outline p-2 shadow-[0_6px_0_var(--outline)] ${up ? 'bg-surface' : 'bg-primary'} ${found.includes(f.id) ? 'ring-4 ring-success' : ''}`}
            >
              {up ? <Flag id={f.id} className="w-full" /> : <span className="h-1/2 w-1/2 text-accent"><Globe /></span>}
            </motion.button>
          );
        })}
      </div>
      {won && (
        <button type="button" onClick={() => setSeed((s) => s + 1)} className="min-h-[72px] rounded-blob border-[5px] border-outline bg-accent px-8 font-ui text-2xl font-bold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]">
          {strings.games.again}
        </button>
      )}
    </div>
  );
}
