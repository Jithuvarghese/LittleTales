import { useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';
import { OUTLINE as O, species, type Species } from './species';
import { useMouthOpen } from './talk';

export type Pose = 'idle' | 'talk' | 'happy' | 'cheer' | 'think' | 'sleepy' | 'sleep' | 'sad-soft' | 'surprised' | 'wave' | 'dance' | 'walk';
export const poses: Pose[] = ['idle', 'talk', 'happy', 'cheer', 'think', 'sleepy', 'sleep', 'sad-soft', 'surprised', 'wave', 'dance', 'walk'];

type Props = {
  id: string;
  pose?: Pose;
  size?: number | string;
  facing?: 'left' | 'right';
  /** Mouth follows the live voice level even if another role is marked as talker. */
  speaking?: boolean;
  label?: string;
  className?: string;
};

const CHEEK = '#ff9e8f';
const MOUTH = '#e0675a';
const BEAK = '#f2a33a';

/* ---------- Random blinking (every 3–5 s) ---------- */
function useBlink(enabled: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setClosed(true);
        t = setTimeout(() => {
          setClosed(false);
          loop();
        }, 130);
      }, 3000 + Math.random() * 2000);
    };
    loop();
    return () => clearTimeout(t);
  }, [enabled]);
  return closed;
}

/* ---------- Body parts ---------- */
function EarsBack({ s }: { s: Species }) {
  const inner = s.belly;
  switch (s.ears) {
    case 'fox':
      return (
        <>
          <path d="M50 66q-10-46 8-58q24 10 34 36z" fill={s.fur} />
          <path d="M51 42q-2-18 7-24q10 4 16 12q-12 2-23 12z" fill={O} stroke="none" />
          <path d="M150 66q10-46-8-58q-24 10-34 36z" fill={s.fur} />
          <path d="M149 42q2-18-7-24q-10 4-16 12q12 2 23 12z" fill={O} stroke="none" />
        </>
      );
    case 'bear':
      return (
        <>
          <circle cx="52" cy="46" r="19" fill={s.fur} />
          <circle cx="52" cy="46" r="9" fill={s.ears === 'bear' && s.fur === '#ffffff' ? s.shade : inner} stroke="none" />
          <circle cx="148" cy="46" r="19" fill={s.fur === '#ffffff' ? s.shade : s.fur} />
          <circle cx="148" cy="46" r="9" fill={inner} stroke="none" />
        </>
      );
    case 'cat':
      return (
        <>
          <path d="M46 70l6-50 36 26z" fill={s.fur} />
          <path d="M55 52l3-20 18 14z" fill="#ffc2b0" stroke="none" />
          <path d="M154 70l-6-50-36 26z" fill={s.fur} />
          <path d="M145 52l-3-20-18 14z" fill="#ffc2b0" stroke="none" />
        </>
      );
    case 'rabbit':
      return (
        <>
          <ellipse cx="74" cy="22" rx="14" ry="36" fill={s.fur} transform="rotate(-10 74 22)" />
          <ellipse cx="74" cy="24" rx="6" ry="24" fill="#ffc2c8" stroke="none" transform="rotate(-10 74 24)" />
          <ellipse cx="126" cy="22" rx="14" ry="36" fill={s.fur} transform="rotate(10 126 22)" />
          <ellipse cx="126" cy="24" rx="6" ry="24" fill="#ffc2c8" stroke="none" transform="rotate(10 126 24)" />
        </>
      );
    case 'mouse':
      return (
        <>
          <circle cx="48" cy="48" r="26" fill={s.fur} />
          <circle cx="48" cy="48" r="14" fill="#ffc2c8" stroke="none" />
          <circle cx="152" cy="48" r="26" fill={s.fur} />
          <circle cx="152" cy="48" r="14" fill="#ffc2c8" stroke="none" />
        </>
      );
    case 'cow':
      return (
        <>
          <path d="M70 44q-6-16 4-22M130 44q6-16-4-22" stroke={O} fill="none" />
          <ellipse cx="36" cy="78" rx="20" ry="10" fill={s.fur} transform="rotate(-18 36 78)" />
          <ellipse cx="164" cy="78" rx="20" ry="10" fill={s.fur} transform="rotate(18 164 78)" />
        </>
      );
    case 'pig':
      return (
        <>
          <path d="M50 60l2-30 30 18z" fill={s.fur} />
          <path d="M150 60l-2-30-30 18z" fill={s.fur} />
        </>
      );
    case 'elephant':
      return (
        <>
          <ellipse cx="34" cy="92" rx="30" ry="38" fill={s.fur} />
          <ellipse cx="38" cy="92" rx="18" ry="26" fill="#f2c4cc" stroke="none" />
          <ellipse cx="166" cy="92" rx="30" ry="38" fill={s.fur} />
          <ellipse cx="162" cy="92" rx="18" ry="26" fill="#f2c4cc" stroke="none" />
        </>
      );
    case 'monkey':
      return (
        <>
          <circle cx="40" cy="92" r="17" fill={s.fur} />
          <circle cx="40" cy="92" r="9" fill={inner} stroke="none" />
          <circle cx="160" cy="92" r="17" fill={s.fur} />
          <circle cx="160" cy="92" r="9" fill={inner} stroke="none" />
        </>
      );
    case 'tufts':
      return (
        <>
          <path d="M56 50l-10-30 30 16z" fill={s.shade} />
          <path d="M144 50l10-30-30 16z" fill={s.shade} />
        </>
      );
    case 'human':
      return (
        <>
          <circle cx="44" cy="94" r="10" fill={s.fur} />
          <circle cx="156" cy="94" r="10" fill={s.fur} />
        </>
      );
    case 'bolts':
      return (
        <>
          <rect x="28" y="78" width="14" height="22" rx="4" fill="#ff8a6b" />
          <rect x="158" y="78" width="14" height="22" rx="4" fill="#ff8a6b" />
        </>
      );
    default:
      return null;
  }
}

