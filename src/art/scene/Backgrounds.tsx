import { useId } from 'react';

/**
 * Story background presets on a 160×100 grid, drawn in the shared outline style.
 * Gentle ambient motion comes from CSS classes (lt-drift, lt-twinkle, lt-sway,
 * lt-wave, lt-spin) that switch off with reduced motion.
 */
export const backgrounds = [
  'meadow-day',
  'meadow-sunset',
  'forest',
  'forest-night',
  'night-sky',
  'sea',
  'beach',
  'bedroom',
  'kitchen',
  'farm',
  'city',
  'rain',
  'snow',
] as const;
export type Background = (typeof backgrounds)[number];

/** Older backdrop names map onto the new presets. */
export const legacyBackground: Record<string, Background> = {
  meadow: 'meadow-day',
  night: 'night-sky',
  sea: 'sea',
  beach: 'beach',
  forest: 'forest',
  room: 'bedroom',
  village: 'city',
  snow: 'snow',
};

export const resolveBackground = (name?: string): Background =>
  (backgrounds as readonly string[]).includes(name ?? '') ? (name as Background) : (legacyBackground[name ?? ''] ?? 'meadow-day');

const O = '#4a2f27';

const Cloud = ({ x, y, s = 1, dur = 60, delay = 0, color = '#fff' }: { x: number; y: number; s?: number; dur?: number; delay?: number; color?: string }) => (
  <g className="lt-drift" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
    <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 10q-6 0-5-6q1-5 7-4q1-6 8-6q6 0 7 5q7-2 8 4q5 1 2 7z" fill={color} />
  </g>
);

const Stars = ({ n = 14 }: { n?: number }) => (
  <g fill="#f7e27a" stroke="none">
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} className="lt-twinkle" style={{ animationDelay: `${(i * 0.37) % 3}s` }} cx={(i * 47) % 160} cy={4 + ((i * 23) % 44)} r={i % 3 === 0 ? 1.6 : 1} />
    ))}
  </g>
);

const Grass = ({ y, color }: { y: number; color: string }) => (
  <g stroke={color} strokeWidth={1.2} fill="none">
    {[8, 30, 52, 74, 96, 118, 140].map((x, i) => (
      <path key={x} className="lt-sway" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px ${y}px` }} d={`M${x} ${y}q-1-4 1-7M${x + 2} ${y}q1-3 3-5`} />
    ))}
  </g>
);

const Flowers = ({ y }: { y: number }) => (
  <g strokeWidth={0.8}>
    {[[20, '#ff8fb8'], [62, '#ffcb47'], [110, '#c9a0ff'], [148, '#ff8a6b']].map(([x, c]) => (
      <g key={x as number} className="lt-sway" style={{ transformOrigin: `${x}px ${y}px` }}>
        <path d={`M${x} ${y}v-5`} stroke="#3f9a3a" />
        <circle cx={x as number} cy={y - 6} r={2} fill={c as string} />
        <circle cx={x as number} cy={y - 6} r={0.8} fill="#ffcb47" stroke="none" />
      </g>
    ))}
  </g>
);

const Tree = ({ x, y, s = 1, c = '#5aae4b' }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-2.5" y="0" width="5" height="16" fill="#8b5a3c" />
    <g className="lt-sway" style={{ transformOrigin: '0px 4px' }}>
      <circle cx="0" cy="-4" r="11" fill={c} />
      <circle cx="-7" cy="1" r="7" fill={c} />
      <circle cx="7" cy="1" r="7" fill={c} />
    </g>
  </g>
);

const House = ({ x, roof }: { x: number; roof: string }) => (
  <g>
    <path d={`M${x - 16} 58l16-14 16 14`} fill={roof} />
    <rect x={x - 13} y="56" width="26" height="22" fill="#fff4e3" />
    <rect x={x - 4} y="64" width="8" height="14" fill="#8b5a3c" />
    <rect x={x - 10} y="60" width="5" height="5" fill="#bfe6ff" />
  </g>
);

function Sky({ id, top, bottom }: { id: string; top: string; bottom: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="160" height="100" fill={`url(#${id})`} stroke="none" />
    </>
  );
}

const Sun = ({ x, y, r = 9, c = '#ffcb47' }: { x: number; y: number; r?: number; c?: string }) => (
  <g>
    <g className="lt-spin" style={{ transformOrigin: `${x}px ${y}px` }} stroke={c} strokeWidth={1.2}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const rad = (a * Math.PI) / 180;
        return <path key={a} d={`M${x + Math.cos(rad) * (r + 3)} ${y + Math.sin(rad) * (r + 3)}L${x + Math.cos(rad) * (r + 7)} ${y + Math.sin(rad) * (r + 7)}`} />;
      })}
    </g>
    <circle cx={x} cy={y} r={r} fill={c} />
  </g>
);

