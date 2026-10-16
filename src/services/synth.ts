/**
 * Built-in sounds synthesised in code so nothing blocks on missing audio files:
 * soft UI effects and gentle music loops from public-domain melodies.
 */

export type SfxName =
  | 'chime'
  | 'pop'
  | 'whoosh'
  | 'boing'
  | 'sparkle'
  | 'boop'
  | 'tada'
  | 'click'
  | 'twinkle'
  | 'splash'
  | 'drum'
  | 'bell';

export const sfxNames: SfxName[] = [
  'chime', 'pop', 'whoosh', 'boing', 'sparkle', 'boop', 'tada', 'click', 'twinkle', 'splash', 'drum', 'bell',
];

type Tone = { f: number; t: number; d: number; type?: OscillatorType; v?: number; slide?: number };

const recipes: Record<SfxName, Tone[]> = {
  chime: [{ f: 880, t: 0, d: 0.5 }, { f: 1320, t: 0.08, d: 0.6, v: 0.6 }],
  pop: [{ f: 600, t: 0, d: 0.08, slide: 1200, type: 'triangle' }],
  whoosh: [{ f: 200, t: 0, d: 0.35, slide: 900, type: 'sawtooth', v: 0.15 }],
  boing: [{ f: 180, t: 0, d: 0.4, slide: 520, type: 'triangle' }],
  sparkle: [1568, 1976, 2349, 2637].map((f, i) => ({ f, t: i * 0.06, d: 0.25, v: 0.4 })),
  boop: [{ f: 420, t: 0, d: 0.18, slide: 300, type: 'sine', v: 0.6 }],
  tada: [523, 659, 784, 1047].map((f, i) => ({ f, t: i * 0.09, d: i === 3 ? 0.7 : 0.2, type: 'triangle' as const })),
  click: [{ f: 1000, t: 0, d: 0.03, type: 'square', v: 0.15 }],
  twinkle: [1760, 2093, 1760, 2637].map((f, i) => ({ f, t: i * 0.1, d: 0.3, v: 0.35 })),
  splash: [{ f: 900, t: 0, d: 0.3, slide: 150, type: 'sawtooth', v: 0.12 }],
  drum: [{ f: 140, t: 0, d: 0.25, slide: 60, type: 'sine', v: 1 }],
  bell: [{ f: 1046, t: 0, d: 1.0, v: 0.6 }, { f: 2093, t: 0, d: 0.6, v: 0.25 }],
};

export function playTones(ctx: AudioContext, dest: AudioNode, name: SfxName) {
  const now = ctx.currentTime;
  for (const tone of recipes[name]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.setValueAtTime(tone.f, now + tone.t);
    if (tone.slide) osc.frequency.exponentialRampToValueAtTime(tone.slide, now + tone.t + tone.d);
    const v = (tone.v ?? 0.5) * 0.5;
    gain.gain.setValueAtTime(0.0001, now + tone.t);
    gain.gain.exponentialRampToValueAtTime(v, now + tone.t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.t + tone.d);
    osc.connect(gain).connect(dest);
    osc.start(now + tone.t);
    osc.stop(now + tone.t + tone.d + 0.05);
  }
}

