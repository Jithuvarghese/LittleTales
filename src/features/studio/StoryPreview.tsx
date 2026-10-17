import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadStory, storyIndex } from '@/content/loaders';
import type { Story, StoryPage } from '@/content/schema';
import { Scene } from '@/art/Scene';
import { species } from '@/art/cast/species';

/** Problems worth fixing before a story ships. */
function checklist(p: StoryPage): string[] {
  const issues: string[] = [];
  if (!p.scene) issues.push('no scene');
  else {
    if (!p.scene.characters.length) issues.push('no character on the page');
    p.scene.characters.forEach((c) => {
      if (!species[c.id]) issues.push(`unknown character "${c.id}"`);
      if (c.size > 40) issues.push(`${c.id} is very large (keep characters under ~55% of the scene height)`);
    });
  }
  if (!p.hotspots.length) issues.push('nothing to tap');
  if (/["“]/.test(p.text) && !p.speaker) issues.push('dialogue without a speaker');
  if (!p.narration?.wordTimings?.length) issues.push('no word timings yet (run audio:generate)');
  return issues;
}

/**
 * Story preview (development only): every page side by side, a word-timing
 * overlay and a checklist, so a story can be composed in minutes.
 * Open with: npm run content:preview -- <story-slug>
 */
export function StoryPreview() {
  const { id = storyIndex[0]?.id ?? '' } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    void loadStory(id).then(setStory);
  }, [id]);
  if (!story) return <p className="p-6 font-ui">Loading {id}…</p>;
  const pages = story.pages.map((p, i) => ({ p, i })).filter((x) => x.p.type === 'story') as { p: StoryPage; i: number }[];
  const cur = pages[selected] ?? pages[0]!;

  return (
    <div className="mx-auto w-full max-w-7xl p-4 font-ui text-text">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">Preview: {story.title}</h1>
        <select value={id} onChange={(e) => (location.href = `/preview/${e.target.value}`)} className="rounded-lg border-2 border-outline bg-surface p-1">
          {storyIndex.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {pages.map(({ p }, n) => {
          const issues = checklist(p);
          return (
            <button key={n} type="button" onClick={() => setSelected(n)} className={`w-40 shrink-0 rounded-xl border-4 p-1 text-left text-xs ${n === selected ? 'border-accent' : 'border-transparent'}`}>
              {p.scene && <Scene scene={p.scene} thumbnail />}
              <span className="block truncate">{n + 1}. {p.text}</span>
              <span className={issues.length ? 'text-hint' : 'text-success'}>{issues.length ? `${issues.length} to check` : 'ready'}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <div>{cur.p.scene && <Scene key={selected} scene={cur.p.scene} />}</div>
        <div className="space-y-3 rounded-2xl bg-surface p-4">
          <p className="font-story text-2xl">{cur.p.text}</p>
          <p className="text-sm">delivery: <b>{cur.p.delivery ?? 'narrator'}</b> · speaker: <b>{cur.p.speaker ?? '—'}</b> · camera: <b>{cur.p.scene?.camera ?? 'zoom-in'}</b> · effects: <b>{cur.p.scene?.effects?.join(', ') ?? 'default'}</b></p>
          <h2 className="font-bold">Word timings</h2>
          <div className="flex flex-wrap gap-1 text-xs">
            {(cur.p.narration?.wordTimings ?? []).map((w, i) => (
              <span key={i} className="rounded bg-bg px-1.5 py-0.5">{w.word} <span className="opacity-60">{(w.startMs / 1000).toFixed(2)}s</span></span>
            ))}
          </div>
          <h2 className="font-bold">Cues</h2>
          <p className="text-sm">{cur.p.timeline.map((t) => `word ${t.word}: ${t.id} → ${t.pose}`).join(' · ') || 'none'}</p>
          <h2 className="font-bold">Checklist</h2>
          <ul className="list-disc pl-5 text-sm">
            {checklist(cur.p).map((x) => <li key={x}>{x}</li>)}
            {checklist(cur.p).length === 0 && <li>All good</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
