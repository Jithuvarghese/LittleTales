import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Expression } from './Pip';

const O = '#4a2f27';

/** Shared face parts so every mascot expresses feelings the same way. */
function Face({ expression, eyeY, lx, rx, mouthY }: { expression: Expression; eyeY: number; lx: number; rx: number; mouthY: number }) {
  const reduce = useReducedMotion();
  const closed = expression === 'happy' || expression === 'celebrate';
  return (
    <>
      <motion.g
        id="eyes"
        animate={reduce ? {} : { scaleY: [1, 1, 0.1, 1] }}
        transition={{ repeat: Infinity, duration: 4.4, times: [0, 0.92, 0.96, 1] }}
        style={{ originY: `${eyeY}px` }}
      >
        {expression === 'sleepy' ? (
          <>
            <path d={`M${lx - 8} ${eyeY}h16`} fill="none" />
            <path d={`M${rx - 8} ${eyeY}h16`} fill="none" />
          </>
        ) : closed ? (
          <>
            <path d={`M${lx - 8} ${eyeY + 2}q8-10 16 0`} fill="none" />
            <path d={`M${rx - 8} ${eyeY + 2}q8-10 16 0`} fill="none" />
          </>
        ) : (
          <>
            <circle cx={lx} cy={eyeY} r="8" fill={O} stroke="none" />
            <circle cx={rx} cy={eyeY} r="8" fill={O} stroke="none" />
            <circle cx={lx + 3} cy={eyeY - 3} r="2.5" fill="#fff" stroke="none" />
            <circle cx={rx + 3} cy={eyeY - 3} r="2.5" fill="#fff" stroke="none" />
          </>
        )}
      </motion.g>
      <g id="mouth">
        {expression === 'talking' ? (
          <motion.ellipse
            cx="100"
            cy={mouthY}
            rx="7"
            fill="#c0483c"
            animate={reduce ? { ry: 5 } : { ry: [2, 7, 2] }}
            transition={{ repeat: Infinity, duration: 0.35 }}
          />
        ) : expression === 'surprised' ? (
          <ellipse cx="100" cy={mouthY} rx="6" ry="8" fill="#c0483c" />
        ) : expression === 'thinking' || expression === 'sleepy' ? (
          <path d={`M92 ${mouthY}h16`} fill="none" />
        ) : (
          <path d={`M88 ${mouthY - 4}q12 12 24 0`} fill="none" />
        )}
      </g>
    </>
  );
}

function Frame({ label, expression, size, children }: { label: string; expression: Expression; size: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const bouncy = !reduce && (expression === 'celebrate' || expression === 'happy');
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      animate={bouncy ? { y: [0, -14, 0] } : { y: 0 }}
      transition={bouncy ? { repeat: Infinity, duration: 0.9 } : undefined}
      stroke={O}
      strokeWidth={6}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <motion.g
        animate={{ rotate: expression === 'thinking' ? -6 : 0 }}
        style={{ originX: '100px', originY: '120px' }}
      >
        {children}
      </motion.g>
    </motion.svg>
  );
}

type P = { expression?: Expression; size?: number };

export const Bumble = ({ expression = 'idle', size = 160 }: P) => (
  <Frame label="Bumble the bear" expression={expression} size={size}>
    <ellipse id="body" cx="100" cy="160" rx="50" ry="36" fill="#b07a4f" />
    <ellipse cx="100" cy="166" rx="28" ry="22" fill="#e9c9a0" />
    <circle id="ear-left" cx="50" cy="48" r="20" fill="#b07a4f" />
    <circle id="ear-right" cx="150" cy="48" r="20" fill="#b07a4f" />
    <circle id="head" cx="100" cy="90" r="55" fill="#b07a4f" />
    <ellipse cx="100" cy="112" rx="26" ry="20" fill="#e9c9a0" />
    <ellipse id="nose" cx="100" cy="102" rx="9" ry="6" fill={O} />
    <Face expression={expression} eyeY={80} lx={78} rx={122} mouthY={120} />
  </Frame>
);

export const Luna = ({ expression = 'idle', size = 160 }: P) => (
  <Frame label="Luna the owl" expression={expression} size={size}>
    <path id="body" d="M40 60l14-36 26 20h40l26-20 14 36q20 110-60 120Q20 170 40 60z" fill="#8f7ad6" />
    <path id="wing-left" d="M42 100q-20 30 4 60q10-30-4-60z" fill="#6f5bb8" />
    <path id="wing-right" d="M158 100q20 30-4 60q-10-30 4-60z" fill="#6f5bb8" />
    <ellipse cx="100" cy="150" rx="34" ry="28" fill="#d9cff7" />
    <circle cx="74" cy="84" r="22" fill="#fff" />
    <circle cx="126" cy="84" r="22" fill="#fff" />
    <path id="beak" d="M92 100h16l-8 12z" fill="#f2a33a" />
    <Face expression={expression} eyeY={84} lx={74} rx={126} mouthY={124} />
  </Frame>
);

export const Zig = ({ expression = 'idle', size = 160 }: P) => (
  <Frame label="Zig the robot" expression={expression} size={size}>
    <path id="antenna" d="M100 34V14" fill="none" />
    <circle cx="100" cy="12" r="8" fill="#ff8a6b" />
    <rect id="body" x="56" y="132" width="88" height="56" rx="16" fill="#7fc4e8" />
    <rect x="84" y="148" width="32" height="20" rx="6" fill="#f7d443" />
    <rect id="head" x="40" y="34" width="120" height="100" rx="30" fill="#a9dcf2" />
    <rect x="56" y="56" width="88" height="56" rx="20" fill="#e8f6ff" />
    <circle id="ear-left" cx="36" cy="84" r="10" fill="#ff8a6b" />
    <circle id="ear-right" cx="164" cy="84" r="10" fill="#ff8a6b" />
    <Face expression={expression} eyeY={78} lx={80} rx={120} mouthY={102} />
  </Frame>
);

export const Coco = ({ expression = 'idle', size = 160 }: P) => (
  <Frame label="Coco the parrot" expression={expression} size={size}>
    <path id="tail" d="M90 170l-10 26 20-10 20 10-10-26z" fill="#4fa3e8" />
    <ellipse id="body" cx="100" cy="140" rx="44" ry="46" fill="#49b25a" />
    <path id="wing-left" d="M58 120q-14 40 16 60q4-34-16-60z" fill="#f7c843" />
    <path id="crest" d="M90 30q0-20 14-24q-2 14 6 22q4-14 16-12q-8 10-6 22z" fill="#e8553f" />
    <circle id="head" cx="100" cy="76" r="46" fill="#e8553f" />
    <circle cx="80" cy="72" r="16" fill="#fff" />
    <circle cx="120" cy="72" r="16" fill="#fff" />
    <path id="beak" d="M88 90q12-6 24 0q-4 22-12 24q-8-2-12-24z" fill="#f2a33a" />
    <Face expression={expression} eyeY={72} lx={80} rx={120} mouthY={130} />
  </Frame>
);
