/**
 * npm run audio:generate [-- --dry-run] [-- --only <story-or-rhyme-id>] [-- --engine kokoro] [-- --force]
 * npm run audio:samples  -> comparison clips for choosing an engine/voice
 *
 * Finds every line of text without up-to-date audio, generates it with the local
 * engine, normalises loudness with ffmpeg, writes MP3s under public/audio, and
 * writes word timings back into the content JSON. Idempotent: a hash of
 * text + voice + settings is stored in config/audio-cache.json, so unchanged lines
 * are never regenerated. Clips listed in config/approved-clips.json are never touched.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { estimateTimings, providers, run, type VoiceSettings, type WordTiming } from './provider';

type Job = { out: string; text: string; voice: string; kind: 'narration' | 'sfx-less'; apply?: (t: WordTiming[]) => void };

const voices = JSON.parse(readFileSync('config/voices.json', 'utf8'));
const pron = JSON.parse(readFileSync('config/pronunciations.json', 'utf8'));
const cachePath = 'config/audio-cache.json';
const approvedPath = 'config/approved-clips.json';
const cache: Record<string, string> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const approved = new Set<string>(existsSync(approvedPath) ? JSON.parse(readFileSync(approvedPath, 'utf8')) : []);

const LUFS = { narration: -16 };

export function applyPronunciations(text: string, replacements: Record<string, string> = pron.replacements) {
  let out = text;
  for (const [from, to] of Object.entries(replacements)) {
    out = out.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), to);
  }
  return out;
}

export function jobHash(text: string, voice: VoiceSettings, engine: string) {
  return createHash('sha256').update(JSON.stringify({ text, voice, engine, v: 1 })).digest('hex').slice(0, 16);
}

function collectJobs(only?: string) {
  const jobs: Job[] = [];
  const dirty = new Map<string, unknown>(); // content files to write back

  const storyDir = 'content/stories/en';
  for (const f of readdirSync(storyDir).filter((x) => x.endsWith('.json'))) {
    const path = join(storyDir, f);
    const s = JSON.parse(readFileSync(path, 'utf8'));
    if (only && s.id !== only) continue;
    s.pages.forEach((p: Record<string, any>, i: number) => {
      if (p.type === 'story') {
        p.narration ??= { src: `audio/narration/en/${s.id}/p${i + 1}.mp3` };
        jobs.push({ out: p.narration.src, text: p.text, voice: 'narrator', kind: 'narration', apply: (t) => { p.narration.wordTimings = t; dirty.set(path, s); } });
      } else {
        p.questionAudio ??= `audio/narration/en/${s.id}/q${i + 1}.mp3`;
        dirty.set(path, s);
        jobs.push({ out: p.questionAudio, text: p.question, voice: 'narrator', kind: 'narration' });
      }
    });
  }

  const rhymeDir = 'content/rhymes/en';
  for (const f of readdirSync(rhymeDir).filter((x) => x.endsWith('.json'))) {
    const path = join(rhymeDir, f);
    const r = JSON.parse(readFileSync(path, 'utf8'));
    if (only && r.id !== only) continue;
    r.lines.forEach((l: Record<string, any>, i: number) => {
      l.narration ??= { src: `audio/songs/${r.id}/l${i + 1}.mp3` };
      jobs.push({ out: l.narration.src, text: l.text, voice: 'songHost', kind: 'narration', apply: (t) => { l.narration.wordTimings = t; dirty.set(path, r); } });
    });
  }

  if (!only) {
    const letters = JSON.parse(readFileSync('content/letters.en.json', 'utf8')).letters;
    for (const l of letters) {
      jobs.push({ out: l.audio.name, text: `${l.letter}.`, voice: 'letters', kind: 'sfx-less' });
      jobs.push({ out: l.audio.sound, text: pron.phonics[l.letter] ?? l.sound, voice: 'letters', kind: 'sfx-less' });
      jobs.push({ out: l.audio.word, text: `${l.letter} is for ${l.word}.`, voice: 'letters', kind: 'sfx-less' });
    }
    const numbers = JSON.parse(readFileSync('content/numbers.en.json', 'utf8')).numbers;
    for (const n of numbers) jobs.push({ out: n.audio, text: `${n.word}.`, voice: 'letters', kind: 'sfx-less' });
  }
  return { jobs, dirty };
}

async function durationMs(file: string) {
  const out = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Math.round(parseFloat(out) * 1000);
}

async function encode(wav: string, mp3: string, lufs: number) {
  mkdirSync(dirname(mp3), { recursive: true });
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11`, '-ar', '44100', '-ac', '1', '-b:a', '96k', mp3]);
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry-run');
  const force = args.includes('--force');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : undefined;
  const engineId = args.includes('--engine') ? args[args.indexOf('--engine') + 1]! : voices.engine;
  const engine = providers[engineId];
  if (!engine) throw new Error(`Unknown engine "${engineId}"`);

  const { jobs, dirty } = collectJobs(only);
  const todo = jobs.filter((j) => {
    if (approved.has(j.out)) return false;
    const v = voices.voices[j.voice] as VoiceSettings;
    return force || cache[j.out] !== jobHash(j.text, v, engineId) || !existsSync(join('public', j.out));
  });
  console.log(`${jobs.length} clips total, ${todo.length} to generate with ${engineId}.`);
  if (dry) {
    todo.slice(0, 50).forEach((j) => console.log(`  ${j.out}  "${j.text}"`));
    if (todo.length > 50) console.log(`  ...and ${todo.length - 50} more`);
    return;
  }
  if (todo.length === 0) return;

  await engine.check(voices.voices[todo[0]!.voice]);
  await run('ffmpeg', ['-version']).catch(() => {
    throw new Error('ffmpeg is required for loudness normalisation. See docs/AUDIO_GUIDE.md.');
  });

  const tmp = join(tmpdir(), 'lt-tts');
  mkdirSync(tmp, { recursive: true });
  let n = 0;
  for (const j of todo) {
    const v = voices.voices[j.voice] as VoiceSettings;
    const wav = join(tmp, `${n}.wav`);
    const spoken = applyPronunciations(j.text);
    const engineTimings = await engine.synthesize(spoken, v, wav);
    const mp3 = join('public', j.out);
    await encode(wav, mp3, LUFS.narration);
    const ms = await durationMs(mp3);
    const timings =
      engineTimings && engineTimings.length === j.text.split(/\s+/).filter(Boolean).length
        ? engineTimings.map((t, i) => ({ ...t, word: j.text.split(/\s+/).filter(Boolean)[i]! }))
        : estimateTimings(j.text, ms);
    j.apply?.(timings);
    cache[j.out] = jobHash(j.text, v, engineId);
    n++;
    if (n % 10 === 0) console.log(`  ${n}/${todo.length}`);
  }
  for (const [path, data] of dirty) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  rmSync(tmp, { recursive: true, force: true });
  console.log(`Generated ${n} clips. Next: npm run audio:review, then npm run content:manifest.`);
}

/** Comparison clips: one story sentence, one letter sound, one counting line per engine. */
async function samples() {
  const lines = {
    story: 'Pip looked up at the big, round moon. "Moon, are you sleepy too?"',
    letter: 'B! B says b, like ball!',
    counting: 'One, two, three mangoes! Well done!',
  };
  mkdirSync('tools/samples', { recursive: true });
  for (const [id, engine] of Object.entries(providers)) {
    const v = voices.voices.narrator as VoiceSettings;
    try {
      await engine.check(v);
    } catch (e) {
      console.log(`skip ${id}: ${(e as Error).message}`);
      continue;
    }
    for (const [name, text] of Object.entries(lines)) {
      const wav = join('tools/samples', `${id}-${name}.wav`);
      await engine.synthesize(text, v, wav);
      console.log(`wrote ${wav}`);
    }
  }
}

if (process.argv[1]?.endsWith('generate.ts')) {
  (process.argv.includes('--samples') ? samples() : main()).catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
