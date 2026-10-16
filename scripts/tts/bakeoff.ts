/**
 * npm run audio:bakeoff
 * Builds tools/bakeoff/index.html: every comparison clip in tools/bakeoff and
 * tools/samples, grouped by test line, with candidates side by side. Pick a
 * favourite per role and note it in config/voices.json.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'tools/bakeoff';
mkdirSync(dir, { recursive: true });
// Local engine samples (npm run audio:samples) join the comparison too.
if (existsSync('tools/samples')) for (const f of readdirSync('tools/samples')) if (f.endsWith('.wav')) copyFileSync(join('tools/samples', f), join(dir, `kokoro-local__${f}`));

const clips = readdirSync(dir).filter((f) => /\.(wav|mp3)$/.test(f));
const groups = new Map<string, string[]>();
for (const f of clips) {
  const [engine, ...rest] = f.replace(/\.(wav|mp3)$/, '').split('__');
  const line = rest.join('__') || engine!;
  groups.set(line, [...(groups.get(line) ?? []), f]);
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const rows = [...groups.entries()]
  .sort()
  .map(([line, files]) => `<section><h2>${esc(line)}</h2><div class="row">${files.map((f) => `<figure><figcaption>${esc(f.split('__')[0]!)}</figcaption><audio controls preload="none" src="${esc(f)}"></audio></figure>`).join('')}</div></section>`)
  .join('\n');
writeFileSync(
  join(dir, 'index.html'),
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Voice bake-off</title>
<style>body{font:16px system-ui;margin:24px;max-width:1100px}section{border-bottom:1px solid #ddd;padding:12px 0}.row{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0}figcaption{font-weight:bold}</style>
<h1>Voice bake-off (${clips.length} clips)</h1><p>Listen to each test line across engines. Choose a winner per role and update config/voices.json.</p>${rows || '<p>No clips yet. Run npm run audio:samples, or unzip notebook results here.</p>'}</html>`,
);
console.log(`Wrote ${join(dir, 'index.html')} (${clips.length} clips). Open it in a browser.`);
