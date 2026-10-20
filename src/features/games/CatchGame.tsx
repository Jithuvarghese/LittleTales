import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Prop } from '@/art/props';
import { Celebration } from '@/components/Celebration';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { numbers } from '@/content/loaders';
import { strings } from '@/strings';
import { finishActivity } from '@/features/rewards/reward';
import { ArrowRightIcon } from '@/art/Icons';

type Faller = { id: number; prop: string; x: number; y: number };

const PROPS = ['apple', 'mango', 'banana', 'star', 'orange', 'grapes', 'balloon', 'heart'];
const BASKET_W = 18; // % of the play area
export const GOAL = 10;

/** Falling speed in % of height per second; slows down (never speeds up) after misses. */
export function nextSpeed(speed: number, missesInARow: number) {
  return missesInARow >= 2 ? Math.max(6, speed - 2) : speed;
}

/** Catch the falling fruit with a basket. Drag, tap left/right, or use the arrow keys. No lives, no losing. */
export function CatchGame() {
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const [basket, setBasket] = useState(50);
  const [fallers, setFallers] = useState<Faller[]>([]);
  const [caught, setCaught] = useState(0);
  const [won, setWon] = useState(false);
  const speed = useRef(12);
  const misses = useRef(0);
  const nextId = useRef(0);
  const basketRef = useRef(50);
  const fallersRef = useRef<Faller[]>([]);
  const caughtRef = useRef(0);
  basketRef.current = basket;

  const move = useCallback((x: number) => setBasket(Math.max(BASKET_W / 2, Math.min(100 - BASKET_W / 2, x))), []);

  // Game loop: drop items, move them down, check catches.
  useEffect(() => {
    if (won) return;
    let last = performance.now();
    let spawnIn = 0;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnIn -= dt;
      // Update positions in a ref (side effects happen exactly once per frame), then render.
      const list = fallersRef.current.map((f) => ({ ...f, y: f.y + speed.current * dt }));
      if (spawnIn <= 0 && list.length < 2) {
        spawnIn = 2.2;
        list.push({ id: nextId.current++, prop: PROPS[nextId.current % PROPS.length]!, x: 10 + Math.random() * 80, y: -10 });
      }
      const kept: Faller[] = [];
      for (const f of list) {
        if (f.y >= 78 && f.y <= 92 && Math.abs(f.x - basketRef.current) < BASKET_W / 2 + 4) {
          misses.current = 0;
          caughtRef.current += 1;
          const n = caughtRef.current;
          AudioManager.sfx('pop');
          AudioManager.say(`${numbers[n]?.word ?? n}!`, { channel: 'letters', role: 'teacher', src: numbers[n]?.audio, queue: true });
          setCaught(n);
        } else if (f.y > 105) {
          misses.current++;
          speed.current = nextSpeed(speed.current, misses.current);
        } else kept.push(f);
      }
      fallersRef.current = kept;
      setFallers(kept);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [won]);

  useEffect(() => {
    if (caught < GOAL || won) return;
    setWon(true);
    fallersRef.current = [];
    setFallers([]);
    AudioManager.sfx('tada');
    useProgress.getState().addStars(3);
    finishActivity();
    AudioManager.say(strings.games.caughtAll, { role: 'quizHost', delivery: 'excited', queue: true });
  }, [caught, won]);

  // Arrow keys move the basket.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(basketRef.current - 8); }
      if (e.key === 'ArrowRight') { e.preventDefault(); move(basketRef.current + 8); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const pointerTo = (clientX: number) => {
    const r = area.current?.getBoundingClientRect();
    if (r) move(((clientX - r.left) / r.width) * 100);
  };

  const restart = () => {
    caughtRef.current = 0;
    setCaught(0);
    setWon(false);
    speed.current = 12;
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-3 px-3 pb-4">
      {won && <Celebration count={24} />}
      <h1 className="sr-only">{strings.games.catch}</h1>
      <div className="flex items-center gap-2 font-ui text-3xl font-extrabold" aria-live="polite">
        {Array.from({ length: GOAL }, (_, i) => (
          <span key={i} className={`h-7 w-7 sm:h-9 sm:w-9 ${i < caught ? '' : 'opacity-25 grayscale'}`} aria-hidden><Prop id="star" /></span>
        ))}
        <span className="sr-only">{caught}</span>
      </div>
      <div
        ref={area}
        data-scene=""
        role="application"
        aria-label={strings.games.catchHelp}
        className="relative aspect-[4/3] touch-none overflow-hidden rounded-blob border-[5px] border-outline bg-gradient-to-b from-[#d8f0ff] to-[#bfe6ff]"
        style={{ width: 'min(100%, calc((100dvh - 17rem) * 4 / 3))' }}
        onPointerDown={(e) => pointerTo(e.clientX)}
        onPointerMove={(e) => e.buttons && pointerTo(e.clientX)}
      >
        <div className="absolute bottom-0 h-[12%] w-full bg-[#8fd18a]" />
        {fallers.map((f) => (
          <div key={f.id} className="absolute aspect-square h-[17%]" style={{ left: `${f.x}%`, top: `${f.y}%`, transform: 'translate(-50%, -50%)' }}>
            <motion.div className="h-full w-full" animate={reduce ? undefined : { rotate: [-8, 8, -8] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Prop id={f.prop} />
            </motion.div>
          </div>
        ))}
        <div className="absolute bottom-[4%] h-[22%] transition-[left] duration-75 [&>svg]:h-full [&>svg]:w-full" style={{ left: `${basket}%`, width: `${BASKET_W}%`, transform: 'translateX(-50%)' }}>
          <Prop id="basket" />
        </div>
        {won && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60">
            <p className="font-ui text-4xl font-extrabold text-[#2b1d16]">{strings.games.caughtAll}</p>
            <button type="button" onClick={restart} className="min-h-[72px] rounded-blob border-[5px] border-outline bg-accent px-8 font-ui text-2xl font-bold text-[#2b1d16] shadow-[0_6px_0_var(--outline)]">
              {strings.games.again}
            </button>
          </div>
        )}
      </div>
      <div className="flex w-full max-w-md justify-between gap-4">
        <button type="button" aria-label={strings.games.left} onClick={() => move(basket - 12)} className="flex h-20 w-28 items-center justify-center rounded-blob border-[5px] border-outline bg-surface p-4 shadow-[0_6px_0_var(--outline)]"><span className="block h-10 w-10 rotate-180"><ArrowRightIcon /></span></button>
        <button type="button" aria-label={strings.games.right} onClick={() => move(basket + 12)} className="flex h-20 w-28 items-center justify-center rounded-blob border-[5px] border-outline bg-surface p-4 shadow-[0_6px_0_var(--outline)]"><span className="block h-10 w-10"><ArrowRightIcon /></span></button>
      </div>
    </div>
  );
}
