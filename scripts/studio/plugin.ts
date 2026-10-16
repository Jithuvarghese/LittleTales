/**
 * Dev-server middleware for the recording studio (/studio). Only active in
 * `npm run dev`; never part of the production build.
 *
 *   GET  /__studio/lines           every line that needs audio, with status
 *   POST /__studio/save?out=<path> body: WAV bytes -> public/<path> (mp3 via ffmpeg when available)
 *   POST /__studio/flag            {out, flagged}
 *   POST /__studio/song-timings    {id, lineTimings}
 */
import type { Plugin } from 'vite';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

type Line = { out: string; text: string; direction: string; group: string; kind: 'line' | 'song'; status: 'recorded' | 'generated' | 'pending'; flagged: boolean };

const RECORDED = 'config/recorded-clips.json';
const REDO = 'config/redo.json';
const readJson = <T>(p: string, fallback: T): T => (existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : fallback);
const writeJson = (p: string, v: unknown) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const exists = (out: string) => ['.mp3', '.wav', '.webm', '.ogg'].some((e) => existsSync(join('public', out.replace(/\.(mp3|wav|webm|ogg)$/, '') + e)));

const directionFor = (role: string, delivery: string) =>
  `${role === 'narrator' ? 'Storyteller' : role[0]!.toUpperCase() + role.slice(1)} · ${delivery === 'narrator' ? 'warm and clear' : delivery}`;

/** Priority order: letters, numbers, praise and quiz questions, then stories, then songs. */
async function collectLines(): Promise<Line[]> {
  const { splitParts } = await import('../../src/content/voicing');
  const { strings } = await import('../../src/strings');
  const { uiLineSrc } = await import('../../src/content/voicing');
  const recorded = new Set(readJson<string[]>(RECORDED, []));
  const flagged = new Set(readJson<string[]>(REDO, []));
  const lines: Omit<Line, 'status' | 'flagged'>[] = [];

  const letters = readJson<{ letters: { letter: string; word: string; sound: string; audio: { name: string; sound: string; word: string } }[] }>('content/letters.en.json', { letters: [] }).letters;
  for (const l of letters) {
    lines.push({ out: l.audio.name, text: l.letter, direction: 'Teacher · say the letter name, bright', group: 'Letters', kind: 'line' });
    lines.push({ out: l.audio.sound, text: `/${l.sound}/`, direction: 'Teacher · the SOUND only (b not "buh"), short and clean', group: 'Letters', kind: 'line' });
    lines.push({ out: l.audio.word, text: `${l.letter} is for ${l.word}!`, direction: 'Teacher · excited', group: 'Letters', kind: 'line' });
  }
  for (const n of readJson<{ numbers: { word: string; audio: string }[] }>('content/numbers.en.json', { numbers: [] }).numbers)
    lines.push({ out: n.audio, text: `${n.word}!`, direction: 'Teacher · counting, cheerful', group: 'Numbers', kind: 'line' });
  const praise = [strings.quiz.great, strings.quiz.tryAgain, strings.storyEnd.wellDone, ...strings.praise];
  for (const t of praise) lines.push({ out: uiLineSrc(t), text: t, direction: 'Quiz host · big smile', group: 'Praise', kind: 'line' });

  const stories = readdirSync('content/stories/en').filter((f) => f.endsWith('.json')).map((f) => readJson<any>(join('content/stories/en', f), {}));
  for (const s of stories) for (const p of s.pages) if (p.type === 'quiz' && p.questionAudio) lines.push({ out: p.questionAudio, text: p.question, direction: 'Quiz host · gentle, curious', group: 'Quiz questions', kind: 'line' });
  for (const s of stories) {
    for (const p of s.pages) {
      if (p.type !== 'story') continue;
      const parts = splitParts(p.text, { delivery: p.delivery, speaker: p.speaker });
      const dir = parts.map((x) => directionFor(x.role, x.delivery)).filter((v, i, a) => a.indexOf(v) === i).join(' → ');
      lines.push({ out: p.narration.src, text: p.text, direction: dir, group: s.title, kind: 'line' });
      for (const h of p.hotspots ?? []) if (h.onTap?.sayAudio) lines.push({ out: h.onTap.sayAudio, text: h.onTap.say, direction: 'Sound word · silly and loud!', group: s.title, kind: 'line' });
    }
  }
  for (const f of readdirSync('content/rhymes/en').filter((x) => x.endsWith('.json'))) {
    const r = readJson<any>(join('content/rhymes/en', f), {});
    lines.push({ out: `audio/songs/${r.id}/vocal.mp3`, text: r.lines.map((l: { text: string }) => l.text).join('\n'), direction: `Sing the whole rhyme (${r.tempo} beats per minute). Use headphones if playing the click.`, group: 'Songs', kind: 'song' });
  }
  return lines.map((l) => ({ ...l, status: recorded.has(l.out) ? 'recorded' : exists(l.out) ? 'generated' : 'pending', flagged: flagged.has(l.out) }));
}