function EarsFront({ s }: { s: Species }) {
  if (s.ears !== 'dog') return null;
  return (
    <>
      <path d="M48 64q-20 34 0 58q12-4 14-34z" fill={s.shade} />
      <path d="M152 64q20 34 0 58q-12-4-14-34z" fill={s.shade} />
    </>
  );
}

function HeadShape({ s }: { s: Species }) {
  const fill = s.fur;
  if (s.mane) {
    // Mane / fleece: a ring of soft puffs behind the head.
    const puffs = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={100 + Math.cos(a) * 56} cy={88 + Math.sin(a) * 52} r={18} fill={s.mane} />;
    });
    return (
      <>
        <g>{puffs}</g>
        <circle cx="100" cy="88" r="54" fill={fill} />
      </>
    );
  }
  switch (s.head) {
    case 'wide':
      return <ellipse cx="100" cy="90" rx="62" ry="50" fill={fill} />;
    case 'egg':
      return <ellipse cx="100" cy="92" rx="54" ry="58" fill={fill} />;
    case 'box':
      return <rect x="40" y="34" width="120" height="104" rx="30" fill={fill} />;
    default:
      return <circle cx="100" cy="88" r="56" fill={fill} />;
  }
}

function Hair({ s }: { s: Species }) {
  const c = s.hairColor ?? '#2b1d16';
  switch (s.hair) {
    case 'short':
      return <path d="M46 84q2-50 54-52q52 2 54 52q-14-20-30-24q-6 10-24 10q-18 0-30-8q-18 6-24 22z" fill={c} />;
    case 'curly':
      return (
        <g fill={c}>
          {[[54, 66], [70, 46], [92, 38], [114, 38], [134, 48], [148, 66], [60, 50], [140, 52]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="17" />
          ))}
        </g>
      );
    case 'bob':
      return <path d="M42 110q-6-78 58-78q64 0 58 78q-8-4-12-30q-20-14-46-14q-26 0-46 14q-4 26-12 30z" fill={c} />;
    case 'ponytail':
      return (
        <>
          <ellipse cx="160" cy="70" rx="16" ry="26" fill={c} transform="rotate(25 160 70)" />
          <path d="M46 84q2-50 54-52q52 2 54 52q-20-22-54-24q-34 2-54 24z" fill={c} />
          <circle cx="152" cy="52" r="6" fill="#ff8fb8" />
        </>
      );
    case 'bun':
      return (
        <>
          <circle cx="100" cy="28" r="18" fill={c} />
          <path d="M46 84q2-50 54-52q52 2 54 52q-20-22-54-24q-34 2-54 24z" fill={c} />
        </>
      );
    case 'braids':
      return (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i} fill={c}>
              <circle cx="42" cy={112 + i * 16} r="9" />
              <circle cx="158" cy={112 + i * 16} r="9" />
            </g>
          ))}
          <path d="M44 100q-4-68 56-68q60 0 56 68q-8-16-14-30q-18-10-42-10q-24 0-42 10q-6 14-14 30z" fill={c} />
          <circle cx="42" cy="162" r="5" fill="#ff8a6b" />
          <circle cx="158" cy="162" r="5" fill="#ff8a6b" />
        </>
      );
    case 'grey':
      return (
        <>
          <circle cx="50" cy="76" r="16" fill={c} />
          <circle cx="150" cy="76" r="16" fill={c} />
          <path d="M54 66q8-30 46-32q38 2 46 32q-20-14-46-14q-26 0-46 14z" fill={c} />
        </>
      );
    default:
      return null;
  }
}

