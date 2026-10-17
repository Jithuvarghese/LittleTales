import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { colours, type ColourEntry } from '@/content/loaders';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { Prop } from '@/art/props';
import { BackIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
export const findSrc = (c: ColourEntry) => `audio/colours/en/find-${c.name}.mp3`;

/** "Red! Like an apple!" */
export function sayColour(c: ColourEntry, onEnd?: () => void) {
  AudioManager.say(strings.colours.like(cap(c.name), c.like), { role: 'teacher', delivery: 'excited', src: c.audio, talker: 'zig', onEnd });
}

const Splash = ({ color, size = 64 }: { color: string; size?: number }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
    <path d="M32 6c8 0 10 8 16 9s12 6 9 14 3 13-4 18-9 12-21 11-14-4-19-11-4-14 0-20 3-10 8-14 7-7 11-7z" fill={color} stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round" />
    <ellipse cx="24" cy="22" rx="6" ry="4" fill="#fff" opacity="0.5" />
  </svg>
);

/* ---------------- Hub ---------------- */
const Palette = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <path d="M32 6C16 6 6 18 6 32s10 26 24 26c6 0 6-6 3-9s-1-8 5-8h8c10 0 14-6 14-13C60 15 48 6 32 6z" fill="#fff4e3" />
    <circle cx="20" cy="26" r="5" fill="#e8553f" /><circle cx="32" cy="18" r="5" fill="#f7d443" /><circle cx="45" cy="24" r="5" fill="#4fa3e8" /><circle cx="18" cy="40" r="5" fill="#6cbf4b" />
  </svg>
);
const Brush = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <path d="M44 6l14 14-22 22-14-14z" fill="#c98c4a" />
    <path d="M22 28l14 14q-4 14-20 16q-8 0-10-4q8-2 8-10q0-12 8-16z" fill="#ff8fb8" />
  </svg>
);

export function ColoursHub() {
  const navigate = useNavigate();
  const modes = [
    { to: 'meet', label: strings.colours.meet, icon: <Palette />, tint: '#fff1c4' },
    { to: 'find', label: strings.colours.find, icon: <Prop id="balloon" />, tint: '#ffe1d6' },
    { to: 'paint', label: strings.colours.paint, icon: <Brush />, tint: '#e6f6ff' },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.colours}</h1>
      <CharacterHost character="zig" expression="happy" size={130} />
      <div className="flex flex-wrap justify-center gap-5">
        {modes.map((m) => <BigButton key={m.to} size="huge" showLabel label={m.label} icon={m.icon} tint={m.tint} onClick={() => navigate(m.to)} />)}
      </div>
    </div>
  );
}

/* ---------------- Meet the colours ---------------- */
const NextIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="32" cy="32" r="26" fill="#8fd18a" /><path d="M28 18l14 14-14 14M41 32H21" />
  </svg>
);

