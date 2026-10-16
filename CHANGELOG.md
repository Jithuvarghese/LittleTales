# Changelog

## Unreleased

### Voice upgrade
- Every line has a role and delivery (excited, whisper, sleepy, sad, surprised, silly, proud, gentle); dialogue is voiced by the speaking character; narrator, five characters, quiz host, teacher and song host each have their own voice.
- Story text rewritten for listening: sound words, refrains, questions to the child, natural pauses.
- Generator performs per sentence with pitch shifts, per-role sound chains, breathing pauses and delivery-aware loudness; all 312 clips regenerated with the free local engine.
- Scene ambience under narration: chirping birds, sea, night crickets, rain, wind.
- Songs: no more spoken songs. "Rhyme time" chant-along with a band and clap beat; real singing recordings with tap-timed lyrics.
- Recording studio at `/studio` (development only) with automatic clean-up, quality warnings, saving and timings; recording guide.
- A/B voice picker, free GPU notebook bake-off with import, optional paid-service provider with character estimate.

### Interface polish
- Living background on every screen: sky, hills, drifting clouds, flying birds and butterflies (calm and still on activity screens and with reduced motion).
- Home tiles with colours and labels; story library as one grid with picture filter chips; drawn icons replace emoji characters.
- Phone layouts fixed (letter and number screens); bubbles rise in separate lanes; automated layout check finds no overlaps at phone, tablet or desktop sizes.
- Buttons no longer speak their names; a soft click instead.

### Phase 9: Legal, QA and launch prep
- Privacy policy and terms drafts (flagged for legal review), shown in the grown-ups area.
- Strict Content Security Policy and security headers for Netlify, Cloudflare Pages and Vercel.
- Playwright end-to-end tests (story and quiz, find the key, parent gate, no third-party requests) and axe accessibility checks; launch checklist and device matrix.

### Phase 8: Content scale-up
- 11 stories authored in the Markdown format and converted to validated JSON.
- Story backlog with 120 ideas, authoring guide, content guidelines and QA checklist.

### Phase 7: Offline, performance, accessibility
- Service worker precaches the app and every story; audio and images are cached on use.
- "Offline stories" option in the grown-ups area.
- Feature areas and stories load as separate chunks; initial JavaScript about 150 KB gzipped.

### Phase 6: Rewards and grown-ups area
- Stars, stickers in four albums, sticker book with drag and drop (tap-to-place fallback).
- Parent gate (hold 3 seconds, then a sum), settings, progress dashboard, credits.
- Screen-time stretch breaks, daily limit, bedtime mode with calm music and a sleep timer.

### Phase 5: Numbers, songs and rhymes
- Numbers 0–20: meet, find, count and tap, which has more, picture addition.
- Rhyme player with highlighted lyrics, bouncing ball, Play all; 8 rhymes including a counting song.

### Phase 4: Letters and typing
- On-screen keyboard, Meet the letters, Find the key, Pop the bubbles, My name, Alphabet song.
- Case-insensitive key handling with browser-shortcut blocking.

### Phase 3: Quiz engine
- Seven quiz types driven by JSON with hint-then-reveal rules and star rewards.

### Phase 2: Story reader
- Library shelves by category; reader with three modes, word highlighting, hotspots, page transitions, swipe and arrow keys, end-of-story rewards.

### Phase 1: Audio and content foundations
- AudioManager with five channels, ducking, preloading, unlock splash and a safety limiter.
- Built-in synthesised sound effects and public-domain melodies.
- Zod content schemas, loaders, validator, manifest builder, Markdown converter and story scaffolder.
- Local narration pipeline (`audio:generate`, `audio:samples`, `audio:review`) behind a swappable provider interface.
- Shared SVG art library: five mascots with seven expressions, 75 props, eight backdrops.

### Phase 0: Scaffold
- Vite + React + TypeScript + Tailwind project with lint, format and test setup.
- Four themes via CSS variables; self-hosted fonts; app shell; clean-check pre-commit hook.
