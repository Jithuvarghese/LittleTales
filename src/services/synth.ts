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
