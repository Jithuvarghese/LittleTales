import { motion, useReducedMotion, type TargetAndTransition } from 'framer-motion';
import type { ReactNode } from 'react';
import type { AnimName, Scene as SceneData } from '@/content/schema';
import { CharacterHost } from '@/components/CharacterHost';
import { Backdrop } from './Backdrops';
import { Prop } from './props';

export const animations: Record<AnimName, TargetAndTransition> = {
  wiggle: { rotate: [0, -12, 12, -8, 0], transition: { duration: 0.6 } },
  bounce: { y: [0, -24, 0], transition: { duration: 0.6 } },
  spin: { rotate: [0, 360], transition: { duration: 0.8 } },
  float: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity } },
  grow: { scale: [1, 1.25, 1], transition: { duration: 0.6 } },
  none: {},
};

export type Pulse = { id: string; anim: AnimName; n: number };
type Props = { scene: SceneData; children?: ReactNode; className?: string; label?: string; pulse?: Pulse | null };

/** Composes a picture from a backdrop plus positioned props and characters. */
export function Scene({ scene, children, className = '', label, pulse }: Props) {
  const reduce = useReducedMotion();
  const items = [
    ...scene.props.map((p) => ({ key: `p-${p.prop}-${p.x}-${p.y}`, name: p.prop, ...p, node: <Prop id={p.prop} /> })),
    ...scene.characters.map((c) => ({
      key: `c-${c.id}`,
      name: c.id as string,
      ...c,
      node: <CharacterHost character={c.id} expression={c.expression} size={1000} />,
    })),
  ];

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-blob border-[5px] border-outline ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
    >
      <Backdrop name={scene.backdrop} />
      {items.map((it, i) => (
        <motion.div
          key={it.key}
          className="absolute [&>svg]:h-full [&>svg]:w-full"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: `${it.size}%`,
            aspectRatio: '1',
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, y: 0, transition: { delay: 0.12 * i, duration: 0.4 } }
          }
        >
          <motion.div
            key={pulse?.id === it.name ? `pulse-${pulse.n}` : 'still'}
            className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
            animate={
              reduce
                ? undefined
                : pulse?.id === it.name
                  ? animations[pulse.anim]
                  : it.anim === 'float'
                    ? animations.float
                    : undefined
            }
          >
            {it.node}
          </motion.div>
        </motion.div>
      ))}
      {children}
    </div>
  );
}
