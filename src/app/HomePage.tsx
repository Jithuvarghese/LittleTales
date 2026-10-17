import { useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { ThemePicker } from '@/components/ThemePicker';
import { AbcIcon, BookIcon, ColoursIcon, GamesIcon, LockIcon, MusicIcon, NumbersIcon, StarIcon } from '@/art/Icons';
import { AudioManager } from '@/services/AudioManager';
import { useSettings } from './settingsStore';
import { strings } from '@/strings';

const destinations: { to: string; label: string; icon: ReactNode; tint: string }[] = [
  { to: '/stories', label: strings.nav.stories, icon: <BookIcon />, tint: '#ffe1d6' },
  { to: '/letters', label: strings.nav.letters, icon: <AbcIcon />, tint: '#fff1c4' },
  { to: '/numbers', label: strings.nav.numbers, icon: <NumbersIcon />, tint: '#dff5d8' },
  { to: '/colours', label: strings.nav.colours, icon: <ColoursIcon />, tint: '#ffe6f1' },
  { to: '/songs', label: strings.nav.songs, icon: <MusicIcon />, tint: '#efe2ff' },
  { to: '/games', label: strings.nav.games, icon: <GamesIcon />, tint: '#d6f1ff' },
  { to: '/stickers', label: strings.nav.stickers, icon: <StarIcon />, tint: '#fff6c9' },
];

export function HomePage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const bedtime = useSettings((s) => s.bedtime);

  // Quiet birdsong on the home screen (crickets at bedtime).
  useEffect(() => {
    AudioManager.ambience(bedtime ? 'night' : 'birds');
    return () => AudioManager.ambience('none');
  }, [bedtime]);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 pb-10 pt-6">
      <h1 className="sr-only">{strings.appName}</h1>
      <motion.div initial={reduce ? false : { y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-end gap-2">
        <CharacterHost expression="happy" size={130} />
        <span className="mb-10 hidden rounded-[1.5rem] rounded-bl-none border-4 border-outline bg-surface px-4 py-2 font-ui text-2xl font-extrabold text-text shadow-[0_4px_0_var(--outline)] sm:block">
          {strings.appName}
        </span>
      </motion.div>
      <div className="flex w-full max-w-[72rem] flex-wrap justify-center gap-4 sm:gap-6">
        {destinations.map((d, i) => (
          <motion.div
            key={d.to}
            initial={reduce ? false : { y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.08 * i } }}
          >
            <BigButton size="huge" showLabel label={d.label} icon={d.icon} tint={d.tint} onClick={() => navigate(d.to)} />
          </motion.div>
        ))}
      </div>
      <ThemePicker />
      <div className="absolute right-3 top-3">
        <BigButton size="tap" label={strings.nav.grownUps} icon={<LockIcon />} onClick={() => navigate('/grown-ups')} />
      </div>
    </div>
  );
}
