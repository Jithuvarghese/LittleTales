/**
 * Converts simple Markdown story files (content/stories-src/*.md) into validated
 * story JSON (content/stories/en/*.json). Format: see docs/AUTHORING_GUIDE.md.
 *
 *   npm run content:convert            -> convert every .md file
 *   npm run content:convert -- my-tale -> convert one
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { story } from '../src/content/schema';
import { castIds } from '../src/art/cast/species';
import { inferDelivery, inferSpeaker } from '../src/content/voicing';

const SRC = 'content/stories-src';
const OUT = 'content/stories/en';
// Any cast member (main or supporting) in a scene line becomes an acting character.
const chars = new Set<string>(castIds);
const PROP_ANIMS = new Set(['float', 'wiggle', 'bounce', 'spin', 'grow', 'twinkle', 'sway', 'left', 'right']);
const POSES = new Set(['idle', 'talk', 'happy', 'cheer', 'think', 'sleepy', 'sleep', 'sad-soft', 'surprised', 'wave', 'dance', 'walk']);

type Item = { kind: 'prop' | 'char'; name: string; x: number; y: number; size: number; extra?: string; facing?: string };

/** "night | moon 70 25 22 float | pip 40 65 40 happy" */
export function parseScene(line: string) {
  const [backdrop, ...rest] = line.split('|').map((s) => s.trim());
  const items: Item[] = rest.filter(Boolean).map((tok) => {
    const [name, x, y, size, extra, facing] = tok.split(/\s+/);
    return {
      kind: chars.has(name!) ? 'char' : 'prop',
      name: name!,
      x: Number(x),
      y: Number(y),
      size: Number(size ?? 20),
      extra,
      facing,
    };
  });
  const scene = {
    backdrop,
    props: items
      .filter((i) => i.kind === 'prop')
      .map((i) => ({ prop: i.name, x: i.x, y: i.y, size: i.size, ...(i.extra ? { anim: i.extra } : {}) })),
    characters: items
      .filter((i) => i.kind === 'char')
      .map((i) => ({
        id: i.name,
        x: i.x,
        y: i.y,
        size: i.size,
        ...(i.extra && !PROP_ANIMS.has(i.extra) ? (POSES.has(i.extra) ? { pose: i.extra } : { expression: i.extra }) : {}),
        ...(i.facing === 'left' || i.extra === 'left' ? { facing: 'left' } : {}),
      })),
  };
  return { scene, items };
}

function parseOption(line: string) {
  // "- moon *"  |  "- circle #e8553f red *"  |  "- happy *" (feelings)
  const correct = /\s\*$/.test(line);
  const parts = line.replace(/^-\s*/, '').replace(/\s\*$/, '').trim().split(/\s+/);
  const opt: Record<string, unknown> = {};
  const faces = ['happy', 'sad', 'sleepy', 'surprised', 'scared', 'angry'];
  const shapes = ['circle', 'square', 'triangle', 'star', 'heart'];
  const first = parts[0]!;
  if (faces.includes(first) && parts.length === 1) {
    opt.face = first;
    opt.label = first;
  } else if (parts[1]?.startsWith('#')) {
    if (shapes.includes(first)) opt.shape = first;
    else opt.prop = first;
    opt.color = parts[1];
    opt.label = parts.slice(2).join(' ') || first;
  } else {
    opt.prop = first;
    opt.label = parts.slice(1).join(' ') || first.replace(/-/g, ' ');
  }
  if (correct) opt.correct = true;
  return opt;
}

function parseQuiz(header: string, optionLines: string[]) {
  // "> quiz count: How many stars? | star 3 | 2 3 4"
  const m = header.match(/^>\s*quiz\s+([a-z-]+):\s*(.*)$/);
  if (!m) throw new Error(`Bad quiz line: ${header}`);
  const [, quizType, rest] = m;
  const [question, ...args] = rest!.split('|').map((s) => s.trim());
  const base = { type: 'quiz', quizType, question, reward: { stars: 1 } };
  const options = optionLines.map(parseOption);
  switch (quizType) {
    case 'count': {
      const [prop, count] = args[0]!.split(/\s+/);
      return { ...base, prop, count: Number(count), choices: args[1]!.split(/\s+/).map(Number) };
    }
    case 'sound-choice':
      return { ...base, sound: args[0], options };
    case 'match':
      return { ...base, target: parseOption(`- ${args[0]}`), options };
    case 'sequence':
      return { ...base, shown: args[0]!.split(/[\s,]+/).filter(Boolean), options };
    case 'drag-drop':
      return { ...base, item: args[0], targets: options };
    case 'feelings':
      return { ...base, character: args[0], options };
    default:
      return { ...base, options };
  }
}

