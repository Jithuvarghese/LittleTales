import { Howl, Howler } from 'howler';
import manifest from '../../content/index.json';
import { channels, useSettings, type Channel } from '@/app/settingsStore';
import { playMelody, playTones, sfxNames, type SfxName } from './synth';

/** Music drops to this fraction of its level while a voice is speaking. */
export const DUCK_LEVEL = 0.4;
/** Hard ceiling on output so nothing is ever too loud. */
export const MAX_OUTPUT = 0.9;

export type SayOptions = {
  channel?: 'narration' | 'letters' | 'ui';
  src?: string;
  /** Called with the index of the word being spoken (when known). */
  onWord?: (index: number) => void;
  onEnd?: () => void;
  rate?: number;
  wordTimings?: { startMs: number; endMs: number }[];
};

/** Tracks overlapping voice clips so music ducks once and restores after the last ends. */
export class Ducker {
  private active = 0;
  constructor(private apply: (ducked: boolean) => void) {}
  start() {
    if (this.active++ === 0) this.apply(true);
  }
  end() {
    if (this.active === 0) return;
    if (--this.active === 0) this.apply(false);
  }
  get isDucked() {
    return this.active > 0;
  }
}

const knownFiles = new Set<string>((manifest as { audio?: string[] }).audio ?? []);
const baseName = (src: string) => src.split('/').pop()!.replace(/\.(mp3|ogg|m4a|wav)$/, '');

/** Effective gain for a channel given settings (master × channel, muted → 0, capped). */
export function channelGain(ch: Channel, s = useSettings.getState()) {
  if (s.muted[ch]) return 0;
  return Math.min(MAX_OUTPUT, s.master * s.volumes[ch]);
}

