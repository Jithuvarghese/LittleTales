# Audio Guide

Audio is played through one `AudioManager` (`src/services/AudioManager.ts`) with five channels (`music`, `narration`, `sfx`, `ui`, `letters`). Each channel has its own volume and mute in the grown-ups settings. Music ducks to 40% while a voice speaks. A master limiter caps output.

## What plays when a file is missing
Nothing ever blocks on missing audio:
- **Music:** built-in melodies synthesised in code (public-domain tunes, see `ATTRIBUTIONS.md`). The file name picks the melody: `audio/music/lullaby-01.mp3` plays the built-in lullaby until a real `lullaby-01.mp3` exists.
- **Sound effects:** synthesised in code by name (`chime`, `pop`, `whoosh`, `boing`, `sparkle`, `boop`, `tada`, `click`, `twinkle`, `splash`, `drum`, `bell`).
- **Narration, letters, numbers:** the browser's own speech voice (rate 0.8, pitch 1.1). This is a fallback only; recorded clips replace it automatically once generated.

The app only requests files that exist (the list is built into `content/index.json` by `npm run content:manifest`), so there are no 404s.

## Files and naming
| What | Path | Loudness |
|---|---|---|
| Story narration | `public/audio/narration/en/<story-id>/p<page>.mp3` | −16 LUFS |
| Quiz questions | `public/audio/narration/en/<story-id>/q<page>.mp3` | −16 LUFS |
| Letter name / sound / word | `public/audio/letters/en/<a>-name.mp3`, `<a>-sound.mp3`, `<a>-word.mp3` | −16 LUFS |
| Number names | `public/audio/numbers/en/<n>.mp3` | −16 LUFS |
| Rhyme lines | `public/audio/songs/<rhyme-id>/l<line>.mp3` | −16 LUFS |
| Music loops | `public/audio/music/<name>.mp3` | −22 LUFS |
| Sound effects | `public/audio/sfx/<name>.mp3` | −18 LUFS |

All files: 44.1 kHz, MP3 (an `.ogg` beside it is optional). Music must loop seamlessly (trim to a bar line), 60–90 BPM for bedtime, 90–120 for play, with no sudden loud parts. Run `npm run audio:generate -- --dry-run` to see every clip the content needs.

## Generating narration (free, local, no account)
Narration is generated ahead of time on the developer's computer by an open-source engine. Nothing is sent online, and the child's browser never generates speech from these files.

### Engines compared
| | Piper | Kokoro-82M |
|---|---|---|
| Engine licence | MIT | Apache-2.0 (model weights too) |
| Voice licences | **Per voice.** Check each model card (many are CC-BY or CC0; some datasets are non-commercial and must not be used) | Voices ship with the Apache-2.0 model |
| Quality | Clear, a little flat | Warmer and more natural, the most child-friendly |
| Speed on a laptop CPU | Very fast | Slower but fine for batch work |
| Word timings | No (estimated or aligned afterwards) | Yes, per token (used directly) |
| Windows | `pip install piper-tts` | `pip install kokoro soundfile` (Python 3.10–3.12) |

**Recommendation:** Kokoro with the `af_heart` voice for narration and `af_bella` for the song host. Before relying on any voice, check its current licence text and record it in `ATTRIBUTIONS.md` and `licenses.json`.

### Steps
1. Install ffmpeg (`winget install Gyan.FFmpeg`) for loudness normalisation.
2. Install an engine:
   - Kokoro: `pip install kokoro soundfile`. The model downloads once into `tools/models/` (git-ignored).
   - Piper: `pip install piper-tts`, then download a voice `.onnx` and `.onnx.json` into `tools/models/`.
3. Make comparison clips and listen: `npm run audio:samples` writes `tools/samples/<engine>-story|letter|counting.wav`.
4. **Owner picks the engine and voice.** Set `"engine"` and the voices in `config/voices.json`.
5. Generate: `npm run audio:generate` (add `-- --only <story-id>` for one story, `-- --engine kokoro` to override). It is idempotent: a hash of text, voice and settings is stored in `config/audio-cache.json`, so only changed lines are regenerated.
6. Review: `npm run audio:review` opens a page listing every clip with a play button and a "redo" tick box.
7. Letter sounds need extra care: listen to all 26 `-sound` clips. When a take is right, add its path to `config/approved-clips.json` so it is never accidentally regenerated.
8. `npm run content:manifest`, then commit the reviewed MP3s and updated content.

### Word timings
If the engine provides timings (Kokoro), they're used directly. Otherwise timings are estimated in proportion to each word's length, with pauses after punctuation (`estimateTimings` in `scripts/tts/provider.ts`). For tighter sync, run a free forced aligner (for example a Whisper-based aligner) over the clips and write its output into `wordTimings`. Slightly early or late highlighting is acceptable; clearly wrong highlighting is not, so check a few clips per story in "Read to me" mode.

### Pronunciations
`config/pronunciations.json` holds whole-word replacements used only for speech (the on-screen text is unchanged), plus the phonics prompts for letter sounds.

### Songs
Local engines don't sing well, so rhymes are delivered as rhythmic chanted verses over the built-in music bed, with highlighted lyrics.

## Adding owner-picked music
Use only tracks whose licence allows website use and local copies (for example CC0 or CC-BY from Free Music Archive, Incompetech, FreePD, Musopen or OpenGameArt). Never use YouTube rips or embeds. Save the file as `public/audio/music/<name>.mp3`, add it to `licenses.json` and `ATTRIBUTIONS.md` (credit is shown on the grown-ups Credits screen), and point a story's `music` at it.
