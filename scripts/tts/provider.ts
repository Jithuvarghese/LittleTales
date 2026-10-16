/**
 * Text-to-speech provider interface. Engines run on the developer's machine
 * (or produce files offline); the website never calls a speech service. Swap
 * engines, or move to recorded human voices, without touching content or app code.
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type WordTiming = { word: string; startMs: number; endMs: number };

/** One clip to synthesise: text, engine voice id (may be a blend "a,b") and speed. */
export type SynthJob = { text: string; voice: string; speed: number; out: string };

export interface TtsProvider {
  readonly id: string;
  /** Throws with setup instructions if the engine or model is missing. */
  check(): Promise<void>;
  /** Synthesises many clips (WAV). Returns engine word timings per job when available. */
  synthesizeBatch(jobs: SynthJob[], onProgress?: (done: number) => void): Promise<(WordTiming[] | null)[]>;
}

export const MODELS_DIR = 'tools/models';

/** ffmpeg/ffprobe may not be on PATH right after installing; FFMPEG_DIR can point at its bin folder. */
export const bin = (name: string) => (process.env.FFMPEG_DIR ? join(process.env.FFMPEG_DIR, name) : name);

export function run(cmd: string, args: string[], input?: string, onLine?: (line: string) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    let partial = '';
    p.stdout.on('data', (d: Buffer) => {
      const text = d.toString();
      out += text;
      if (onLine) {
        partial += text;
        const lines = partial.split('\n');
        partial = lines.pop() ?? '';
        lines.forEach((l) => l.trim() && onLine(l));
      }
    });
    p.stderr.on('data', (d: Buffer) => (err += d.toString()));
    p.on('error', reject);
    p.on('close', (code: number) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}: ${err.slice(-800)}`))));
    if (input !== undefined) p.stdin.end(input);
    else p.stdin.end();
  });
}

/** Kokoro-82M (Apache-2.0), batch mode so the model loads once. Supports voice blends "a,b". */
export const kokoro: TtsProvider = {
  id: 'kokoro',
  async check() {
    await run('python', ['scripts/tts/kokoro_say.py', '--check']).catch(() => {
      throw new Error('Kokoro is not installed. Run: pip install kokoro soundfile  (see docs/AUDIO_GUIDE.md)');
    });
  },
  async synthesizeBatch(jobs, onProgress) {
    const file = join('tools', 'kokoro-jobs.json');
    writeFileSync(file, JSON.stringify(jobs));
    const byOut = new Map<string, WordTiming[] | null>();
    await run('python', ['scripts/tts/kokoro_say.py', '--batch', file], undefined, (line) => {
      try {
        const r = JSON.parse(line) as { out: string; timings: WordTiming[] | null };
        byOut.set(r.out, r.timings?.length ? r.timings : null);
        onProgress?.(byOut.size);
      } catch {
        /* not a result line */
      }
    });
    return jobs.map((j) => byOut.get(j.out) ?? null);
  },
};

/** Piper (MIT engine; each voice model has its own licence). "voice" is a model file name. */
export const piper: TtsProvider = {
  id: 'piper',
  async check() {
    await run('piper', ['--help']).catch(() => {
      throw new Error('The "piper" command was not found. Install it with: pip install piper-tts');
    });
  },
  async synthesizeBatch(jobs, onProgress) {
    let n = 0;
    for (const j of jobs) {
      const model = join(MODELS_DIR, j.voice);
      if (!existsSync(model)) throw new Error(`Missing ${model}. See docs/AUDIO_GUIDE.md.`);
      await run('piper', ['--model', model, '--output_file', j.out, '--length_scale', String(1 / j.speed)], j.text);
      onProgress?.(++n);
    }
    return jobs.map(() => null);
  },
};

/**
 * Optional paid service (Tier 3). Used only on the developer's machine during
 * generation; the key lives in a git-ignored .env file and the website never calls it.
 * "voice" is the service's voice id. Requires the account's plan to allow commercial use.
 */
export const elevenlabs: TtsProvider = {
  id: 'elevenlabs',
  async check() {
    loadEnv();
    if (!process.env.ELEVENLABS_API_KEY) throw new Error('Set ELEVENLABS_API_KEY in .env (see .env.example).');
  },
  async synthesizeBatch(jobs, onProgress) {
    loadEnv();
    const key = process.env.ELEVENLABS_API_KEY!;
    const model = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
    let n = 0;
    const out: (WordTiming[] | null)[] = [];
    for (const j of jobs) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(j.voice)}/with-timestamps?output_format=pcm_24000`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: j.text, model_id: model, voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.5, speed: Math.min(1.2, Math.max(0.7, j.speed)) } }),
      });
      if (!res.ok) throw new Error(`Voice service error ${res.status}: ${(await res.text()).slice(0, 300)}`);
      const data = (await res.json()) as { audio_base64: string; alignment?: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } };
      writeWav(j.out, Buffer.from(data.audio_base64, 'base64'), 24000);
      out.push(data.alignment ? charsToWords(data.alignment) : null);
      onProgress?.(++n);
    }
    return out;
  },
};

