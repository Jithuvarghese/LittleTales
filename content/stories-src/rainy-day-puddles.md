---
id: rainy-day-puddles
title: Rainy Day Puddles
category: everyday, nature
ageBand: 3-5
duration: short
theme: under-the-sea
music: row-01
characters: bumble, coco
cover: village | cloud 40 18 30 | umbrella 60 55 30 | bumble 40 66 36 happy
---

## Page
scene: village | cloud 40 18 30 float | cloud 72 22 26 float | bumble 50 66 40 thinking
text: Drip, drop! It was raining in the village.
sfx: onEnter splash
tap: cloud "Drip, drop!" grow splash

## Page
scene: room | umbrella 70 55 30 | bumble 35 62 40 happy
text: Bumble found a big purple umbrella.
tap: umbrella "Pop it open!" grow pop

## Page
scene: village | umbrella 50 44 30 | bumble 50 66 36 happy
text: Out he went, splish, splash, splosh!
sfx: onEnter splash

> quiz sound-choice: Which sound does a drum make? | drum
- drum *
- bell
- duck

## Page
scene: village | coco 30 36 26 happy | bumble 60 66 36 happy
text: Coco the parrot hid under the umbrella too.
tap: coco "Thank you, Bumble!" bounce

## Page
scene: village | sock 35 72 16 | bumble 60 64 36 surprised
text: Oh no! Bumble's sock got all wet.
tap: sock "Squelch!" wiggle splash
prompt: Ask: What do you wear when it rains?

## Page
scene: village | cloud 50 20 28 | coco 30 40 24 happy | bumble 60 66 36 happy
text: Coco laughed. "Puddles are fun!"

> quiz match: Find the same shape. | triangle #9b6bd6 triangle
- square #9b6bd6 square
- triangle #9b6bd6 triangle *
- circle #9b6bd6 circle

## Page
scene: village | rainbow 50 30 60 | coco 30 50 22 celebrate | bumble 65 66 34 celebrate
text: Then the rain stopped and a rainbow came out!
sfx: onEnter sparkle
tap: rainbow "A rainbow!" grow chime

## Page
scene: room | cup 50 64 22 | bumble 25 62 34 happy | coco 78 50 24 happy
text: Back home, they had warm milk.
tap: cup "Warm and yummy." bounce

## Page
scene: room | bed 50 70 50 | bumble 50 58 32 happy
text: Rainy days can be happy days too.
prompt: Ask: What do you like to do on a rainy day?
