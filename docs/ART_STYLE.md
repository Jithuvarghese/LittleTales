# Art Style Guide

All LittleTales art is flat, picture-book style vector illustration written as SVG code in `src/art/`. Follow these rules for every new piece so 100+ stories look like one world.

## The look
- **Outlines:** thick and rounded, always the warm dark brown `#4a2f27`. Props use stroke width 4 on a 100×100 grid; characters use 6 on a 200×200 grid; backdrops use 1.2 on a 160×100 grid. Always `stroke-linejoin: round` and `stroke-linecap: round`.
- **Fills:** flat colour, with at most one soft shade tone (for example a lighter belly or a darker wing). No gradients, no textures, no shadows inside shapes.
- **Shapes:** simple geometry: circles, ellipses, rounded rectangles, soft curves. No sharp spikes or thin details that vanish on a phone.
- **Faces:** big friendly eyes (solid dark circles with a small white highlight), small nose, simple curved mouth. Never scary, never angry-looking by default.
- **Proportions:** characters have big heads (about half their height) and short bodies. Keep each character's proportions the same in every scene.

## Palette
- Warm, saturated, never neon. Shared colours: sky `#bfe6ff`, grass `#6cbf4b` / `#8fd18a`, sun `#ffcb47`, coral `#ff8a6b`, sky blue `#6bc1ff`, lilac `#c9a0ff`, pink `#ff9fc4`, cream `#fff4e3`.
- Night scenes use deep indigo `#1d1b3a` with soft yellow stars `#f7e27a`.
- Red (`#e8553f`) is used for objects (apples, roofs) but **never** to signal a wrong answer.

## Characters
| Character | Role | Main colours | Groups |
|---|---|---|---|
| Pip the fox cub | Main host | orange `#f08a3c`, cream | tail, body, head, ear-left, ear-right, eyes, nose, mouth |
| Bumble the bear | Counting and numbers | brown `#b07a4f`, tan | body, ear-left, ear-right, head, nose, eyes, mouth |
| Luna the owl | Bedtime, calm | lilac `#8f7ad6` | body, wing-left, wing-right, beak, eyes, mouth |
| Zig the robot | Letters and typing | light blue `#a9dcf2`, coral details | antenna, body, head, ear-left, ear-right, eyes, mouth |
| Coco the parrot | Rhymes and songs | green body, red head, yellow wing | tail, body, wing-left, crest, head, beak, eyes, mouth |

Expressions: `idle`, `happy`, `thinking`, `celebrate`, `talking`, `sleepy`, `surprised`. They are made by swapping the eyes and mouth groups. Motion (blink, bounce, tilt, tail wag, talking mouth) is done with Framer Motion on the named groups, and is turned off when the device asks for reduced motion.

## Building scenes
Scenes are composed from data: a backdrop (`meadow`, `night`, `sea`, `beach`, `forest`, `room`, `village`, `snow`) plus props and characters placed by percentage (`x`, `y`, `size`). Keep the main character at roughly 30–45% size, props at 10–30%. Leave space for tap targets: anything tappable should be at least 72 px on a tablet.

## Adding a prop
1. Add an entry to `src/art/props.tsx` with `id`, `name`, the first `letter`, and the drawing on the 100×100 grid.
2. Use `fill="currentColor"` only for shapes that quizzes recolour (circle, square, triangle).
3. Run `npm run content:validate`. It checks that every prop used in content exists.

## Replacing art later
An illustrator's files can replace any piece: export as SVG on the same grid, keep the group ids for characters, and swap the drawing in the matching component. No content changes are needed.
