/**
 * npm run audio:import -- <folder-or-zip> --model <name>
 * Places clips made in the free GPU notebook into public/audio: files are named
 * after their target path (audio__narration__en__story__p1.wav). Each clip is
 * loudness-normalised to MP3, gets estimated word timings, is recorded in
 * config/recorded-clips.json (never regenerated) and noted for attribution.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { bin, estimateTimings, run } from './provider';
import { buildManifest } from '../build-manifest';

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'notebook';
if (!src) {
  console.error('Usage: npm run audio:import -- <folder-or-zip> --model <name>');
  process.exit(1);
}

async function main() {
  let dir = src!;
  if (src!.endsWith('.zip')) {
    dir = join('tools', 'import-tmp');
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    await run('tar', ['-xf', src!, '-C', dir]);
  }
  const recordedPath = 'config/recorded-clips.json';
  const recorded = new Set<string>(existsSync(recordedPath) ? JSON.parse(readFileSync(recordedPath, 'utf8')) : []);
  const files = readdirSync(dir).filter((f) => /\.(wav|mp3)$/.test(f) && f.includes('audio__'));
  let n = 0;
  for (const f of files) {
    // "<model>__audio__narration__en__x__p1.wav" -> "audio/narration/en/x/p1.mp3"
    const target = basename(f).replace(/^[a-z0-9]+__(?=audio__)/, '').replace(/__/g, '/').replace(/\.(wav|mp3)$/, '.mp3');
    if (!/^audio\/[\w/-]+\.mp3$/.test(target)) continue;
    const out = join('public', target);
    mkdirSync(dirname(out), { recursive: true });
    await run(bin('ffmpeg'), ['-y', '-loglevel', 'error', '-i', join(dir, f), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', '-b:a', '96k', out]);
    const ms = Math.round(parseFloat(await run(bin('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out])) * 1000);
    for (const sf of readdirSync('content/stories/en').filter((x) => x.endsWith('.json'))) {
      const path = join('content/stories/en', sf);
      const s = JSON.parse(readFileSync(path, 'utf8'));
      let changed = false;
      for (const p of s.pages) if (p.type === 'story' && p.narration?.src === target) { p.narration.wordTimings = estimateTimings(p.text, ms); changed = true; }
      if (changed) writeFileSync(path, JSON.stringify(s, null, 2) + '\n');
    }
    recorded.add(target);
    n++;
  }
  writeFileSync(recordedPath, JSON.stringify([...recorded].sort(), null, 2) + '\n');
  writeFileSync('content/index.json', JSON.stringify(buildManifest(), null, 2) + '\n');
  console.log(`Imported ${n} clips made with ${model}. Add "${model}" and its licence to docs/ATTRIBUTIONS.md and licenses.json.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