/** Melodies as [midi note, beats]; 0 = rest. All are public-domain tunes. */
export const melodies: Record<string, { bpm: number; notes: [number, number][]; wave: OscillatorType }> = {
  // "Ah! vous dirai-je, maman" (French folk, 1761) — the tune of Twinkle Twinkle / Baa Baa.
  twinkle: {
    bpm: 96,
    wave: 'triangle',
    notes: [
      [60, 1], [60, 1], [67, 1], [67, 1], [69, 1], [69, 1], [67, 2],
      [65, 1], [65, 1], [64, 1], [64, 1], [62, 1], [62, 1], [60, 2],
      [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
      [67, 1], [67, 1], [65, 1], [65, 1], [64, 1], [64, 1], [62, 2],
    ],
  },
  // Brahms, "Wiegenlied" Op. 49 No. 4 (1868); composer died 1897.
  lullaby: {
    bpm: 72,
    wave: 'sine',
    notes: [
      [64, 0.5], [64, 0.5], [67, 2], [64, 0.5], [64, 0.5], [67, 2],
      [64, 0.5], [67, 0.5], [72, 1], [71, 1.5], [69, 0.5], [69, 1], [67, 1],
      [62, 0.5], [64, 0.5], [65, 1], [62, 1], [62, 0.5], [64, 0.5], [65, 2],
      [62, 0.5], [65, 0.5], [71, 0.5], [69, 0.5], [67, 1], [71, 1], [72, 2],
    ],
  },
  // "Frère Jacques" (French traditional, 18th century).
  frere: {
    bpm: 104,
    wave: 'triangle',
    notes: [
      [60, 1], [62, 1], [64, 1], [60, 1], [60, 1], [62, 1], [64, 1], [60, 1],
      [64, 1], [65, 1], [67, 2], [64, 1], [65, 1], [67, 2],
      [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1],
      [67, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 1], [60, 1],
      [60, 1], [55, 1], [60, 2], [60, 1], [55, 1], [60, 2],
    ],
  },
  // "Row, Row, Row Your Boat" (traditional, published 1852).
  row: {
    bpm: 100,
    wave: 'triangle',
    notes: [
      [60, 1.5], [60, 1.5], [60, 1], [62, 0.5], [64, 1.5], [64, 1], [62, 0.5], [64, 1], [65, 0.5], [67, 3],
      [72, 0.5], [72, 0.5], [72, 0.5], [67, 0.5], [67, 0.5], [67, 0.5], [64, 0.5], [64, 0.5], [64, 0.5], [60, 0.5], [60, 0.5], [60, 0.5],
      [67, 1], [65, 0.5], [64, 1], [62, 0.5], [60, 3],
    ],
  },
  // "Mary Had a Little Lamb" (tune traditional, 1830s).
  mary: {
    bpm: 108,
    wave: 'triangle',
    notes: [
      [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 2],
      [62, 1], [62, 1], [62, 2], [64, 1], [67, 1], [67, 2],
      [64, 1], [62, 1], [60, 1], [62, 1], [64, 1], [64, 1], [64, 1], [64, 1],
      [62, 1], [62, 1], [64, 1], [62, 1], [60, 4],
    ],
  },
  // Gentle original play loop.
  play: {
    bpm: 110,
    wave: 'triangle',
    notes: [
      [60, 1], [64, 1], [67, 1], [64, 1], [65, 1], [69, 1], [67, 2],
      [65, 1], [64, 1], [62, 1], [64, 1], [60, 2], [0, 2],
    ],
  },
};

const midiToHz = (m: number) => 440 * 2 ** ((m - 69) / 12);

/** Loops a melody with a soft pad until stop() is called. */
export function playMelody(ctx: AudioContext, dest: AudioNode, id: string): () => void {
  const mel = melodies[id] ?? melodies.play!;
  const beat = 60 / mel.bpm;
  const loopLen = mel.notes.reduce((s, [, b]) => s + b, 0) * beat;
  let stopped = false;
  let start = ctx.currentTime + 0.05;
  const oscs: OscillatorNode[] = [];

  const schedule = () => {
    let t = start;
    for (const [note, beats] of mel.notes) {
      const d = beats * beat;
      if (note > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = mel.wave;
        osc.frequency.value = midiToHz(note);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.95);
        osc.connect(g).connect(dest);
        osc.start(t);
        osc.stop(t + d);
        oscs.push(osc);
        osc.onended = () => oscs.splice(oscs.indexOf(osc), 1);
      }
      t += d;
    }
    start += loopLen;
  };

  schedule();
  const timer = setInterval(() => {
    if (stopped) return;
    if (start - ctx.currentTime < 1) schedule();
  }, 250);

  return () => {
    stopped = true;
    clearInterval(timer);
    for (const o of [...oscs]) {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
    }
  };
}

export type AmbienceName = 'birds' | 'sea' | 'night' | 'rain' | 'wind' | 'farm';

function noiseBuffer(ctx: AudioContext, seconds = 2) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** One bird call: a few quick rising/falling chirps. */
function chirp(ctx: AudioContext, dest: AudioNode, at: number, base: number, notes: number) {
  for (let n = 0; n < notes; n++) {
    const t = at + n * (0.07 + Math.random() * 0.05);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const f = base * (0.9 + Math.random() * 0.3);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, t);
    osc.frequency.exponentialRampToValueAtTime(f * (Math.random() > 0.5 ? 1.5 : 0.7), t + 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.022, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 0.1);
  }
}

/**
 * Quiet, looping scene beds synthesised in code: chirping birds, the sea, night
 * crickets, rain, wind and a farmyard. Returns a stop function.
 */
