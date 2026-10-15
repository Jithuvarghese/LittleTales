import { Pip, type Expression } from '@/art/Pip';

export type CharacterId = 'pip' | 'bumble' | 'luna' | 'zig' | 'coco';

type Props = { character?: CharacterId; expression?: Expression; size?: number };

/** Renders a mascot host. Only Pip is drawn so far; others fall back to Pip. */
export function CharacterHost({ expression = 'idle', size }: Props) {
  return <Pip expression={expression} size={size} />;
}
