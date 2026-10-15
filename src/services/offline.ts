import manifest from '../../content/index.json';
import { loadStory } from '@/content/loaders';

const CACHE = 'lt-media';
const known = new Set((manifest as { audio?: string[] }).audio ?? []);

/** Collects every recorded audio file a story references (only files that exist). */
async function storyAssets(id: string): Promise<string[]> {
  const story = await loadStory(id); // also pulls the story's code chunk into the service-worker cache
  if (!story) return [];
  const srcs = new Set<string>();
  if (story.music?.src) srcs.add(story.music.src);
  for (const p of story.pages) {
    if (p.type === 'story') {
      if (p.narration?.src) srcs.add(p.narration.src);
      p.sfx.forEach((s) => srcs.add(s.src));
      if (p.image) srcs.add(p.image);
    } else if (p.questionAudio) srcs.add(p.questionAudio);
  }
  return [...srcs].filter((s) => known.has(s) || s.startsWith('images/'));
}

/** "Keep this story offline": stores its media in the cache the service worker serves from. */
export async function cacheStory(id: string) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE);
    await cache.addAll((await storyAssets(id)).map((s) => `/${s}`));
  } catch {
    /* offline or quota: the story still works online */
  }
}

export async function uncacheStory(id: string) {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE);
    await Promise.all((await storyAssets(id)).map((s) => cache.delete(`/${s}`)));
  } catch {
    /* ignore */
  }
}
