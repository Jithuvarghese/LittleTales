import { motion, useReducedMotion } from 'framer-motion';
import { useSettings } from '@/app/settingsStore';

/**
 * Decorative world behind every screen: soft sky, rolling hills, drifting clouds,
 * flying birds and fluttering butterflies. Never takes taps (pointer-events none)
 * and sits behind all content. Motion stops when reduced motion is requested.
 */
const O = '#4a2f27';

function Bird({ color = '#5ab6e8', flap = true }: { color?: string; flap?: boolean }) {
  return (
    <svg viewBox="0 0 60 40" width="100%" height="100%" aria-hidden stroke={O} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
      <motion.path
        d="M22 20q-10-14-20-8q8 2 12 10z"
        fill={color}
        style={{ originX: '22px', originY: '20px' }}
        animate={flap ? { rotate: [0, 28, 0] } : undefined}
        transition={{ duration: 0.35, repeat: Infinity }}
      />
      <ellipse cx="30" cy="24" rx="14" ry="9" fill={color} />
      <circle cx="42" cy="18" r="7" fill={color} />
      <path d="M48 17l7 2-7 3z" fill="#f2a33a" />
      <circle cx="44" cy="16.5" r="1.6" fill={O} stroke="none" />
      <motion.path
        d="M30 20q4-16 16-14q-6 6-8 16z"
        fill={color}
        style={{ originX: '30px', originY: '20px' }}
        animate={flap ? { rotate: [0, -30, 0] } : undefined}
        transition={{ duration: 0.35, repeat: Infinity }}
      />
    </svg>
  );
}

function Butterfly({ a = '#c9a0ff', b = '#ff9fc4', flap = true }: { a?: string; b?: string; flap?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden stroke={O} strokeWidth={2.5} strokeLinejoin="round">
      <motion.g style={{ originX: '20px', originY: '20px' }} animate={flap ? { scaleX: [1, 0.35, 1] } : undefined} transition={{ duration: 0.4, repeat: Infinity }}>
        <path d="M20 20q-14-18-17-5q0 10 17 5zM20 20q14-18 17-5q0 10-17 5z" fill={a} />
        <path d="M20 21q-11 12-13 4zM20 21q11 12 13 4z" fill={b} />
      </motion.g>
      <path d="M20 12v18" />
    </svg>
  );
}

const Cloud = () => (
  <svg viewBox="0 0 120 60" width="100%" height="100%" aria-hidden>
    <path d="M20 50q-16 0-14-14q2-12 16-10q2-18 24-18q16 0 22 14q18-6 24 10q14 2 8 18z" fill="#fff" opacity="0.85" />
  </svg>
);

export function LivingSky({ calm = false }: { calm?: boolean }) {
  const reduce = useReducedMotion();
  const bedtime = useSettings((s) => s.bedtime);
  const theme = useSettings((s) => s.theme);
  const night = bedtime || theme === 'starry-night';
  const still = reduce || calm;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Sky gradient and hills follow the theme colours */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--bg) 70%, white) 0%, var(--bg) 60%)' }} />
      <svg className="absolute bottom-0 left-0 h-[22vh] min-h-[120px] w-full" viewBox="0 0 1440 220" preserveAspectRatio="none">
        <path d="M0 120Q240 40 520 100T1040 90T1440 80V220H0z" fill="color-mix(in srgb, var(--primary) 35%, var(--bg))" />
        <path d="M0 170Q300 110 640 160T1440 140V220H0z" fill="color-mix(in srgb, var(--primary) 55%, var(--bg))" />
      </svg>

      {night ? (
        [...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#f7e27a]"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 55}%` }}
            animate={still ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
          />
        ))
      ) : (
        <>
          {[{ top: '8%', w: 160, d: 90, delay: 0 }, { top: '22%', w: 110, d: 120, delay: -40 }, { top: '14%', w: 130, d: 105, delay: -75 }].map((c, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ top: c.top, width: c.w, height: c.w / 2, left: still ? `${15 + i * 30}%` : undefined }}
              initial={still ? false : { x: '-20vw' }}
              animate={still ? undefined : { x: ['-20vw', '110vw'] }}
              transition={{ duration: c.d, repeat: Infinity, ease: 'linear', delay: c.delay }}
            >
              <Cloud />
            </motion.div>
          ))}
          {/* Birds glide across now and then */}
          {[{ top: '12%', size: 44, d: 26, delay: 2, color: '#5ab6e8' }, { top: '18%', size: 34, d: 32, delay: 14, color: '#ff8a6b' }, { top: '9%', size: 30, d: 30, delay: 22, color: '#ffcb47' }].map((b, i) =>
            still ? null : (
              <motion.div
                key={`b${i}`}
                className="absolute"
                style={{ top: b.top, width: b.size, height: b.size * 0.66 }}
                initial={{ x: '-10vw' }}
                animate={{ x: ['-10vw', '110vw'], y: [0, -18, 6, -10, 0] }}
                transition={{ duration: b.d, repeat: Infinity, ease: 'linear', delay: b.delay, repeatDelay: 6 }}
              >
                <Bird color={b.color} />
              </motion.div>
            ),
          )}
          {/* Butterflies flutter low over the hills */}
          {[{ left: '8%', bottom: '14vh', a: '#c9a0ff', b: '#ff9fc4' }, { left: '82%', bottom: '18vh', a: '#ffcb47', b: '#ff8a6b' }].map((f, i) => (
            <motion.div
              key={`f${i}`}
              className="absolute h-9 w-9"
              style={{ left: f.left, bottom: f.bottom }}
              animate={still ? undefined : { x: [0, 40, -10, 30, 0], y: [0, -30, -10, -40, 0] }}
              transition={{ duration: 9 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Butterfly a={f.a} b={f.b} flap={!still} />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}

export { Bird, Butterfly };