function body(req: import('node:http').IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function ffmpegPath() {
  const dir = process.env.FFMPEG_DIR;
  return dir ? join(dir, 'ffmpeg') : 'ffmpeg';
}

/** Writes a take: WAV, then MP3 with loudness normalisation when ffmpeg is available. */
async function saveTake(out: string, wav: Buffer) {
  if (!/^audio\/[\w/-]+\.(mp3|wav)$/.test(out) || out.includes('..')) throw new Error('bad path');
  const stem = join('public', out.replace(/\.(mp3|wav)$/, ''));
  mkdirSync(dirname(stem), { recursive: true });
  for (const e of ['.mp3', '.wav', '.webm', '.ogg']) if (existsSync(stem + e)) unlinkSync(stem + e);
  writeFileSync(`${stem}.wav`, wav);
  const r = spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', `${stem}.wav`, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', '-b:a', '96k', `${stem}.mp3`]);
  if (r.status === 0) unlinkSync(`${stem}.wav`);
  const saved = r.status === 0 ? `${stem}.mp3` : `${stem}.wav`;
  const recorded = new Set(readJson<string[]>(RECORDED, []));
  recorded.add(out);
  writeJson(RECORDED, [...recorded].sort());
  return saved;
}

/** Writes word timings for a saved story line (estimated from duration). */
async function writeTimings(out: string, durationMs: number) {
  const { estimateTimings } = await import('../tts/provider');
  for (const f of readdirSync('content/stories/en').filter((x) => x.endsWith('.json'))) {
    const path = join('content/stories/en', f);
    const s = readJson<any>(path, {});
    let changed = false;
    for (const p of s.pages) {
      if (p.type === 'story' && p.narration?.src === out) {
        p.narration.wordTimings = estimateTimings(p.text, durationMs);
        changed = true;
      }
    }
    if (changed) writeJson(path, s);
  }
}

async function refreshManifest() {
  const { buildManifest } = await import('../build-manifest');
  writeJson('content/index.json', buildManifest());
}

export function studioPlugin(): Plugin {
  return {
    name: 'littletales-studio',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__studio/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const send = (code: number, data: unknown) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        try {
          if (url.pathname === '/__studio/lines') return send(200, await collectLines());
          if (req.method === 'POST' && url.pathname === '/__studio/save') {
            const out = url.searchParams.get('out') ?? '';
            const ms = Number(url.searchParams.get('ms') ?? 0);
            const saved = await saveTake(out, await body(req));
            if (ms) await writeTimings(out, ms);
            await refreshManifest();
            return send(200, { saved });
          }
          if (req.method === 'POST' && url.pathname === '/__studio/flag') {
            const { out, flagged } = JSON.parse((await body(req)).toString());
            const set = new Set(readJson<string[]>(REDO, []));
            if (flagged) set.add(out);
            else set.delete(out);
            writeJson(REDO, [...set].sort());
            return send(200, { ok: true });
          }
          if (req.method === 'POST' && url.pathname === '/__studio/song-timings') {
            const { id, lineTimings } = JSON.parse((await body(req)).toString());
            const path = join('content/rhymes/en', `${String(id).replace(/[^a-z0-9-]/g, '')}.json`);
            const r = readJson<any>(path, null);
            if (!r) return send(404, { error: 'no such rhyme' });
            r.vocal = `audio/songs/${r.id}/vocal.mp3`;
            r.lineTimings = lineTimings.map((n: number) => Math.round(n));
            writeJson(path, r);
            return send(200, { ok: true });
          }
          send(404, { error: 'not found' });
        } catch (e) {
          send(500, { error: e instanceof Error ? e.message : String(e) });
        }
      });
    },
  };
}
