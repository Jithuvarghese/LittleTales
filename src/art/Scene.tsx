import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import type { ReactNode } from 'react';
import type { AnimName, Scene as SceneData } from '@/content/schema';
import { Character, toPose, type Pose } from './cast/Character';
import { Background, resolveBackground } from './scene/Backgrounds';
import { Effects, defaultEffects, type Effect } from './scene/Effects';
import { Prop } from './props';

/** One-off reactions when something is tapped. */
export const animations: Record<AnimName, TargetAndTransition> = {
  wiggle: { rotate: [0, -12, 12, -8, 0], transition: { duration: 0.6 } },
  bounce: { y: [0, -24, 0], scaleY: [1, 1.08, 0.92, 1], transition: { duration: 0.6 } },
  spin: { rotate: [0, 360], transition: { duration: 0.8 } },
  float: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity } },
  grow: { scale: [1, 1.25, 0.95, 1], transition: { duration: 0.6 } },
  twinkle: { scale: [1, 1.3, 1], rotate: [0, 15, 0], transition: { duration: 0.6 } },
  sway: { rotate: [0, -8, 8, 0], transition: { duration: 0.9 } },
  none: {},
};

/** Gentle loops for props that are always alive. */
const idleLoops: Partial<Record<AnimName, TargetAndTransition>> = {
  float: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  twinkle: { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85], transition: { duration: 2, repeat: Infinity } },
  sway: { rotate: [-4, 4, -4], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  bounce: { y: [0, -6, 0], transition: { duration: 1.2, repeat: Infinity } },
  wiggle: { rotate: [-3, 3, -3], transition: { duration: 1.6, repeat: Infinity } },
};

/** Ken Burns style camera drift (a few percent only). */
const cameraMoves: Record<string, TargetAndTransition> = {
  'zoom-in': { scale: [1, 1.06], transition: { duration: 14, ease: 'easeOut' } },
  'zoom-out': { scale: [1.06, 1], transition: { duration: 14, ease: 'easeOut' } },
  'pan-left': { scale: 1.06, x: ['2%', '-2%'], transition: { duration: 16, ease: 'easeInOut' } },
  'pan-right': { scale: 1.06, x: ['-2%', '2%'], transition: { duration: 16, ease: 'easeInOut' } },
  still: {},
};

export type Pulse = { id: string; anim: AnimName; n: number };
type Props = {
  scene: SceneData;
  children?: ReactNode;
  className?: string;
  label?: string;
  pulse?: Pulse | null;
  /** Pose changes from the page timeline or reactions (character id → pose). */
  poses?: Record<string, Pose>;
  /** Character currently speaking (its mouth follows the voice). */
  speaker?: string | null;
  /** Small cover thumbnails skip effects and camera to stay light. */
  thumbnail?: boolean;
};

/** Composes a story picture: animated background, effects, props and acting characters. */
export function Scene({ scene, children, className = '', label, pulse, poses, speaker, thumbnail }: Props) {
  const reduce = useReducedMotion();
  const bg = resolveBackground(scene.backdrop);
  const fx: Effect[] = thumbnail ? [] : ((scene.effects as Effect[] | undefined) ?? defaultEffects[bg] ?? []);
  const cam = !thumbnail && !reduce ? cameraMoves[scene.camera ?? 'zoom-in'] : undefined;

  const items = [
    ...scene.props.map((p) => ({ key: `p-${p.prop}-${p.x}-${p.y}`, name: p.prop, kind: 'prop' as const, ...p })),
    ...scene.characters.map((c) => ({ key: `c-${c.id}-${c.x}`, name: c.id, kind: 'char' as const, ...c })),
  ];
  // Staggered entrance: props first, then characters, about 400 ms in total.
  const step = Math.min(0.06, 0.36 / Math.max(1, items.length));

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-blob border-[5px] border-outline ${className}`}
      data-scene=""
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      <motion.div className="absolute inset-0" animate={cam}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }}>
          <Background name={bg} />
        </motion.div>
        {fx.length > 0 && <Effects list={fx} />}
        {items.map((it, i) => {
          const isPulsed = pulse?.id === it.name;
          const pose: Pose = it.kind === 'char' ? (isPulsed ? 'happy' : (poses?.[it.name] ?? (it.pose as Pose | undefined) ?? toPose(it.expression))) : 'idle';
          return (
            <motion.div
              key={it.key}
              className="absolute [&>svg]:h-full [&>svg]:w-full"
              style={{
                left: `${it.x}%`,
                top: `${it.y}%`,
                width: `${it.size}%`,
                aspectRatio: it.kind === 'char' ? '200 / 222' : '1',
                translateX: '-50%',
                translateY: '-50%',
                zIndex: it.kind === 'char' ? 2 : 1,
              }}
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.9 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, transition: { delay: 0.12 + step * i, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] } }}
            >
              <motion.div
                key={isPulsed ? `pulse-${pulse!.n}` : 'still'}
                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                animate={reduce ? undefined : isPulsed ? animations[pulse!.anim] : it.kind === 'prop' && it.anim ? idleLoops[it.anim] : undefined}
              >
                {it.kind === 'char' ? (
                  <Character id={it.name} pose={pose} size="100%" facing={(it as { facing?: 'left' | 'right' }).facing} speaking={speaker === it.name} />
                ) : (
                  <Prop id={it.name} />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
      {children}
    </div>
  );
}
