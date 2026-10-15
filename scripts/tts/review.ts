/**
 * npm run audio:review -> writes tools/audio-review.html and serves it locally.
 * Lists every generated clip with its text, a play button and a "flag for redo"
 * toggle. Flags are exported as a JSON list to paste into config/redo.json;
 * delete those clips' cache entries (npm run audio:generate -- --force --only <id>) to redo.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

type Clip = { src: string; text: string; group: string };

function collect(): Clip[] {
  const clips: Clip[] = [];
  for (const f of readdirSync('content/stories/en').filter((x) => x.endsWith('.json'))) {
    const s = JSON.parse(readFileSync(join('content/stories/en', f), 'utf8'));
    s.pages.forEach((p: Record<string, any>) => {
      if (p.type === 'story' && p.narration?.src) clips.push({ src: p.narration.src, text: p.text, group: s.title });
      if (p.type === 'quiz' && p.questionAudio) clips.push({ src: p.questionAudio, text: p.question, group: s.title });
    });
  }
  for (const f of readdirSync('content/rhymes/en').filter((x) => x.endsWith('.json'))) {
    const r = JSON.parse(readFileSync(join('content/rhymes/en', f), 'utf8'));
    r.lines.forEach((l: Record<string, any>) => l.narration?.src && clips.push({ src: l.narration.src, text: l.text, group: r.title }));
  }
  const letters = JSON.parse(readFileSync('content/letters.en.json', 'utf8')).letters;
  for (const l of letters) {
    clips.push({ src: l.audio.name, text: `${l.letter} (name)`, group: 'Letters' });
    clips.push({ src: l.audio.sound, text: `${l.letter} (sound: must be a clean phonics sound)`, group: 'Letters' });
    clips.push({ src: l.audio.word, text: `${l.letter} is for ${l.word}`, group: 'Letters' });
  }
  for (const n of JSON.parse(readFileSync('content/numbers.en.json', 'utf8')).numbers) clips.push({ src: n.audio, text: n.word, group: 'Numbers' });
  return clips.filter((c) => existsSync(join('public', c.src)));
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function page(clips: Clip[]) {
  const rows = clips
    .map((c) => `<tr><td>${esc(c.group)}</td><td>${esc(c.text)}</td><td><audio controls preload="none" src="/${esc(c.src)}"></audio></td><td><label><input type="checkbox" data-src="${esc(c.src)}"> redo</label></td></tr>`)
    .join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>Audio review</title>
<style>body{font:16px system-ui;margin:24px}td{padding:6px 10px;border-bottom:1px solid #ddd}textarea{width:100%;height:120px}</style>
<h1>Audio review (${clips.length} clips)</h1>
<p>Listen to each clip. Tick "redo" for anything wrong, then copy the list below into config/redo.json.</p>
<table>${rows || '<tr><td>No clips generated yet. Run npm run audio:generate first.</td></tr>'}</table>
<h2>Flagged</h2><textarea id="out" readonly>[]</textarea>
<script>
const key='lt-review';const saved=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
const out=document.getElementById('out');
const sync=()=>{out.value=JSON.stringify([...saved],null,2);localStorage.setItem(key,out.value)};
document.querySelectorAll('input[data-src]').forEach(cb=>{cb.checked=saved.has(cb.dataset.src);cb.onchange=()=>{cb.checked?saved.add(cb.dataset.src):saved.delete(cb.dataset.src);sync()}});
sync();
</script></html>`;
}

const clips = collect();
mkdirSync('tools', { recursive: true });
writeFileSync('tools/audio-review.html', page(clips));
console.log(`Wrote tools/audio-review.html with ${clips.length} clips.`);

if (!process.argv.includes('--no-serve')) {
  const types: Record<string, string> = { '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.html': 'text/html' };
  createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]!);
    const file = url === '/' ? 'tools/audio-review.html' : normalize(join('public', url));
    if (!file.startsWith('public') && file !== normalize('tools/audio-review.html')) return void res.writeHead(403).end();
    if (!existsSync(file)) return void res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  }).listen(5199, '127.0.0.1', () => console.log('Review at http://127.0.0.1:5199/  (Ctrl+C to stop)'));
}
