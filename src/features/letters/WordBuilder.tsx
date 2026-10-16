import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Celebration } from '@/components/Celebration';
import { Prop } from '@/art/props';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { words as builtIn } from '@/content/loaders';
import { strings } from '@/strings';
import { useTypingKeys } from './keys';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { sayLetterName } from './letterAudio';

type Choice = { word: string; prop?: string; audio?: string; kind: 'name' | 'custom' | 'built-in' | 'free' };

const clean = (w: string) => w.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 14);

/** Says a whole word: recorded clip for built-in words, otherwise the device voice. */
function sayWord(c: Choice, onEnd?: () => void, queue = false) {
  const text = c.word.charAt(0) + c.word.slice(1).toLowerCase();
  AudioManager.say(`${text}!`, { channel: 'letters', role: 'teacher', delivery: 'proud', src: c.audio, onEnd, queue });
}

const Speaker = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
    <path d="M10 24h10l14-12v40L20 40H10z" fill="#ffcb47" />
    <path d="M42 22q8 10 0 20M48 16q14 16 0 32" />
  </svg>
);
const Pencil = () => (
  <svg viewBox="0 0 64 64" fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round" aria-hidden>
    <path d="M14 50l4-14 28-28 10 10-28 28z" fill="#ffcb47" />
    <path d="M14 50l14-4" />
  </svg>
);

/**
 * Word builder: the child builds a word letter by letter (their name, a word a
 * grown-up typed in, or a picture word), then hears the whole word. "Free typing"
 * lets the child type any letters and hear them read as a word.
 */