function Muzzle({ s, open }: { s: Species; open: number }) {
  switch (s.muzzle) {
    case 'fox':
      return <path d="M58 104q20-8 42 6q22-14 42-6q-4 32-42 34q-38-2-42-34z" fill={s.belly} />;
    case 'round':
      return <ellipse cx="100" cy="112" rx="27" ry="19" fill={s.belly} />;
    case 'cow':
      return <ellipse cx="100" cy="116" rx="34" ry="21" fill={s.belly} />;
    case 'snout':
      return (
        <>
          <ellipse cx="100" cy="110" rx="20" ry="14" fill={s.shade} />
          <ellipse cx="93" cy="110" rx="3.5" ry="5" fill={O} stroke="none" />
          <ellipse cx="107" cy="110" rx="3.5" ry="5" fill={O} stroke="none" />
        </>
      );
    case 'beak':
      // Upper beak fixed, lower beak opens with the voice.
      return (
        <>
          <motion.path d="M90 112q10 14 20 0z" fill="#d9822b" animate={{ y: open * 7 }} transition={{ duration: 0.06 }} />
          <path d="M86 100q14-10 28 0q-4 16-14 18q-10-2-14-18z" fill={BEAK} />
        </>
      );
    case 'duck':
      return (
        <>
          <motion.ellipse cx="100" cy="118" rx="18" ry="6" fill="#d9822b" animate={{ y: open * 6 }} transition={{ duration: 0.06 }} />
          <ellipse cx="100" cy="110" rx="24" ry="10" fill={BEAK} />
        </>
      );
    case 'trunk':
      return <path d="M88 104q-6 44 14 56q10-2 4-10q-10-16-2-46z" fill={s.fur} />;
    default:
      return null;
  }
}

function Nose({ s }: { s: Species }) {
  if (['beak', 'duck', 'trunk', 'snout'].includes(s.muzzle)) return null;
  if (s.ears === 'human') return <path d="M96 106q4 4 8 0" fill="none" />;
  if (s.head === 'box' || s.name === 'frog' || s.name === 'turtle') return null;
  const y = s.muzzle === 'cow' ? 108 : s.muzzle === 'fox' ? 107 : 104;
  return (
    <>
      <ellipse cx="100" cy={y} rx="8" ry="6" fill={s.nose ?? O} />
      <ellipse cx="97" cy={y - 2} rx="2.5" ry="1.5" fill="#fff" stroke="none" opacity="0.7" />
    </>
  );
}

