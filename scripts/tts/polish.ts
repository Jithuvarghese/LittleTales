/**
 * npm run audio:polish
 * Re-finishes existing generated clips (hiss removal, gated gaps, click-free
 * edges, linear loudness) without regenerating speech. Human recordings and
 * approved clips are left untouched. Clip length is unchanged, so timings stay valid.
 */
import { existsSync, readFileSync, renameSync } from 'node:fs';
import { finishClip } from './provider';

const cache: Record<string, string> = JSON.parse(readFileSync('config/audio-cache.json', 'utf8'));
const readList = (p: string) => new Set<string>(existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []);
const keep = new Set([...readList('config/approved-clips.json'), ...readList('config/recorded-clips.json')]);
const config = JSON.parse(readFileSync('config/voices.json', 'utf8'));

async function main() {
  const clips = Object.keys(cache).filter((c) => !keep.has(c) && existsSync(`public/${c}`));
  let n = 0;
  for (const c of clips) {
    // Whispered/sleepy lines stay quieter: read the delivery from the file name group where known.
    const lufs = /p\d+\.mp3$/.test(c) ? lufsFor(c) : -16;
    const tmp = `public/${c}.tmp.mp3`;
    await finishClip(`public/${c}`, tmp, lufs);
    renameSync(tmp, `public/${c}`);
    if (++n % 25 === 0) console.log(`  ${n}/${clips.length}`);
  }
  console.log(`Polished ${n} clips.`);
}

/** Looks up the page's delivery so whispers and sleepy lines keep their lower level. */
function lufsFor(clip: string) {
  const m = clip.match(/narration\/en\/([^/]+)\/p(\d+)\.mp3$/);
  if (!m) return -16;
  try {
    const story = JSON.parse(readFileSync(`content/stories/en/${m[1]}.json`, 'utf8'));
    const page = story.pages.find((p: { narration?: { src: string } }) => p.narration?.src === clip);
    const vol = config.deliveries[page?.delivery ?? 'narrator']?.volume ?? 1;
    return Number((-16 + 20 * Math.log10(vol)).toFixed(1));
  } catch {
    return -16;
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