export const providers: Record<string, TtsProvider> = { kokoro, piper, elevenlabs };

function loadEnv() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '');
  }
}

function writeWav(path: string, pcm: Buffer, rate: number) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  writeFileSync(path, Buffer.concat([h, pcm]));
}

function charsToWords(a: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }): WordTiming[] {
  const words: WordTiming[] = [];
  let cur: WordTiming | null = null;
  a.characters.forEach((c, i) => {
    if (/\s/.test(c)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = { word: '', startMs: Math.round(a.character_start_times_seconds[i]! * 1000), endMs: 0 };
    cur.word += c;
    cur.endMs = Math.round(a.character_end_times_seconds[i]! * 1000);
  });
  if (cur) words.push(cur);
  return words;
}

/**
 * Duration-proportional word timings: each word gets time in proportion to its
 * length (plus a little for punctuation pauses). Used when no engine timings exist.
 */
export function estimateTimings(text: string, durationMs: number, leadMs = 80, tailMs = 120): WordTiming[] {
  const words = text.split(/\s+/).filter(Boolean);
  const weight = (w: string) => w.replace(/[^\w']/g, '').length + 2 + (/[,.!?;:]$/.test(w) ? 3 : 0);
  const total = words.reduce((s, w) => s + weight(w), 0) || 1;
  const usable = Math.max(0, durationMs - leadMs - tailMs);
  let t = leadMs;
  return words.map((word) => {
    const d = (weight(word) / total) * usable;
    const timing = { word, startMs: Math.round(t), endMs: Math.round(t + d) };
    t += d;
    return timing;
  });
}

/**
 * Clean finishing for any voice clip: remove hiss, gate the silent gaps, fade the
 * edges (no clicks), then two-pass linear loudness normalisation so quiet
 * background noise is never pumped up. Keeps the clip length unchanged so word
 * timings stay in sync. Writes a 44.1 kHz mono MP3.
 */
export const CLEAN_CHAIN =
  // Steep cut below the engine's 12 kHz limit removes the faint whistle tone.
  'lowpass=f=10500,lowpass=f=10500,lowpass=f=10500,lowpass=f=10500,' +
  'afftdn=nf=-36:tn=1,' +
  'agate=threshold=0.02:ratio=10:attack=3:release=150:range=0.005,' +
  'afade=t=in:d=0.015,areverse,afade=t=in:d=0.06,areverse';

/** Runs ffmpeg and returns its stderr (where loudnorm prints its measurements). */
function ffmpegStderr(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(bin('ffmpeg'), args);
    let err = '';
    p.stderr.on('data', (d: Buffer) => (err += d.toString()));
    p.on('error', reject);
    p.on('close', () => resolve(err));
  });
}

export async function finishClip(input: string, out: string, lufs = -16, concat = false) {
  const src = concat ? ['-f', 'concat', '-safe', '0', '-i', input] : ['-i', input];
  const txt = await ffmpegStderr(['-hide_banner', '-nostats', ...src, '-af', `${CLEAN_CHAIN},loudnorm=I=${lufs}:TP=-2:LRA=11:print_format=json`, '-f', 'null', '-']);
  const m = (k: string) => txt.match(new RegExp(`"${k}"\\s*:\\s*"(-?[\\d.]+|-inf)"`))?.[1];
  const [I, TP, LRA, TH, offset] = ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset'].map(m);
  const norm =
    I && TP && LRA && TH && I !== '-inf'
      ? `loudnorm=I=${lufs}:TP=-2:LRA=11:measured_I=${I}:measured_TP=${TP}:measured_LRA=${LRA}:measured_thresh=${TH}:offset=${offset ?? 0}:linear=true`
      : `loudnorm=I=${lufs}:TP=-2:LRA=11`;
  await run(bin('ffmpeg'), ['-y', '-loglevel', 'error', ...src, '-af', `${CLEAN_CHAIN},${norm}`, '-ar', '44100', '-ac', '1', '-b:a', '112k', out]);
}
