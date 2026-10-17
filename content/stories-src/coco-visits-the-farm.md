---
id: coco-visits-the-farm
title: Coco Visits the Farm
category: animals, everyday
ageBand: 3-5
duration: short
theme: sunny-meadow
music: frere-01
characters: coco
cover: farm | cow 34 66 26 happy | coco 68 40 22 happy
---

## Page
scene: farm | coco 30 40 24 dance
text: Flap, flap, flap! Coco the parrot flew to the farm.
camera: pan-right
cue: 4 coco happy
tap: coco "Squawk! Hello!" bounce

## Page
scene: farm | cow 60 64 30 idle left | coco 24 44 22 talk
text: "Hello, cow!" said Coco. The cow said... "Moooo!"
cue: 6 cow happy
tap: cow "Moo!" wiggle
prompt: Can you say moo like a cow?

## Page
scene: meadow-day | duck 46 68 22 walk | duck 70 72 18 walk | coco 18 40 20 happy
text: Two ducks waddled by. "Quack, quack!"
speaker: duck
camera: pan-left
tap: duck "Quack, quack!" bounce

> quiz sound-choice: Which animal says moo? | Moo!
- cow *
- duck
- cat

## Page
scene: farm | pig 50 68 26 dance | coco 20 40 20 happy
text: A pink pig rolled in the mud. "Oink!"
speaker: pig
tap: pig "Oink, oink!" wiggle splash

## Page
scene: farm | goat 58 66 26 talk left | coco 22 42 20 think
text: A little goat said, "Maa, maa!" Can you say maa?
speaker: goat
tap: goat "Maa!" bounce

## Page
scene: meadow-day | cat 38 68 22 talk | dog 66 68 24 happy left | coco 16 38 18 happy
text: The cat said, "Meow." The dog said, "Woof!"
cue: 4 dog talk
cue: 4 cat happy
tap: cat "Meow!" wiggle
tap: dog "Woof, woof!" bounce

> quiz picture-choice: Which one is the pig?
- pig *
- goat
- dog

## Page
scene: farm | hen 40 68 22 idle | nest 62 78 22 | egg 58 72 8 | egg 66 72 8 | coco 18 40 20 surprised
text: In the barn, Coco found eggs in a nest.
camera: zoom-in
cue: 4 coco happy
tap: hen "Cluck, cluck!" bounce
tap: nest "Shh, eggs are resting." grow

## Page
scene: farm | cow 20 68 20 dance | pig 42 70 18 dance | duck 62 72 16 dance | coco 82 44 18 cheer left
text: Moo! Quack! Oink! All the animals sang a farm song together.
delivery: silly
sfx: onEnter tada
tap: coco "Squawk, squawk!" spin

## Page
scene: meadow-sunset | coco 34 42 24 wave | cow 70 68 20 wave left
text: "Bye, farm friends!" Coco flew home, happy.
speaker: coco
effects: sunrays
camera: zoom-out
prompt: Ask: Which farm animal do you like best?
