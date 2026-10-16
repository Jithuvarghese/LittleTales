---
id: pip-and-the-moon
title: Pip and the Moon
category: bedtime, animals
ageBand: 3-5
duration: short
theme: starry-night
music: lullaby-01
characters: pip, luna
cover: night | moon 75 25 26 float | pip 40 65 45 happy
---

## Page
scene: night | moon 75 25 26 float | pip 35 66 42 idle
text: Look! Pip looked up... at the big, round moon.
tap: moon "Hello, moon!" wiggle twinkle
tap: pip "I am Pip!" bounce
sfx: onEnter twinkle
prompt: Ask: Can you see the moon tonight?

## Page
scene: night | moon 75 25 26 float | pip 35 66 42 thinking
text: "Moon, are you sleepy too?" asked Pip.
tap: moon "Not yet!" wiggle
prompt: Ask: Are you sleepy?

## Page
scene: night | moon 75 25 26 | tree 15 60 34 | luna 18 40 26 happy | pip 50 68 38 happy
text: Hoo, hoo! Luna the owl flew down from the tree.
tap: luna "Hoo, hoo!" bounce
tap: tree "Rustle, rustle." wiggle

> quiz picture-choice: What is Pip looking at?
- moon *
- sun
- ball

## Page
scene: night | moon 75 25 26 | star 30 18 10 float | star 50 12 8 float | luna 25 55 30 talking | pip 60 68 38 idle
text: "The moon stays up to light the sky," said Luna.
tap: star "Twinkle!" spin twinkle

## Page
scene: night | moon 75 25 26 | star 20 15 9 float | star 45 22 9 float | star 60 10 9 float | pip 45 66 42 happy
text: "And the stars keep it company. Twinkle, twinkle!"
speaker: luna
sfx: onEnter sparkle
tap: pip "So many stars!" bounce

## Page
scene: night | moon 75 25 26 | cloud 40 22 26 float | pip 45 68 40 thinking
text: A soft cloud floated by... puff, puff. Can you see it?
tap: cloud "Puff, puff." grow whoosh

## Page
scene: night | moon 75 25 26 | pip 40 68 42 happy | luna 70 60 28 happy
text: Pip waved. "Good night, moon. Good night, stars."
tap: pip "Good night!" wiggle

> quiz feelings: How does Pip feel now? | pip
- sleepy *
- angry
- scared

## Page
scene: room | bed 50 70 50 | lamp 85 55 22 | pip 50 58 34 idle
text: Pip curled up in a cosy bed... snug as a bug.
delivery: sleepy
tap: lamp "Click!" grow click

## Page
scene: night | moon 75 25 26 float | pip 40 68 40 happy
text: Shh... the moon smiled, and shone, all night long.
delivery: whisper
sfx: onEnter chime
prompt: Say good night to the moon together.
