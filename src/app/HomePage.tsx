import { useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { ThemePicker } from '@/components/ThemePicker';
import { AbcIcon, BookIcon, LockIcon, MusicIcon, NumbersIcon, StarIcon } from '@/art/Icons';
import { strings } from '@/strings';

const destinations = [
  { to: '/stories', label: strings.nav.stories, icon: <BookIcon /> },
  { to: '/letters', label: strings.nav.letters, icon: <AbcIcon /> },
  { to: '/numbers', label: strings.nav.numbers, icon: <NumbersIcon /> },
  { to: '/songs', label: strings.nav.songs, icon: <MusicIcon /> },
  { to: '/stickers', label: strings.nav.stickers, icon: <StarIcon /> },
];

export function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="sr-only">{strings.appName}</h1>
      <CharacterHost expression="happy" size={150} />
      <div className="flex max-w-4xl flex-wrap justify-center gap-6 sm:gap-8">
        {destinations.map((d) => (
          <BigButton
            key={d.to}
            size="huge"
            label={d.label}
            icon={d.icon}
            onClick={() => navigate(d.to)}
          />
        ))}
      </div>
      <ThemePicker />
      <div className="absolute right-4 top-4">
        <BigButton
          size="tap"
          label={strings.nav.grownUps}
          icon={<LockIcon />}
          onClick={() => navigate('/grown-ups')}
        />
      </div>
    </div>
  );
}
