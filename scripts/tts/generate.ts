/**
 * npm run audio:generate [-- --dry-run] [-- --only <story-id|letters|numbers|ui>] [-- --engine kokoro] [-- --force] [-- --estimate]
 * npm run audio:samples  -> comparison clips for choosing voices
 *
 * Performs every line that needs audio:
 *  - splits it into parts (narrator vs. the speaking character) and sentences,
 *  - synthesises each sentence with that role's voice and the line's delivery
 *    (speed), shifts pitch and applies the role's sound chain with ffmpeg,
 *  - joins sentences with breathing pauses and a short lead-in,
 *  - normalises loudness (quieter for whispers) and writes MP3 + word timings.
 *
 * Idempotent: a hash of text + voicing + settings per clip is stored in
 * config/audio-cache.json, so unchanged lines are never regenerated. Clips listed in
 * config/approved-clips.json, and human recordings, are never touched.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { bin, estimateTimings, finishClip, providers, run, type SynthJob, type WordTiming } from './provider';
import { splitParts, uiLineSrc, type Delivery, type Part, type Role } from '../../src/content/voicing';
import { strings } from '../../src/strings';

type Clip = { out: string; text: string; parts: Part[]; apply?: (t: WordTiming[]) => void };
type Sentence = { clip: number; part: number; display: string; spoken: string; role: Role; delivery: Delivery; raw: string; processed: string; ms: number; timings: WordTiming[] | null };

const config = JSON.parse(readFileSync('config/voices.json', 'utf8'));
const pron = JSON.parse(readFileSync('config/pronunciations.json', 'utf8'));
const cachePath = 'config/audio-cache.json';
const approvedPath = 'config/approved-clips.json';
const recordedPath = 'config/recorded-clips.json';
const cache: Record<string, string> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const readList = (p: string) => new Set<string>(existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : []);
const protectedClips = new Set([...readList(approvedPath), ...readList(recordedPath)]);

const LUFS = -16;

export function applyPronunciations(text: string, replacements: Record<string, string> = pron.replacements) {
  let out = text;
  for (const [from, to] of Object.entries(replacements)) {
    out = out.replace(new RegExp(`(^|[^\\w'])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w'])`, 'g'), `$1${to}`);
  }
  return out;
}

export function jobHash(text: string, voice: unknown, engine: string) {
  return createHash('sha256').update(JSON.stringify({ text, voice, engine, v: 2 })).digest('hex').slice(0, 16);
}

/** Splits a part into sentences, keeping the words exactly as displayed. */
export function sentences(text: string) {
  return text.split(/(?<=[.!?…])\s+(?=\S)/).map((s) => s.trim()).filter((s) => /\w/.test(s));
}

const voiceSettingsFor = (parts: Part[], engine: string) => ({
  parts: parts.map((p) => ({ ...p, role: config.roles[p.role]?.[engine], r: config.roles[p.role], d: config.deliveries[p.delivery] })),
  chains: config.chains,
  ageRate: config.ageRate,
  overrides: config.overrides,
});

