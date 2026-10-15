import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AudioManager } from '@/services/AudioManager';
import { BigButton } from '@/components/BigButton';
import { strings } from '@/strings';
import { ALPHABET } from './keys';

/**
 * Alphabet song to the traditional public-domain tune (the same melody as
 * "Twinkle, Twinkle"). Each letter lights up in time with the beat.
 * Beats per letter follow the classic phrasing: A B C D E F G, H I J K L M N O P, ...
 */
const BEATS = [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2];
const BPM = 96;

const PlayIcon = ({ playing }: { playing: boolean }) => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <circle cx="32" cy="32" r="26" fill="#8fd18a" />
    {playing ? <path d="M24 20v24M40 20v24" /> : <path d="M26 18l20 14-20 14z" fill="#fff" />}
  </svg>
);

export function AlphabetSong() {
  const [lit, setLit] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    AudioManager.stopMusic();
    setPlaying(false);
    setLit(-1);
  };

  const play = () => {
    stop();
    setPlaying(true);
    AudioManager.music('audio/music/twinkle.mp3');
    let t = 50;
    BEATS.forEach((b, i) => {
      timers.current.push(setTimeout(() => setLit(i), t));
      t += (b * 60000) / BPM;
    });
    timers.current.push(setTimeout(stop, t + 1500));
  };

  useEffect(() => () => stop(), []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <h1 className="sr-only">{strings.letters.song}</h1>
      <div className="grid max-w-5xl grid-cols-7 gap-2 sm:gap-4">
        {ALPHABET.map((l, i) => (
          <motion.button
            type="button"
            key={l}
            aria-label={l}
            onClick={() => AudioManager.say(l, { channel: 'letters' })}
            animate={lit === i ? { scale: 1.3, y: -8 } : { scale: 1, y: 0 }}
            className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-outline font-story text-4xl font-bold sm:h-24 sm:w-24 sm:text-6xl ${lit === i ? 'bg-accent text-[#2b1d16]' : 'bg-surface text-text'}`}
          >
            {l}
          </motion.button>
        ))}
      </div>
      <BigButton size="big" label={playing ? strings.pause : strings.play} icon={<PlayIcon playing={playing} />} onClick={playing ? stop : play} />
    </div>
  );
}