function Eyes({ s, pose, blink }: { s: Species; pose: Pose; blink: boolean }) {
  const y = 86 + (s.eyeY ?? 0) + (s.head === 'box' ? -4 : 0);
  const dx = s.head === 'wide' ? 24 : 22;
  const arcs = pose === 'happy' || pose === 'cheer' || pose === 'dance';
  const lines = pose === 'sleepy' || pose === 'sleep' || blink;
  const big = pose === 'surprised' ? 1.25 : 1;
  const look = pose === 'think' ? -4 : 0;

  if (s.head === 'box') {
    // Robot: glowing eyes on a face screen.
    return (
      <>
        <rect x="56" y="54" width="88" height="64" rx="20" fill="#1f3a4d" />
        {arcs ? (
          <>
            <path d="M68 88q10-12 20 0M112 88q10-12 20 0" stroke="#7ef2ff" strokeWidth="6" fill="none" />
          </>
        ) : lines ? (
          <path d="M68 86h20M112 86h20" stroke="#7ef2ff" strokeWidth="6" fill="none" />
        ) : (
          <>
            <rect x="70" y={74 + look} width="16" height={20 * big} rx="8" fill="#7ef2ff" stroke="none" />
            <rect x="114" y={74 + look} width="16" height={20 * big} rx="8" fill="#7ef2ff" stroke="none" />
          </>
        )}
      </>
    );
  }
  const owl = s.ears === 'tufts';
  return (
    <>
      {(owl || s.name === 'frog') && (
        <>
          <circle cx={100 - dx} cy={y} r={owl ? 20 : 17} fill={owl ? '#fff' : s.fur} />
          <circle cx={100 + dx} cy={y} r={owl ? 20 : 17} fill={owl ? '#fff' : s.fur} />
        </>
      )}
      {arcs ? (
        <>
          <path d={`M${88 - dx} ${y + 2}q12-14 24 0`} fill="none" strokeWidth="5.5" />
          <path d={`M${88 + dx} ${y + 2}q12-14 24 0`} fill="none" strokeWidth="5.5" />
        </>
      ) : lines ? (
        <>
          <path d={`M${90 - dx} ${y}q10 7 20 0`} fill="none" strokeWidth="5" />
          <path d={`M${90 + dx} ${y}q10 7 20 0`} fill="none" strokeWidth="5" />
        </>
      ) : (
        [-1, 1].map((side) => (
          <g key={side}>
            <ellipse cx={100 + side * dx} cy={y + look} rx={10 * big} ry={12 * big} fill={O} stroke="none" />
            <circle cx={100 + side * dx + 3.5} cy={y + look - 4.5} r={4.2} fill="#fff" stroke="none" />
            <circle cx={100 + side * dx - 3.5} cy={y + look + 5} r={2} fill="#fff" stroke="none" />
          </g>
        ))
      )}
      {pose === 'sad-soft' && (
        <>
          <path d={`M${88 - dx} ${y - 18}q12 -6 22 2`} fill="none" strokeWidth="4" />
          <path d={`M${90 + dx} ${y - 16}q10 -8 22 -2`} fill="none" strokeWidth="4" />
        </>
      )}
      {s.glasses && (
        <g fill="none" strokeWidth="3.5">
          <circle cx={100 - dx} cy={y} r="15" />
          <circle cx={100 + dx} cy={y} r="15" />
          <path d={`M${100 - dx + 15} ${y}h${2 * dx - 30}`} />
        </g>
      )}
    </>
  );
}