function collectClips(only?: string): { clips: Clip[]; dirty: Map<string, unknown> } {
  const clips: Clip[] = [];
  const dirty = new Map<string, unknown>();
  const storyDir = 'content/stories/en';
  for (const f of readdirSync(storyDir).filter((x) => x.endsWith('.json'))) {
    const path = join(storyDir, f);
    const s = JSON.parse(readFileSync(path, 'utf8'));
    if (only && s.id !== only) continue;
    s.pages.forEach((p: Record<string, any>, i: number) => {
      if (p.type === 'story') {
        p.narration ??= { src: `audio/narration/en/${s.id}/p${i + 1}.mp3` };
        clips.push({
          out: p.narration.src,
          text: p.text,
          parts: splitParts(p.text, { delivery: p.delivery, speaker: p.speaker }),
          apply: (t) => { p.narration.wordTimings = t; dirty.set(path, s); },
        });
        for (const h of p.hotspots ?? []) {
          if (!h.onTap?.say || !h.onTap.sayAudio) continue;
          const isChar = p.scene?.characters?.some((c: { id: string }) => c.id === h.id);
          clips.push({ out: h.onTap.sayAudio, text: h.onTap.say, parts: [{ text: h.onTap.say, role: isChar ? h.id : 'narrator', delivery: 'silly' }] });
        }
      } else {
        p.questionAudio ??= `audio/narration/en/${s.id}/q${i + 1}.mp3`;
        dirty.set(path, s);
        clips.push({ out: p.questionAudio, text: p.question, parts: [{ text: p.question, role: 'quizHost', delivery: 'gentle' }] });
      }
    });
  }

  if (!only || only === 'ui') {
    const lines: [string, Delivery][] = [
      [strings.quiz.great, 'excited'],
      [strings.quiz.tryAgain, 'gentle'],
      [strings.storyEnd.wellDone, 'proud'],
      [strings.letters.breakTime, 'gentle'],
      [strings.screenTime.stretch, 'excited'],
      [strings.screenTime.dailyDone, 'gentle'],
      [strings.quiz.countAloud, 'excited'],
      ...strings.praise.map((t) => [t, 'excited'] as [string, Delivery]),
    ];
    for (const [text, delivery] of lines) clips.push({ out: uiLineSrc(text), text, parts: [{ text, role: 'quizHost', delivery }] });
  }
  if (!only || only === 'letters') {
    const letters = JSON.parse(readFileSync('content/letters.en.json', 'utf8')).letters;
    for (const l of letters) {
      clips.push({ out: l.audio.name, text: `${l.letter}!`, parts: [{ text: `${l.letter}!`, role: 'teacher', delivery: 'excited' }] });
      const snd = pron.phonics[l.letter] ?? l.sound;
      clips.push({ out: l.audio.sound, text: snd, parts: [{ text: snd, role: 'teacher', delivery: 'gentle' }] });
      const word = `${l.letter} is for ${l.word}!`;
      clips.push({ out: l.audio.word, text: word, parts: [{ text: word, role: 'teacher', delivery: 'excited' }] });
    }
  }
  if (!only || only === 'numbers') {
    const numbers = JSON.parse(readFileSync('content/numbers.en.json', 'utf8')).numbers;
    for (const n of numbers) {
      const t = `${n.word[0].toUpperCase()}${n.word.slice(1)}!`;
      clips.push({ out: n.audio, text: t, parts: [{ text: t, role: 'teacher', delivery: 'excited' }] });
    }
  }
  return { clips, dirty };
}

/** Runs async tasks with limited concurrency. */
async function pool<T>(items: T[], limit: number, fn: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i]!, i);
      }
    }),
  );
}