export function MeetColour() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [run, setRun] = useState(0);
  const c = colours[i]!;
  useEffect(() => {
    const t = setTimeout(() => sayColour(c), 300);
    return () => {
      clearTimeout(t);
      AudioManager.stopVoice();
    };
  }, [c, run]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <h1 className="sr-only">{strings.colours.meet}</h1>
      <div className="grid grid-cols-2 items-center justify-items-center gap-4 sm:flex sm:gap-10">
        <BigButton label={strings.previous} icon={<BackIcon />} onClick={() => setI((x) => (x + colours.length - 1) % colours.length)} className="order-2 sm:order-none" />
        <motion.button
          type="button"
          key={`${c.name}-${run}`}
          aria-label={c.name}
          onClick={() => setRun((r) => r + 1)}
          className="order-1 col-span-2 flex flex-col items-center sm:order-none"
          initial={reduce ? false : { scale: 0.5, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Splash color={c.hex} size={220} />
          <span className="font-story text-6xl font-bold" style={{ color: c.name === 'white' || c.name === 'yellow' ? 'var(--text)' : c.hex, textShadow: '0 2px 0 rgba(255,255,255,0.6)' }}>{c.name}</span>
        </motion.button>
        <BigButton label={strings.next} icon={<NextIcon />} onClick={() => setI((x) => (x + 1) % colours.length)} className="order-3 sm:order-none" />
      </div>
      <div className="flex gap-4">
        {c.things.map((t, k) => (
          <motion.div key={`${c.name}-${t}`} className="h-24 w-24 sm:h-28 sm:w-28" initial={reduce ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + k * 0.12 } }}>
            <Prop id={t} title={t} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Find the colour (pop the balloon) ---------------- */
const Balloon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 80 110" className="h-full w-full" aria-hidden stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <path d="M40 104q-6-8 0-16" fill="none" />
    <ellipse cx="40" cy="42" rx="32" ry="38" fill={color} />
    <path d="M36 80h8l-4 7z" fill={color} />
    <ellipse cx="28" cy="28" rx="7" ry="10" fill="#fff" opacity="0.45" stroke="none" />
  </svg>
);

/** Picks 3 different colours for a round, with the target among them. */
export function makeRound(n = 3, rand = Math.random) {
  const pick = [...colours].sort(() => rand() - 0.5).slice(0, n);
  return { options: pick, target: pick[Math.floor(rand() * n)]! };
}

export function FindColour() {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(0);
  const { options, target } = useMemo(() => makeRound(3), [round]);
  const [misses, setMisses] = useState(0);
  const [popped, setPopped] = useState<string | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    setMisses(0);
    setPopped(null);
    busy.current = false;
    AudioManager.say(strings.colours.findPrompt(target.name), { role: 'teacher', delivery: 'excited', src: findSrc(target), talker: 'zig' });
  }, [round, target]);

  const tap = (c: ColourEntry) => {
    if (busy.current) return;
    if (c.name === target.name) {
      busy.current = true;
      setPopped(c.name);
      AudioManager.sfx('pop');
      useProgress.getState().addStars(1);
      sayColour(c, () => setTimeout(() => setRound((r) => r + 1), 600));
    } else {
      // Gentle: name the colour that was tapped, then ask again with a hint glow.
      AudioManager.sfx('oops');
      setMisses((m) => m + 1);
      AudioManager.say(strings.colours.thatIs(c.name, target.name), { role: 'teacher', delivery: 'gentle', talker: 'zig' });
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-4 p-4">
      {popped && <Celebration count={10} />}
      <h1 className="sr-only">{strings.colours.find}</h1>
      <div className="flex items-center gap-3">
        <CharacterHost character="zig" pose={popped ? 'cheer' : misses ? 'wave' : 'talk'} size={110} />
        <button type="button" onClick={() => AudioManager.say(strings.colours.findPrompt(target.name), { role: 'teacher', src: findSrc(target), talker: 'zig' })} className="story-text rounded-blob bg-surface px-5 py-3 font-bold" style={{ fontSize: 'calc(var(--story-size) * 0.75)' }}>
          {strings.colours.findPrompt(target.name)}
        </button>
      </div>
      <div className="flex w-full max-w-3xl flex-1 items-end justify-around gap-2">
        <AnimatePresence>
          {options.map((c, k) =>
            popped === c.name ? null : (
              <motion.button
                key={`${round}-${c.name}`}
                type="button"
                aria-label={`${c.name} balloon`}
                onClick={() => tap(c)}
                className={`h-[min(15rem,32vh)] w-[min(10rem,26vw)] rounded-full ${misses >= 2 && c.name === target.name ? 'lt-hint-pulse' : ''}`}
                initial={reduce ? false : { y: 200, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { y: [0, -14, 0], opacity: 1, transition: { y: { duration: 2.4 + k * 0.4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.4 } } }}
                exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.25 } }}
              >
                <Balloon color={c.hex} />
              </motion.button>
            ),
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- Paint it! ---------------- */
type Region = { id: string; d: string; start: string };
/** Circle path centred on (x, y). */
const circle = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
const pictures: Record<string, Region[]> = {
  house: [
    { id: 'sky', d: 'M0 0h200v110H0z', start: '#ffffff' },
    { id: 'sun', d: circle(160, 28, 15), start: '#ffffff' },
    { id: 'grass', d: 'M0 110q100-20 200 0v50H0z', start: '#ffffff' },
    { id: 'wall', d: 'M50 80h80v60H50z', start: '#ffffff' },
    { id: 'roof', d: 'M40 82l50-42 50 42z', start: '#ffffff' },
    { id: 'door', d: 'M82 104h18v36H82z', start: '#ffffff' },
    { id: 'window', d: 'M58 92h16v16H58zM108 92h16v16h-16z', start: '#ffffff' },
    { id: 'tree', d: circle(168, 72, 17) + circle(154, 86, 12) + circle(182, 86, 12), start: '#ffffff' },
    { id: 'trunk', d: 'M163 92h10v40h-10z', start: '#ffffff' },
    { id: 'flower', d: circle(24, 130, 7) + circle(38, 124, 7), start: '#ffffff' },
  ],
  fish: [
    { id: 'water', d: 'M0 0h200v160H0z', start: '#ffffff' },
    { id: 'body', d: 'M40 80q50-50 100 0q-50 50-100 0z', start: '#ffffff' },
    { id: 'tail', d: 'M138 80l40-28v56z', start: '#ffffff' },
    { id: 'fin', d: 'M80 56q14-20 30-4z', start: '#ffffff' },
    { id: 'stripe', d: 'M92 44q10 36 0 72q-8-4-10-36t10-36z', start: '#ffffff' },
    { id: 'sand', d: 'M0 140q100-14 200 0v20H0z', start: '#ffffff' },
    { id: 'shell', d: 'M30 150l-12-14q12-16 24 0z', start: '#ffffff' },
  ],
};

export function PaintIt() {
  const reduce = useReducedMotion();
  const [picture, setPicture] = useState<'house' | 'fish'>('house');
  const [brush, setBrush] = useState(colours[0]!);
  const [fills, setFills] = useState<Record<string, string>>({});
  const regions = pictures[picture]!;
  const painted = regions.filter((r) => fills[r.id]).length;
  const done = painted === regions.length;

  useEffect(() => {
    if (!done) return;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(3);
    AudioManager.say(strings.colours.beautiful, { role: 'quizHost', delivery: 'excited', talker: 'pip' });
  }, [done]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-3 px-3 pb-4 lg:flex-row lg:items-start">
      {done && <Celebration count={18} />}
      <h1 className="sr-only">{strings.colours.paint}</h1>
      <div className="w-full lg:w-3/4">
        <svg viewBox="0 0 200 160" className="w-full rounded-blob border-[5px] border-outline bg-white" role="img" aria-label={strings.colours.paint} stroke="var(--outline)" strokeWidth="3" strokeLinejoin="round">
          {regions.map((r) => (
            <motion.path
              key={`${picture}-${r.id}`}
              d={r.d}
              fill={fills[r.id] ?? r.start}
              animate={reduce ? undefined : { fill: fills[r.id] ?? r.start }}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`paint the ${r.id}`}
              tabIndex={0}
              onClick={() => {
                setFills((f) => ({ ...f, [r.id]: brush.hex }));
                AudioManager.sfx('pop', 'ui');
              }}
              onKeyDown={(e) => e.key === 'Enter' && setFills((f) => ({ ...f, [r.id]: brush.hex }))}
            />
          ))}
        </svg>
      </div>
      <div className="flex w-full flex-col items-center gap-3 lg:w-1/4">
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-2" role="group" aria-label={strings.colours.pickPaint}>
          {colours.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-label={c.name}
              aria-pressed={brush.name === c.name}
              onClick={() => {
                setBrush(c);
                AudioManager.say(cap(c.name), { role: 'teacher', talker: 'zig' });
              }}
              className={`h-[72px] w-[72px] rounded-full border-[5px] border-outline shadow-[0_4px_0_var(--outline)] transition-transform ${brush.name === c.name ? 'scale-110 ring-4 ring-accent' : ''}`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {(['house', 'fish'] as const).map((p) => (
            <button key={p} type="button" onClick={() => { setPicture(p); setFills({}); }} aria-pressed={picture === p} aria-label={p} className={`h-[72px] w-[72px] rounded-2xl border-4 border-outline bg-surface p-2 ${picture === p ? 'ring-4 ring-accent' : ''}`}>
              <Prop id={p} />
            </button>
          ))}
          <button type="button" onClick={() => setFills({})} className="h-[72px] rounded-2xl border-4 border-outline bg-surface px-3 font-ui font-bold">{strings.colours.clear}</button>
        </div>
      </div>
    </div>
  );
}
