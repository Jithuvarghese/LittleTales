import { motion, useReducedMotion } from 'framer-motion';

export type Expression = 'idle' | 'happy' | 'thinking' | 'celebrate' | 'talking' | 'sleepy' | 'surprised';

const O = '#4a2f27';
const FUR = '#f2913d';
const FUR_DARK = '#d9732a';
const CREAM = '#fff6e8';

/**
 * Pip the fox cub: a round, soft, baby-proportioned fox (big head, big shiny eyes,
 * rosy cheeks, white muzzle, dark ear tips, fluffy white-tipped tail). Layered SVG
 * with named groups so parts animate independently.
 */
export function Pip({ expression = 'idle', size = 160 }: { expression?: Expression; size?: number }) {
  const reduce = useReducedMotion();
  const bouncy = !reduce && (expression === 'celebrate' || expression === 'happy');
  const closedEyes = expression === 'happy' || expression === 'celebrate';

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Pip the fox"
      animate={bouncy ? { y: [0, -10, 0] } : { y: 0 }}
      transition={bouncy ? { repeat: Infinity, duration: 0.9 } : undefined}
      stroke={O}
      strokeWidth={5}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* Fluffy tail curling round the side, with a white tip */}
      <motion.g
        id="tail"
        style={{ originX: '140px', originY: '170px' }}
        animate={reduce ? {} : { rotate: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        <path d="M128 176q58 6 58-46q0-24-18-34q4 30-14 46q-14 12-30 14z" fill={FUR} />
        <path d="M186 130q0-24-18-34q2 18-6 30q12 2 24 4z" fill={CREAM} />
      </motion.g>

      {/* Body sitting, with cream tummy and little paws */}
      <g id="body">
        <path d="M58 182q-6-50 42-54q48 4 42 54z" fill={FUR} />
        <path d="M80 182q-2-34 20-36q22 2 20 36z" fill={CREAM} />
        <ellipse id="paw-left" cx="78" cy="182" rx="15" ry="9" fill={FUR_DARK} />
        <ellipse id="paw-right" cx="122" cy="182" rx="15" ry="9" fill={FUR_DARK} />
      </g>

      <motion.g id="head" animate={{ rotate: expression === 'thinking' ? -7 : 0 }} style={{ originX: '100px', originY: '120px' }}>
        {/* Ears: rounded triangles with dark tips and pink insides */}
        <g id="ear-left">
          <path d="M44 74q-10-46 8-58q24 10 34 36z" fill={FUR} />
          <path d="M52 52q-4-22 4-28q10 6 16 20z" fill="#ffc2b0" stroke="none" />
          <path d="M45 40q-2-18 7-24q10 4 16 12q-12 2-23 12z" fill={O} stroke="none" />
        </g>
        <g id="ear-right">
          <path d="M156 74q10-46-8-58q-24 10-34 36z" fill={FUR} />
          <path d="M148 52q4-22-4-28q-10 6-16 20z" fill="#ffc2b0" stroke="none" />
          <path d="M155 40q2-18-7-24q-10 4-16 12q12 2 23 12z" fill={O} stroke="none" />
        </g>
        {/* Big round head with soft cheek tufts */}
        <path d="M100 38q58 0 64 52q4 26-14 38l8 6q-30 16-58 14q-28 2-58-14l8-6q-18-12-14-38q6-52 64-52z" fill={FUR} />
        {/* White muzzle and cheeks */}
        <path d="M54 104q20-8 46 6q26-14 46-6q-4 34-46 36q-42-2-46-36z" fill={CREAM} />
        {/* Rosy cheeks */}
        <ellipse cx="62" cy="112" rx="10" ry="7" fill="#ff9e8f" stroke="none" opacity="0.8" />
        <ellipse cx="138" cy="112" rx="10" ry="7" fill="#ff9e8f" stroke="none" opacity="0.8" />

        <motion.g
          id="eyes"
          animate={reduce || closedEyes || expression === 'sleepy' ? {} : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.92, 0.96, 1] }}
          style={{ originY: '90px' }}
        >
          {expression === 'sleepy' ? (
            <>
              <path d="M66 92q10 6 20 0" fill="none" />
              <path d="M114 92q10 6 20 0" fill="none" />
            </>
          ) : closedEyes ? (
            <>
              <path d="M66 94q10-12 20 0" fill="none" />
              <path d="M114 94q10-12 20 0" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="76" cy="90" rx={expression === 'surprised' ? 11 : 10} ry={expression === 'surprised' ? 13 : 12} fill={O} stroke="none" />
              <ellipse cx="124" cy="90" rx={expression === 'surprised' ? 11 : 10} ry={expression === 'surprised' ? 13 : 12} fill={O} stroke="none" />
              <circle cx="80" cy="85" r="4" fill="#fff" stroke="none" />
              <circle cx="128" cy="85" r="4" fill="#fff" stroke="none" />
              <circle cx="73" cy="95" r="2" fill="#fff" stroke="none" />
              <circle cx="121" cy="95" r="2" fill="#fff" stroke="none" />
            </>
          )}
        </motion.g>

        {/* Little round nose */}
        <ellipse id="nose" cx="100" cy="108" rx="8" ry="6" fill={O} />
        <ellipse cx="97" cy="106" rx="2.5" ry="1.5" fill="#fff" stroke="none" opacity="0.7" />

        <g id="mouth">
          {expression === 'talking' ? (
            <motion.ellipse cx="100" cy="122" rx="7" fill="#e0675a" animate={reduce ? { ry: 5 } : { ry: [2, 7, 2] }} transition={{ repeat: Infinity, duration: 0.35 }} />
          ) : expression === 'surprised' ? (
            <ellipse cx="100" cy="123" rx="5" ry="7" fill="#e0675a" />
          ) : expression === 'thinking' || expression === 'sleepy' ? (
            <path d="M93 121q7 3 14 0" fill="none" />
          ) : closedEyes ? (
            <path d="M88 116q12 16 24 0q-12 6-24 0z" fill="#e0675a" />
          ) : (
            <path d="M90 116q5 7 10 0q5 7 10 0" fill="none" />
          )}
        </g>
      </motion.g>
    </motion.svg>
  );
}
