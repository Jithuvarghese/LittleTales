import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterHost } from '@/components/CharacterHost';
import { Celebration } from '@/components/Celebration';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from '@/app/settingsStore';
import { useProgress } from '@/features/rewards/progressStore';
import { strings } from '@/strings';
import { useTypingKeys } from './keys';
import { OnScreenKeyboard } from './OnScreenKeyboard';
import { sayLetterName } from './letterAudio';

/** The child builds their own name letter by letter, with the next key highlighted. */
export function NameBuilder() {
  const name = useSettings((s) => s.childName).toUpperCase().replace(/[^A-Z]/g, '');
  const [pos, setPos] = useState(0);
  const [pressed, setPressed] = useState<{ key: string; n: number } | null>(null);
  const done = name.length > 0 && pos >= name.length;
  const target = name[pos] ?? null;

  useEffect(() => {
    if (!name) AudioManager.say(strings.letters.noName);
    else if (target) setTimeout(() => sayLetterName(target), 300);
  }, [name, target]);

  useEffect(() => {
    if (!done) return;
    AudioManager.sfx('tada');
    AudioManager.say(`${useSettings.getState().childName}! ${strings.praise[4]}`);
    useProgress.getState().addStars(3);
  }, [done]);

  const press = (k: string) => {
    setPressed((p) => ({ key: k, n: (p?.n ?? 0) + 1 }));
    // After finishing, the next key press starts the name again (no automatic repeats).
    if (done) {
      setPos(0);
      return;
    }
    if (!target) return;
    if (k === target) {
      AudioManager.sfx('chime');
      sayLetterName(k);
      setPos((p) => p + 1);
    } else {
      sayLetterName(target);
    }
  };
  useTypingKeys(press);

  if (!name)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
        <CharacterHost character="zig" expression="thinking" size={180} />
        <p className="max-w-xl font-ui text-3xl">{strings.letters.noName}</p>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 p-4">
      {done && <Celebration count={24} />}
      <h1 className="sr-only">{strings.letters.name}</h1>
      <div className="flex flex-wrap justify-center gap-2" aria-live="polite">
        {name.split('').map((ch, i) => (
          <motion.span
            key={`${ch}-${i}-${i < pos}`}
            animate={i < pos ? { y: [0, -20, 0] } : undefined}
            className={`flex h-24 w-20 items-center justify-center rounded-2xl border-[5px] font-story text-6xl font-bold sm:h-32 sm:w-28 sm:text-8xl ${
              i < pos ? 'border-outline bg-accent text-[#2b1d16]' : i === pos ? 'border-dashed border-outline text-text/40' : 'border-dashed border-outline/40 text-text/20'
            }`}
          >
            {ch}
          </motion.span>
        ))}
      </div>
      <OnScreenKeyboard target={target} hint pressed={pressed} onKey={press} />
    </div>
  );
}
