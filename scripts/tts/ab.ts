/**
 * npm run audio:ab -- "Shh... the baby bird is sleeping." --role luna --delivery whisper
 * Renders one line with several candidate voices (and blends) for a role and
 * delivery, then serves a page at http://127.0.0.1:5198 with the takes side by
 * side. "Pick this one" saves the choice to config/voices.json: the role's main
 * voice (for the default delivery) or an override for that role + delivery.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { providers, type SynthJob } from './provider';

const args = process.argv.slice(2);
const text = args.find((a) => !a.startsWith('--')) ?? 'Pip looked up at the big, round moon.';
const val = (n: string, d: string) => (args.includes(n) ? args[args.indexOf(n) + 1]! : d);
const role = val('--role', 'narrator');
const delivery = val('--delivery', 'narrator');
const configPath = 'config/voices.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const CANDIDATES = [
  'af_heart', 'af_bella', 'af_nova', 'af_sky', 'af_sarah', 'bf_emma', 'bf_isabella',
  'am_michael', 'am_puck', 'bm_george', 'af_heart,af_bella', 'af_sky,af_heart', 'bf_emma,af_heart',
];

async function main() {
  const engine = providers.kokoro!;
  await engine.check();
  const dir = join('tools', 'ab');
  mkdirSync(dir, { recursive: true });
  const r = config.roles[role] ?? config.roles.narrator;
  const d = config.deliveries[delivery] ?? config.deliveries.narrator;
  const jobs: SynthJob[] = CANDIDATES.map((voice, i) => ({ text, voice, speed: r.rate * d.rate * config.ageRate, out: join(dir, `take-${i}.wav`) }));
  console.log(`Rendering ${jobs.length} takes...`);
  await engine.synthesizeBatch(jobs, (n) => console.log(`  ${n}/${jobs.length}`));

  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const page = `<!doctype html><html lang="en"><meta charset="utf-8"><title>A/B voices</title>
<style>body{font:16px system-ui;margin:24px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.c{border:1px solid #ccc;border-radius:12px;padding:10px}button{margin-top:6px;padding:8px 12px;border-radius:8px}</style>
<h1>${esc(role)} · ${esc(delivery)}</h1><p>"${esc(text)}"</p><p>Current voice: <b>${esc(String(config.overrides?.[`${role}.${delivery}`] ?? r.kokoro))}</b></p>
<div class="grid">${CANDIDATES.map((v, i) => `<div class="c"><b>${esc(v)}</b><br><audio controls src="/take-${i}.wav"></audio><br><button onclick="pick('${esc(v)}')">Pick this one</button></div>`).join('')}</div>
<p id="s"></p><script>async function pick(v){const r=await fetch('/pick',{method:'POST',body:JSON.stringify({voice:v})});document.getElementById('s').textContent=r.ok?'Saved '+v+' to config/voices.json':'Error'}</script></html>`;

  createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/pick') {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        const { voice } = JSON.parse(body);
        const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
        if (delivery === 'narrator') cfg.roles[role].kokoro = voice;
        else (cfg.overrides ??= {})[`${role}.${delivery}`] = voice;
        writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n');
        res.end('ok');
      });
      return;
    }
    const m = req.url?.match(/^\/take-(\d+)\.wav$/);
    if (m && existsSync(join(dir, `take-${m[1]}.wav`))) {
      res.writeHead(200, { 'Content-Type': 'audio/wav' });
      return res.end(readFileSync(join(dir, `take-${m[1]}.wav`)));
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page);
  }).listen(5198, '127.0.0.1', () => console.log('Compare at http://127.0.0.1:5198/  (Ctrl+C to stop)'));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
