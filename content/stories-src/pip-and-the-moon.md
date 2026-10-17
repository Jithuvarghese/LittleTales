---
id: pip-and-the-moon
title: Pip and the Moon
category: bedtime, animals
ageBand: 3-5
duration: short
theme: starry-night
music: lullaby-01
characters: pip, luna
cover: night-sky | moon 76 24 24 float | pip 42 62 30 happy
---

## Page
scene: night-sky | moon 76 24 24 float | pip 34 64 30 idle
text: Look! Pip looked up... at the big, round moon.
effects: fireflies
camera: zoom-in
cue: 0 pip surprised
cue: 3 pip happy
tap: moon "Hello, moon!" twinkle twinkle
tap: pip "I am Pip!" bounce
sfx: onEnter twinkle
prompt: Ask: Can you see the moon tonight?

## Page
scene: night-sky | moon 76 24 24 float | pip 34 64 30 talk
text: "Moon, are you sleepy too?" asked Pip.
speaker: pip
effects: fireflies
camera: pan-right
tap: moon "Not yet!" wiggle
prompt: Ask: Are you sleepy?

## Page
scene: forest-night | luna 22 42 22 wave | pip 60 64 28 idle left
text: Hoo, hoo! Luna the owl flew down from the tree.
effects: fireflies
camera: zoom-in
cue: 0 luna happy
cue: 2 pip surprised
tap: luna "Hoo, hoo!" bounce
prompt: Ask: Where do owls live?

> quiz picture-choice: What is Pip looking at?
- moon *
- sun
- ball

## Page
scene: night-sky | moon 76 24 24 | star 30 18 8 twinkle | star 50 12 7 twinkle | luna 28 60 26 talk | pip 66 64 26 think left
text: "The moon stays up to light the sky," said Luna.
speaker: luna
camera: pan-left
tap: star "Twinkle!" twinkle twinkle

## Page
scene: night-sky | moon 76 24 24 | star 20 15 8 twinkle | star 44 22 8 twinkle | star 60 10 8 twinkle | luna 72 62 22 talk left | pip 36 64 28 happy
text: "And the stars keep it company. Twinkle, twinkle!"
speaker: luna
effects: stars
cue: 6 pip cheer
sfx: onEnter sparkle
tap: pip "So many stars!" bounce

## Page
scene: night-sky | moon 76 24 24 | cloud 40 22 24 float | pip 44 64 30 think
text: A soft cloud floated by... puff, puff. Can you see it?
effects: fireflies
camera: pan-right
tap: cloud "Puff, puff." grow whoosh

## Page
scene: night-sky | moon 76 24 24 | pip 36 64 28 wave | luna 70 62 24 sleepy left
text: Pip waved. "Good night, moon. Good night, stars."
speaker: pip
effects: fireflies
tap: pip "Good night!" wiggle
tap: luna "Hoo... night night." bounce

> quiz feelings: How does Pip feel now? | pip
- sleepy *
- angry
- scared

## Page
scene: bedroom | bed 50 76 48 | lamp 86 58 18 | pip 50 60 24 sleepy
text: Pip curled up in a cosy bed... snug as a bug.
delivery: sleepy
camera: zoom-in
tap: lamp "Click!" grow click

## Page
scene: night-sky | moon 74 26 26 float | pip 40 66 28 sleep
text: Shh... the moon smiled, and shone, all night long.
delivery: whisper
effects: fireflies
camera: zoom-out
sfx: onEnter chime
prompt: Say good night to the moon together.
