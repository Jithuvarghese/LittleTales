import { channelGain, Ducker, DUCK_LEVEL, MAX_OUTPUT, AudioManager, rankVoice } from '@/services/AudioManager';
import { defaultSettings, useSettings } from '@/app/settingsStore';

describe('Ducker', () => {
  it('ducks once for overlapping voices and restores after the last one ends', () => {
    const calls: boolean[] = [];
    const d = new Ducker((x) => calls.push(x));
    d.start();
    d.start();
    expect(d.isDucked).toBe(true);
    d.end();
    expect(d.isDucked).toBe(true);
    d.end();
    expect(d.isDucked).toBe(false);
    expect(calls).toEqual([true, false]);
  });
  it('ignores extra end() calls', () => {
    const calls: boolean[] = [];
    const d = new Ducker((x) => calls.push(x));
    d.end();
    d.start();
    d.end();
    d.end();
    expect(calls).toEqual([true, false]);
  });
  it('ducks music to about 40% of its level', () => {
    expect(DUCK_LEVEL).toBeCloseTo(0.4);
  });
});

describe('channelGain', () => {
  beforeEach(() => useSettings.setState({ ...defaultSettings }));

  it('multiplies master and channel volume', () => {
    useSettings.setState({ master: 0.5, volumes: { ...defaultSettings.volumes, music: 0.4 } });
    expect(channelGain('music')).toBeCloseTo(0.2);
  });
  it('is zero when the channel is muted', () => {
    useSettings.getState().setMuted('sfx', true);
    expect(channelGain('sfx')).toBe(0);
  });
  it('never exceeds the safety cap', () => {
    useSettings.setState({ master: 1, volumes: { ...defaultSettings.volumes, narration: 1 } });
    expect(channelGain('narration')).toBe(MAX_OUTPUT);
  });
});

describe('AudioManager.say fallback', () => {
  it('steps through every word and ends, restoring music level, even without speech support', () => {
    vi.useFakeTimers();
    const words: number[] = [];
    let ended = false;
    AudioManager.say('One two three', { onWord: (i) => words.push(i), onEnd: () => (ended = true) });
    expect(AudioManager.ducker.isDucked).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(words).toEqual([0, 1, 2]);
    expect(ended).toBe(true);
    expect(AudioManager.ducker.isDucked).toBe(false);
    vi.useRealTimers();
  });
  it('unlock() is safe without Web Audio', () => {
    expect(() => AudioManager.unlock()).not.toThrow();
    expect(AudioManager.unlocked).toBe(true);
  });
});

describe('rankVoice', () => {
  const v = (name: string, lang = 'en-US') => ({ name, lang, localService: true });
  it('prefers natural neural voices over classic robotic ones', () => {
    const voices = [v('Microsoft David Desktop'), v('Microsoft Aria Online (Natural) - English (United States)'), v('Google UK English Female', 'en-GB')];
    const best = [...voices].sort((a, b) => rankVoice(b) - rankVoice(a))[0]!;
    expect(best.name).toMatch(/Natural/);
  });
  it('ignores non-English voices', () => {
    expect(rankVoice(v('Google français', 'fr-FR'))).toBe(-1);
  });
});

describe('interrupting speech', () => {
  it('never reports "finished" when stopped early (no surprise page turns or repeats) and restores music', () => {
    vi.useFakeTimers();
    let ended = 0;
    AudioManager.say('One two three four five', { onEnd: () => ended++ });
    vi.advanceTimersByTime(500);
    AudioManager.stopVoice();
    vi.advanceTimersByTime(10000);
    expect(ended).toBe(0);
    expect(AudioManager.ducker.isDucked).toBe(false);
    vi.useRealTimers();
  });
  it('a new line replaces the old one without the old one finishing', () => {
    vi.useFakeTimers();
    const ends: string[] = [];
    AudioManager.say('first line here', { onEnd: () => ends.push('first') });
    AudioManager.say('second', { onEnd: () => ends.push('second') });
    vi.advanceTimersByTime(10000);
    expect(ends).toEqual(['second']);
    vi.useRealTimers();
  });
});

describe('queued speech', () => {
  it('speaks queued lines one after another, each completely', () => {
    vi.useFakeTimers();
    const order: string[] = [];
    AudioManager.say('one', { onEnd: () => order.push('one') });
    AudioManager.say('two', { queue: true, onEnd: () => order.push('two') });
    AudioManager.say('three', { queue: true, onEnd: () => order.push('three') });
    vi.advanceTimersByTime(20000);
    expect(order).toEqual(['one', 'two', 'three']);
    vi.useRealTimers();
  });
});
