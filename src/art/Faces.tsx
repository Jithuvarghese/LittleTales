/** Simple feeling faces for the feelings quiz. */
const mouths: Record<string, string> = {
  happy: 'M30 62q20 20 40 0',
  sad: 'M30 72q20-18 40 0',
  sleepy: 'M38 66h24',
  surprised: '',
  scared: 'M30 68q5-6 10 0t10 0t10 0t10 0',
  angry: 'M32 70q18-10 36 0',
};

export function Face({ face, size = '100%' }: { face: string; size?: number | string }) {
  const closed = face === 'sleepy';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden stroke="#4a2f27" strokeWidth={5} strokeLinecap="round" fill="none">
      <circle cx="50" cy="50" r="44" fill="#ffd98a" />
      {closed ? (
        <>
          <path d="M28 42h14M58 42h14" />
          <text x="70" y="28" fontSize="18" fill="#4a2f27" stroke="none" fontWeight="bold">z</text>
        </>
      ) : (
        <>
          <circle cx="35" cy="42" r={face === 'surprised' || face === 'scared' ? 7 : 5} fill="#4a2f27" />
          <circle cx="65" cy="42" r={face === 'surprised' || face === 'scared' ? 7 : 5} fill="#4a2f27" />
        </>
      )}
      {face === 'angry' && <path d="M26 30l16 6M74 30l-16 6" />}
      {face === 'sad' && <path d="M28 30l12-4M72 30l-12-4" />}
      {face === 'surprised' ? <ellipse cx="50" cy="68" rx="8" ry="10" fill="#c0483c" /> : <path d={mouths[face] ?? mouths.happy} />}
    </svg>
  );
}
