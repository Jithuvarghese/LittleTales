/**
 * Validates all content against the Zod schemas and checks references:
 * props exist in the art library, referenced files exist, word-timing gaps.
 * Exits non-zero on schema or reference errors. Missing audio is reported, not
 * fatal (built-in sounds and the speech fallback cover it).
 *
 *   npm run content:validate [-- --dir some/other/stories]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { lettersFile, numbersFile, rhyme, stickersFile, story } from '../src/content/schema';

// Prop ids are read from the art library source so this script needs no JSX runtime.
const propSource = readFileSync('src/art/props.tsx', 'utf8');
const propIds = new Set([...propSource.matchAll(/\{ id: '([a-z-]+)', name:/g)].map((m) => m[1]!));
const speciesSource = readFileSync('src/art/cast/species.ts', 'utf8');
const castIds = new Set([...speciesSource.matchAll(/^\s{2}(\w+): \{ name:/gm)].map((m) => m[1]!));
const builtinSfx = new Set(['chime', 'pop', 'whoosh', 'boing', 'sparkle', 'boop', 'tada', 'click', 'twinkle', 'splash', 'drum', 'bell']);
const builtinMusic = new Set(['twinkle', 'lullaby', 'frere', 'row', 'mary', 'play']);

export type Report = { errors: string[]; missingAudio: string[]; timingGaps: string[] };

const base = (src: string) => src.split('/').pop()!.replace(/\.(mp3|ogg|m4a|wav)$/, '');

export function validateDir(storyDir = 'content/stories/en', rhymeDir = 'content/rhymes/en'): Report {
  const r: Report = { errors: [], missingAudio: [], timingGaps: [] };
  const fileExists = (src: string) => existsSync(join('public', src));
  const checkProp = (where: string, id?: string) => {
    if (id && !propIds.has(id)) r.errors.push(`${where}: unknown prop "${id}"`);
  };
  const checkAudio = (where: string, src: string | undefined, builtin?: Set<string>) => {
    if (!src || fileExists(src)) return;
    if (builtin?.has(base(src).replace(/-\d+$/, ''))) return;
    r.missingAudio.push(`${where}: ${src}`);
  };

  for (const f of readdirSync(storyDir).filter((x) => x.endsWith('.json'))) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(storyDir, f), 'utf8'));
    } catch (e) {
      r.errors.push(`${f}: invalid JSON (${(e as Error).message})`);
      continue;
    }
    const parsed = story.safeParse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues) r.errors.push(`${f}: ${i.path.join('.')} ${i.message}`);
      continue;
    }
    const s = parsed.data;
    if (`${s.id}.json` !== f) r.errors.push(`${f}: id "${s.id}" does not match file name`);
    if (s.rewardAlbum && !['animals', 'ocean', 'sky', 'treats'].includes(s.rewardAlbum)) r.errors.push(`${f}: unknown sticker album "${s.rewardAlbum}"`);
    checkAudio(`${f} music`, s.music?.src, builtinMusic);
    s.pages.forEach((p, i) => {
      const where = `${f} page ${i + 1}`;
      if (p.type === 'story') {
        p.scene?.props.forEach((x) => checkProp(where, x.prop));
        p.scene?.characters.forEach((c) => { if (!castIds.has(c.id)) r.errors.push(`${where}: unknown character "${c.id}"`); });
        p.timeline.forEach((t) => { if (!castIds.has(t.id)) r.errors.push(`${where}: cue for unknown character "${t.id}"`); });
        if (p.image && !fileExists(p.image)) r.errors.push(`${where}: missing image ${p.image}`);
        checkAudio(where, p.narration?.src);
        if (p.narration?.src && fileExists(p.narration.src) && !p.narration.wordTimings?.length)
          r.timingGaps.push(where);
        p.sfx.forEach((x) => checkAudio(where, x.src, builtinSfx));
        p.hotspots.forEach((h) => checkAudio(where, h.onTap.sfx, builtinSfx));
      } else {
        if ('options' in p) p.options.forEach((o) => checkProp(where, o.prop));
        if ('targets' in p) p.targets.forEach((o) => checkProp(where, o.prop));
        if (p.quizType === 'count') {
          checkProp(where, p.prop);
          if (!p.choices.includes(p.count)) r.errors.push(`${where}: choices must include ${p.count}`);
        }
        if (p.quizType === 'drag-drop') checkProp(where, p.item);
        if (p.quizType === 'sequence') p.shown.forEach((x) => checkProp(where, x));
      }
    });
  }

  if (existsSync(rhymeDir)) {
    for (const f of readdirSync(rhymeDir).filter((x) => x.endsWith('.json'))) {
      const parsed = rhyme.safeParse(JSON.parse(readFileSync(join(rhymeDir, f), 'utf8')));
      if (!parsed.success) {
        for (const i of parsed.error.issues) r.errors.push(`${f}: ${i.path.join('.')} ${i.message}`);
        continue;
      }
      parsed.data.scene.props.forEach((x) => checkProp(f, x.prop));
      checkAudio(`${f} vocal`, parsed.data.vocal);
    }
  }

  const checkFile = (path: string, schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } } }) => {
    const res = schema.safeParse(JSON.parse(readFileSync(path, 'utf8')));
    if (!res.success) for (const i of res.error!.issues) r.errors.push(`${path}: ${i.path.join('.')} ${i.message}`);
  };
  if (storyDir === 'content/stories/en') {
    checkFile('content/letters.en.json', lettersFile);
    checkFile('content/numbers.en.json', numbersFile);
    checkFile('content/stickers.json', stickersFile);
    // Stickers: every picture exists, every album has a background and at least one sticker.
    const stickerFile = stickersFile.parse(JSON.parse(readFileSync('content/stickers.json', 'utf8')));
    const albumIds = new Set(stickerFile.albums.map((a) => a.id));
    for (const a of stickerFile.albums) {
      if (!a.backdrop) r.errors.push(`sticker album "${a.id}" has no background`);
      if (!stickerFile.stickers.some((st) => st.album === a.id)) r.errors.push(`sticker album "${a.id}" has no stickers`);
    }
    for (const st of stickerFile.stickers) {
      if (!albumIds.has(st.album)) r.errors.push(`sticker "${st.id}" is in unknown album "${st.album}"`);
      if (!propIds.has(st.prop) && !castIds.has(st.prop)) r.errors.push(`sticker "${st.id}" uses unknown picture "${st.prop}"`);
    }
    if (new Set(stickerFile.stickers.map((st) => st.id)).size !== stickerFile.stickers.length) r.errors.push('duplicate sticker ids');
    const letters = lettersFile.parse(JSON.parse(readFileSync('content/letters.en.json', 'utf8'))).letters;
    letters.forEach((l) => {
      checkProp(`letter ${l.letter}`, l.prop);
      checkAudio(`letter ${l.letter}`, l.audio.sound);
    });
  }
  return r;
}

if (process.argv[1]?.endsWith('validate-content.ts')) {
  const dirArg = process.argv.indexOf('--dir');
  const r = dirArg > 0 ? validateDir(process.argv[dirArg + 1]!, '') : validateDir();
  if (r.missingAudio.length)
    console.log(`\n${r.missingAudio.length} audio file(s) not recorded yet (speech fallback in use). Run with --verbose to list.`);
  if (process.argv.includes('--verbose')) r.missingAudio.forEach((m) => console.log(`  missing audio  ${m}`));
  if (r.timingGaps.length) console.log(`${r.timingGaps.length} page(s) have audio but no wordTimings.`);
  if (r.errors.length) {
    console.error(`\n${r.errors.length} error(s):`);
    r.errors.forEach((e) => console.error(`  x ${e}`));
    process.exit(1);
  }
  console.log('content: OK');
}
