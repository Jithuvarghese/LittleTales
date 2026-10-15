import { motion, useReducedMotion } from 'framer-motion';

export type Expression = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'talking';

/**
 * Pip the fox cub as a layered SVG with named groups so parts can be animated
 * independently. First pass; refined in the art library phase.
 */
export function Pip({ expression = 'idle', size = 160 }: { expression?: Expression; size?: number }) {
  const reduce = useReducedMotion();
  const bouncy = !reduce && (expression === 'celebrate' || expression === 'happy');

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Pip the fox"
      animate={bouncy ? { y: [0, -14, 0] } : { y: 0 }}
      transition={bouncy ? { repeat: Infinity, duration: 0.9 } : undefined}
      stroke="#4a2f27"
      strokeWidth={6}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <motion.g
        id="tail"
        style={{ originX: '150px', originY: '160px' }}
        animate={reduce ? {} : { rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <path d="M140 160q50-10 45-60q-25 20-50 35z" fill="#f08a3c" />
        <path d="M182 104q-8 14-20 20" fill="none" />
      </motion.g>
      <g id="body">
        <ellipse cx="100" cy="155" rx="45" ry="35" fill="#f08a3c" />
        <ellipse cx="100" cy="162" rx="25" ry="22" fill="#fff4e3" />
      </g>
      <motion.g
        id="head"
        animate={{ rotate: expression === 'thinking' ? -8 : 0 }}
        style={{ originX: '100px', originY: '110px' }}
      >
        <path id="ear-left" d="M55 70L50 20l40 30z" fill="#f08a3c" />
        <path id="ear-right" d="M145 70l5-50-40 30z" fill="#f08a3c" />
        <path d="M40 80q60-60 120 0q0 50-60 55q-60-5-60-55z" fill="#f08a3c" />
        <path d="M60 100q40 50 80 0q-10 35-40 35q-30 0-40-35z" fill="#fff4e3" />
        <motion.g
          id="eyes"
          animate={reduce ? {} : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1] }}
          style={{ originY: '88px' }}
        >
          {expression === 'happy' || expression === 'celebrate' ? (
            <>
              <path d="M66 90q8-10 16 0" fill="none" />
              <path d="M118 90q8-10 16 0" fill="none" />
            </>
          ) : (
            <>
              <circle cx="74" cy="88" r="8" fill="#4a2f27" stroke="none" />
              <circle cx="126" cy="88" r="8" fill="#4a2f27" stroke="none" />
              <circle cx="77" cy="85" r="2.5" fill="#fff" stroke="none" />
              <circle cx="129" cy="85" r="2.5" fill="#fff" stroke="none" />
            </>
          )}
        </motion.g>
        <ellipse id="nose" cx="100" cy="106" rx="7" ry="5" fill="#4a2f27" />
        <g id="mouth">
          {expression === 'talking' ? (
            <motion.ellipse
              cx="100"
              cy="120"
              rx="7"
              fill="#c0483c"
              animate={reduce ? { ry: 5 } : { ry: [2, 7, 2] }}
              transition={{ repeat: Infinity, duration: 0.35 }}
            />
          ) : expression === 'thinking' ? (
            <path d="M92 120h16" fill="none" />
          ) : (
            <path d="M88 116q12 12 24 0" fill="none" />
          )}
        </g>
      </motion.g>
    </motion.svg>
  );
}