export function BackgroundArt({ name }: { name: Background }) {
  const g = useId().replace(/:/g, '');
  switch (name) {
    case 'meadow-sunset':
      return (
        <>
          <Sky id={g} top="#ffb38a" bottom="#ffe1b3" />
          <circle cx="118" cy="56" r="14" fill="#ff8a6b" />
          <Cloud x={20} y={14} color="#ffd7c4" />
          <path d="M0 66q40-20 90-6t70-6v46H0z" fill="#b48ad6" />
          <path d="M0 80q50-14 100 0t60-4v24H0z" fill="#8a6bc0" />
          <Grass y={92} color="#6a4fa0" />
        </>
      );
    case 'forest':
      return (
        <>
          <Sky id={g} top="#d6f1d8" bottom="#eef8e2" />
          <Cloud x={40} y={8} s={0.8} />
          {[6, 34, 62, 90, 118, 146].map((x, i) => <Tree key={x} x={x} y={44 + (i % 2) * 3} s={1.1} c={i % 2 ? '#4f9e45' : '#5aae4b'} />)}
          <path d="M0 78q80-10 160 0v22H0z" fill="#6cbf4b" />
          <Grass y={92} color="#3f8a35" />
        </>
      );
    case 'forest-night':
      return (
        <>
          <Sky id={g} top="#141331" bottom="#263a4a" />
          <Stars n={10} />
          <path d="M126 10a11 11 0 1 0 9 18a9 9 0 1 1-9-18z" fill="#f7e27a" />
          {[6, 34, 62, 90, 118, 146].map((x, i) => <Tree key={x} x={x} y={46 + (i % 2) * 3} s={1.1} c={i % 2 ? '#2f5a3c' : '#355f40'} />)}
          <path d="M0 78q80-10 160 0v22H0z" fill="#233c33" />
        </>
      );
    case 'night-sky':
      return (
        <>
          <Sky id={g} top="#141331" bottom="#2c2a5a" />
          <Stars n={18} />
          <path d="M126 10a11 11 0 1 0 9 18a9 9 0 1 1-9-18z" fill="#f7e27a" />
          <path d="M0 74q40-20 90-6t70-4v36H0z" fill="#2c4a3e" />
          <path d="M0 86q50-12 100 0t60-2v16H0z" fill="#233c33" />
        </>
      );
    case 'sea':
      return (
        <>
          <Sky id={g} top="#7fd8e6" bottom="#2f8fb8" />
          <g fill="#fff" opacity="0.12" stroke="none">
            {[20, 60, 100, 140].map((x) => <path key={x} className="lt-sway" style={{ transformOrigin: `${x}px 0px` }} d={`M${x} 0l8 0-18 100h-6z`} />)}
          </g>
          <path d="M0 88q40-8 80 0t80 0v12H0z" fill="#f7dfa0" />
          {[14, 36, 128, 150].map((x, i) => (
            <path key={x} className="lt-sway" style={{ transformOrigin: `${x}px 90px`, animationDelay: `${i * 0.5}s` }} d={`M${x} 90q-4-10 0-16t0-14`} fill="none" stroke="#3f9a3a" strokeWidth={2.4} />
          ))}
        </>
      );
    case 'beach':
      return (
        <>
          <Sky id={g} top="#9fdcff" bottom="#dff3ff" />
          <Sun x={132} y={18} />
          <Cloud x={24} y={12} />
          <rect y="50" width="160" height="22" fill="#4fb5d8" />
          <path className="lt-wave" d="M-20 52q10-3 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" strokeWidth={1.4} />
          <path d="M0 68q40-6 80 0t80 0v32H0z" fill="#f7dfa0" />
        </>
      );
    case 'bedroom':
      return (
        <>
          <rect width="160" height="100" fill="#ffe9cc" />
          <path d="M0 0h160v6H0z" fill="#ffd9a8" />
          <rect x="16" y="14" width="34" height="28" rx="3" fill="#2c2a5a" />
          <Stars n={5} />
          <path d="M33 14v28M16 28h34" fill="none" />
          <rect x="110" y="16" width="22" height="18" rx="2" fill="#c9e7ff" />
          <path d="M114 30l5-7 4 4 5-6 2 9z" fill="#6cbf4b" strokeWidth={0.8} />
          <rect y="74" width="160" height="26" fill="#d9a066" />
          <ellipse cx="80" cy="88" rx="40" ry="7" fill="#ff9fc4" />
        </>
      );
    case 'kitchen':
      return (
        <>
          <rect width="160" height="100" fill="#fff6e6" />
          <g stroke="#f0dcc0" strokeWidth={0.6}>{[10, 20, 30, 40, 50, 60].map((y) => <path key={y} d={`M0 ${y}h160`} />)}</g>
          <rect x="60" y="10" width="40" height="28" rx="3" fill="#bfe6ff" />
          <path d="M80 10v28M60 24h40" fill="none" />
          <rect y="66" width="160" height="34" fill="#c98c4a" />
          <rect y="62" width="160" height="6" fill="#efe2cf" />
        </>
      );
    case 'farm':
      return (
        <>
          <Sky id={g} top="#9fdcff" bottom="#e2f5ff" />
          <Sun x={20} y={18} />
          <Cloud x={70} y={10} />
          <path d="M0 70q60-14 160-4v34H0z" fill="#8fd18a" />
          <path d="M100 66V40l18-12 18 12v26z" fill="#e8553f" />
          <rect x="112" y="50" width="12" height="16" fill="#fff4e3" />
          <path d="M112 50l12 16M124 50l-12 16" fill="none" strokeWidth={0.8} />
          <g stroke={O} strokeWidth={1}>{[4, 18, 32, 46, 60, 74].map((x) => <path key={x} d={`M${x} 82v-12`} />)}<path d="M0 74h80M0 79h80" /></g>
          <Grass y={94} color="#4f9e45" />
        </>
      );
    case 'city':
      return (
        <>
          <Sky id={g} top="#ffe7c2" bottom="#fff4e0" />
          <Sun x={24} y={18} r={8} />
          <Cloud x={90} y={10} s={0.8} />
          <House x={30} roof="#e8553f" />
          <House x={80} roof="#5ab6e8" />
          <House x={128} roof="#9b6bd6" />
          <rect y="78" width="160" height="22" fill="#c9a06a" />
        </>
      );
    case 'rain':
      return (
        <>
          <Sky id={g} top="#9fb0c4" bottom="#d6e0ea" />
          <Cloud x={14} y={10} s={1.3} color="#e4e9ef" dur={90} />
          <Cloud x={90} y={16} s={1.1} color="#eef2f6" dur={80} delay={-30} />
          <path d="M0 74q60-10 160 0v26H0z" fill="#7fb07a" />
          <ellipse cx="50" cy="88" rx="16" ry="3" fill="#8fc0e0" />
          <ellipse cx="120" cy="92" rx="12" ry="2.5" fill="#8fc0e0" />
        </>
      );
    case 'snow':
      return (
        <>
          <Sky id={g} top="#cfe6ff" bottom="#f0f7ff" />
          <Cloud x={30} y={10} />
          <path d="M0 68q40-16 90-4t70-4v40H0z" fill="#ffffff" />
          <Tree x={130} y={58} s={0.9} c="#4f9e45" />
          <path d="M120 48q10-8 20 0" fill="#fff" />
        </>
      );
    default:
      return (
        <>
          <Sky id={g} top="#a9dcff" bottom="#e3f4ff" />
          <Sun x={134} y={18} />
          <Cloud x={20} y={12} />
          <Cloud x={80} y={20} s={0.8} dur={80} delay={-25} />
          <path d="M0 70q40-24 90-6t70-6v42H0z" fill="#8fd18a" />
          <path d="M0 82q50-14 100 0t60-4v22H0z" fill="#6cbf4b" />
          <Flowers y={90} />
          <Grass y={96} color="#3f8a35" />
        </>
      );
  }
}

export function Background({ name }: { name?: string }) {
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden stroke={O} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round">
      <BackgroundArt name={resolveBackground(name)} />
    </svg>
  );
}
