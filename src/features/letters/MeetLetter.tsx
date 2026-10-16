import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Prop } from '@/art/props';
import { BigButton } from '@/components/BigButton';
import { BackIcon } from '@/art/Icons';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';
import { ALPHABET, HOME_ROW_FIRST, useTypingKeys } from './keys';
import { introduceLetter, letterEntry } from './letterAudio';

export function letterOrder(path: 'alphabetical' | 'home-row') {
  return path === 'home-row' ? HOME_ROW_FIRST : ALPHABET;
}

export function GiantLetter({ l }: { l: string }) {
  const letterCase = useSettings((s) => s.letterCase);
  const text = letterCase === 'upper' ? l : letterCase === 'lower' ? l.toLowerCase() : `${l}${l.toLowerCase()}`;
  return (
    <span className="font-story font-bold leading-none text-text" style={{ fontSize: 'clamp(6rem, min(26vw, 38vh), 20rem)' }}>
      {text}
    </span>
  );
}

const Next = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="32" cy="32" r="26" fill="#8fd18a" />
    <path d="M28 18l14 14-14 14M41 32H21" />
  </svg>
);

export function MeetLetter() {
  const reduce = useReducedMotion();
  const order = letterOrder(useSettings((s) => s.learningPath));
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const l = order[i]!;
  const e = letterEntry(l);

  const hear = () => {
    setN((x) => x + 1);
    introduceLetter(l);
    useProgress.getState().practiseLetter(l);
  };
  useEffect(() => {
    const t = setTimeout(hear, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l]);
  useTypingKeys((k) => {
    const idx = order.indexOf(k);
    if (idx >= 0) setI(idx);
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <h1 className="sr-only">{strings.letters.meet}</h1>
      <div className="grid grid-cols-2 items-center justify-items-center gap-4 sm:flex sm:gap-10">
        <BigButton label={strings.previous} icon={<BackIcon />} onClick={() => setI((x) => (x + order.length - 1) % order.length)} className="order-2 sm:order-none" />
        <motion.button
          type="button"
          key={`${l}-${n}`}
          aria-label={`${l}, ${e.word}`}
          onClick={hear}
          animate={reduce ? undefined : { scale: [0.8, 1.08, 1] }}
          className="order-1 col-span-2 rounded-blob px-4 sm:order-none"
        >
          <GiantLetter l={l} />
        </motion.button>
        <BigButton label={strings.next} icon={<Next />} onClick={() => setI((x) => (x + 1) % order.length)} className="order-3 sm:order-none" />
      </div>
      <motion.div key={`w-${l}-${n}`} initial={reduce ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
        <div className="h-24 w-24 sm:h-32 sm:w-32"><Prop id={e.prop} title={e.word} /></div>
        <span className="font-story text-4xl sm:text-5xl">
          <b className="text-primary">{e.word[0]}</b>
          {e.word.slice(1)}
        </span>
      </motion.div>
    </div>
  );
}
