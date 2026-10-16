import { Howl, Howler } from 'howler';
import manifest from '../../content/index.json';
import { channels, useSettings, type Channel } from '@/app/settingsStore';
import { playAmbience, playBand, playMelody, playTones, sfxNames, type AmbienceName, type SfxName } from './synth';
import { performance as perform, splitParts, type Delivery, type Part, type Role } from '@/content/voicing';

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
  /** Who performs the line and how (used when no recording exists). */
  role?: Role;
  delivery?: Delivery;
  speaker?: Role;
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
const EXTS = ['.mp3', '.ogg', '.m4a', '.wav', '.webm'];
/** Finds the recorded file for a path, accepting any delivered format (mp3 preferred). */
export function resolveAudio(src: string | undefined, files: Set<string> = knownFiles): string | null {
  if (!src) return null;
  if (files.has(src)) return src;
  const stem = src.replace(/\.(mp3|ogg|m4a|wav|webm)$/, '');
  for (const e of EXTS) if (files.has(stem + e)) return stem + e;
  return null;
}
const baseName = (src: string) => src.split('/').pop()!.replace(/\.(mp3|ogg|m4a|wav)$/, '');

/**
 * Ranks the device's speech voices so the most natural-sounding English voice is
 * used. Neural voices ("Natural", "Online", Google, Apple enhanced) sound far less
 * robotic than the classic system voices.
 */
export function rankVoice(v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  if (!/^en(-|_|$)/i.test(v.lang)) return -1;
  const n = v.name.toLowerCase();
  let score = 0;
  if (/natural|neural/.test(n)) score += 100;
  if (/online/.test(n)) score += 40;
  if (/premium|enhanced/.test(n)) score += 60;
  if (/^google/.test(n)) score += 50;
  if (/(samantha|karen|moira|tessa|serena|aria|jenny|sonia|libby|ava|emma|neerja|clara|natasha)/.test(n)) score += 30;
  if (/(en-gb|en-in|en-au)/i.test(v.lang)) score += 5;
  if (/(desktop|espeak|zira|david|mark|hazel)/.test(n)) score -= 30;
  return score;
}

const MALE = /(guy|ryan|davis|andrew|brian|christopher|eric|roger|thomas|william|daniel|george|james|oliver|male|liam|ravi|prabhat)/i;

/** Picks a distinct device voice per role so characters do not all sound the same. */
export function voiceForRole<V extends Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>>(role: Role, all: V[]): V | null {
  const ranked = all.filter((v) => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a));
  if (!ranked.length) return null;
  const male = ranked.filter((v) => MALE.test(v.name));
  const female = ranked.filter((v) => !MALE.test(v.name));
  const pick = (list: V[], i: number) => list[Math.min(i, list.length - 1)] ?? ranked[0]!;
  switch (role) {
    case 'bumble':
      return male.length ? pick(male, 0) : pick(ranked, 1);
    case 'zig':
      return male.length ? pick(male, 1) : pick(ranked, 2);
    case 'pip':
    case 'songHost':
      return pick(female, 1);
    case 'coco':
      return pick(female, 2);
    case 'luna':
      return pick(female, 3);
    default:
      return ranked[0]!;
  }
}

