# Art Inventory

An audit of every picture in the child area: what it was, and what it is now.

## Emoji audit (October 2026)
A search of all source, content and strings files for emoji and pictographic characters found **none in the child area**. Earlier releases had replaced the last ones (tick, skip, arrow and keyboard symbols) with drawn icons. Remaining symbols:

| Place | Character | Becomes |
|---|---|---|
| `src/features/studio/Studio.tsx` (development-only recording page) | record, stop, play, tick symbols | Drawn icons (studio is never in the published site) |
| `scripts/validate-content.ts` (developer console output) | cross mark | Plain text "x" |

## Characters
| Before | Now |
|---|---|
| Five separate mascot drawings with only blink and bounce, no arms | One shared rig (`src/art/cast/Character.tsx`) for the whole cast: same outline, glossy eyes with random blinks, rosy cheeks, ground shadow, arms and feet, 12 poses (idle, talk, happy, cheer, think, sleepy, sleep, sad-soft, surprised, wave, dance, walk), squash-and-stretch idle, mouth driven by the live voice |
| Story animals drawn as flat object icons (cow, duck, pig, cat, dog…) | 25 supporting characters on the same rig: cat, dog, cow, duck, rabbit, elephant, monkey, frog, lion, pig, sheep, mouse, panda, tiger, penguin, hen, squirrel, turtle, goat, bird, and people of varied looks (Anu, four children, grandma, grandpa) |

## Objects
| Before | Now |
|---|---|
| ~75 object icons | Same style, extended set in `src/art/props.tsx`; animals used as story actors are now characters, not icons |

## Scenery
| Before | Now |
|---|---|
| 8 static backdrops | Scene composer (`src/art/scene/`) with 12 animated backgrounds, ambient effect layers, slow camera drift, staggered entrances |
