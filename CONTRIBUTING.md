# Contributing

## Stack
React 18 + TypeScript (strict) + Vite, Tailwind CSS with CSS-variable theme tokens,
Framer Motion, Howler.js, Zustand (persisted to local storage), Zod-validated JSON content,
Vitest + Testing Library, Playwright for e2e.

## Principles for the child area
- Touch targets at least 72×72 px; primary buttons at least 96 px.
- At most 3–4 choices per screen. Pictures and sound over text.
- No failure states: gentle hint, then reveal and celebrate. Never use red for mistakes.
- Feedback within 100 ms. Respect `prefers-reduced-motion`.
- No external links, ads, chat or user-generated content. Grown-up features sit behind the parent gate.

## Code conventions
- All UI text lives in `src/strings.ts`.
- No story content in components: content lives in `content/` and is validated by `src/content/schema.ts`.
- Themes: add one entry to `src/theme/themes.ts`. Text must meet WCAG AA (tests enforce it).
- Fonts and assets are self-hosted. No third-party network requests.
- Every music, sound, font and image asset gets an entry in `docs/ATTRIBUTIONS.md` and `licenses.json`.
- Keep components small; write tests for audio, key handling, quiz logic, the parent gate and content validation.

## Commits
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`, `style:`, `perf:`),
  imperative mood, subject at most 72 characters.
- Commit small working steps; update `CHANGELOG.md`.
- The pre-commit hook runs `npm run check:clean` and `npm run lint`.
- Work on `main`; tag finished phases (`phase-0`, `phase-1`, ...). Never force-push.