function Mouth({ s, pose, open }: { s: Species; pose: Pose; open: number }) {
  if (s.muzzle === 'beak' || s.muzzle === 'duck') return null;
  const y = s.ears === 'human' ? 120 : s.muzzle === 'cow' ? 126 : s.head === 'box' ? 104 : s.muzzle === 'none' ? 116 : 121;
  const robot = s.head === 'box';
  const stroke = robot ? '#7ef2ff' : O;
  if (open > 0.06) return <ellipse cx="100" cy={y + 2} rx={6 + open * 4} ry={2 + open * 8} fill={robot ? '#7ef2ff' : MOUTH} stroke={stroke} />;
  switch (pose) {
    case 'happy':
    case 'cheer':
    case 'dance':
      return <path d={`M87 ${y - 3}q13 17 26 0q-13 6-26 0z`} fill={robot ? '#7ef2ff' : MOUTH} stroke={stroke} />;
    case 'surprised':
      return <ellipse cx="100" cy={y + 2} rx="6" ry="8" fill={robot ? '#7ef2ff' : MOUTH} stroke={stroke} />;
    case 'think':
    case 'sleepy':
    case 'sleep':
      return <path d={`M93 ${y}q7 3 14 0`} fill="none" stroke={stroke} />;
    case 'sad-soft':
      return <path d={`M92 ${y + 2}q8-6 16 0`} fill="none" stroke={stroke} />;
    default:
      return s.muzzle === 'fox' || s.muzzle === 'round' ? (
        <path d={`M90 ${y - 4}q5 7 10 0q5 7 10 0`} fill="none" stroke={stroke} />
      ) : (
        <path d={`M88 ${y - 4}q12 12 24 0`} fill="none" stroke={stroke} />
      );
  }
}

function Tail({ s }: { s: Species }) {
  switch (s.tail) {
    case 'fox':
      return (
        <>
          <path d="M128 192q58 6 58-46q0-24-18-34q4 30-14 46q-14 12-30 14z" fill={s.fur} />
          <path d="M186 146q0-24-18-34q2 18-6 30q12 2 24 4z" fill={s.belly} />
        </>
      );
    case 'puff':
      return <circle cx="142" cy="186" r="13" fill={s.fur === '#ffffff' ? '#f2f2f2' : s.belly} />;
    case 'curl':
      return <path d="M136 182q22 0 20-14q-2-10-10-6q-6 4 0 8" fill="none" strokeWidth="6" stroke={s.shade} />;
    case 'long':
      return (
        <>
          <path d="M136 190q40 4 42-30q0-12-8-16" fill="none" stroke={O} strokeWidth="13" />
          <path d="M136 190q40 4 42-30q0-12-8-16" fill="none" stroke={s.fur} strokeWidth="7" />
          {s.mane && <circle cx="170" cy="144" r="9" fill={s.mane} />}
        </>
      );
    case 'feathers':
      return (
        <g>
          <path d="M126 196q34 4 46-20q-26 2-46 8z" fill={s.shade} />
          <path d="M126 190q30-6 40-34q-24 8-40 22z" fill={s.crest ?? s.fur} />
        </g>
      );
    default:
      return null;
  }
}

function Arm({ s, side }: { s: Species; side: -1 | 1 }) {
  const m = (d: string) => (side === 1 ? d : d); // paths are drawn per side below
  const color = s.arms === 'hands' ? s.clothes ?? s.fur : s.arms === 'wings' || s.arms === 'fins' || s.name === 'panda' ? s.shade : s.fur;
  if (s.arms === 'none') return null;
  if (side === -1) {
    if (s.arms === 'wings' || s.arms === 'fins') return <path d={m('M66 146q-30 10-26 46q16-4 28-28z')} fill={color} />;
    if (s.arms === 'robot')
      return (
        <>
          <rect x="44" y="148" width="18" height="30" rx="8" fill={s.shade} />
          <circle cx="53" cy="184" r="9" fill="#ff8a6b" />
        </>
      );
    return (
      <>
        <path d="M66 146q-18 4-20 32q0 10 10 9q8-2 12-26z" fill={color} />
        {s.arms === 'hands' && <circle cx="52" cy="184" r="8" fill={s.fur} />}
      </>
    );
  }
  if (s.arms === 'wings' || s.arms === 'fins') return <path d="M134 146q30 10 26 46q-16-4-28-28z" fill={color} />;
  if (s.arms === 'robot')
    return (
      <>
        <rect x="138" y="148" width="18" height="30" rx="8" fill={s.shade} />
        <circle cx="147" cy="184" r="9" fill="#ff8a6b" />
      </>
    );
  return (
    <>
      <path d="M134 146q18 4 20 32q0 10-10 9q-8-2-12-26z" fill={color} />
      {s.arms === 'hands' && <circle cx="148" cy="184" r="8" fill={s.fur} />}
    </>
  );
}