export function WordBuilder() {
  const reduce = useReducedMotion();
  const childName = useSettings((s) => s.childName);
  const customWords = useSettings((s) => s.customWords);
  const setSettings = useSettings((s) => s.set);
  const [draft, setDraft] = useState('');

  const choices = useMemo<Choice[]>(() => {
    const list: Choice[] = [];
    if (clean(childName)) list.push({ word: clean(childName), kind: 'name' });
    for (const w of customWords) if (clean(w)) list.push({ word: clean(w), kind: 'custom' });
    for (const w of builtIn) list.push({ word: w.word.toUpperCase(), prop: w.prop, audio: w.audio, kind: 'built-in' });
    return list;
  }, [childName, customWords]);

  const [choice, setChoice] = useState<Choice>(() => choices[0] ?? { word: 'CAT', kind: 'built-in' });
  const [pos, setPos] = useState(0);
  const [typed, setTyped] = useState('');
  const [pressed, setPressed] = useState<{ key: string; n: number } | null>(null);
  const free = choice.kind === 'free';
  const target = free ? null : (choice.word[pos] ?? null);
  const done = !free && pos >= choice.word.length;

  const pick = (c: Choice) => {
    setChoice(c);
    setPos(0);
    setTyped('');
    if (c.kind !== 'free') sayWord(c, () => sayLetterName(c.word[0]!));
  };

  useEffect(() => {
    if (!done) return;
    AudioManager.sfx('tada');
    useProgress.getState().addStars(2);
    // Said after the last letter's name has finished.
    sayWord(choice, undefined, true);
  }, [done, choice]);

  const press = (k: string) => {
    setPressed((p) => ({ key: k, n: (p?.n ?? 0) + 1 }));
    if (free) {
      if (k === 'BACKSPACE') return setTyped((t) => t.slice(0, -1));
      if (!/^[A-Z]$/.test(k) || typed.length >= 14) return;
      AudioManager.sfx('pop', 'ui');
      sayLetterName(k);
      return setTyped((t) => t + k);
    }
    if (k === 'BACKSPACE') return;
    // Finished: the next key press starts the same word again (no automatic repeats).
    if (done) return setPos(0);
    if (k === target) {
      AudioManager.sfx('chime');
      useProgress.getState().practiseLetter(k);
      setPos((p) => p + 1);
      sayLetterName(k);
    } else if (target) {
      sayLetterName(target);
    }
  };
  useTypingKeys(press, true, { backspace: free });

  const addWord = (e: FormEvent) => {
    e.preventDefault();
    const w = clean(draft);
    if (!w) return;
    if (!customWords.map(clean).includes(w)) setSettings({ customWords: [w.toLowerCase(), ...customWords].slice(0, 30) });
    setDraft('');
    pick({ word: w, kind: 'custom' });
  };

  const letters = free ? typed.split('') : choice.word.split('');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-4 px-3 pb-6">
      {done && <Celebration count={18} />}
      <h1 className="sr-only">{strings.letters.name}</h1>

      {/* Word picker: name, grown-up words, picture words, free typing */}
      <div className="-mx-3 flex w-[calc(100%+1.5rem)] gap-2 overflow-x-auto px-3 pb-2" role="group" aria-label={strings.letters.pickWord}>
        <button type="button" onClick={() => pick({ word: '', kind: 'free' })} aria-pressed={free} aria-label={strings.letters.freeTyping}
          className={`flex h-[72px] shrink-0 items-center gap-2 rounded-full border-4 border-outline px-3 font-ui font-bold shadow-[0_4px_0_var(--outline)] ${free ? 'bg-accent text-[#2b1d16]' : 'bg-surface text-text'}`}>
          <span className="h-10 w-10"><Pencil /></span>
          <span className="hidden sm:inline">{strings.letters.freeTyping}</span>
        </button>
        {choices.map((c) => (
          <button key={`${c.kind}-${c.word}`} type="button" onClick={() => pick(c)} aria-pressed={choice.word === c.word && !free} aria-label={c.word.toLowerCase()}
            className={`flex h-[72px] shrink-0 items-center gap-2 rounded-full border-4 border-outline px-3 font-story text-xl font-bold shadow-[0_4px_0_var(--outline)] ${choice.word === c.word && !free ? 'bg-accent text-[#2b1d16]' : 'bg-surface text-text'}`}>
            {c.prop && <span className="h-10 w-10"><Prop id={c.prop} /></span>}
            <span>{c.word.toLowerCase()}</span>
          </button>
        ))}
      </div>

      {/* The word being built */}
      <div className="flex min-h-[7rem] flex-wrap items-center justify-center gap-2" aria-live="polite">
        {!free && choice.prop && (
          <motion.div key={`${choice.word}-pic`} initial={reduce ? false : { scale: 0.6 }} animate={done && !reduce ? { scale: [1, 1.2, 1] } : { scale: 1 }} className="h-24 w-24 sm:h-28 sm:w-28">
            <Prop id={choice.prop} title={choice.word.toLowerCase()} />
          </motion.div>
        )}
        {letters.length === 0 && free && <p className="font-ui text-2xl opacity-70">{strings.letters.typeAnything}</p>}
        {letters.map((ch, i) => (
          <motion.span
            key={`${choice.word}-${ch}-${i}-${free || i < pos}`}
            initial={free && !reduce ? { y: -20, opacity: 0 } : false}
            animate={!free && i < pos && !reduce ? { y: [0, -14, 0] } : { y: 0, opacity: 1 }}
            className={`flex h-20 w-16 items-center justify-center rounded-2xl border-[5px] font-story text-5xl font-bold sm:h-28 sm:w-24 sm:text-7xl ${
              free || i < pos ? 'border-outline bg-accent text-[#2b1d16]' : i === pos ? 'border-dashed border-outline text-text/50' : 'border-dashed border-outline/40 text-text/25'
            }`}
          >
            {ch.toLowerCase()}
          </motion.span>
        ))}
        {(free ? typed.length > 0 : done) && (
          <button type="button" onClick={() => sayWord(free ? { word: typed, kind: 'free' } : choice)} aria-label={strings.letters.sayWord}
            className="ml-2 h-20 w-20 rounded-blob border-[5px] border-outline bg-surface p-3 shadow-[0_6px_0_var(--outline)]">
            <Speaker />
          </button>
        )}
      </div>

      <OnScreenKeyboard target={target} hint={!free} pressed={pressed} onKey={press} letterCase="upper" />
      {free && (
        <button type="button" onClick={() => press('BACKSPACE')} className="rounded-full border-4 border-outline bg-surface px-5 py-2 font-ui font-bold">
          {strings.letters.rubOut}
        </button>
      )}

      {/* Grown-up: type a word to practise (saved on this device) */}
      <form onSubmit={addWord} className="mt-2 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-surface/80 px-3 py-2 font-ui text-sm">
        <label htmlFor="new-word" className="font-bold">{strings.letters.grownUpWord}</label>
        <input id="new-word" value={draft} maxLength={14} autoComplete="off" onChange={(e) => setDraft(e.target.value.replace(/[^A-Za-z]/g, ''))}
          className="w-36 rounded-lg border-2 border-outline bg-surface px-2 py-1 text-base text-text" />
        <button type="submit" className="rounded-lg border-2 border-outline bg-primary px-3 py-1 font-bold text-on-primary">{strings.letters.addWord}</button>
      </form>
    </div>
  );
}
