import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Prop, propIndex } from '@/art/props';
import { Celebration } from '@/components/Celebration';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';
import { finishActivity } from '@/features/rewards/reward';

const POOL = ['cat', 'dog', 'duck', 'fish', 'apple', 'sun', 'moon', 'star', 'car', 'ball', 'cake', 'frog', 'kite', 'tree', 'bee', 'owl'];

type Card = { id: number; prop: string };

/** Shuffled pairs of picture cards. */
export function makeDeck(pairs: number, rand: () => number = Math.random): Card[] {
  const picked = [...POOL].sort(() => rand() - 0.5).slice(0, pairs);
  return [...picked, ...picked].map((prop, id) => ({ id, prop })).sort(() => rand() - 0.5).map((c, id) => ({ ...c, id }));
}

const CardBack = () => (
  <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
    <rect x="4" y="4" width="92" height="92" rx="16" fill="var(--primary)" />
    {[25, 50, 75].map((x) => [25, 50, 75].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="var(--accent)" opacity="0.8" />))}
  </svg>
);

/** Find two matching pictures. Cards say their name when turned; no mistakes count against the child. */
export function MatchGame() {
  const reduce = useReducedMotion();
  const [pairs, setPairs] = useState(3);
  const [deck, setDeck] = useState(() => makeDeck(3));
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const busy = useRef(false);
  const won = found.length === pairs;

  const newGame = (p = pairs) => {
    setPairs(p);
    setDeck(makeDeck(p));
    setOpen([]);
    setFound([]);
    busy.current = false;
  };

  useEffect(() => {
    if (!won) return;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(3);
    finishActivity();
    AudioManager.say(strings.games.allMatched, { role: 'quizHost', delivery: 'excited', queue: true });
  }, [won]);

  const flip = (c: Card) => {
    if (busy.current || open.includes(c.id) || found.includes(c.prop)) return;
    AudioManager.sfx('click', 'ui');
    const name = propIndex[c.prop]?.name ?? c.prop;
    const nowOpen = [...open, c.id];
    setOpen(nowOpen);
    if (nowOpen.length < 2) {
      AudioManager.say(`${name[0]!.toUpperCase()}${name.slice(1)}!`, { role: 'teacher' });
      return;
    }
    const [a, b] = nowOpen.map((id) => deck.find((d) => d.id === id)!);
    busy.current = true;
    if (a!.prop === b!.prop) {
      AudioManager.say(strings.games.matchFound(name), {
        role: 'quizHost',
        delivery: 'excited',
        onEnd: () => {
          setFound((f) => [...f, a!.prop]);
          setOpen([]);
          busy.current = false;
        },
      });
      AudioManager.sfx('chime');
    } else {
      // Not a pair: say the second name, then gently turn both back.
      AudioManager.say(`${name[0]!.toUpperCase()}${name.slice(1)}!`, {
        role: 'teacher',
        onEnd: () =>
          setTimeout(() => {
            setOpen([]);
            busy.current = false;
          }, 700),
      });
    }
  };

  const cols = pairs <= 3 ? 'grid-cols-3' : pairs <= 4 ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4';

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-3 pb-6">
      {won && <Celebration count={24} />}
      <h1 className="sr-only">{strings.games.matchLabel}</h1>
      <div className="flex gap-3" role="group" aria-label={strings.games.howMany}>
        {[3, 4, 6].map((p) => (
          <button key={p} type="button" aria-pressed={pairs === p} aria-label={`${p * 2} cards`} onClick={() => newGame(p)}
            className={`flex h-[72px] items-center gap-1 rounded-full border-4 border-outline px-4 font-ui text-xl font-bold shadow-[0_4px_0_var(--outline)] ${pairs === p ? 'bg-accent text-[#2b1d16]' : 'bg-surface text-text'}`}>
            {Array.from({ length: Math.min(p, 3) }, (_, i) => <span key={i} className="h-4 w-3 rounded-sm border-2 border-outline bg-primary" aria-hidden />)}
            <span className="ml-1">{p * 2}</span>
          </button>
        ))}
      </div>
      <div className={`grid w-full ${cols} gap-3 sm:gap-4`} style={{ maxWidth: pairs === 6 ? '40rem' : '34rem' }}>
        {deck.map((c) => {
          const faceUp = open.includes(c.id) || found.includes(c.prop);
          return (
            <motion.button
              key={`${pairs}-${c.id}`}
              type="button"
              onClick={() => flip(c)}
              aria-label={faceUp ? propIndex[c.prop]?.name ?? c.prop : strings.games.hidden}
              animate={reduce ? undefined : { rotateY: faceUp ? 0 : 180 }}
              transition={{ duration: 0.35 }}
              className={`aspect-square rounded-2xl border-[5px] border-outline bg-surface p-2 shadow-[0_6px_0_var(--outline)] ${found.includes(c.prop) ? 'ring-4 ring-success' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {faceUp ? <Prop id={c.prop} /> : <CardBack />}
            </motion.button>
          );
        })}
      </div>
      {won && (
        <button type="button" onClick={() => newGame()} className="min-h-[72px] rounded-blob border-[5px] border-outline bg-accent px-8 font-ui text-2xl font-bold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]">
          {strings.games.again}
        </button>
      )}
    </div>
  );
}