function Body({ s }: { s: Species }) {
  if (s.head === 'box') {
    return (
      <>
        <rect x="62" y="136" width="76" height="64" rx="16" fill={s.fur} />
        <rect x="82" y="152" width="36" height="22" rx="7" fill="#ffd84d" />
        <circle cx="92" cy="186" r="4" fill="#ff8a6b" />
        <circle cx="108" cy="186" r="4" fill="#7ef2ff" />
      </>
    );
  }
  const people = s.ears === 'human';
  if (s.name === 'turtle')
    return (
      <>
        <path d="M54 200q0-62 46-64q46 2 46 64z" fill="#a8743f" />
        <path d="M70 196q4-40 30-42q26 2 30 42M100 154v44M74 178h52" fill="none" stroke="#6e4a2f" />
      </>
    );
  return (
    <>
      <path d="M60 204q-8-62 40-66q48 4 40 66z" fill={people ? s.clothes : s.fur} />
      {!people && <ellipse cx="100" cy="180" rx="25" ry="21" fill={s.belly} stroke={s.fur === s.belly ? 'none' : O} />}
      {people && <path d="M84 142q16 10 32 0" fill="none" />}
      {s.spots && s.name === 'cow' && (
        <g fill={s.shade} stroke="none">
          <ellipse cx="74" cy="168" rx="9" ry="7" />
          <ellipse cx="126" cy="186" rx="8" ry="6" />
        </g>
      )}
      {s.spots && s.name === 'tiger' && <path d="M66 170h12M64 184h12M122 170h12M124 184h12" stroke={s.shade} />}
    </>
  );
}

function Feet({ s, walking, reduce }: { s: Species; walking: boolean; reduce: boolean | null }) {
  const color = s.ears === 'human' ? '#5a4036' : s.muzzle === 'beak' || s.muzzle === 'duck' ? BEAK : s.shade;
  const anim = (phase: number): TargetAndTransition | undefined =>
    walking && !reduce ? { y: phase ? [0, -6, 0, 0] : [0, 0, 0, -6, 0] } : undefined;
  return (
    <>
      <motion.ellipse cx="82" cy="204" rx="16" ry="9" fill={color} animate={anim(0)} transition={{ duration: 0.45, repeat: Infinity }} />
      <motion.ellipse cx="118" cy="204" rx="16" ry="9" fill={color} animate={anim(1)} transition={{ duration: 0.45, repeat: Infinity }} />
    </>
  );
}

