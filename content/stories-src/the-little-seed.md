---
id: the-little-seed
title: The Little Seed
category: nature, learning
ageBand: 3-7
duration: short
theme: sunny-meadow
music: mary-01
characters: pip
cover: meadow-day | flower 58 62 26 sway | pip 28 64 26 happy
---

## Page
scene: meadow-day | pip 40 64 28 think
text: Look! Pip found a tiny, tiny seed in the grass.
camera: zoom-in
cue: 0 pip surprised
cue: 3 pip happy
tap: pip "A tiny seed!" bounce
prompt: Ask: What do you think will grow?

## Page
scene: meadow-day | pip 40 64 28 happy
text: Pip dug a little hole and planted it.
cue: 2 pip dance
sfx: onEnter pop

## Page
scene: rain | cloud 54 18 26 float | pip 30 64 26 happy
text: Pitter, patter, pitter, patter! The rain gave it a drink.
effects: rain
cue: 5 pip cheer
tap: cloud "Pitter, patter!" grow splash
sfx: onEnter splash

## Page
scene: meadow-day | pip 30 64 26 talk
text: The warm sun said, "Grow, little seed!"
speaker: pip
effects: sunrays
camera: pan-right
tap: pip "Grow, grow!" bounce

## Page
scene: meadow-day | leaf 56 76 12 sway | pip 30 64 26 surprised
text: Pop! A tiny green shoot peeked out.
cue: 1 pip cheer
tap: leaf "Hello, shoot!" wiggle pop

> quiz sequence: What happens next? | leaf
- flower *
- egg
- ball

## Page
scene: meadow-day | leaf 52 66 16 sway | leaf 62 62 14 sway | pip 26 64 26 happy
text: Day by day, it grew taller... and taller... and taller! Can you stretch up tall?
cue: 7 pip cheer
prompt: Stretch up tall like a growing plant!

## Page
scene: meadow-day | flower 58 58 32 sway | bee 78 30 14 float | pip 26 64 26 surprised
text: One morning... ta-da! A big pink flower opened up!
delivery: surprised
effects: petals
cue: 2 pip cheer
tap: flower "Ta-da!" grow sparkle
tap: bee "Buzz, buzz!" spin

> quiz drag-drop: Help the bee find the flower. | bee
- flower *
- car
- cup

## Page
scene: meadow-day | flower 58 58 32 sway | butterfly 78 30 16 float | bird 30 26 14 happy | pip 24 66 24 happy
text: Bees and butterflies came to visit.
effects: petals
tap: butterfly "Flutter!" spin

## Page
scene: meadow-sunset | flower 40 58 28 sway | flower 66 60 24 sway | pip 20 66 24 cheer
text: "From one tiny seed," said Pip, "a flower grew!"
speaker: pip
effects: sunrays
camera: zoom-out
sfx: onEnter chime
