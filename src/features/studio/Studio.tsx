import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioManager } from '@/services/AudioManager';
import { cleanTake, encodeWav, type TakeReport } from './clean';

/**
 * Recording studio (development only). A grown-up records every line that needs
 * audio: big text, a direction for how to say it, Record / Stop / Replay /
 * Re-record, automatic clean-up, saving to the right file, then the next line.
 */
type Line = { out: string; text: string; direction: string; group: string; kind: 'line' | 'song'; status: 'recorded' | 'generated' | 'pending'; flagged: boolean };
type Filter = 'todo' | 'recorded' | 'flagged' | 'all';
const RATE = 44100;

export function Studio() {
  const [lines, setLines] = useState<Line[]>([]);
  const [filter, setFilter] = useState<Filter>('todo');
  const [group, setGroup] = useState('all');
  const [index, setIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [take, setTake] = useState<{ wav: ArrayBuffer; url: string; report: TakeReport } | null>(null);
  const [message, setMessage] = useState('');
  const [taps, setTaps] = useState<number[] | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const tapStart = useRef(0);

  const load = useCallback(async () => {
    const res = await fetch('/__studio/lines');
    setLines(await res.json());
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => ['all', ...new Set(lines.map((l) => l.group))], [lines]);
  const visible = lines.filter(
    (l) =>
      (group === 'all' || l.group === group) &&
      (filter === 'all' || (filter === 'todo' && l.status !== 'recorded') || (filter === 'recorded' && l.status === 'recorded') || (filter === 'flagged' && l.flagged)),
  );
  const line = visible[Math.min(index, visible.length - 1)];
  const done = lines.filter((l) => l.status === 'recorded').length;

  const start = async () => {
    setTake(null);
    setMessage('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false } });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: rec.mimeType });
        const ctx = new OfflineAudioContext(1, 1, RATE);
        const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
        // Resample to 44.1 kHz mono.
        const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * RATE), RATE);
        const src = off.createBufferSource();
        src.buffer = decoded;
        src.connect(off.destination);
        src.start();
        const rendered = await off.startRendering();
        const { samples, report } = cleanTake(rendered.getChannelData(0), RATE);
        const wav = encodeWav(samples, RATE);
        setTake({ wav, url: URL.createObjectURL(new Blob([wav], { type: 'audio/wav' })), report });
      };
      recorder.current = rec;
      rec.start();
      setRecording(true);
      if (line?.kind === 'song') AudioManager.band(melodyFor(line));
    } catch {
      setMessage('Microphone not available. Allow microphone access in the browser and try again.');
    }
  };
  const stop = () => {
    recorder.current?.stop();
    AudioManager.stopMusic();
    setRecording(false);
  };
  const replay = () => {
    if (!take) return;
    audio.current?.pause();
    audio.current = new Audio(take.url);
    void audio.current.play();
  };
  const save = async () => {
    if (!take || !line) return;
    setMessage('Saving…');
    const res = await fetch(`/__studio/save?out=${encodeURIComponent(line.out)}&ms=${take.report.durationMs}`, { method: 'POST', body: take.wav });
    const data = await res.json();
    if (!res.ok) return setMessage(`Could not save: ${data.error}`);
    setMessage(`Saved ${data.saved}`);
    setTake(null);
    await load();
    if (line.kind === 'song') setTaps([]);
    else if (filter !== 'todo') setIndex((i) => i + 1);
  };
  const flag = async (flagged: boolean) => {
    if (!line) return;
    await fetch('/__studio/flag', { method: 'POST', body: JSON.stringify({ out: line.out, flagged }) });
    await load();
  };

  // Song tap-timing: play the recording and tap at the start of every line.
  const startTapping = () => {
    if (!line) return;
    setTaps([]);
    audio.current?.pause();
    audio.current = new Audio(`/${line.out.replace(/\.mp3$/, '.mp3')}?t=${Date.now()}`);
    audio.current.onerror = () => {
      audio.current = new Audio(`/${line.out.replace(/\.mp3$/, '.wav')}?t=${Date.now()}`);
      void audio.current.play();
    };
    void audio.current.play();
    tapStart.current = performance.now();
  };
  const tap = () => setTaps((t) => (t ? [...t, performance.now() - tapStart.current] : t));
  const saveTaps = async () => {
    if (!line || !taps) return;
    const id = line.out.split('/')[2];
    await fetch('/__studio/song-timings', { method: 'POST', body: JSON.stringify({ id, lineTimings: taps }) });
    setMessage('Song timings saved.');
    setTaps(null);
    audio.current?.pause();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (taps) tap();
        else if (recording) stop();
        else void start();
      }
      if (e.key === 'Enter' && take) void save();
      if (e.key === 'r' && take) replay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const songLines = line?.kind === 'song' ? line.text.split('\n') : [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 font-ui text-text">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold">Recording studio</h1>
        <span className="rounded-full bg-surface px-3 py-1 text-sm">
          {done} of {lines.length} recorded
        </span>
        <select value={filter} onChange={(e) => { setFilter(e.target.value as Filter); setIndex(0); }} className="ml-auto rounded-lg border-2 border-outline bg-surface p-2">
          <option value="todo">To record</option>
          <option value="recorded">Recorded</option>
          <option value="flagged">Flagged for redo</option>
          <option value="all">All</option>
        </select>
        <select value={group} onChange={(e) => { setGroup(e.target.value); setIndex(0); }} className="rounded-lg border-2 border-outline bg-surface p-2">
          {groups.map((g) => <option key={g} value={g}>{g === 'all' ? 'Everything' : g}</option>)}
        </select>
      </header>

      {!line ? (
        <p className="rounded-3xl bg-surface p-8 text-center text-2xl">Nothing here. Pick another filter.</p>
      ) : (
        <section className="flex flex-col gap-4 rounded-3xl border-4 border-outline bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm opacity-75">
            <span>{line.group} · {visible.indexOf(line) + 1} / {visible.length}</span>
            <span className="font-mono">{line.out}</span>
          </div>
          <p className="rounded-2xl bg-accent/40 px-4 py-2 text-xl font-bold">{line.direction}</p>
          {line.kind === 'song' ? (
            <div className="space-y-1 text-3xl">
              {songLines.map((l, i) => (
                <p key={i} className={taps && taps.length === i ? 'rounded-lg bg-accent px-2' : ''}>{l}</p>
              ))}
            </div>
          ) : (
            <p className="font-story text-4xl leading-relaxed sm:text-5xl">{line.text}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!recording ? (
              <button type="button" onClick={start} className="min-h-[56px] rounded-2xl border-4 border-outline bg-[#e85d4a] px-6 text-xl font-bold text-white">Record</button>
            ) : (
              <button type="button" onClick={stop} className="min-h-[56px] animate-pulse rounded-2xl border-4 border-outline bg-outline px-6 text-xl font-bold text-white">Stop</button>
            )}
            <button type="button" disabled={!take} onClick={replay} className="min-h-[56px] rounded-2xl border-4 border-outline px-6 text-xl font-bold disabled:opacity-40">Replay</button>
            <button type="button" disabled={!take} onClick={start} className="min-h-[56px] rounded-2xl border-4 border-outline px-6 text-xl font-bold disabled:opacity-40">Re-record</button>
            <button type="button" disabled={!take} onClick={save} className="min-h-[56px] rounded-2xl border-4 border-outline bg-primary px-6 text-xl font-bold text-on-primary disabled:opacity-40">Save &amp; next</button>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={line.flagged} onChange={(e) => flag(e.target.checked)} /> Flag for redo
            </label>
          </div>
          {take && (
            <ul className="flex flex-wrap gap-2 text-sm">
              <li className="rounded-full bg-bg px-3 py-1">{(take.report.durationMs / 1000).toFixed(1)} s</li>
              {take.report.tooQuiet && <li className="rounded-full bg-hint px-3 py-1 text-white">Too quiet: move closer to the microphone</li>}
              {take.report.clipped && <li className="rounded-full bg-hint px-3 py-1 text-white">Too loud (clipped): move back a little</li>}
              {take.report.noisy && <li className="rounded-full bg-hint px-3 py-1 text-white">Background noise ({take.report.noiseDb} dB): find a quieter spot</li>}
              {!take.report.tooQuiet && !take.report.clipped && !take.report.noisy && <li className="rounded-full bg-success px-3 py-1 text-white">Sounds good</li>}
            </ul>
          )}
          {line.kind === 'song' && line.status === 'recorded' && (
            <div className="flex flex-wrap items-center gap-3 border-t-2 border-outline/20 pt-3">
              <span className="font-bold">Line timing:</span>
              {!taps ? (
                <button type="button" onClick={startTapping} className="rounded-xl border-4 border-outline px-4 py-2 font-bold">Play &amp; tap each line</button>
              ) : (
                <>
                  <button type="button" onClick={tap} className="rounded-xl border-4 border-outline bg-accent px-6 py-3 text-xl font-bold">Tap (Space) · line {taps.length + 1}</button>
                  <button type="button" disabled={taps.length !== songLines.length} onClick={saveTaps} className="rounded-xl border-4 border-outline px-4 py-2 font-bold disabled:opacity-40">Save timings</button>
                  <button type="button" onClick={startTapping} className="underline">Start over</button>
                </>
              )}
            </div>
          )}
          {message && <p role="status">{message}</p>}
          <div className="flex justify-between">
            <button type="button" onClick={() => { setTake(null); setIndex((i) => Math.max(0, i - 1)); }} className="underline">Previous line</button>
            <button type="button" onClick={() => { setTake(null); setIndex((i) => i + 1); }} className="underline">Skip</button>
          </div>
          <p className="text-sm opacity-70">Keys: Space record/stop · R replay · Enter save. See docs/RECORDING_GUIDE.md.</p>
        </section>
      )}
    </div>
  );
}

function melodyFor(line: Line) {
  const id = line.out.split('/')[2] ?? '';
  if (id.startsWith('twinkle') || id.startsWith('baa') || id.startsWith('five')) return 'twinkle';
  if (id.startsWith('row') || id.startsWith('rain')) return 'row';
  if (id.startsWith('mary')) return 'mary';
  return 'frere';
}
