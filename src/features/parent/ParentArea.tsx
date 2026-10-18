import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { channels, useSettings, type Channel } from '@/app/settingsStore';
import { themeIds } from '@/theme/themes';
import { letters, storyIndex } from '@/content/loaders';
import { useProgress, dayKey } from '@/features/rewards/progressStore';
import { cacheStory, uncacheStory } from '@/services/offline';
import { strings } from '@/strings';
import privacy from '../../../docs/legal/privacy-policy.md?raw';
import terms from '../../../docs/legal/terms.md?raw';
import credits from '../../../docs/ATTRIBUTIONS.md?raw';
import { ParentGate } from './ParentGate';
import { useGate } from './gate';

type Tab = 'settings' | 'dashboard' | 'offline' | 'credits' | 'privacy' | 'terms';

/** Grown-ups area. Locked behind the gate; relocks on leaving. */
export function ParentArea() {
  const unlocked = useGate((s) => s.unlocked);
  const lock = useGate((s) => s.lock);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('settings');
  useEffect(() => () => lock(), [lock]);

  if (!unlocked) return <ParentGate />;

  const tabs: [Tab, string][] = [
    ['settings', strings.parent.settings],
    ['dashboard', strings.parent.dashboard],
    ['offline', strings.parent.offline],
    ['credits', strings.parent.credits],
    ['privacy', strings.parent.privacy],
    ['terms', strings.parent.terms],
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 font-ui text-lg">
      <div className="flex flex-wrap items-center gap-2" role="tablist">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-h-[48px] rounded-xl border-4 border-outline px-4 font-bold ${tab === id ? 'bg-primary text-on-primary' : 'bg-surface text-text'}`}>
            {label}
          </button>
        ))}
        <button type="button" onClick={() => { lock(); navigate('/'); }} className="ml-auto min-h-[48px] rounded-xl px-4 underline">
          {strings.parent.exit}
        </button>
      </div>
      <div className="rounded-3xl border-4 border-outline bg-surface p-5 text-text">
        {tab === 'settings' && <SettingsPanel />}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'offline' && <OfflinePanel />}
        {tab === 'credits' && <Markdown text={credits} />}
        {tab === 'privacy' && <Markdown text={privacy} />}
        {tab === 'terms' && <Markdown text={terms} />}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-wrap items-center justify-between gap-3 border-b border-outline/20 py-3">
      <span className="font-bold">{label}</span>
      <span className="flex items-center gap-2">{children}</span>
    </label>
  );
}

function Choice<T extends string>({ value, options, onChange, labels }: { value: T; options: readonly T[]; onChange: (v: T) => void; labels?: Record<string, string> }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className="min-h-[44px] rounded-lg border-2 border-outline bg-surface px-2 text-text">
      {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
    </select>
  );
}

const channelLabels: Record<Channel, string> = { music: 'Music', narration: 'Narration', sfx: 'Sound effects', ui: 'Button voices', letters: 'Letters & numbers' };

function SettingsPanel() {
  const s = useSettings();
  return (
    <div>
      <h2 className="mb-2 text-2xl font-extrabold">Sound</h2>
      <Row label="Master volume">
        <input type="range" min={0} max={1} step={0.05} value={s.master} onChange={(e) => s.set({ master: Number(e.target.value) })} aria-label="Master volume" />
      </Row>
      {channels.map((ch) => (
        <Row key={ch} label={channelLabels[ch]}>
          <input type="range" min={0} max={1} step={0.05} value={s.volumes[ch]} onChange={(e) => s.setVolume(ch, Number(e.target.value))} aria-label={`${channelLabels[ch]} volume`} />
          <span className="flex items-center gap-1 text-base">
            <input type="checkbox" checked={s.muted[ch]} onChange={(e) => s.setMuted(ch, e.target.checked)} /> Mute
          </span>
        </Row>
      ))}
      <h2 className="mb-2 mt-6 text-2xl font-extrabold">Reading</h2>
      <Row label="Text size"><Choice value={s.textSize} options={['M', 'L', 'XL'] as const} onChange={s.setTextSize} /></Row>
      <Row label="Letters"><Choice value={s.letterCase} options={['upper', 'lower', 'both'] as const} onChange={s.setLetterCase} labels={{ upper: 'UPPERCASE', lower: 'lowercase', both: 'Both' }} /></Row>
      <Row label="Dyslexia-friendly font"><input type="checkbox" checked={s.dyslexicFont} onChange={(e) => s.setDyslexicFont(e.target.checked)} /></Row>
      <Row label="Turn pages automatically after narration"><input type="checkbox" checked={s.autoAdvance} onChange={(e) => s.set({ autoAdvance: e.target.checked })} /></Row>
      <Row label="Theme"><Choice value={s.theme} options={themeIds} onChange={s.setTheme} labels={strings.themes} /></Row>
      <h2 className="mb-2 mt-6 text-2xl font-extrabold">Letters</h2>
      <Row label="Learning path"><Choice value={s.learningPath} options={['alphabetical', 'home-row'] as const} onChange={(v) => s.set({ learningPath: v })} labels={{ alphabetical: 'A to Z', 'home-row': 'Easy keys first (home row)' }} /></Row>
      <Row label="Child's first name (stays on this device)">
        <input value={s.childName} maxLength={16} onChange={(e) => s.set({ childName: e.target.value.replace(/[^A-Za-z]/g, '') })} className="min-h-[44px] rounded-lg border-2 border-outline bg-surface px-2 text-text" />
      </Row>
      <h2 className="mb-2 mt-6 text-2xl font-extrabold">Screen time</h2>
      <Row label="Stretch breaks: randomly between 5 and this many minutes (0 = off)">
        <input type="number" min={0} max={120} value={s.sessionMinutes} onChange={(e) => s.set({ sessionMinutes: Number(e.target.value) })} className="w-24 rounded-lg border-2 border-outline bg-surface px-2 text-text" />
      </Row>
      <Row label="Daily limit (minutes, 0 = off)">
        <input type="number" min={0} max={300} value={s.dailyLimitMinutes} onChange={(e) => s.set({ dailyLimitMinutes: Number(e.target.value) })} className="w-24 rounded-lg border-2 border-outline bg-surface px-2 text-text" />
      </Row>
      <Row label="Bedtime mode (dim theme, calm music, sleep timer)">
        <input type="checkbox" checked={s.bedtime} onChange={(e) => s.set({ bedtime: e.target.checked })} />
      </Row>
      <Row label="Song sleep timer (minutes)">
        <input type="number" min={1} max={60} value={s.sleepTimerMinutes} onChange={(e) => s.set({ sleepTimerMinutes: Number(e.target.value) })} className="w-24 rounded-lg border-2 border-outline bg-surface px-2 text-text" />
      </Row>
    </div>
  );
}

function Dashboard() {
  const p = useProgress();
  const today = Math.round((p.secondsByDay[dayKey()] ?? 0) / 60);
  const week = Math.round(
    Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() - i * 86400000))).reduce((s, k) => s + (p.secondsByDay[k] ?? 0), 0) / 60,
  );
  const favourites = Object.entries(p.storiesCompleted).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const title = (id: string) => storyIndex.find((s) => s.id === id)?.title ?? id;
  return (
    <div className="space-y-4">
      <p className="text-base opacity-75">All progress is stored only in this browser, on this device.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Stars', p.stars], ['Stickers', p.stickers.length], ['Minutes today', today], ['Minutes this week', week]].map(([k, v]) => (
          <div key={k} className="rounded-2xl border-2 border-outline p-3 text-center"><div className="text-3xl font-extrabold">{v}</div><div>{k}</div></div>
        ))}
      </div>
      <div>
        <h3 className="font-extrabold">Stories finished: {Object.keys(p.storiesCompleted).length} of {storyIndex.length}</h3>
        {favourites.length > 0 && <p>Favourites: {favourites.map(([id, n]) => `${title(id)} (${n}×)`).join(', ')}</p>}
      </div>
      <div>
        <h3 className="font-extrabold">Letters (bold = familiar, practised 3+ times)</h3>
        <p className="font-story text-2xl tracking-wide">
          {letters.map((l) => (
            <span key={l.letter} className={(p.letters[l.letter] ?? 0) >= 3 ? 'font-bold' : 'opacity-40'}>{l.letter} </span>
          ))}
        </p>
      </div>
      <div>
        <h3 className="font-extrabold">Numbers</h3>
        <p className="font-story text-2xl">
          {Array.from({ length: 21 }, (_, n) => (
            <span key={n} className={(p.numbers[n] ?? 0) >= 3 ? 'font-bold' : 'opacity-40'}>{n} </span>
          ))}
        </p>
      </div>
      <button type="button" onClick={() => window.confirm(strings.parent.resetConfirm) && p.reset()} className="min-h-[48px] rounded-xl border-4 border-outline px-4 font-bold">
        {strings.parent.reset}
      </button>
    </div>
  );
}

function OfflinePanel() {
  const offline = useProgress((s) => s.offline);
  const toggle = useProgress((s) => s.toggleOffline);
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <div>
      <p className="mb-3 text-base opacity-75">Stories you open are saved automatically. Tick a story to keep it ready offline even before it is opened.</p>
      {storyIndex.map((s) => (
        <Row key={s.id} label={s.title}>
          {busy === s.id ? <span>Saving…</span> : null}
          <input
            type="checkbox"
            checked={offline.includes(s.id)}
            onChange={async (e) => {
              setBusy(s.id);
              if (e.target.checked) await cacheStory(s.id);
              else await uncacheStory(s.id);
              toggle(s.id);
              setBusy(null);
            }}
          />
        </Row>
      ))}
    </div>
  );
}

/** Tiny Markdown renderer for the bundled legal/credits documents (headings, lists, paragraphs). */
function Markdown({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split(/\r?\n/).map((line, i) => {
        if (line.startsWith('# ')) return <h2 key={i} className="text-2xl font-extrabold">{line.slice(2)}</h2>;
        if (line.startsWith('## ')) return <h3 key={i} className="pt-2 text-xl font-bold">{line.slice(3)}</h3>;
        if (line.startsWith('### ')) return <h4 key={i} className="font-bold">{line.slice(4)}</h4>;
        if (/^[-*] /.test(line)) return <p key={i} className="pl-4">• {line.slice(2).replace(/\*\*/g, '')}</p>;
        if (line.startsWith('|') || !line.trim()) return line.startsWith('|') ? <p key={i} className="font-mono text-sm">{line}</p> : null;
        return <p key={i}>{line.replace(/\*\*/g, '')}</p>;
      })}
    </div>
  );
}