class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private gains: Partial<Record<Channel, GainNode>> = {};
  private stopMusicFn: (() => void) | null = null;
  private musicHowl: Howl | null = null;
  private currentMusic: string | null = null;
  private voice: Howl | null = null;
  private wordTimer: ReturnType<typeof setInterval> | null = null;
  private preloaded = new Map<string, Howl>();
  readonly ducker = new Ducker((d) => this.applyDuck(d));
  unlocked = false;

  constructor() {
    useSettings.subscribe(() => this.refreshVolumes());
  }

  /** Must be called from a user gesture (the "Tap to start!" splash). */
  unlock() {
    if (this.unlocked) return;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.ratio.value = 12;
      limiter.connect(this.ctx.destination);
      for (const ch of channels) {
        const g = this.ctx.createGain();
        g.connect(limiter);
        this.gains[ch] = g;
      }
      void this.ctx.resume();
      Howler.autoUnlock = true;
    } catch {
      /* no Web Audio: speech fallback still works */
    }
    this.unlocked = true;
    this.refreshVolumes();
  }

  private refreshVolumes() {
    if (!this.ctx) return;
    for (const ch of channels) {
      const g = this.gains[ch];
      if (!g) continue;
      const target = channelGain(ch) * (ch === 'music' && this.ducker.isDucked ? DUCK_LEVEL : 1);
      g.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    this.musicHowl?.volume(channelGain('music') * (this.ducker.isDucked ? DUCK_LEVEL : 1));
  }

  private applyDuck(ducked: boolean) {
    const g = this.gains.music;
    const target = channelGain('music') * (ducked ? DUCK_LEVEL : 1);
    if (g && this.ctx) g.gain.setTargetAtTime(target, this.ctx.currentTime, ducked ? 0.1 : 0.4);
    this.musicHowl?.fade(this.musicHowl.volume(), target, ducked ? 200 : 600);
  }

  /** Plays a short effect. Accepts a built-in name or a file path. */
  sfx(nameOrSrc: string, channel: 'sfx' | 'ui' = 'sfx') {
    if (knownFiles.has(nameOrSrc)) {
      new Howl({ src: [`/${nameOrSrc}`], volume: channelGain(channel) }).play();
      return;
    }
    const name = baseName(nameOrSrc) as SfxName;
    const builtin: SfxName = sfxNames.includes(name) ? name : 'pop';
    const dest = this.gains[channel];
    if (this.ctx && dest) playTones(this.ctx, dest, builtin);
  }

  /** Starts looping music. File if present, otherwise a built-in melody (by name). */
  music(src: string | undefined) {
    const key = src ?? 'play';
    if (this.currentMusic === key) return;
    this.stopMusic();
    this.currentMusic = key;
    if (src && knownFiles.has(src)) {
      this.musicHowl = new Howl({ src: [`/${src}`], loop: true, volume: 0, html5: true });
      this.musicHowl.play();
      this.musicHowl.fade(0, channelGain('music'), 1500);
      return;
    }
    // Bedtime mode keeps everything calm: built-in music switches to the lullaby.
    const melody = useSettings.getState().bedtime ? 'lullaby' : baseName(key).replace(/-\d+$/, '');
    const dest = this.gains.music;
    if (this.ctx && dest) this.stopMusicFn = playMelody(this.ctx, dest, melody);
  }

  stopMusic() {
    this.stopMusicFn?.();
    this.stopMusicFn = null;
    if (this.musicHowl) {
      const h = this.musicHowl;
      h.fade(h.volume(), 0, 400);
      setTimeout(() => h.unload(), 450);
    }
    this.musicHowl = null;
    this.currentMusic = null;
  }

  preload(srcs: (string | undefined)[]) {
    for (const src of srcs) {
      if (!src || !knownFiles.has(src) || this.preloaded.has(src)) continue;
      this.preloaded.set(src, new Howl({ src: [`/${src}`], preload: true }));
    }
  }

  /** Speaks text: recorded clip if available, else the speech fallback. Ducks music meanwhile. */
  say(text: string, opts: SayOptions = {}) {
    this.stopVoice();
    const channel = opts.channel ?? 'narration';
    const words = text.split(/\s+/).filter(Boolean);
    this.ducker.start();
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      this.clearWordTimer();
      this.ducker.end();
      opts.onEnd?.();
    };

    if (opts.src && knownFiles.has(opts.src)) {
      const howl = this.preloaded.get(opts.src) ?? new Howl({ src: [`/${opts.src}`] });
      howl.volume(channelGain(channel));
      howl.once('end', done);
      howl.once('loaderror', done);
      howl.once('stop', done);
      howl.play();
      this.voice = howl;
      const timings = opts.wordTimings;
      if (timings?.length) {
        this.wordTimer = setInterval(() => {
          const ms = (howl.seek() as number) * 1000;
          let idx = 0;
          while (idx + 1 < timings.length && timings[idx + 1]!.startMs <= ms) idx++;
          opts.onWord?.(idx);
        }, 60);
      } else {
        const dur = howl.duration() * 1000 || words.length * 450;
        this.evenWords(words.length, dur / Math.max(1, words.length), opts.onWord);
      }
      return;
    }
    this.speakFallback(text, words, channel, opts, done);
  }

  private speakFallback(text: string, words: string[], channel: Channel, opts: SayOptions, done: () => void) {
    if (!('speechSynthesis' in window) || channelGain(channel) === 0) {
      // Silent: still step through words so highlighting works.
      this.evenWords(words.length, 420, opts.onWord, done);
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en';
      u.rate = opts.rate ?? 0.8;
      u.pitch = 1.1;
      u.volume = channelGain(channel);
      // Map character offsets to word indices for boundary events.
      const starts: number[] = [];
      let pos = 0;
      for (const w of words) {
        const at = text.indexOf(w, pos);
        starts.push(at);
        pos = at + w.length;
      }
      let gotBoundary = false;
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        gotBoundary = true;
        let idx = 0;
        while (idx + 1 < starts.length && starts[idx + 1]! <= e.charIndex) idx++;
        opts.onWord?.(idx);
      };
      u.onend = done;
      u.onerror = done;
      speechSynthesis.speak(u);
      // Some voices never fire boundaries: fall back to even-spaced highlighting.
      setTimeout(() => {
        if (!gotBoundary && !this.wordTimer) this.evenWords(words.length, 480, opts.onWord);
      }, 700);
      // Safety net in case onend never fires.
      setTimeout(done, Math.max(4000, words.length * 900));
    } catch {
      this.evenWords(words.length, 420, opts.onWord, done);
    }
  }

  private evenWords(count: number, msPerWord: number, onWord?: (i: number) => void, onDone?: () => void) {
    let i = 0;
    onWord?.(0);
    this.wordTimer = setInterval(() => {
      i++;
      if (i >= count) {
        this.clearWordTimer();
        onDone?.();
        return;
      }
      onWord?.(i);
    }, msPerWord);
  }

  private clearWordTimer() {
    if (this.wordTimer) clearInterval(this.wordTimer);
    this.wordTimer = null;
  }

  stopVoice() {
    this.clearWordTimer();
    this.voice?.stop();
    this.voice = null;
    try {
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }

  stopAll() {
    this.stopVoice();
    this.stopMusic();
  }
}

export const AudioManager = new AudioManagerImpl();