async function durationMs(file: string) {
  const out = await run(bin('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Math.round(parseFloat(out) * 1000);
}

let hasRubberband: boolean | null = null;
async function pitchFilter(pitch: number) {
  if (Math.abs(pitch - 1) < 0.01) return '';
  if (hasRubberband === null) hasRubberband = (await run(bin('ffmpeg'), ['-hide_banner', '-filters'])).includes('rubberband');
  return hasRubberband
    ? `rubberband=pitch=${pitch.toFixed(3)}:formant=preserved,`
    : `asetrate=${Math.round(24000 * pitch)},aresample=24000,atempo=${(1 / pitch).toFixed(3)},`;
}

const silenceCache = new Map<number, string>();
async function silence(ms: number, dir: string) {
  const key = Math.round(ms / 10) * 10;
  if (silenceCache.has(key)) return silenceCache.get(key)!;
  const f = join(dir, `sil-${key}.wav`);
  await run(bin('ffmpeg'), ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(key / 1000), '-c:a', 'pcm_s16le', f]);
  silenceCache.set(key, f);
  return f;
}

function mapTimings(display: string, engine: WordTiming[] | null, ms: number): WordTiming[] {
  const words = display.split(/\s+/).filter(Boolean);
  if (engine && engine.length === words.length) return engine.map((t, i) => ({ ...t, word: words[i]! }));
  return estimateTimings(display, ms);
}

async function main() {
  const args = process.argv.slice(2);
  const flag = (n: string) => args.includes(n);
  const val = (n: string) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
  const engineId = val('--engine') ?? config.engine;
  const engine = providers[engineId];
  if (!engine) throw new Error(`Unknown engine "${engineId}"`);
  const { clips, dirty } = collectClips(val('--only'));

  const todo = clips.filter((c) => {
    if (protectedClips.has(c.out)) return false;
    return flag('--force') || cache[c.out] !== jobHash(c.text, voiceSettingsFor(c.parts, engineId), engineId) || !existsSync(join('public', c.out));
  });
  const chars = todo.reduce((s, c) => s + c.text.length, 0);
  console.log(`${clips.length} clips total, ${todo.length} to generate with ${engineId} (${chars} characters).`);
  if (flag('--estimate')) {
    console.log('Paid services usually bill per character; compare this total with your plan\'s monthly allowance before generating.');
    return;
  }
  if (flag('--dry-run')) {
    todo.slice(0, 60).forEach((c) => console.log(`  ${c.out}  ${c.parts.map((p) => `[${p.role}/${p.delivery}] ${p.text}`).join(' ')}`));
    if (todo.length > 60) console.log(`  ...and ${todo.length - 60} more`);
    return;
  }
  if (!todo.length) return;
  await engine.check();
  await run(bin('ffmpeg'), ['-version']).catch(() => {
    throw new Error('ffmpeg is required. Install it, or set FFMPEG_DIR to its bin folder (see docs/AUDIO_GUIDE.md).');
  });

  const tmp = join('tools', 'tts-tmp');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  // Work in chunks and save progress after each, so an interrupted run loses little.
  const sents: Sentence[] = [];
  const CHUNK = 30;
  for (let c0 = 0; c0 < todo.length; c0 += CHUNK) {
    const chunk = todo.slice(c0, c0 + CHUNK);
    console.log(`Chunk ${c0 / CHUNK + 1} of ${Math.ceil(todo.length / CHUNK)}`);
    sents.length = 0;
    // 1. Sentences for every clip.
    chunk.forEach((c, ci) =>
      c.parts.forEach((p, pi) =>
        sentences(p.text).forEach((display) => {
          const n = sents.length;
          sents.push({ clip: ci, part: pi, display, spoken: applyPronunciations(display), role: p.role, delivery: p.delivery, raw: join(tmp, `s${n}.wav`), processed: join(tmp, `p${n}.wav`), ms: 0, timings: null });
        }),
      ),
    );

    // 2. Synthesise all sentences in one batch (model loads once).
    const jobs: SynthJob[] = sents.map((s) => {
      const r = config.roles[s.role] ?? config.roles.narrator;
      const d = config.deliveries[s.delivery] ?? config.deliveries.narrator;
      const picked = engineId === 'kokoro' ? config.overrides?.[`${s.role}.${s.delivery}`] : undefined;
      const voice = picked ?? (r[engineId] && typeof r[engineId] === 'object' ? r[engineId].model : r[engineId]);
      return { text: s.spoken, voice: String(voice), speed: r.rate * d.rate * config.ageRate, out: s.raw };
    });
    console.log(`Synthesising ${jobs.length} sentences...`);
    const engineTimings = await engine.synthesizeBatch(jobs, (n) => n % 25 === 0 && console.log(`  ${n}/${jobs.length}`));

    // 3. Per-sentence pitch + role sound chain.
    console.log('Shaping sound...');
    await pool(sents, 3, async (s, i) => {
      const r = config.roles[s.role] ?? config.roles.narrator;
      const d = config.deliveries[s.delivery] ?? config.deliveries.narrator;
      const chain = config.chains[d.chain ?? r.chain] ?? config.chains.narrator;
      const filter = `${await pitchFilter(r.pitch * d.pitch)}${chain},silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,afade=t=in:d=0.01,areverse,afade=t=in:d=0.025,areverse`;
      await run(bin('ffmpeg'), ['-y', '-loglevel', 'error', '-i', s.raw, '-af', filter, '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le', s.processed]);
      s.ms = await durationMs(s.processed);
      s.timings = engineTimings[i] ?? null;
    });

    // 4. Join sentences with breathing pauses, normalise, encode, record timings.
    console.log('Joining and encoding...');
    await pool(chunk, 3, async (c, ci) => {
      const own = sents.filter((s) => s.clip === ci);
      const listFile = join(tmp, `c${ci}.txt`);
      const entries: string[] = [];
      const timings: WordTiming[] = [];
      let t = config.leadInMs;
      entries.push(await silence(config.leadInMs, tmp));
      for (let k = 0; k < own.length; k++) {
        const s = own[k]!;
        entries.push(s.processed);
        for (const w of mapTimings(s.display, s.timings, s.ms)) timings.push({ word: w.word, startMs: t + w.startMs, endMs: t + w.endMs });
        t += s.ms;
        const nextS = own[k + 1];
        if (nextS) {
          const pause = config.deliveries[s.delivery]?.pauseMs ?? 380;
          const ms = nextS.part !== s.part ? pause : pause * 0.7;
          entries.push(await silence(ms, tmp));
          t += Math.round(ms / 10) * 10;
        }
      }
      writeFileSync(listFile, entries.map((e) => `file '${e.replace(/\\/g, '/').replace(/^tools\/tts-tmp\//, '')}'`).join('\n'));
      const vol = Math.min(...c.parts.map((p) => config.deliveries[p.delivery]?.volume ?? 1));
      const lufs = (LUFS + 20 * Math.log10(vol)).toFixed(1);
      const mp3 = join('public', c.out);
      mkdirSync(dirname(mp3), { recursive: true });
      await finishClip(listFile, mp3, Number(lufs), true);
      c.apply?.(timings);
      cache[c.out] = jobHash(c.text, voiceSettingsFor(c.parts, engineId), engineId);
    });
    for (const [path, data] of dirty) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  }
  for (const [path, data] of dirty) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
  rmSync(tmp, { recursive: true, force: true });
  console.log(`Generated ${todo.length} clips. Next: npm run audio:review, then npm run content:manifest.`);
}

/** Comparison clips: the same five lines in each configured role. */
async function samples() {
  const lines: [string, Delivery][] = [
    ['Pip looked up at the big, round moon.', 'narrator'],
    ['Hooray! We found the treasure!', 'excited'],
    ['Shh... the baby bird is sleeping.', 'whisper'],
    ['Oh no. The kite is stuck in the tree.', 'sad'],
    ['B says buh... one, two, three!', 'excited'],
  ];
  const engineId = config.engine;
  const engine = providers[engineId]!;
  await engine.check();
  const dir = 'tools/samples';
  mkdirSync(dir, { recursive: true });
  const jobs: SynthJob[] = [];
  for (const role of Object.keys(config.roles)) {
    lines.forEach(([text, d], i) => {
      const r = config.roles[role];
      jobs.push({ text, voice: String(typeof r[engineId] === 'object' ? r[engineId].model : r[engineId]), speed: r.rate * config.deliveries[d].rate * config.ageRate, out: join(dir, `${role}-${i + 1}-${d}.wav`) });
    });
  }
  await engine.synthesizeBatch(jobs, (n) => console.log(`  ${n}/${jobs.length}`));
  console.log(`Wrote ${jobs.length} clips to ${dir}`);
}

if (process.argv[1]?.endsWith('generate.ts')) {
  (process.argv.includes('--samples') ? samples() : main()).catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}

/** Line list for exporting to the free-GPU notebook (same voicing as generation). */
export function collectClipsForExport() {
  return collectClips().clips;
}
