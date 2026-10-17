---
id: zig-and-the-colour-garden
title: Zig and the Colour Garden
category: learning, nature
ageBand: 3-5
duration: short
theme: candy-land
music: play-01
characters: zig
cover: meadow-day | flower 26 72 18 sway | flower 74 74 18 sway | zig 50 60 28 happy
---

## Page
scene: meadow-day | zig 46 62 28 walk
text: Beep, boop! Zig the little robot found a garden.
camera: pan-right
cue: 4 zig wave
tap: zig "Beep boop!" bounce click

## Page
scene: meadow-day | flower 34 70 22 sway | zig 70 62 26 happy left
text: A pink flower nodded hello.
effects: petals
tap: flower "Pink!" wiggle sparkle
tap: zig "Hello, flower!" bounce

## Page
scene: meadow-day | apple 38 72 16 bounce | zig 70 62 26 think left
text: A red apple sat on the grass. What else is red?
cue: 6 zig happy
tap: apple "Red!" bounce pop
prompt: Ask: What else is red?

## Page
scene: forest | leaf 40 60 16 sway | zig 70 62 26 dance left
text: A green leaf danced in the wind.
effects: leaves
tap: leaf "Green!" spin whoosh

> quiz match: Find the same colour. | circle #e8553f red
- circle #e8553f red *
- circle #5ab6e8 blue
- circle #f7d443 yellow

## Page
scene: meadow-day | zig 40 62 28 happy
text: The yellow sun shone bright.
effects: sunrays
camera: zoom-out
tap: zig "So warm!" bounce

## Page
scene: meadow-day | butterfly 56 36 18 float | zig 30 62 26 surprised
text: A purple butterfly flew round and round.
cue: 3 zig happy
tap: butterfly "Purple!" spin sparkle

## Page
scene: meadow-day | rainbow 50 38 56 | zig 50 66 26 surprised
text: And then... all the colours made a rainbow!
delivery: surprised
effects: sunrays
cue: 4 zig cheer
sfx: onEnter sparkle
tap: rainbow "Red, yellow, blue!" grow chime

> quiz sequence: What comes next? | egg, butterfly
- flower *
- car
- moon

## Page
scene: meadow-sunset | rainbow 50 38 56 | flower 18 78 14 sway | flower 82 78 14 sway | zig 50 66 26 talk
text: "Beep boop," said Zig. "I love colours! Do you?"
speaker: zig
effects: petals
camera: zoom-out
prompt: Ask: What is your favourite colour?
