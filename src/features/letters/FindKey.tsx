import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { Prop } from '@/art/props';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { stickerData } from '@/content/loaders';
import { strings } from '@/strings';
import { useTypingKeys } from './keys';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { letterEntry, sayLetterName, sayLetterSoundAndWord } from './letterAudio';
import { GiantLetter, letterOrder } from './MeetLetter';

/** Session length before a sticker and a gentle break suggestion. */
export const SESSION_MS = 4 * 60 * 1000;

type Props = { mode?: 'letters' | 'numbers' };

/** Find the key: a target appears; pressing it (any case) gives cheerful feedback. Wrong keys only hint. */
export function FindKey({ mode = 'letters' }: Props) {
  const reduce = useReducedMotion();
  const path = useSettings((s) => s.learningPath);
  const letterCase = useSettings((s) => s.letterCase);
  const pool = mode === 'letters' ? letterOrder(path) : '0123456789'.split('');
  const [idx, setIdx] = useState(0);
  const [hint, setHint] = useState(false);
  const [pressed, setPressed] = useState<{ key: string; n: number } | null>(null);
  const [streak, setStreak] = useState(0);
  const [party, setParty] = useState(false);
  const [mood, setMood] = useState<'idle' | 'happy' | 'celebrate'>('idle');
  const [sessionDone, setSessionDone] = useState<string | null>(null);
  const started = useRef(Date.now());
  const busy = useRef(false);
  const target = pool[idx % pool.length]!;

  const prompt = (t: string) => {
    if (mode === 'letters') AudioManager.say(strings.letters.findPrompt(t), { channel: 'letters', src: letterEntry(t).audio.name });
    else AudioManager.say(strings.letters.findPrompt(t), { channel: 'letters' });
  };

  useEffect(() => {
    setHint(false);
    const t = setTimeout(() => prompt(target), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  const press = (k: string) => {
    setPressed((p) => ({ key: k, n: (p?.n ?? 0) + 1 }));
    if (busy.current || sessionDone) return;
    if (k === target) {
      busy.current = true;
      AudioManager.sfx('chime');
      setMood('happy');
      const progress = useProgress.getState();
      if (mode === 'letters') {
        progress.practiseLetter(k);
        sayLetterSoundAndWord(k);
      } else {
        progress.practiseNumber(Number(k));
        AudioManager.say(k, { channel: 'letters' });
      }
      progress.addStars(1);
      const s = streak + 1;
      setStreak(s);
      if (s % 4 === 0) {
        setParty(true);
        setMood('celebrate');
        AudioManager.sfx('tada');
      }
      setTimeout(() => {
        setParty(false);
        setMood('idle');
        busy.current = false;
        if (Date.now() - started.current > SESSION_MS) {
          setSessionDone(progress.awardSticker() ?? '');
          AudioManager.say(strings.letters.breakTime);
          return;
        }
        setIdx((i) => i + 1);
      }, 1800);
    } else {
      // No negative sound: highlight the target key and repeat it kindly.
      setHint(true);
      if (mode === 'letters') AudioManager.say(strings.letters.wrongKey(k, target), { channel: 'letters' });
      else sayLetterName(target);
    }
  };
  useTypingKeys(press);

  if (sessionDone !== null) {
    const st = stickerData.stickers.find((s) => s.id === sessionDone);
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        <Celebration />
        <CharacterHost character="zig" expression="celebrate" size={180} />
        <p className="font-ui text-4xl font-bold">{strings.letters.breakTime}</p>
        {st && <div className="h-32 w-32"><Prop id={st.prop} title={st.label} /></div>}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 p-4">
      {party && <Celebration />}
      <h1 className="sr-only">{mode === 'letters' ? strings.letters.find : strings.numbers.find}</h1>
      <div className="flex items-center gap-6">
        <CharacterHost character={mode === 'letters' ? 'zig' : 'bumble'} expression={mood} size={140} />
        <motion.button
          type="button"
          key={`${target}-${streak}`}
          onClick={() => prompt(target)}
          aria-label={strings.letters.findPrompt(target)}
          animate={reduce ? undefined : mood !== 'idle' ? { rotate: [0, -10, 10, -6, 0], scale: [1, 1.2, 1] } : { scale: [0.6, 1] }}
        >
          {mode === 'letters' ? <GiantLetter l={target} /> : <span className="font-story font-bold" style={{ fontSize: 'clamp(10rem, 30vw, 22rem)' }}>{target}</span>}
        </motion.button>
        {mode === 'letters' && mood !== 'idle' && (
          <div className="h-28 w-28"><Prop id={letterEntry(target).prop} title={letterEntry(target).word} /></div>
        )}
      </div>
      <OnScreenKeyboard target={target} hint={hint} pressed={pressed} onKey={press} numbers={mode === 'numbers'} letters={mode === 'letters'} letterCase={letterCase === 'lower' ? 'lower' : 'upper'} />
    </div>
  );
}
