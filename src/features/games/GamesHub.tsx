import { useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { Prop } from '@/art/props';
import { strings } from '@/strings';

const MatchIcon = () => (
  <svg viewBox="0 0 64 64" aria-hidden fill="none" stroke="var(--outline)" strokeWidth="4" strokeLinejoin="round">
    <rect x="6" y="12" width="24" height="34" rx="5" fill="#fff4e3" />
    <rect x="34" y="18" width="24" height="34" rx="5" fill="#fff4e3" transform="rotate(8 46 35)" />
    <circle cx="18" cy="29" r="6" fill="#ff8a6b" />
    <circle cx="46" cy="35" r="6" fill="#ff8a6b" />
  </svg>
);

export function GamesHub() {
  const navigate = useNavigate();
  const games = [
    { to: 'catch', label: strings.games.catch, icon: <Prop id="basket" />, tint: '#dff5d8' },
    { to: 'match', label: strings.games.matchLabel, icon: <MatchIcon />, tint: '#ffe1d6' },
    { to: '/letters/bubbles', label: strings.letters.falling, icon: <Prop id="balloon" />, tint: '#efe2ff' },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.games}</h1>
      <CharacterHost character="coco" expression="happy" size={130} />
      <div className="flex flex-wrap justify-center gap-5">
        {games.map((g) => (
          <BigButton key={g.to} size="huge" showLabel label={g.label} icon={g.icon} tint={g.tint} onClick={() => navigate(g.to)} />
        ))}
      </div>
    </div>
  );
}
