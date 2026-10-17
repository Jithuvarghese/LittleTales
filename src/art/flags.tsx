import { useId, type ReactNode } from 'react';

/**
 * National flags drawn as code on a 30×20 grid (3:2), with official colours.
 * A few complex emblems are simplified for small screens.
 */
const star = (cx: number, cy: number, r: number, rot = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = ((i * 36 + rot - 90) * Math.PI) / 180;
    const rr = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return <polygon points={pts.join(' ')} />;
};
const h3 = (a: string, b: string, c: string) => (
  <>
    <rect width="30" height="6.67" fill={a} />
    <rect y="6.67" width="30" height="6.67" fill={b} />
    <rect y="13.33" width="30" height="6.67" fill={c} />
  </>
);
const v3 = (a: string, b: string, c: string) => (
  <>
    <rect width="10" height="20" fill={a} />
    <rect x="10" width="10" height="20" fill={b} />
    <rect x="20" width="10" height="20" fill={c} />
  </>
);
const nordic = (bg: string, cross: string, inner?: string) => (
  <>
    <rect width="30" height="20" fill={bg} />
    <rect x="8" width={inner ? 6 : 4} height="20" fill={cross} />
    <rect y={inner ? 7 : 8} width="30" height={inner ? 6 : 4} fill={cross} />
    {inner && (
      <>
        <rect x="9.5" width="3" height="20" fill={inner} />
        <rect y="8.5" width="30" height="3" fill={inner} />
      </>
    )}
  </>
);

export const flagArt: Record<string, ReactNode> = {
  india: (
    <>
      {h3('#FF9933', '#FFFFFF', '#138808')}
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" strokeWidth="0.45" />
      <g stroke="#000080" strokeWidth="0.18">
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          return <line key={i} x1="15" y1="10" x2={15 + Math.cos(a) * 2.5} y2={10 + Math.sin(a) * 2.5} />;
        })}
      </g>
      <circle cx="15" cy="10" r="0.45" fill="#000080" />
    </>
  ),
  japan: (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      <circle cx="15" cy="10" r="6" fill="#BC002D" />
    </>
  ),
  france: v3('#0055A4', '#FFFFFF', '#EF4135'),
  italy: v3('#009246', '#FFFFFF', '#CE2B37'),
  ireland: v3('#169B62', '#FFFFFF', '#FF883E'),
  belgium: v3('#000000', '#FAE042', '#ED2939'),
  nigeria: v3('#008751', '#FFFFFF', '#008751'),
  germany: h3('#000000', '#DD0000', '#FFCE00'),
  netherlands: h3('#AE1C28', '#FFFFFF', '#21468B'),
  indonesia: (
    <>
      <rect width="30" height="10" fill="#FF0000" />
      <rect y="10" width="30" height="10" fill="#FFFFFF" />
    </>
  ),
  poland: (
    <>
      <rect width="30" height="10" fill="#FFFFFF" />
      <rect y="10" width="30" height="10" fill="#DC143C" />
    </>
  ),
  ukraine: (
    <>
      <rect width="30" height="10" fill="#0057B7" />
      <rect y="10" width="30" height="10" fill="#FFD700" />
    </>
  ),
  sweden: nordic('#006AA7', '#FECC00'),
  finland: nordic('#FFFFFF', '#002F6C'),
  denmark: nordic('#C8102E', '#FFFFFF'),
  norway: nordic('#BA0C2F', '#FFFFFF', '#00205B'),
  thailand: (
    <>
      <rect width="30" height="20" fill="#A51931" />
      <rect y="3.33" width="30" height="13.33" fill="#F4F5F8" />
      <rect y="6.67" width="30" height="6.67" fill="#2D2A4A" />
    </>
  ),
  bangladesh: (
    <>
      <rect width="30" height="20" fill="#006A4E" />
      <circle cx="13.5" cy="10" r="6" fill="#F42A41" />
    </>
  ),
  greece: (
    <>
      {Array.from({ length: 9 }, (_, i) => <rect key={i} y={(i * 20) / 9} width="30" height={20 / 9} fill={i % 2 ? '#FFFFFF' : '#0D5EAF'} />)}
      <rect width="11.1" height="11.1" fill="#0D5EAF" />
      <rect x="4.44" width="2.22" height="11.1" fill="#FFFFFF" />
      <rect y="4.44" width="11.1" height="2.22" fill="#FFFFFF" />
    </>
  ),
  colombia: (
    <>
      <rect width="30" height="10" fill="#FCD116" />
      <rect y="10" width="30" height="5" fill="#003893" />
      <rect y="15" width="30" height="5" fill="#CE1126" />
    </>
  ),
  argentina: (
    <>
      {h3('#74ACDF', '#FFFFFF', '#74ACDF')}
      <circle cx="15" cy="10" r="2" fill="#F6B40E" stroke="#85340A" strokeWidth="0.2" />
    </>
  ),
  china: (
    <>
      <rect width="30" height="20" fill="#EE1C25" />
      <g fill="#FFFF00">
        {star(5, 5, 3)}
        {star(10, 2, 1, 23)}
        {star(12, 4, 1, 46)}
        {star(12, 7, 1, 70)}
        {star(10, 9, 1, 20)}
      </g>
    </>
  ),
  usa: (
    <>
      {Array.from({ length: 13 }, (_, i) => <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill={i % 2 ? '#FFFFFF' : '#B22234'} />)}
      <rect width="12" height={(20 / 13) * 7} fill="#3C3B6E" />
      <g fill="#FFFFFF">
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: row % 2 ? 5 : 6 }, (_, col) => (
            <g key={`${row}-${col}`}>{star(1 + col * 2 + (row % 2 ? 1 : 0), 0.85 + row * 1.15, 0.45)}</g>
          )),
        )}
      </g>
    </>
  ),
  uk: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.6" />
    </>
  ),
  brazil: (
    <>
      <rect width="30" height="20" fill="#009C3B" />
      <path d="M15 2.5L27 10L15 17.5L3 10z" fill="#FFDF00" />
      <circle cx="15" cy="10" r="4.4" fill="#002776" />
      <path d="M10.8 9.2q4.2-1.2 8.4 1.6" stroke="#FFFFFF" strokeWidth="0.7" fill="none" />
    </>
  ),
  canada: (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      <rect width="7.5" height="20" fill="#D52B1E" />
      <rect x="22.5" width="7.5" height="20" fill="#D52B1E" />
      <path
        d="M15 3.5l1.1 2.1 1.2-.6-.5 3 1.8-1.9.4 1 1.7-.4-.6 2 .9.5-3 2.4.3 1.1-2.6-.3V15h-.6v-2.6l-2.6.3.3-1.1-3-2.4.9-.5-.6-2 1.7.4.4-1 1.8 1.9-.5-3 1.2.6z"
        fill="#D52B1E"
      />
    </>
  ),
};

export const flagIds = Object.keys(flagArt);

/** A flag with a soft frame; unknown ids show a white flag, never crash. */
export function Flag({ id, title, className }: { id: string; title?: string; className?: string }) {
  const clip = `flag-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 30 20" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <clipPath id={clip}>
        <rect width="30" height="20" rx="1.8" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>{flagArt[id] ?? <rect width="30" height="20" fill="#fff" />}</g>
      <rect x="0.4" y="0.4" width="29.2" height="19.2" rx="1.4" fill="none" stroke="#4a2f27" strokeWidth="0.8" />
    </svg>
  );
}
