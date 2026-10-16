import { letters } from '@/content/loaders';
import { AudioManager } from '@/services/AudioManager';
import { strings } from '@/strings';
import { fallbackSound } from './keys';

export const letterEntry = (l: string) => letters.find((x) => x.letter === l)!;

/** "A! A says /a/ like apple!" using recorded name/sound/word clips when available. */
export function introduceLetter(l: string, onEnd?: () => void) {
  const e = letterEntry(l);
  AudioManager.say(strings.letters.says(l, fallbackSound[l] ?? l, e.word), {
    channel: 'letters',
    role: 'teacher',
    delivery: 'excited',
    src: e.audio.name,
    onEnd,
  });
}

export function sayLetterName(l: string, onEnd?: () => void) {
  AudioManager.say(l, { channel: 'letters', role: 'teacher', src: letterEntry(l).audio.name, onEnd });
}

export function sayLetterSoundAndWord(l: string) {
  const e = letterEntry(l);
  AudioManager.say(`${fallbackSound[l]}, ${e.word}`, { channel: 'letters', role: 'teacher', delivery: 'proud', src: e.audio.sound });
}
