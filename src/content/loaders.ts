import manifest from '../../content/index.json';
import lettersRaw from '../../content/letters.en.json';
import numbersRaw from '../../content/numbers.en.json';
import stickersRaw from '../../content/stickers.json';
import wordsRaw from '../../content/words.en.json';
import {
  lettersFile,
  numbersFile,
  rhyme,
  stickersFile,
  wordsFile,
  story,
  type Category,
  type Rhyme,
  type Story,
} from './schema';

export type StorySummary = {
  id: string;
  title: string;
  category: Category[];
  ageBand: string;
  durationTag: string;
  characters: string[];
  theme?: string;
  coverScene?: Story['coverScene'];
};
export type RhymeSummary = { id: string; title: string; counting: boolean };

export const storyIndex = manifest.stories as StorySummary[];
export const rhymeIndex = manifest.rhymes as RhymeSummary[];

// Each story/rhyme file is its own lazy chunk.
const storyFiles = import.meta.glob<{ default: unknown }>('../../content/stories/en/*.json');
const rhymeFiles = import.meta.glob<{ default: unknown }>('../../content/rhymes/en/*.json');

function fileFor(files: Record<string, () => Promise<{ default: unknown }>>, id: string) {
  return Object.entries(files).find(([path]) => path.endsWith(`/${id}.json`))?.[1];
}

export async function loadStory(id: string): Promise<Story | null> {
  const load = fileFor(storyFiles, id);
  if (!load) return null;
  const parsed = story.safeParse((await load()).default);
  if (!parsed.success) {
    console.warn(`Story "${id}" failed validation`, parsed.error.issues);
    return null;
  }
  return parsed.data;
}

export async function loadRhyme(id: string): Promise<Rhyme | null> {
  const load = fileFor(rhymeFiles, id);
  if (!load) return null;
  const parsed = rhyme.safeParse((await load()).default);
  return parsed.success ? parsed.data : null;
}

export const letters = lettersFile.parse(lettersRaw).letters;
export const numbers = numbersFile.parse(numbersRaw).numbers;
export const stickerData = stickersFile.parse(stickersRaw);
export const words = wordsFile.parse(wordsRaw).words;
