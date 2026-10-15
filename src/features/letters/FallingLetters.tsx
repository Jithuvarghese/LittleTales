import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { useSettings } from '@/app/settingsStore';
import { strings } from '@/strings';
import { useTypingKeys } from './keys';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { letterOrder } from './MeetLetter';
import { sayLetterName } from './letterAudio';

type Bubble = { id: number; letter: string; x: number; born: number };

/** Seconds a bubble takes to float up; grows (slower) when the child struggles. */
export function adaptDuration(current: number, missedRecently: number) {
  if (missedRecently >= 2) return Math.min(current + 3, 30);
  return current;
}

const COLORS = ['#ff9fc4', '#9fe3e0', '#ffd98a', '#c9a0ff', '#a8ecd2'];

/** Bubbles float up slowly; press a letter to pop it. No lives, no timer, no game over. */
export function FallingLetters() {
  const order = letterOrder(useSettings((s) => s.learningPath));
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [duration, setDuration] = useState(16);
  const [pressed, setPressed] = useState<{ key: string; n: number } | null>(null);
  const missed = useRef(0);
  const nextId = useRef(0);
  const pool = order.slice(0, 10);

  useEffect(() => {
    const spawn = () => {
      setBubbles((b) => {
        if (b.length >= 3) return b;
        const letter = pool[Math.floor(Math.random() * pool.length)]!;
        return [...b, { id: nextId.current++, letter, x: 10 + Math.random() * 75, born: Date.now() }];
      });
    };
    spawn();
    const t = setInterval(spawn, (duration * 1000) / 3);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const escaped = (id: number) => {
    setBubbles((b) => b.filter((x) => x.id !== id));
    missed.current++;
    const next = adaptDuration(duration, missed.current);
    if (next !== duration) {
      missed.current = 0;
      setDuration(next);
    }
  };

  const press = (k: string) => {
    setPressed((p) => ({ key: k, n: (p?.n ?? 0) + 1 }));
    const hit = bubbles.find((b) => b.letter === k);
    if (hit) {
      AudioManager.sfx('pop');
      sayLetterName(k);
      setBubbles((b) => b.filter((x) => x.id !== hit.id));
      missed.current = 0;
      useProgress.getState().practiseLetter(k);
      useProgress.getState().addStars(1);
    }
  };
  useTypingKeys(press);

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-4">
      <h1 className="sr-only">{strings.letters.falling}</h1>
      <div className="relative h-[45vh] w-full max-w-5xl overflow-hidden rounded-blob border-[5px] border-outline bg-surface/60">
        <AnimatePresence>
          {bubbles.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              aria-label={b.letter}
              onClick={() => press(b.letter)}
              className="absolute flex h-24 w-24 items-center justify-center rounded-full border-4 border-outline font-story text-5xl font-bold text-[#2b1d16]"
              style={{ left: `${b.x}%`, background: COLORS[b.id % COLORS.length] }}
              initial={{ top: '100%' }}
              animate={{ top: '-25%' }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration, ease: 'linear' }}
              onAnimationComplete={(def) => {
                if (typeof def === 'object' && def && 'top' in def && (def as { top: string }).top === '-25%') escaped(b.id);
              }}
            >
              {b.letter}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <OnScreenKeyboard pressed={pressed} onKey={press} />
    </div>
  );
}
