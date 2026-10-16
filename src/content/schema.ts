import { z } from 'zod';

/** Zod schemas for all content. Content files in /content must validate against these. */

export const locale = z.literal('en');
export const characterId = z.enum(['pip', 'bumble', 'luna', 'zig', 'coco']);
export const expression = z.enum(['idle', 'happy', 'thinking', 'celebrate', 'talking', 'sleepy', 'surprised']);
export const themeId = z.enum(['sunny-meadow', 'under-the-sea', 'starry-night', 'candy-land']);
export const category = z.enum([
  'animals',
  'bedtime',
  'friendship',
  'adventures',
  'nature',
  'feelings',
  'everyday',
  'fairy-tales',
  'learning',
]);
export const backdrop = z.enum(['meadow', 'night', 'sea', 'room', 'forest', 'beach', 'village', 'snow']);
export const delivery = z.enum(['narrator', 'excited', 'whisper', 'sleepy', 'sad', 'surprised', 'silly', 'proud', 'gentle']);
export const ambience = z.enum(['birds', 'sea', 'night', 'rain', 'wind', 'farm', 'none']);
export const animName = z.enum(['wiggle', 'bounce', 'spin', 'float', 'grow', 'none']);

export const wordTiming = z.object({
  word: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});

export const narration = z.object({
  src: z.string().optional(),
  wordTimings: z.array(wordTiming).optional(),
});

export const music = z.object({ src: z.string(), volume: z.number().min(0).max(1).default(0.4) });

/** A positioned thing in a scene; x/y/size are percentages of the scene box. */
const placed = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().min(1).max(100).default(20),
  anim: animName.optional(),
});

export const sceneProp = placed.extend({ prop: z.string() });
export const sceneCharacter = placed.extend({ id: characterId, expression: expression.optional() });

export const scene = z.object({
  backdrop,
  props: z.array(sceneProp).default([]),
  characters: z.array(sceneCharacter).default([]),
});

export const sfxTrigger = z.union([
  z.literal('onEnter'),
  z.literal('onTap'),
  z.string().regex(/^onWord:\d+$/),
]);
export const sfx = z.object({ trigger: sfxTrigger, src: z.string() });

export const hotspot = z.object({
  id: z.string(),
  shape: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
  label: z.string().optional(),
  onTap: z.object({
    sfx: z.string().optional(),
    say: z.string().optional(),
    /** Recorded or generated clip for the sound word (performed on its own). */
    sayAudio: z.string().optional(),
    animate: animName.optional(),
  }),
});

export const storyPage = z.object({
  type: z.literal('story'),
  text: z.string().min(1),
  image: z.string().optional(),
  animation: z.string().optional(),
  scene: scene.optional(),
  delivery: delivery.optional(),
  /** Character who speaks the quoted words on this page. */
  speaker: characterId.optional(),
  ambience: ambience.optional(),
  narration: narration.optional(),
  sfx: z.array(sfx).default([]),
  hotspots: z.array(hotspot).default([]),
  parentPrompt: z.string().optional(),
});

const reward = z.object({ stars: z.number().int().min(0).default(1) }).default({ stars: 1 });

export const quizOption = z.object({
  prop: z.string().optional(),
  image: z.string().optional(),
  label: z.string(),
  correct: z.boolean().optional(),
  color: z.string().optional(),
  shape: z.enum(['circle', 'square', 'triangle', 'star', 'heart']).optional(),
  face: z.enum(['happy', 'sad', 'sleepy', 'surprised', 'scared', 'angry']).optional(),
});

const quizBase = {
  type: z.literal('quiz'),
  question: z.string(),
  questionAudio: z.string().optional(),
  reward,
};

const withOneCorrect = (opts: z.infer<typeof quizOption>[]) =>
  opts.filter((o) => o.correct).length === 1;
const options = z.array(quizOption).min(2).max(4).refine(withOneCorrect, {
  message: 'exactly one option must be correct',
});