export function convert(md: string) {
  const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error('Missing front matter');
  const meta: Record<string, string> = {};
  for (const line of fm[1]!.split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = md.slice(fm[0].length);
  const blocks = body.split(/^(?=## Page|> quiz)/m).map((b) => b.trim()).filter(Boolean);
  const pages: unknown[] = [];
  let n = 0;

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines[0]!.startsWith('> quiz')) {
      pages.push(parseQuiz(lines[0]!, lines.slice(1).filter((l) => l.startsWith('-'))));
      continue;
    }
    n++;
    const page: Record<string, unknown> = { type: 'story', sfx: [], hotspots: [] };
    let items: Item[] = [];
    for (const line of lines.slice(1)) {
      const [key, ...v] = line.split(':');
      const value = v.join(':').trim();
      switch (key!.trim()) {
        case 'scene': {
          const parsed = parseScene(value);
          page.scene = parsed.scene;
          items = parsed.items;
          break;
        }
        case 'text':
          page.text = value;
          break;
        case 'prompt':
          page.parentPrompt = value;
          break;
        case 'delivery':
          page.delivery = value;
          break;
        case 'effects':
          if (page.scene) (page.scene as Record<string, unknown>).effects = value.split(/[\s,]+/).filter(Boolean);
          break;
        case 'camera':
          if (page.scene) (page.scene as Record<string, unknown>).camera = value;
          break;
        case 'cue': {
          // cue: 3 pip surprised  -> at word 3, Pip looks surprised
          const [word, id, pose] = value.split(/\s+/);
          ((page.timeline as unknown[] | undefined) ?? (page.timeline = [])) as unknown[];
          (page.timeline as unknown[]).push({ word: Number(word), id, pose });
          break;
        }
        case 'speaker':
          page.speaker = value;
          break;
        case 'ambience':
          page.ambience = value;
          break;
        case 'sfx': {
          const [trigger, name] = value.split(/\s+/);
          (page.sfx as unknown[]).push({ trigger, src: `audio/sfx/${name}.mp3` });
          break;
        }
        case 'tap': {
          // tap: cow "Moo!" wiggle boing
          const tm = value.match(/^(\S+)\s+"([^"]*)"\s*(\S+)?\s*(\S+)?$/);
          if (!tm) throw new Error(`Bad tap line: ${line}`);
          const [, target, say, animate, sfx] = tm;
          const it = items.find((i) => i.name === target);
          if (!it) throw new Error(`tap target "${target}" is not in the scene`);
          (page.hotspots as unknown[]).push({
            id: target,
            label: target,
            shape: { x: it.x - it.size / 2, y: it.y - it.size / 2, w: it.size, h: it.size },
            onTap: { say, sayAudio: `audio/narration/en/${meta.id}/p${n}-${target}.mp3`, ...(animate ? { animate } : {}), ...(sfx ? { sfx: `audio/sfx/${sfx}.mp3` } : {}) },
          });
          break;
        }
      }
    }
    page.narration = { src: `audio/narration/en/${meta.id}/p${n}.mp3` };
    // Voicing: explicit lines win; otherwise infer from the words so every page is performed.
    const text = String(page.text ?? '');
    page.delivery ??= inferDelivery(text);
    if (!page.speaker && /["“]/.test(text)) {
      const cast = meta.characters!.split(',').map((s) => s.trim());
      const who = inferSpeaker(text, cast) ?? (page.scene as { characters: { id: string; expression?: string }[] } | undefined)?.characters.find((c) => c.expression === 'talking')?.id;
      if (who) page.speaker = who;
    }
    pages.push(page);
  }

  const data = {
    id: meta.id,
    locale: 'en',
    title: meta.title,
    category: meta.category!.split(',').map((s) => s.trim()),
    ageBand: meta.ageBand,
    durationTag: meta.duration,
    theme: meta.theme || undefined,
    music: meta.music ? { src: `audio/music/${meta.music}.mp3`, volume: 0.4 } : undefined,
    ambience: meta.ambience || undefined,
    characters: meta.characters!.split(',').map((s) => s.trim()),
    coverScene: meta.cover ? parseScene(meta.cover).scene : undefined,
    pages,
  };
  return story.parse(data);
}

/** Keeps generated word timings and question audio when the page text is unchanged. */
function preserveAudio(next: ReturnType<typeof convert>, path: string) {
  if (!existsSync(path)) return;
  const prev = JSON.parse(readFileSync(path, 'utf8'));
  next.pages.forEach((p, i) => {
    const old = prev.pages?.[i];
    if (!old || old.type !== p.type) return;
    if (p.type === 'story' && old.text === p.text && old.narration?.wordTimings) {
      p.narration = { ...p.narration, wordTimings: old.narration.wordTimings };
    }
    if (p.type === 'quiz' && old.question === p.question && old.questionAudio) p.questionAudio = old.questionAudio;
  });
}

function main() {
  const only = process.argv[2];
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const files = readdirSync(SRC).filter((f) => f.endsWith('.md') && (!only || f === `${only}.md`));
  let failed = 0;
  for (const f of files) {
    try {
      const out = convert(readFileSync(join(SRC, f), 'utf8').replace(/\r\n/g, '\n'));
      preserveAudio(out, join(OUT, `${out.id}.json`));
      writeFileSync(join(OUT, `${out.id}.json`), JSON.stringify(out, null, 2) + '\n');
      console.log(`converted ${basename(f)} -> ${out.id}.json`);
    } catch (e) {
      failed++;
      console.error(`FAILED ${f}:`, e instanceof Error ? e.message : e);
    }
  }
  if (failed) process.exit(1);
}

if (process.argv[1]?.endsWith('md-to-story.ts')) main();
