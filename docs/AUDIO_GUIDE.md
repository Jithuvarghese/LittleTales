# Audio Guide

Audio plays through one `AudioManager` (`src/services/AudioManager.ts`) with five channels (`music`, `narration`, `sfx`, `ui`, `letters`), each with its own volume and mute in the grown-ups settings. Music and scene sounds duck to 40% while a voice speaks. A master limiter caps output.

## How every line is performed
Every narrated line has a **role** and a **delivery**, defined in `config/voices.json`:
- **Roles:** narrator, pip, bumble, luna, zig, coco, quizHost, teacher, songHost. Each has its own voice (or voice blend), speed, pitch and sound treatment ("chain").
- **Deliveries:** narrator, excited, whisper, sleepy, sad, surprised, silly, proud, gentle. Each sets speed, pitch, loudness and pause length.
- **Dialogue** inside quotes is performed by the speaking character ("…," said Luna → Luna's voice), the rest by the narrator.
- Story pages set `delivery:` and `speaker:` in the Markdown source; when missing, the converter infers them from the words (whisper, sleepy, surprised…) and writes them into the JSON, where they can be edited.
- Tappable sound words ("Moo!", "Boing!") each get their own short clip performed in a silly voice.
- Ages 3–5: everything is about 12% slower (`ageRate`).

The same rules drive the device-voice fallback in the browser, so even before audio is generated, characters sound different and whispers are quiet.

## Scene sounds
Under every story page a quiet scene bed plays, synthesised in code: chirping birds (meadow, forest, village), sea, night crickets, rain, wind. A page or story can set `ambience:` to override.

## Songs
Songs are never read out in the speaking voice.
- **Sing along:** plays a real singing recording (`audio/songs/<id>/vocal.mp3`, made in the studio) with lines lit up at the tapped timings.
- **Rhyme time:** when there is no recording yet, children chant along with a lively band (plucked melody, bass, kick and clap on a clear beat), a bouncing ball and clapping hands.

## Generating narration (free, local)
The local engine is **Kokoro-82M** (Apache-2.0), running on the processor. It produces word timings directly.

```bash
# once: Python 3.10–3.12, then
pip install kokoro soundfile
winget install Gyan.FFmpeg          # or set FFMPEG_DIR in .env to its bin folder

npm run audio:generate -- --dry-run   # see every clip, its role and delivery
npm run audio:generate                # everything that changed (resumable, saves after each chunk)
npm run audio:generate -- --only pip-and-the-moon   # one story (also: letters, numbers, ui)
npm run audio:review                  # listen to every clip, flag redos
npm run content:manifest              # tell the app which files exist
```
The generator performs each **sentence** separately with the role's voice and delivery speed, shifts pitch with ffmpeg (`rubberband`), applies the role's sound chain (gentle high- and low-pass, warm EQ, light compression, a touch of room for the narrator; Zig slightly metallic), joins sentences with breathing pauses (longer between voices) and a short lead-in, then normalises loudness (−16 LUFS, quieter for whispers and sleepy lines) and writes MP3 + word timings back into the content. A hash per clip in `config/audio-cache.json` means unchanged lines are never regenerated.

Clips listed in `config/approved-clips.json` (approved letter sounds) and `config/recorded-clips.json` (human recordings, imported clips) are **never** overwritten.

### Choosing voices
- `npm run audio:samples` renders five test lines for every role into `tools/samples/`.
- `npm run audio:ab -- "Shh... the baby bird is sleeping." --role luna --delivery whisper` renders one line with 13 candidate voices and blends side by side at http://127.0.0.1:5198. "Pick this one" saves the choice to `config/voices.json` (the role's main voice, or an override for that role and delivery).

## Free comparison of more expressive models (Tier 2.5)
Larger free models (Chatterbox, Sesame CSM, Dia) need a graphics card the development laptop does not have, so they run in a free notebook service with a free GPU (free account, no payment, no API key):
1. `npm run audio:export-lines` writes `tools/notebooks/lines.json` and `bakeoff-lines.json`.
2. Open `tools/notebooks/voice-bakeoff.ipynb` in the notebook service, pick a GPU runtime, upload a line file, run one model section at a time (clips save as they finish; re-running continues).
3. Download the zip. For comparison, unzip into `tools/bakeoff/` and run `npm run audio:bakeoff`. For real lines, `npm run audio:import -- voices.zip --model chatterbox`.
Licences to verify on the day: Chatterbox (MIT), Sesame CSM-1B (Apache 2.0), Dia-1.6B (Apache 2.0). Skip models whose licence requires an on-site credit. Never clone a voice without written permission, and never clone a child's voice.

## Paid service (Tier 3, optional)
A provider for a paid voice service is included (`elevenlabs` in `scripts/tts/provider.ts`). It runs only on the developer's machine; the website never calls it.
1. Copy `.env.example` to `.env` and add the key (the file is git-ignored).
2. `npm run audio:estimate` prints the character count to compare against the plan's monthly credits.
3. Read the plan terms first: commercial rights, any attribution or disclosure requirement (if on-site credit is required, stop: it conflicts with the project's rule about not naming tools on the site), and rules for children's content.
4. Put the service's voice ids into `config/voices.json` under an `elevenlabs` key per role, generate one story (`--engine elevenlabs --only <id>`), approve it, then the rest.

## Human recordings (best for children)
See `docs/RECORDING_GUIDE.md` and the studio at `/studio` (development only). Recordings replace generated clips line by line.

## Files and naming
| What | Path | Loudness |
|---|---|---|
| Story narration | `public/audio/narration/en/<story-id>/p<page>.mp3` | −16 LUFS (quieter for whispers) |
| Tappable sound words | `public/audio/narration/en/<story-id>/p<page>-<item>.mp3` | −16 LUFS |
| Quiz questions | `public/audio/narration/en/<story-id>/q<page>.mp3` | −16 LUFS |
| Praise and prompts | `public/audio/ui/en/<slug>.mp3` | −16 LUFS |
| Letter name / sound / word | `public/audio/letters/en/<a>-name.mp3`, `<a>-sound.mp3`, `<a>-word.mp3` | −16 LUFS |
| Number names | `public/audio/numbers/en/<n>.mp3` | −16 LUFS |
| Song recordings | `public/audio/songs/<rhyme-id>/vocal.mp3` | −16 LUFS |
| Music loops | `public/audio/music/<name>.mp3` | −22 LUFS |

Any of `.mp3`, `.wav`, `.ogg` or `.webm` is accepted for a path; MP3 is preferred. All files 44.1 kHz.

## Adding owner-picked music
Use only tracks whose licence allows website use and local copies (CC0 or CC-BY from Free Music Archive, Incompetech, FreePD, Musopen, OpenGameArt). Never use YouTube rips or embeds. Save as `public/audio/music/<name>.mp3`, add it to `licenses.json` and `ATTRIBUTIONS.md`, and point a story's `music` at it.