let chosenVoice: SpeechSynthesisVoice | null = null;
function bestVoice(): SpeechSynthesisVoice | null {
  if (chosenVoice) return chosenVoice;
  try {
    const voices = speechSynthesis.getVoices();
    const best = voices.filter((v) => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a))[0];
    if (best) chosenVoice = best;
    return best ?? null;
  } catch {
    return null;
  }
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    speechSynthesis.addEventListener?.('voiceschanged', () => {
      chosenVoice = null;
      bestVoice();
    });
  } catch {
    /* ignore */
  }
}

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
  private speechToken = 0;
  private stopAmbienceFn: (() => void) | null = null;
  private currentAmbience: string | null = null;
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
    const file = nameOrSrc.includes('/') ? resolveAudio(nameOrSrc) : null;
    if (file) {
      new Howl({ src: [`/${file}`], volume: channelGain(channel) }).play();
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
    const musicFile = resolveAudio(src);
    if (musicFile) {
      this.musicHowl = new Howl({ src: [`/${musicFile}`], loop: true, volume: 0, html5: true });
      this.musicHowl.play();
      this.musicHowl.fade(0, channelGain('music'), 1500);
      return;
    }
    // Bedtime mode keeps everything calm: built-in music switches to the lullaby.
    const melody = useSettings.getState().bedtime ? 'lullaby' : baseName(key).replace(/-\d+$/, '');
    const dest = this.gains.music;
    if (this.ctx && dest) this.stopMusicFn = playMelody(this.ctx, dest, melody);
  }

  /** Song backing band with a clear beat; onBeat fires on every beat (for clap-along). */
  band(melody: string, onBeat?: (beat: number) => void) {
    this.stopMusic();
    this.currentMusic = `band:${melody}`;
    const dest = this.gains.music;
    if (this.ctx && dest) this.stopMusicFn = playBand(this.ctx, dest, melody, onBeat);
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
      const file = resolveAudio(src);
      if (!src || !file || this.preloaded.has(src)) continue;
      this.preloaded.set(src, new Howl({ src: [`/${file}`], preload: true }));
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

    const voiceFile = resolveAudio(opts.src);
    if (opts.src && voiceFile) {
      const howl = this.preloaded.get(opts.src) ?? new Howl({ src: [`/${voiceFile}`] });
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
    const parts: Part[] = splitParts(text, { role: opts.role, delivery: opts.delivery, speaker: opts.speaker });
    const token = ++this.speechToken;
    let wordOffset = 0;
    let anyBoundary = false;
    let all: SpeechSynthesisVoice[] = [];
    try {
      all = speechSynthesis.getVoices();
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }

    const speakPart = (i: number) => {
      if (token !== this.speechToken) return;
      if (i >= parts.length) return done();
      const part = parts[i]!;
      const partWords = part.text.split(/\s+/).filter(Boolean);
      const offset = wordOffset;
      wordOffset += partWords.length;
      const p = perform(part.role, part.delivery);
      const next = () => {
        this.clearWordTimer();
        setTimeout(() => speakPart(i + 1), i + 1 < parts.length ? p.pauseMs : 0);
      };
      try {
        const u = new SpeechSynthesisUtterance(part.text);
        const voice = voiceForRole(part.role, all) ?? bestVoice();
        if (voice) u.voice = voice;
        u.lang = voice?.lang ?? 'en-GB';
        u.rate = Math.min(1.6, Math.max(0.5, (opts.rate ?? 1) * p.rate * 1.05));
        u.pitch = Math.min(2, Math.max(0.1, p.pitch));
        u.volume = channelGain(channel) * p.volume;
        const starts: number[] = [];
        let pos = 0;
        for (const w of partWords) {
          const at = part.text.indexOf(w, pos);
          starts.push(at);
          pos = at + w.length;
        }
        u.onboundary = (e) => {
          if (e.name && e.name !== 'word') return;
          anyBoundary = true;
          let idx = 0;
          while (idx + 1 < starts.length && starts[idx + 1]! <= e.charIndex) idx++;
          opts.onWord?.(offset + idx);
        };
        u.onstart = () => {
          opts.onWord?.(offset);
          // Voices that never report word boundaries get even-spaced highlighting.
          if (anyBoundary) return;
          let k = 0;
          this.clearWordTimer();
          this.wordTimer = setInterval(() => {
            if (anyBoundary || ++k >= partWords.length) return this.clearWordTimer();
            opts.onWord?.(offset + k);
          }, 430 / u.rate);
        };
        u.onend = next;
        u.onerror = next;
        speechSynthesis.speak(u);
      } catch {
        next();
      }
    };
    speakPart(0);
    // Safety net in case the speech engine never reports the end.
    setTimeout(() => token === this.speechToken && done(), Math.max(5000, words.length * 1100));
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

  /** Quiet scene bed (birds, sea, night...) under narration; ducks with the music. */
  ambience(name: AmbienceName | 'none' | undefined) {
    if ((name ?? null) === this.currentAmbience) return;
    this.stopAmbienceFn?.();
    this.stopAmbienceFn = null;
    this.currentAmbience = name ?? null;
    const dest = this.gains.music;
    if (!name || name === 'none' || !this.ctx || !dest) return;
    this.stopAmbienceFn = playAmbience(this.ctx, dest, name);
  }

  stopVoice() {
    this.speechToken++;
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
    this.ambience('none');
    this.stopMusic();
  }
}

export const AudioManager = new AudioManagerImpl();
