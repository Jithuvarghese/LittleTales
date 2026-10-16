/**
 * Clean-up for recorded takes, done in the browser so no audio knowledge or
 * extra software is needed: trim silence, remove low rumble, gentle noise gate,
 * normalise loudness, and warn about takes that are too quiet, clipped or noisy.
 */

export type TakeReport = { tooQuiet: boolean; clipped: boolean; noisy: boolean; durationMs: number; peak: number; noiseDb: number };

const db = (x: number) => 20 * Math.log10(Math.max(1e-9, x));

/** RMS level of each 20 ms window. */
export function windowRms(samples: Float32Array, rate: number, ms = 20): number[] {
  const n = Math.max(1, Math.round((rate * ms) / 1000));
  const out: number[] = [];
  for (let i = 0; i < samples.length; i += n) {
    let sum = 0;
    const end = Math.min(samples.length, i + n);
    for (let j = i; j < end; j++) sum += samples[j]! * samples[j]!;
    out.push(Math.sqrt(sum / Math.max(1, end - i)));
  }
  return out;
}

export function analyse(samples: Float32Array, rate: number): TakeReport {
  let peak = 0;
  let clippedCount = 0;
  for (const s of samples) {
    const a = Math.abs(s);
    if (a > peak) peak = a;
    if (a >= 0.99) clippedCount++;
  }
  const rms = windowRms(samples, rate).sort((a, b) => a - b);
  const floor = rms[Math.floor(rms.length * 0.1)] ?? 0;
  const noiseDb = db(floor);
  return {
    tooQuiet: peak < 0.1,
    clipped: clippedCount > samples.length * 0.001,
    noisy: noiseDb > -45,
    durationMs: Math.round((samples.length / rate) * 1000),
    peak,
    noiseDb: Math.round(noiseDb),
  };
}

/** Removes leading and trailing silence, keeping a short natural pad. */
export function trimSilence(samples: Float32Array, rate: number, thresholdDb = -42, padMs = 120): Float32Array {
  const win = windowRms(samples, rate);
  const n = Math.round(rate * 0.02);
  const loud = (r: number) => db(r) > thresholdDb;
  const first = win.findIndex(loud);
  if (first < 0) return samples.slice(0, 0);
  let last = win.length - 1;
  while (last > first && !loud(win[last]!)) last--;
  const pad = Math.round((rate * padMs) / 1000);
  return samples.slice(Math.max(0, first * n - pad), Math.min(samples.length, (last + 1) * n + pad));
}

/** One-pole high-pass filter (removes rumble and handling noise below ~80 Hz). */
export function highPass(samples: Float32Array, rate: number, cutoff = 80): Float32Array {
  const rc = 1 / (2 * Math.PI * cutoff);
  const a = rc / (rc + 1 / rate);
  const out = new Float32Array(samples.length);
  let prevIn = 0;
  let prevOut = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i]!;
    prevOut = a * (prevOut + x - prevIn);
    prevIn = x;
    out[i] = prevOut;
  }
  return out;
}

/** Gentle noise gate: softens windows near the noise floor (light noise reduction). */
export function noiseGate(samples: Float32Array, rate: number, floorDb: number): Float32Array {
  const n = Math.round(rate * 0.02);
  const win = windowRms(samples, rate);
  const out = new Float32Array(samples);
  win.forEach((r, w) => {
    if (db(r) < floorDb + 6) for (let i = w * n; i < Math.min(out.length, (w + 1) * n); i++) out[i]! *= 0.3;
  });
  return out;
}

/** Scales to a target RMS loudness without letting peaks exceed -1 dBFS. */
export function normalise(samples: Float32Array, targetRmsDb = -18): Float32Array {
  let sum = 0;
  let peak = 0;
  for (const s of samples) {
    sum += s * s;
    peak = Math.max(peak, Math.abs(s));
  }
  const rms = Math.sqrt(sum / Math.max(1, samples.length));
  if (rms === 0) return samples;
  const gain = Math.min(10 ** (targetRmsDb / 20) / rms, 0.89 / Math.max(peak, 1e-9));
  return samples.map((s) => s * gain);
}

export function cleanTake(samples: Float32Array, rate: number) {
  const report = analyse(samples, rate);
  let s = highPass(samples, rate);
  s = trimSilence(s, rate);
  s = noiseGate(s, rate, report.noiseDb);
  s = normalise(s);
  return { samples: s, report: { ...report, durationMs: Math.round((s.length / rate) * 1000) } };
}

/** 16-bit mono WAV, playable everywhere and convertible to MP3 by the dev server. */
export function encodeWav(samples: Float32Array, rate: number): ArrayBuffer {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  const str = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + samples.length * 2, true);
  str(8, 'WAVEfmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, samples.length * 2, true);
  samples.forEach((s, i) => v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 0x7fff, true));
  return buf;
}
