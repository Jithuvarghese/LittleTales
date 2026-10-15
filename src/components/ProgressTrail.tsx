/** Friendly progress: a trail of paw prints instead of numbers. */
export function ProgressTrail({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-1" aria-label={`Page ${current + 1} of ${total}`} role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`h-6 w-6 transition-transform ${i === current ? 'scale-125' : ''}`} aria-hidden>
          <g fill={i <= current ? 'var(--accent)' : 'transparent'} stroke="var(--outline)" strokeWidth="1.8">
            <ellipse cx="12" cy="15" rx="5" ry="4.5" />
            <circle cx="6" cy="9" r="2.2" />
            <circle cx="10" cy="5.5" r="2.2" />
            <circle cx="14" cy="5.5" r="2.2" />
            <circle cx="18" cy="9" r="2.2" />
          </g>
        </svg>
      ))}
    </div>
  );
}
