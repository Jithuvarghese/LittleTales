import { useMemo, type CSSProperties } from 'react';
import { Prop } from '@/art/props';

export const effects = ['leaves', 'snow', 'rain', 'fireflies', 'bubbles', 'stars', 'clouds', 'sunrays', 'petals'] as const;
export type Effect = (typeof effects)[number];

/** Effects added automatically for a background when the page sets none. */
export const defaultEffects: Record<string, Effect[]> = {
  'night-sky': ['fireflies'],
  'forest-night': ['fireflies'],
  forest: ['leaves'],
  sea: ['bubbles'],
  rain: ['rain'],
  snow: ['snow'],
  'meadow-day': ['petals'],
  'meadow-sunset': ['sunrays'],
};

const rand = (i: number, n: number) => ((i * 9301 + 49297) % 233280) / 233280 * n;

function Particles({ count, render, cls, duration, style }: { count: number; render: (i: number) => JSX.Element; cls: string; duration: [number, number]; style?: (i: number) => CSSProperties }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <>
      {items.map((i) => (
        <span
          key={i}
          className={`absolute ${cls}`}
          style={{
            left: `${rand(i + 1, 100)}%`,
            top: cls === 'lt-fall' ? '-8%' : cls === 'lt-rise' ? '96%' : `${rand(i + 7, 70)}%`,
            animationDuration: `${duration[0] + rand(i + 3, duration[1] - duration[0])}s`,
            animationDelay: `${-rand(i + 5, duration[1])}s`,
            ...(style?.(i) ?? {}),
          }}
        >
          {render(i)}
        </span>
      ))}
    </>
  );
}

const dot = (size: number, color: string, glow = false) => (
  <span className="block rounded-full" style={{ width: size, height: size, background: color, boxShadow: glow ? `0 0 10px 4px ${color}` : undefined }} />
);

/** Ambient effect layers drawn over the background and under the characters. */
export function Effects({ list }: { list: Effect[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {list.includes('sunrays') && (
        <div className="lt-rays absolute inset-0" style={{ background: 'repeating-conic-gradient(from 200deg at 85% 0%, rgba(255,240,180,0.6) 0deg 6deg, transparent 6deg 16deg)' }} />
      )}
      {list.includes('snow') && <Particles count={26} cls="lt-fall" duration={[7, 13]} render={(i) => dot(4 + (i % 3) * 2, '#ffffff')} style={(i) => ({ ['--lt-dx' as string]: `${(i % 5) * 8 - 16}px` })} />}
      {list.includes('rain') && (
        <Particles count={34} cls="lt-fall" duration={[0.9, 1.5]} render={() => <span className="block h-4 w-[2px] rounded bg-[#6fa8d6]/80" />} style={() => ({ ['--lt-rot' as string]: '0deg', ['--lt-dx' as string]: '-6px' })} />
      )}
      {list.includes('leaves') && (
        <Particles count={8} cls="lt-fall" duration={[9, 15]} render={(i) => <span className="block h-5 w-5" style={{ filter: i % 2 ? 'hue-rotate(40deg)' : undefined }}><Prop id="leaf" /></span>} style={(i) => ({ ['--lt-dx' as string]: `${(i % 4) * 20 - 30}px` })} />
      )}
      {list.includes('petals') && <Particles count={7} cls="lt-fall" duration={[10, 16]} render={(i) => dot(7, ['#ff9fc4', '#ffd23f', '#ffffff'][i % 3]!)} style={(i) => ({ ['--lt-dx' as string]: `${(i % 4) * 16 - 20}px` })} />}
      {list.includes('fireflies') && <Particles count={10} cls="lt-glow" duration={[3, 6]} render={() => dot(5, '#fff3a0', true)} />}
      {list.includes('stars') && <Particles count={12} cls="lt-glow" duration={[2.5, 5]} render={() => <span className="block h-3 w-3"><Prop id="star" /></span>} />}
      {list.includes('bubbles') && <Particles count={12} cls="lt-rise" duration={[5, 9]} render={(i) => <span className="block rounded-full border-2 border-white/80 bg-white/20" style={{ width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5 }} />} />}
      {list.includes('clouds') && <Particles count={3} cls="lt-glow" duration={[12, 18]} render={() => <span className="block h-10 w-20 opacity-80"><Prop id="cloud" /></span>} />}
    </div>
  );
}