export function playAmbience(ctx: AudioContext, dest: AudioNode, name: AmbienceName): () => void {
  const out = ctx.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(name === 'birds' ? 0.9 : 0.5, ctx.currentTime + 1.5);
  out.connect(dest);
  const nodes: AudioScheduledSourceNode[] = [];
  const timers: ReturnType<typeof setInterval>[] = [];

  const noise = (type: BiquadFilterType, freq: number, q = 1, gain = 0.2) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(out);
    src.start();
    nodes.push(src);
    return { f, g };
  };

  if (name === 'birds' || name === 'farm') {
    // Chirping birds: random calls from a few "birds" with their own pitch.
    const birds = [2600, 3400, 4200];
    timers.push(
      setInterval(() => {
        if (Math.random() < 0.3) {
          const b = birds[Math.floor(Math.random() * birds.length)]!;
          chirp(ctx, out, ctx.currentTime + Math.random() * 0.3, b, 2 + Math.floor(Math.random() * 4));
        }
      }, 1400),
    );
    noise('lowpass', 500, 0.5, 0.015); // soft breeze
  }
  if (name === 'sea') {
    const { g } = noise('lowpass', 700, 0.7, 0.12);
    // Waves: slow swells.
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 0.12;
    depth.gain.value = 0.1;
    lfo.connect(depth).connect(g.gain);
    lfo.start();
    nodes.push(lfo);
  }
  if (name === 'rain') noise('highpass', 2500, 0.5, 0.06);
  if (name === 'wind') {
    const { f } = noise('bandpass', 400, 2, 0.12);
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 0.08;
    depth.gain.value = 250;
    lfo.connect(depth).connect(f.frequency);
    lfo.start();
    nodes.push(lfo);
  }
  if (name === 'night') {
    // Crickets: short high trills in a slow rhythm.
    timers.push(
      setInterval(() => {
        const t = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.frequency.value = 4600 + Math.random() * 300;
          g.gain.setValueAtTime(0.0001, t + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.006, t + i * 0.05 + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.04);
          osc.connect(g).connect(out);
          osc.start(t + i * 0.05);
          osc.stop(t + i * 0.05 + 0.05);
        }
      }, 1600),
    );
  }

  return () => {
    timers.forEach(clearInterval);
    try {
      out.gain.cancelScheduledValues(ctx.currentTime);
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      out.disconnect();
    }, 1200);
  };
}

/** Default ambience for a backdrop when content does not set one. */
export const ambienceFor = (backdrop?: string): AmbienceName | 'none' =>
  backdrop === 'night' || backdrop === 'snow'
    ? 'night'
    : backdrop === 'sea' || backdrop === 'beach'
      ? 'sea'
      : backdrop === 'meadow' || backdrop === 'forest' || backdrop === 'village'
        ? 'birds'
        : 'none';

/**
 * Band backing for songs: plucked melody (ukulele-like), bass on every beat,
 * kick and clap, so children can clap along. Calls onBeat with the beat index.
 */
export function playBand(ctx: AudioContext, dest: AudioNode, id: string, onBeat?: (beat: number) => void): () => void {
  const mel = melodies[id] ?? melodies.play!;
  const beat = 60 / mel.bpm;
  const totalBeats = mel.notes.reduce((s, [, b]) => s + b, 0);
  const loopLen = totalBeats * beat;
  const clapBuf = noiseBuffer(ctx, 0.2);
  const bus = ctx.createGain();
  bus.connect(dest);
  let start = ctx.currentTime + 0.1;
  let stopped = false;
  let beatCount = 0;
  const beatTimers: ReturnType<typeof setTimeout>[] = [];

  const pluck = (f: number, t: number, d: number, v = 0.16) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.6, d));
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + Math.min(0.65, d + 0.05));
  };
  const kick = (t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(130, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.22);
  };
  const clap = (t: number) => {
    const src = ctx.createBufferSource();
    src.buffer = clapBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(f).connect(g).connect(bus);
    src.start(t);
  };

  const schedule = () => {
    // Melody (plucked) and bass following the current melody note.
    let t = start;
    const noteAt: { t: number; note: number }[] = [];
    for (const [note, beats] of mel.notes) {
      const d = beats * beat;
      if (note > 0) {
        pluck(midiToHz(note), t, d);
        noteAt.push({ t, note });
      }
      t += d;
    }
    for (let b = 0; b < Math.round(totalBeats); b++) {
      const bt = start + b * beat;
      const current = [...noteAt].reverse().find((n) => n.t <= bt + 0.001)?.note ?? 60;
      pluck(midiToHz(current - 24), bt, beat * 0.9, 0.22);
      if (b % 2 === 0) kick(bt);
      else clap(bt);
      const idx = beatCount++;
      const delay = (bt - ctx.currentTime) * 1000;
      beatTimers.push(setTimeout(() => !stopped && onBeat?.(idx), Math.max(0, delay)));
    }
    start += loopLen;
  };

  schedule();
  const timer = setInterval(() => {
    if (!stopped && start - ctx.currentTime < 1.5) schedule();
  }, 300);
  return () => {
    stopped = true;
    clearInterval(timer);
    beatTimers.forEach(clearTimeout);
    bus.disconnect();
  };
}
