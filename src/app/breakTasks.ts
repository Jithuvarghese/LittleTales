import type { Pose } from '@/art/cast/Character';

/**
 * Stretch-break tasks linked to what the child was just doing, so the break
 * carries the learning into the room ("find something blue", "count the fans").
 */
export type BreakTask = { text: string; host: string; pose: Pose };

const COLOURS = ['red', 'blue', 'green', 'yellow', 'orange', 'pink', 'white', 'brown'];
const LETTERS: [string, string][] = [['B', 'a ball'], ['C', 'a cup'], ['S', 'a sock'], ['T', 'a toy'], ['P', 'a pillow'], ['D', 'a door']];

export const breakTasks: Record<string, BreakTask[]> = {
  colours: COLOURS.map((c) => ({ text: `Find something ${c} in your room, and point to it!`, host: 'zig', pose: 'wave' as Pose })),
  numbers: [
    { text: 'Count the fans in your house!', host: 'bumble', pose: 'think' },
    { text: 'Count the windows in your room!', host: 'bumble', pose: 'think' },
    { text: 'Count the chairs in your room!', host: 'bumble', pose: 'think' },
    { text: 'Clap your hands five times!', host: 'bumble', pose: 'cheer' },
    { text: 'Jump up and down three times!', host: 'bumble', pose: 'dance' },
  ],
  letters: LETTERS.map(([l, thing]) => ({ text: `Find something that starts with ${l}, like ${thing}!`, host: 'zig', pose: 'think' as Pose })),
  stories: [
    { text: 'Hop like a bunny, three times!', host: 'pip', pose: 'dance' },
    { text: 'Stretch up tall like a tree!', host: 'pip', pose: 'cheer' },
    { text: 'Flap your arms like a bird!', host: 'pip', pose: 'wave' },
  ],
  songs: [
    { text: 'Dance and wiggle to the music!', host: 'coco', pose: 'dance' },
    { text: 'Clap along with me, one, two, three!', host: 'coco', pose: 'cheer' },
  ],
  flags: [
    { text: 'Wave your arms like a flag in the wind!', host: 'pip', pose: 'wave' },
    { text: 'Find something with two colours on it!', host: 'pip', pose: 'think' },
  ],
  games: [{ text: 'Jump up and down three times!', host: 'coco', pose: 'dance' }],
  default: [{ text: 'Reach up high, wiggle your fingers, and touch your toes.', host: 'pip', pose: 'cheer' }],
};

/** Every task line (for voice generation). */
export const allBreakLines = [...new Set(Object.values(breakTasks).flat().map((t) => t.text))];

/** Picks a task for the section of the site the child is in. */
export function taskFor(pathname: string, rand: () => number = Math.random): BreakTask {
  const section = pathname.split('/')[1] ?? '';
  const list = breakTasks[section] ?? breakTasks.default!;
  return list[Math.floor(rand() * list.length)]!;
}
