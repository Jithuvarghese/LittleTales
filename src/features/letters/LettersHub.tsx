import { useNavigate } from 'react-router-dom';
import { BigButton } from '@/components/BigButton';
import { CharacterHost } from '@/components/CharacterHost';
import { Prop } from '@/art/props';
import { strings } from '@/strings';
import { KeyboardIcon } from '@/art/Icons';

const Glyph = ({ text, bg }: { text: string; bg: string }) => (
  <svg viewBox="0 0 64 64" aria-hidden>
    <rect x="4" y="4" width="56" height="56" rx="14" fill={bg} stroke="var(--outline)" strokeWidth="4" />
    <text x="32" y="44" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#2b1d16" fontFamily="Andika, sans-serif">{text}</text>
  </svg>
);

export function LettersHub() {
  const navigate = useNavigate();
  const modes = [
    { to: 'meet', label: strings.letters.meet, icon: <Glyph text="Aa" bg="#ffcb47" /> },
    { to: 'find', label: strings.letters.find, icon: <KeyboardIcon /> },
    { to: 'bubbles', label: strings.letters.falling, icon: <Prop id="balloon" /> },
    { to: 'name', label: strings.letters.name, icon: <Glyph text="Me" bg="#ff9fc4" /> },
    { to: 'song', label: strings.letters.song, icon: <Prop id="bell" /> },
  ];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <h1 className="sr-only">{strings.nav.letters}</h1>
      <CharacterHost character="zig" expression="happy" size={140} />
      <div className="flex flex-wrap justify-center gap-6">
        {modes.map((m) => (
          <BigButton key={m.to} size="huge" showLabel label={m.label} icon={m.icon} onClick={() => navigate(m.to)} />
        ))}
      </div>
    </div>
  );
}
