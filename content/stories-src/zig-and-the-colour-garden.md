---
id: zig-and-the-colour-garden
title: Zig and the Colour Garden
category: learning, nature
ageBand: 3-5
duration: short
theme: candy-land
music: play-01
characters: zig
cover: meadow | flower 30 70 22 | flower 70 72 22 | zig 50 55 40 happy
---

## Page
scene: meadow | zig 50 60 42 idle
text: Zig the little robot found a garden.
tap: zig "Beep boop!" bounce click

## Page
scene: meadow | flower 35 68 26 | zig 70 60 36 happy
text: A pink flower nodded hello.
tap: flower "Pink!" wiggle sparkle

## Page
scene: meadow | apple 40 64 20 | zig 72 60 36 thinking
text: A red apple sat on the grass.
tap: apple "Red!" bounce pop
prompt: Ask: What else is red?

## Page
scene: meadow | leaf 40 64 22 | zig 72 60 36 happy
text: A green leaf danced in the wind.
tap: leaf "Green!" spin whoosh

> quiz match: Find the same colour. | circle #e8553f red
- circle #e8553f red *
- circle #5ab6e8 blue
- circle #f7d443 yellow

## Page
scene: meadow | sun 75 22 24 | zig 40 60 38 happy
text: The yellow sun shone bright.
tap: sun "Yellow and warm!" grow

## Page
scene: meadow | butterfly 55 40 24 float | zig 30 62 36 happy
text: A purple butterfly flew round and round.
tap: butterfly "Purple!" spin sparkle

## Page
scene: meadow | rainbow 50 40 60 | zig 50 68 34 celebrate
text: Then all the colours made a rainbow!
sfx: onEnter sparkle
tap: rainbow "Red, yellow, blue!" grow chime

> quiz sequence: What comes next? | egg, butterfly
- flower *
- car
- moon

## Page
scene: meadow | rainbow 50 40 60 | flower 20 76 16 | flower 80 76 16 | zig 50 68 34 happy
text: "Beep boop," said Zig. "I love colours!"
prompt: Ask: What is your favourite colour?
