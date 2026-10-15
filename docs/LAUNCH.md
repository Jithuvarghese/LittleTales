# Launch Checklist and Test Matrix

## Before launch
- [ ] Legal review of `docs/legal/privacy-policy.md` and `docs/legal/terms.md`; add a contact email
- [ ] Owner picks the narration engine and voice (`npm run audio:samples`), then `npm run audio:generate`, `npm run audio:review`
- [ ] All 26 letter sounds listen-checked and listed in `config/approved-clips.json`
- [ ] Voice and any music licences recorded in `docs/ATTRIBUTIONS.md` and `licenses.json`
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` all pass
- [ ] Lighthouse (Performance, Accessibility, Best Practices) at 90 or above on the deployed site
- [ ] Response headers verified on the deployed site (CSP, Referrer-Policy: no-referrer)

## Deploying
| Host | Setup |
|---|---|
| Netlify | Connect the repo. `netlify.toml` builds `npm run build` to `dist`; `public/_headers` and `public/_redirects` apply automatically |
| Cloudflare Pages | Build command `npm run build`, output `dist`; `_headers` and `_redirects` apply automatically |
| Vercel | Framework "Vite"; `vercel.json` provides headers and SPA rewrites |

## Browser and device matrix
Run through: tap to start → home → a story in each mode → a quiz → sticker book → Find the key → a rhyme → grown-ups gate.

| Device / browser | Layout | Touch | Keyboard games | Audio | Offline revisit | Notes |
|---|---|---|---|---|---|---|
| iPad (Safari, latest 2) | | | on-screen | | | |
| Android tablet (Chrome) | | | on-screen | | | |
| iPhone (Safari) | | | on-screen | | | |
| Android phone (Chrome) | | | on-screen | | | |
| Windows laptop (Chrome, Edge) | | n/a | physical | | | |
| Windows laptop (Firefox) | | n/a | physical | | | |
| Mac (Safari, Chrome) | | n/a | physical | | | |
| 4K desktop | | n/a | physical | | | |

Automated coverage: `npm run test:e2e` runs a tablet-sized desktop Chrome and a Pixel 7 profile.

## Known limitations (v1)
- Until narration is generated, voices use the device's built-in speech, which varies by device and may not highlight words on every browser (even-spaced highlighting is used instead).
- Music and sound effects are synthesised placeholders; owner-picked licensed tracks can replace them by file name.
- Art is flat vector illustration made in code; an illustrator can replace any piece without content changes.