function Sparkles() {
  const spots: [number, number][] = [
    [30, 40],
    [170, 34],
    [24, 120],
    [178, 112],
  ];
  return (
    <g fill="#ffd23f" stroke={O} strokeWidth={2}>
      {spots.map(([x, y], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y - 9}l3 6 6 3-6 3-3 6-3-6-6-3 6-3z`}
          style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </g>
  );
}

function Zzz() {
  return (
    <motion.text
      x="150"
      y="36"
      fontSize="26"
      fontWeight="bold"
      fill={O}
      stroke="none"
      fontFamily="Baloo 2, sans-serif"
      animate={{ y: [0, -14], opacity: [0, 1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity }}
    >
      z
    </motion.text>
  );
}

/* ---------- Pose choreography ---------- */
type Motion = { root?: TargetAndTransition; rootT?: Transition; head?: TargetAndTransition; armL?: TargetAndTransition; armR?: TargetAndTransition; armT?: Transition };

const loop = (duration: number): Transition => ({ duration, repeat: Infinity, ease: 'easeInOut' });

function choreography(pose: Pose): Motion {
  switch (pose) {
    case 'happy':
      return { root: { y: [0, -8, 0], scaleY: [1, 0.95, 1.04, 1], scaleX: [1, 1.04, 0.97, 1] }, rootT: loop(0.9), armL: { rotate: [0, 12, 0] }, armR: { rotate: [0, -12, 0] }, armT: loop(0.9) };
    case 'cheer':
      return { root: { y: [0, -18, 0], scaleY: [1, 0.92, 1.06, 1], scaleX: [1, 1.06, 0.95, 1] }, rootT: loop(0.6), armL: { rotate: [120, 135, 120] }, armR: { rotate: [-120, -135, -120] }, armT: loop(0.3) };
    case 'dance':
      return { root: { y: [0, -10, 0, -10, 0], rotate: [-6, 6, -6] }, rootT: loop(0.9), head: { rotate: [5, -5, 5] }, armL: { rotate: [120, 20, 120] }, armR: { rotate: [-20, -120, -20] }, armT: loop(0.9) };
    case 'walk':
      return { root: { y: [0, -5, 0], rotate: [2, -2, 2] }, rootT: loop(0.45), armL: { rotate: [-20, 20, -20] }, armR: { rotate: [20, -20, 20] }, armT: loop(0.9) };
    case 'wave':
      return { root: { y: [0, -3, 0] }, rootT: loop(2.4), armR: { rotate: [-125, -95, -125] }, armT: loop(0.5) };
    case 'think':
      return { root: { y: [0, -2, 0] }, rootT: loop(2.8), head: { rotate: -9 }, armR: { rotate: -115 } };
    case 'surprised':
      return { root: { y: [0, -16, 0, 0, 0], scaleY: [1, 1.06, 0.96, 1, 1] }, rootT: { duration: 1.6, repeat: Infinity, repeatDelay: 1 }, armL: { rotate: 50 }, armR: { rotate: -50 } };
    case 'sad-soft':
      return { root: { y: [0, -1.5, 0] }, rootT: loop(3.2), head: { rotate: 7 }, armL: { rotate: 6 }, armR: { rotate: -6 } };
    case 'sleepy':
    case 'sleep':
      return { root: { scaleY: [1, 1.03, 1] }, rootT: loop(3.6), head: { rotate: 6, y: 3 }, armL: { rotate: 8 }, armR: { rotate: -8 } };
    case 'talk':
      return { root: { y: [0, -3, 0], scaleY: [1, 0.985, 1] }, rootT: loop(2.2), head: { rotate: [0, 2, 0, -2, 0] }, armL: { rotate: [0, 10, 0] }, armR: { rotate: [0, -16, 0] }, armT: loop(1.4) };
    default:
      return { root: { y: [0, -3, 0], scaleY: [1, 0.985, 1], scaleX: [1, 1.01, 1] }, rootT: loop(2.4), armL: { rotate: [0, 4, 0] }, armR: { rotate: [0, -4, 0] }, armT: loop(2.4) };
  }
}

/** Old expression names used in content map onto poses. */
export function toPose(expression?: string): Pose {
  const map: Record<string, Pose> = { idle: 'idle', happy: 'happy', thinking: 'think', celebrate: 'cheer', talking: 'talk', sleepy: 'sleepy', surprised: 'surprised' };
  return (poses as string[]).includes(expression ?? '') ? (expression as Pose) : (map[expression ?? ''] ?? 'idle');
}

/**
 * A cast member drawn from shared parts, with idle life (bounce with squash and
 * stretch, breathing, random blinks), poses, and a mouth that follows the voice.
 */
export function Character({ id, pose = 'idle', size = 160, facing = 'right', speaking = false, label, className }: Props) {
  const reduce = useReducedMotion();
  const s = species[id] ?? species.pip!;
  const blink = useBlink(!reduce && pose !== 'sleepy' && pose !== 'sleep');
  const live = useMouthOpen(id, speaking);
  const open = pose === 'talk' && live === 0 && !reduce ? 0 : live;
  const c = choreography(pose);
  const fb = { transformBox: 'fill-box' as const };
  const still = reduce ? undefined : undefined;

  const wrap = (node: ReactNode) => (
    <motion.svg
      viewBox="0 0 200 222"
      width={size}
      height={typeof size === 'number' ? size * 1.11 : size}
      role="img"
      aria-label={label ?? s.name}
      className={className}
      style={facing === 'left' ? { transform: 'scaleX(-1)' } : undefined}
      stroke={O}
      strokeWidth={5}
      strokeLinejoin="round"
      strokeLinecap="round"
      overflow="visible"
    >
      {node}
    </motion.svg>
  );

  return wrap(
    <>
      {/* Soft ground shadow that shrinks as the character hops */}
      <motion.ellipse
        cx="100"
        cy="212"
        rx="50"
        ry="8"
        fill="rgba(74,47,39,0.16)"
        stroke="none"
        style={{ ...fb, originX: 0.5, originY: 0.5 }}
        animate={reduce ? undefined : { scaleX: c.root?.y ? [1, 0.88, 1] : 1 }}
        transition={c.rootT}
      />
      <motion.g style={{ ...fb, originX: 0.5, originY: 1 }} animate={reduce ? still : c.root} transition={c.rootT}>
        <Tail s={s} />
        <Feet s={s} walking={pose === 'walk'} reduce={reduce} />
        <Body s={s} />
        <motion.g style={{ ...fb, originX: 0.5, originY: 0.9 }} animate={c.head ?? { rotate: 0, y: 0 }} transition={c.head && Array.isArray(c.head.rotate) ? loop(0.9) : { duration: 0.4 }}>
          <EarsBack s={s} />
          {s.antenna && (
            <>
              <path d="M100 34V12" fill="none" />
              <motion.circle cx="100" cy="10" r="8" fill="#ff8a6b" animate={reduce ? undefined : { scale: [1, 1.3, 1] }} transition={loop(1.2)} style={{ ...fb, originX: 0.5, originY: 0.5 }} />
            </>
          )}
          {s.crest && (
            <path d="M88 40q-4-24 10-28q-2 14 6 20q4-16 18-14q-10 10-8 24z" fill={s.crest} />
          )}
          <HeadShape s={s} />
          {s.spots && s.name === 'cow' && <ellipse cx="128" cy="70" rx="14" ry="11" fill={s.shade} stroke="none" />}
          {s.spots && s.name === 'tiger' && <path d="M100 34v14M84 38l4 12M116 38l-4 12" stroke={s.shade} />}
          {s.name === 'panda' && (
            <>
              <ellipse cx="78" cy="88" rx="15" ry="18" fill={s.shade} stroke="none" transform="rotate(-20 78 88)" />
              <ellipse cx="122" cy="88" rx="15" ry="18" fill={s.shade} stroke="none" transform="rotate(20 122 88)" />
            </>
          )}
          {s.ears === 'tufts' && <ellipse cx="100" cy="98" rx="40" ry="36" fill={s.belly} stroke="none" />}
          <Hair s={s} />
          <EarsFront s={s} />
          <Muzzle s={s} open={open} />
          <Eyes s={s} pose={pose} blink={blink} />
          <Nose s={s} />
          {s.head !== 'box' && (
            <>
              <ellipse cx="64" cy="112" rx="10" ry="6.5" fill={CHEEK} stroke="none" opacity="0.75" />
              <ellipse cx="136" cy="112" rx="10" ry="6.5" fill={CHEEK} stroke="none" opacity="0.75" />
            </>
          )}
          <Mouth s={s} pose={pose} open={open} />
        </motion.g>
        {/* Arms in front so raised arms (cheer, wave, think) are never hidden behind the head. */}
        <motion.g style={{ ...fb, originX: 1, originY: 0 }} animate={c.armL ?? { rotate: 0 }} transition={c.armT ?? { duration: 0.35 }}>
          <Arm s={s} side={-1} />
        </motion.g>
        <motion.g style={{ ...fb, originX: 0, originY: 0 }} animate={c.armR ?? { rotate: 0 }} transition={c.armT ?? { duration: 0.35 }}>
          <Arm s={s} side={1} />
        </motion.g>
      </motion.g>
      {!reduce && pose === 'cheer' && <Sparkles />}
      {!reduce && (pose === 'sleepy' || pose === 'sleep') && <Zzz />}
    </>,
  );
}