export const quizPage = z.discriminatedUnion('quizType', [
  z.object({ ...quizBase, quizType: z.literal('picture-choice'), options }),
  z.object({ ...quizBase, quizType: z.literal('sound-choice'), sound: z.string(), options }),
  z.object({
    ...quizBase,
    quizType: z.literal('count'),
    prop: z.string(),
    count: z.number().int().min(1).max(10),
    choices: z.array(z.number().int()).min(2).max(4),
  }),
  z.object({ ...quizBase, quizType: z.literal('match'), target: quizOption, options }),
  z.object({ ...quizBase, quizType: z.literal('sequence'), shown: z.array(z.string()).min(1), options }),
  z.object({
    ...quizBase,
    quizType: z.literal('drag-drop'),
    item: z.string(),
    targets: options,
  }),
  z.object({ ...quizBase, quizType: z.literal('feelings'), character: characterId, options }),
]);

export const page = z.union([storyPage, quizPage]);

export const story = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    locale,
    title: z.string(),
    category: z.array(category).min(1),
    ageBand: z.enum(['3-5', '5-7', '3-7']),
    durationTag: z.enum(['short', 'medium']),
    cover: z.string().optional(),
    coverScene: scene.optional(),
    theme: themeId.optional(),
    music: music.optional(),
    ambience: ambience.optional(),
    characters: z.array(characterId),
    pages: z.array(page).min(1),
  })
  .refine((s) => s.pages.filter((p) => p.type === 'story').length >= 8, {
    message: 'a story needs at least 8 story pages',
  });

export const rhymeLine = z.object({ text: z.string(), narration: narration.optional() });
export const rhyme = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  locale,
  title: z.string(),
  source: z.string(),
  publicDomain: z.boolean(),
  melody: z.string().optional(),
  tempo: z.number().min(40).max(160).default(90),
  scene,
  hotspots: z.array(hotspot).default([]),
  /** Recorded singing; start time of each line in ms (from the studio tap-timing tool). */
  vocal: z.string().optional(),
  lineTimings: z.array(z.number().nonnegative()).optional(),
  instrumental: z.string().optional(),
  counting: z.object({ prop: z.string(), from: z.number().int() }).optional(),
  lines: z.array(rhymeLine).min(1),
});

export const letterEntry = z.object({
  letter: z.string().regex(/^[A-Z]$/),
  sound: z.string(),
  word: z.string(),
  prop: z.string(),
  audio: z.object({ name: z.string(), sound: z.string(), word: z.string() }),
});
export const lettersFile = z.object({ locale, letters: z.array(letterEntry).length(26) });

export const numberEntry = z.object({
  value: z.number().int().min(0).max(100),
  word: z.string(),
  prop: z.string(),
  audio: z.string(),
});
export const numbersFile = z.object({ locale, numbers: z.array(numberEntry).min(21) });

export const sticker = z.object({ id: z.string(), album: z.string(), prop: z.string(), label: z.string() });
export const stickersFile = z.object({ albums: z.array(z.object({ id: z.string(), label: z.string(), backdrop })), stickers: z.array(sticker) });

export type Story = z.infer<typeof story>;
export type Page = z.infer<typeof page>;
export type StoryPage = z.infer<typeof storyPage>;
export type QuizPage = z.infer<typeof quizPage>;
export type QuizOption = z.infer<typeof quizOption>;
export type Scene = z.infer<typeof scene>;
export type Hotspot = z.infer<typeof hotspot>;
export type Rhyme = z.infer<typeof rhyme>;
export type LetterEntry = z.infer<typeof letterEntry>;
export type NumberEntry = z.infer<typeof numberEntry>;
export type Sticker = z.infer<typeof sticker>;
export type Category = z.infer<typeof category>;
export type WordTiming = z.infer<typeof wordTiming>;
export type AnimName = z.infer<typeof animName>;
export type Ambience = z.infer<typeof ambience>;
