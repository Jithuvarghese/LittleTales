# LittleTales

A colourful, safe, joyful website where children aged 3–7 listen to stories, play gentle quizzes, meet letters and numbers, and sing along to rhymes. No ads, no accounts, no trackers, no third-party requests; all progress stays on the device.

## What's inside
- **Stories:** 11 illustrated stories with three reading modes (Read to me with word highlighting, Grown-up reads, I'll try), tappable pictures, page swipes, a paw-print progress trail, and a sticker at the end.
- **Quizzes:** 7 types (picture choice, sound choice, count it, colour/shape match, what happens next, drag and drop, feelings). No failure states: hint, then reveal, then celebrate.
- **ABC:** Meet the letters, Find the key, Pop the bubbles, My name, Alphabet song. Large on-screen keyboard, case-insensitive, browser shortcuts blocked.
- **123:** Meet the numbers 0–20, Find the number, Count and tap, Which has more, Add them up.
- **Songs and rhymes:** 7 public-domain rhymes plus an original counting song, with karaoke highlighting, Play all, and a bedtime sleep timer.
- **Rewards:** stars and a sticker book with drag-and-drop albums.
- **Grown-ups (behind a gate):** volumes per channel, text size, letter case, dyslexia-friendly font, themes, learning path, child's name, screen-time breaks, daily limit, bedtime mode, progress dashboard, offline stories, credits, privacy and terms.
- Four themes, offline caching, strict Content Security Policy.

## Getting started
```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # unit tests
npm run test:e2e         # browser tests (run `npm run build` first; `npx playwright install chromium` once)
npm run lint
npm run typecheck
npm run build            # production build into dist/ (validates content, checks the bundle)
```

## Content
```bash
npm run content:new-story -- my-story   # scaffold a story
npm run content:convert                 # Markdown stories -> JSON
npm run content:validate                # schema + asset checks
npm run audio:generate -- --dry-run     # list narration clips needed
```
See [docs/AUTHORING_GUIDE.md](docs/AUTHORING_GUIDE.md), [docs/AUDIO_GUIDE.md](docs/AUDIO_GUIDE.md), [docs/ART_STYLE.md](docs/ART_STYLE.md), [docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md) and [content/STORY_BACKLOG.md](content/STORY_BACKLOG.md).

## Deploying
Static hosting. `public/_headers` and `public/_redirects` configure Netlify and Cloudflare Pages; `vercel.json` configures Vercel. See [docs/LAUNCH.md](docs/LAUNCH.md).

See [CONTRIBUTING.md](CONTRIBUTING.md) for conventions.
