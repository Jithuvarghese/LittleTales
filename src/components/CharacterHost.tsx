import { Character, toPose, type Pose } from '@/art/cast/Character';

export type CharacterId = 'pip' | 'bumble' | 'luna' | 'zig' | 'coco';

type Props = { character?: string; expression?: string; pose?: Pose; size?: number; facing?: 'left' | 'right'; speaking?: boolean };

/** Renders a cast member in a pose (older expression names are mapped onto poses). */
export function CharacterHost({ character = 'pip', expression, pose, size, facing, speaking }: Props) {
  return <Character id={character} pose={pose ?? toPose(expression)} size={size} facing={facing} speaking={speaking} />;
}
