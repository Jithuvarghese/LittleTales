---
id: the-little-seed
title: The Little Seed
category: nature, learning
ageBand: 3-7
duration: short
theme: sunny-meadow
music: mary-01
characters: pip
cover: meadow | flower 55 62 34 | pip 25 65 34 happy
---

## Page
scene: meadow | pip 40 64 40 thinking
text: Pip found a tiny seed in the grass.
tap: pip "A tiny seed!" bounce
prompt: Ask: What do you think will grow?

## Page
scene: meadow | pip 40 64 40 happy
text: Pip dug a little hole and planted it.
sfx: onEnter pop

## Page
scene: meadow | cloud 55 20 30 float | pip 30 64 36 happy
text: Pitter, patter! The rain gave it a drink.
tap: cloud "Pitter, patter!" grow splash
sfx: onEnter splash

## Page
scene: meadow | sun 75 20 24 | pip 30 64 36 happy
text: The warm sun said, "Grow, little seed!"
tap: sun "Grow, grow!" grow

## Page
scene: meadow | leaf 55 72 14 | pip 30 64 36 celebrate
text: Pop! A tiny green shoot peeked out.
tap: leaf "Hello, shoot!" wiggle pop

> quiz sequence: What happens next? | leaf
- flower *
- egg
- ball

## Page
scene: meadow | leaf 50 64 20 | leaf 60 60 18 | pip 25 64 34 happy
text: Day by day, it grew taller and taller.
prompt: Stretch up tall like a growing plant!

## Page
scene: meadow | flower 55 58 40 | bee 75 30 16 float | pip 25 64 34 celebrate
text: One morning, a big pink flower opened up!
tap: flower "Ta-da!" grow sparkle
tap: bee "Buzz, buzz!" spin

> quiz drag-drop: Help the bee find the flower. | bee
- flower *
- car
- cup

## Page
scene: meadow | flower 55 58 40 | butterfly 75 30 18 float | pip 25 64 34 happy
text: Bees and butterflies came to visit.
tap: butterfly "Flutter!" spin

## Page
scene: meadow | flower 40 58 34 | flower 65 60 30 | pip 20 66 30 happy
text: "From one tiny seed," said Pip, "a flower grew!"
sfx: onEnter chime
