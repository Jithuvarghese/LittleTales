# Recording Guide: Real Voices for LittleTales

Children listen longer, and learn more, when the voice is a real, warm person. This guide lets a parent, grandparent or friend record the whole library with a phone or laptop and no audio experience.

## Open the studio
```bash
npm run dev
# then open http://localhost:5173/studio
```
The studio exists only on your computer during development; it is never part of the published website.

Each line shows:
- the **text**, large,
- a **direction** in yellow (for example "Luna · whisper" or "Teacher · the SOUND only"),
- **Record / Stop / Replay / Re-record / Save & next**.

Keys: **Space** starts and stops recording, **R** replays, **Enter** saves and moves on.

After each take the studio trims the silence, removes rumble, lowers background hiss, evens out the volume, and warns you if the take is too quiet, too loud or noisy. Saved takes replace the computer voice straight away, line by line, so the site improves as you go.

## Recording order
1. **Letters** (name, sound, word) and **numbers**: these are heard most often.
2. **Praise and quiz questions** ("Great job!", "Try again!").
3. The most-played stories (check the grown-ups Progress screen for favourites).
4. Everything else, then **songs**.

## The room and the microphone
- Pick the quietest room. Turn off fans, the fridge hum if you can, and notifications.
- Soft things stop echo: curtains, a sofa, a bed. **Blanket-fort trick:** sit under a duvet draped over a chair with the phone or laptop inside with you. It sounds silly and works wonderfully.
- Keep the microphone about **15 cm (six inches)** from your mouth, slightly to the side so breaths do not pop.
- Phone headsets and USB microphones are both fine. Use the same set-up for a whole session so lines match.

## How to read for young children
- **Smile while you speak.** Children can hear it.
- **Slow down.** Slower than feels natural, with clear pauses between sentences.
- **Exaggerate.** Big ups and downs; children love drama.
- **Whisper and shout on purpose** when the direction says so. Sound words ("Splash!", "Boing!") should be loud and silly.
- Ask questions as if the child is with you: "Can you see the moon?" Leave a little gap after it.
- Letter **sounds** are short and clean: /b/ not "buh", /s/ is a hiss. Listen back to each one.
- If you stumble, just press Re-record. Nobody hears the mistakes.

## Character voices
Different people can voice different characters for natural variety: one storyteller, a deeper voice for Bumble the bear, a calm, slow voice for Luna the owl, a bright, quick voice for Coco the parrot, a cheerful voice for Pip, a bouncy, slightly robotic voice for Zig.

**Children's voices:** an older child may voice a character only with a parent's written consent. Keep the consent note safe, and never use a child's voice to train or copy a voice.

## Songs
1. Choose the rhyme in the **Songs** group. Put on headphones, press Record, and the studio plays the backing band so you can keep time (the headphones stop the band leaking into the recording).
2. Sing the whole rhyme once, happily and slowly. Perfect pitch is not needed; joy is.
3. After saving, press **Play & tap each line** and tap Space at the start of every line. This makes the words light up in time. Save the timings.

## Warm-up script (read aloud before each session)
> "Hello, hello! Big smile... Pip looked up at the big, round moon. Splash! Boing! Shh... the baby bird is sleeping. Hooray! One, two, three!"

## Session checklist
- [ ] Quiet room, phone on silent, water nearby
- [ ] Microphone about 15 cm away, same set-up as last time
- [ ] Warm-up script read once
- [ ] Recorded lines replayed; any warnings fixed with a re-record
- [ ] Unsure takes flagged for redo
- [ ] After the session: `npm run content:manifest`, listen to one story in "Read to me", commit the new files

## Permission and credit
Before publishing, every speaker gives written permission for their recordings to be used on the website. Add each speaker to `docs/ATTRIBUTIONS.md` using first names or initials only (for example "Narration: A. and R.").
