/** Reusable scene backdrops on a 160×100 grid. Composed from shared parts. */
const O = '#4a2f27';

const Cloud = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 10q-6 0-5-6q1-5 7-4q1-6 8-6q6 0 7 5q7-2 8 4q5 1 2 7z"
    fill="#fff"
  />
);
const Hill = ({ d, fill }: { d: string; fill: string }) => <path d={d} fill={fill} />;
const Stars = () => (
  <g fill="#f7e27a" stroke="none">
    {[[20, 12], [45, 22], [70, 8], [100, 18], [130, 10], [148, 28], [12, 34], [88, 34]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={1.4} />
    ))}
  </g>
);

const backdrops: Record<string, JSX.Element> = {
  meadow: (
    <>
      <rect width="160" height="100" fill="#bfe6ff" />
      <Cloud x={20} y={14} /> <Cloud x={110} y={22} s={0.8} />
      <Hill d="M0 70q40-24 90-6t70-6v42H0z" fill="#8fd18a" />
      <Hill d="M0 82q50-14 100 0t60-4v22H0z" fill="#6cbf4b" />
    </>
  ),
  night: (
    <>
      <rect width="160" height="100" fill="#1d1b3a" />
      <Stars />
      <Hill d="M0 74q40-20 90-6t70-4v36H0z" fill="#2c4a3e" />
      <Hill d="M0 86q50-12 100 0t60-2v16H0z" fill="#233c33" />
    </>
  ),
  sea: (
    <>
      <rect width="160" height="100" fill="#6fd0d8" />
      <rect y="0" width="160" height="30" fill="#9fe3e0" />
      <path d="M0 30q10-4 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#fff" strokeWidth="1.5" />
      <Hill d="M0 88q40-8 80 0t80 0v12H0z" fill="#f7dfa0" />
      <path d="M20 88q-4-16 4-26M28 88q4-12-2-20" fill="none" stroke="#3f9a3a" strokeWidth="2" />
    </>
  ),
  beach: (
    <>
      <rect width="160" height="100" fill="#bfe6ff" />
      <circle cx="132" cy="18" r="10" fill="#ffcb47" />
      <rect y="52" width="160" height="20" fill="#4fb5d8" />
      <Hill d="M0 68q40-6 80 0t80 0v32H0z" fill="#f7dfa0" />
    </>
  ),
  forest: (
    <>
      <rect width="160" height="100" fill="#cdeccf" />
      {[10, 40, 80, 120, 150].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y={40 + (i % 2) * 6} width="6" height="40" fill="#8b5a3c" />
          <circle cx={x} cy={36 + (i % 2) * 6} r="16" fill={i % 2 ? '#4f9e45' : '#5aae4b'} />
        </g>
      ))}
      <Hill d="M0 80q80-10 160 0v20H0z" fill="#6cbf4b" />
    </>
  ),
  room: (
    <>
      <rect width="160" height="100" fill="#fff1d6" />
      <rect x="18" y="14" width="34" height="28" rx="3" fill="#bfe6ff" />
      <path d="M35 14v28M18 28h34" fill="none" />
      <rect y="74" width="160" height="26" fill="#d9a066" />
      <path d="M0 74h160" fill="none" />
    </>
  ),
  village: (
    <>
      <rect width="160" height="100" fill="#ffe7c2" />
      <circle cx="28" cy="20" r="10" fill="#ffcb47" />
      {[30, 80, 128].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 18} 58l18-16 18 16`} fill={['#e8553f', '#5ab6e8', '#9b6bd6'][i]} />
          <rect x={x - 14} y="56" width="28" height="22" fill="#fff4e3" />
          <rect x={x - 4} y="64" width="8" height="14" fill="#8b5a3c" />
        </g>
      ))}
      <rect y="78" width="160" height="22" fill="#c9a06a" />
    </>
  ),
  snow: (
    <>
      <rect width="160" height="100" fill="#d6ecff" />
      <g fill="#fff" stroke="none">
        {[[14, 10], [40, 24], [66, 12], [96, 28], [124, 8], [146, 22], [30, 40], [110, 44]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} />
        ))}
      </g>
      <Hill d="M0 70q40-16 90-4t70-4v38H0z" fill="#ffffff" />
    </>
  ),
};

export function Backdrop({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
      stroke={O}
      strokeWidth={1.2}
      strokeLinejoin="round"
    >
      {backdrops[name] ?? backdrops.meadow}
    </svg>
  );
}
