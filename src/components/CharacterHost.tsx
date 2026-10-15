import { Pip, type Expression } from '@/art/Pip';
import { Bumble, Coco, Luna, Zig } from '@/art/Mascots';

export type CharacterId = 'pip' | 'bumble' | 'luna' | 'zig' | 'coco';

type Props = { character?: CharacterId; expression?: Expression; size?: number };

const cast = { pip: Pip, bumble: Bumble, luna: Luna, zig: Zig, coco: Coco };

/** Renders one of the five mascot hosts in a given expression. */
export function CharacterHost({ character = 'pip', expression = 'idle', size }: Props) {
  const C = cast[character] ?? Pip;
  return <C expression={expression} size={size} />;
}
