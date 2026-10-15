# Authoring Guide: Adding Stories

You don't need to write code to add a story. Write a simple text file, run one command, and the story appears in the library.

## Quick start
```bash
npm run content:new-story -- the-busy-bee   # creates content/stories-src/the-busy-bee.md
# edit the file
npm run content:convert -- the-busy-bee     # makes content/stories/en/the-busy-bee.json
npm run content:validate                    # checks everything
npm run dev                                  # read it in the browser
```

## The story file
```markdown
---
id: the-busy-bee            (lowercase, dashes, must match the file name)
title: The Busy Bee
category: nature, animals   (first one decides the shelf)
ageBand: 3-5                (3-5, 5-7 or 3-7)
duration: short             (short ≤ 3 min, medium ≤ 6 min)
theme: sunny-meadow         (sunny-meadow, under-the-sea, starry-night, candy-land)
music: play-01              (built-in: lullaby, twinkle, frere, row, mary, play)
characters: pip, bumble
cover: meadow | flower 50 60 30 | bee 70 30 16 float
---

## Page
scene: meadow | flower 50 60 30 | bee 70 30 16 float | pip 25 64 36 happy
text: Buzz! A busy bee flew to a flower.
tap: bee "Buzz, buzz!" spin sparkle
tap: pip "Hello, bee!" bounce
sfx: onEnter chime
prompt: Ask: What colour is the flower?

> quiz picture-choice: Which one is the bee?
- bee *
- fish
- car
```

### Scene line
`backdrop | item x y size extra | ...`
- **backdrop:** meadow, night, sea, beach, forest, room, village, snow
- **item:** a prop id (see `src/art/props.tsx`) or a character (pip, bumble, luna, zig, coco)
- **x y:** centre position in percent (0–100). **size:** width in percent.
- **extra:** for props an animation (`float`), for characters an expression (`happy`, `thinking`, `celebrate`, `talking`, `sleepy`, `surprised`)

### Page lines
- `text:` 1–3 short sentences. Keep it big and simple.
- `tap: item "What it says" animation sound`: makes something in the scene tappable. Animations: wiggle, bounce, spin, float, grow. Sounds: chime, pop, whoosh, boing, sparkle, boop, tada, click, twinkle, splash, drum, bell.
- `sfx: onEnter sound` plays when the page opens (`onWord:3` plays on the fourth word).
- `prompt:` a hint shown only in "Grown-up reads" mode.

### Quizzes (put between pages, max 4 options, mark the right one with `*`)
| Type | Header | Options |
|---|---|---|
| Picture choice | `> quiz picture-choice: Which one is the cat?` | `- cat *` |
| Sound choice | `> quiz sound-choice: Which animal says moo? \| Moo!` | `- cow *` (the sound is spoken, or a built-in sound name like `drum`) |
| Count it | `> quiz count: How many stars? \| star 3 \| 2 3 4` | none |
| Colour/shape match | `> quiz match: Find the same colour. \| circle #e8553f red` | `- circle #e8553f red *` |
| What happens next | `> quiz sequence: What comes next? \| egg, leaf` | `- flower *` |
| Drag and drop | `> quiz drag-drop: Put the mango in the basket. \| mango` | `- basket *` |
| Feelings | `> quiz feelings: How does Pip feel? \| pip` | `- happy *` (happy, sad, sleepy, surprised, scared, angry) |

Quizzes never fail a child: a miss gives a hint, a second miss shows the answer, and every quiz ends with a celebration and a star.

## Rules every story must follow
- At least 8 story pages (8–20 is the target).
- Original stories, or public-domain tales retold in your own simple words. Never copy books, characters or songs.
- Check the story against `docs/CONTENT_GUIDELINES.md`.

## Writing JSON directly
You can also write `content/stories/en/<id>.json` by hand. The schema is in `src/content/schema.ts`, and `npm run content:validate` tells you exactly what's wrong. A broken file is rejected by validation, and a broken story never crashes the site: it simply doesn't load.

## After adding stories
- `npm run content:manifest` rebuilds the library index (this also runs automatically before `dev` and `build`).
- `npm run audio:generate -- --only <id>` creates narration once a voice is chosen (see `docs/AUDIO_GUIDE.md`).

## Reaching 100+ stories
Pick ideas from `content/STORY_BACKLOG.md`, write 5–10 at a time with the template above, validate, read each one aloud once, and tick it off in the backlog.
