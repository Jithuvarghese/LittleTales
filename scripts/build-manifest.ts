/**
 * Builds content/index.json: story and rhyme summaries for lazy loading by
 * category, plus the list of audio files that actually exist under public/.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

export function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

export function buildManifest() {
  const storyDir = 'content/stories/en';
  const rhymeDir = 'content/rhymes/en';
  const stories = readdirSync(storyDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const s = read(join(storyDir, f));
      return {
        id: s.id,
        title: s.title,
        category: s.category,
        ageBand: s.ageBand,
        durationTag: s.durationTag,
        characters: s.characters,
        theme: s.theme,
        coverScene: s.coverScene,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  const rhymes = readdirSync(rhymeDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const r = read(join(rhymeDir, f));
      return { id: r.id, title: r.title, counting: Boolean(r.counting) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  const audio = listFiles('public/audio')
    .filter((p) => /\.(mp3|ogg|m4a|wav)$/.test(p))
    .map((p) => relative('public', p).replace(/\\/g, '/'))
    .sort();
  return { stories, rhymes, audio };
}

if (process.argv[1]?.endsWith('build-manifest.ts')) {
  const m = buildManifest();
  writeFileSync('content/index.json', JSON.stringify(m, null, 2) + '\n');
  console.log(`manifest: ${m.stories.length} stories, ${m.rhymes.length} rhymes, ${m.audio.length} audio files`);
}
