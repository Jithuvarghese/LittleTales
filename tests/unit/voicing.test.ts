import { inferDelivery, inferSpeaker, performance, splitParts, uiLineSrc } from '@/content/voicing';
import { resolveAudio, voiceForRole } from '@/services/AudioManager';
import { analyse, cleanTake, encodeWav, normalise, trimSilence } from '@/features/studio/clean';
import { sentences } from '../../scripts/tts/generate';

describe('voicing', () => {
  it('gives dialogue to the speaking character and the rest to the narrator', () => {
    const parts = splitParts('"The moon stays up to light the sky," said Luna.');
    expect(parts.map((p) => p.role)).toEqual(['luna', 'narrator']);
  });
  it('uses an explicit speaker when the text does not name one', () => {
    const parts = splitParts('"And the stars keep it company."', { speaker: 'luna' });
    expect(parts[0]!.role).toBe('luna');
  });
  it('infers who speaks from "said X" and "X said"', () => {
    expect(inferSpeaker('"Hi!" said Pip.')).toBe('pip');
    expect(inferSpeaker('Coco laughed. "Fun!"')).toBe('coco');
    expect(inferSpeaker('"Thank you," said Anu.')).toBeUndefined();
  });
  it('infers a delivery from the words', () => {
    expect(inferDelivery('Shh... the baby is sleeping.')).toBe('whisper');
    expect(inferDelivery('Oh no! The kite!')).toBe('surprised');
    expect(inferDelivery('Hooray! We did it!')).toBe('proud');
    expect(inferDelivery('Pip had a ball.')).toBe('narrator');
  });
  it('makes whispers quieter and slower, and characters differ from the narrator', () => {
    const narr = performance('narrator', 'narrator');
    const whisper = performance('narrator', 'whisper');
    expect(whisper.volume).toBeLessThan(narr.volume);
    expect(whisper.rate).toBeLessThan(narr.rate);
    expect(performance('coco', 'narrator').pitch).toBeGreaterThan(performance('bumble', 'narrator').pitch);
  });
  it('keeps every displayed word when splitting into sentences', () => {
    const t = 'Look! Pip looked up... at the big, round moon.';
    expect(sentences(t).join(' ').split(/\s+/)).toEqual(t.split(/\s+/));
  });
  it('builds stable file names for praise lines', () => {
    expect(uiLineSrc('Great job!')).toBe('audio/ui/en/great-job.mp3');
  });
});

describe('audio files and device voices', () => {
  it('finds a recording in any delivered format', () => {
    const files = new Set(['audio/a/x.wav', 'audio/a/y.mp3']);
    expect(resolveAudio('audio/a/x.mp3', files)).toBe('audio/a/x.wav');
    expect(resolveAudio('audio/a/y.mp3', files)).toBe('audio/a/y.mp3');
    expect(resolveAudio('audio/a/z.mp3', files)).toBeNull();
  });
  it('gives characters different device voices when several exist', () => {
    const v = (name: string) => ({ name, lang: 'en-US', localService: true });
    const all = [v('Microsoft Aria Online (Natural)'), v('Microsoft Jenny Online (Natural)'), v('Microsoft Guy Online (Natural)'), v('Google US English')];
    expect(voiceForRole('bumble', all)!.name).toMatch(/Guy/);
    expect(voiceForRole('narrator', all)!.name).not.toBe(voiceForRole('pip', all)!.name);
  });
});

describe('studio take clean-up', () => {
  const rate = 8000;
  const tone = (secs: number, amp: number) => Float32Array.from({ length: rate * secs }, (_, i) => amp * Math.sin((i / rate) * 2 * Math.PI * 220));
  const withSilence = () => Float32Array.from([...new Float32Array(rate), ...tone(1, 0.5), ...new Float32Array(rate)]);

  it('trims silence at both ends', () => {
    const out = trimSilence(withSilence(), rate);
    expect(out.length).toBeLessThan(rate * 1.5);
    expect(out.length).toBeGreaterThan(rate * 0.9);
  });
  it('warns about quiet and clipped takes', () => {
    expect(analyse(tone(1, 0.05), rate).tooQuiet).toBe(true);
    expect(analyse(tone(1, 1.2), rate).clipped).toBe(true);
    expect(analyse(tone(1, 0.5), rate).clipped).toBe(false);
  });
  it('normalises without peaks above -1 dBFS', () => {
    const out = normalise(tone(1, 0.05));
    expect(Math.max(...out.map(Math.abs))).toBeLessThanOrEqual(0.9);
    expect(Math.max(...out.map(Math.abs))).toBeGreaterThan(0.05);
  });
  it('produces a valid WAV file', () => {
    const { samples } = cleanTake(withSilence(), rate);
    const wav = new DataView(encodeWav(samples, rate));
    expect(String.fromCharCode(wav.getUint8(0), wav.getUint8(1), wav.getUint8(2), wav.getUint8(3))).toBe('RIFF');
    expect(wav.getUint32(24, true)).toBe(rate);
    expect(wav.byteLength).toBe(44 + samples.length * 2);
  });
});
