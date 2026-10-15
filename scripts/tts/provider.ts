/**
 * Text-to-speech provider interface. Engines run locally on the developer's
 * machine only; nothing is sent to an online service. Swap engines (or move to
 * recorded human voices) by adding a provider here, without touching content.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type VoiceSettings = {
  piper?: { model: string; speaker?: number };
  kokoro?: { voice: string };
  speed: number;
};

export type WordTiming = { word: string; startMs: number; endMs: number };

export interface TtsProvider {
  readonly id: string;
  /** Throws with setup instructions if the engine or model is missing. */
  check(voice: VoiceSettings): Promise<void>;
  /** Writes a WAV file for the text. May return word timings if the engine provides them. */
  synthesize(text: string, voice: VoiceSettings, outWav: string): Promise<WordTiming[] | null>;
}

export const MODELS_DIR = 'tools/models';

export function run(cmd: string, args: string[], input?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}: ${err.slice(-500)}`))));
    if (input !== undefined) p.stdin.end(input);
    else p.stdin.end();
  });
}

/** Piper (MIT engine; check each voice model's own licence before use). */
export const piper: TtsProvider = {
  id: 'piper',
  async check(voice) {
    const model = voice.piper?.model;
    if (!model) throw new Error('No piper model configured for this voice in config/voices.json');
    if (!existsSync(join(MODELS_DIR, model)))
      throw new Error(`Missing ${join(MODELS_DIR, model)}. See docs/AUDIO_GUIDE.md ("Install Piper").`);
    await run('piper', ['--help']).catch(() => {
      throw new Error('The "piper" command was not found. Install it with: pip install piper-tts');
    });
  },
  async synthesize(text, voice, outWav) {
    const args = ['--model', join(MODELS_DIR, voice.piper!.model), '--output_file', outWav, '--length_scale', String(1 / voice.speed), '--sentence_silence', '0.35'];
    if (voice.piper!.speaker !== undefined) args.push('--speaker', String(voice.piper!.speaker));
    await run('piper', args, text);
    return null;
  },
};

/** Kokoro-82M (Apache-2.0 model) via the small Python helper in scripts/tts/kokoro_say.py. */
export const kokoro: TtsProvider = {
  id: 'kokoro',
  async check() {
    await run('python', ['scripts/tts/kokoro_say.py', '--check']).catch(() => {
      throw new Error('Kokoro is not installed. Run: pip install kokoro soundfile  (see docs/AUDIO_GUIDE.md)');
    });
  },
  async synthesize(text, voice, outWav) {
    const out = await run('python', ['scripts/tts/kokoro_say.py', '--voice', voice.kokoro!.voice, '--speed', String(voice.speed), '--out', outWav], text);
    try {
      const parsed = JSON.parse(out.trim().split('\n').pop() ?? 'null');
      return Array.isArray(parsed) && parsed.length ? (parsed as WordTiming[]) : null;
    } catch {
      return null;
    }
  },
};

export const providers: Record<string, TtsProvider> = { piper, kokoro };

/**
 * Duration-proportional word timings: each word gets time in proportion to its
 * length (plus a little for punctuation pauses). Used when no aligner result exists.
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
