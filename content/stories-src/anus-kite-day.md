---
id: anus-kite-day
title: Anu's Kite Day
category: adventures, everyday
ageBand: 3-7
duration: short
theme: sunny-meadow
music: play-01
characters: pip, coco
cover: village | kite 60 25 24 float | pip 35 66 36 happy
---

## Page
scene: village | sun 80 18 18 | pip 40 66 38 happy
text: It was kite day in Anu's town, and Pip came too.
tap: pip "Kite day!" bounce
prompt: Kite festivals like Makar Sankranti are loved across India.

## Page
scene: room | kite 50 45 34 | pip 25 66 32 happy
text: Anu had a bright orange kite with a long tail.
tap: kite "Ready to fly!" wiggle

## Page
scene: village | kite 50 30 20 | pip 30 68 32 happy
text: Anu ran fast. Up, up, up went the kite! Whoosh!
sfx: onEnter whoosh
tap: kite "Up, up!" spin whoosh

## Page
scene: village | kite 25 22 14 float | kite 50 18 14 float | kite 75 25 14 float | pip 50 70 30 happy
text: The sky was full of kites. Let's count! One, two, three!
sfx: onEnter sparkle

> quiz count: How many kites are in the sky? | kite 3 | 2 3 4

## Page
scene: village | kite 60 20 18 float | coco 40 36 22 happy | pip 30 70 30 happy
text: Coco the parrot flew next to Anu's kite.
tap: coco "Race you, kite!" bounce

## Page
scene: village | kite 60 30 18 | tree 72 50 34 | pip 30 68 30 surprised
text: Oh! The kite string caught on a tree.
tap: tree "Oops!" wiggle

> quiz feelings: How does Pip feel? | pip
- surprised *
- sleepy
- happy

## Page
scene: village | kite 60 30 18 | tree 72 50 34 | coco 62 24 18 happy
text: Coco gently pulled the string free.
tap: coco "Got it!" bounce pop

## Page
scene: village | kite 55 20 22 float | pip 30 68 30 celebrate | coco 72 30 20 celebrate
text: The kite danced high again. Hooray! Hooray!
delivery: proud
sfx: onEnter tada

## Page
scene: village | sun 80 20 18 | kite 30 66 18 | pip 55 66 32 happy
text: "Thank you, Coco," said Anu. "Best kite day ever!"
prompt: Ask: What colour kite would you fly?
