---
id: the-big-blue-sea
title: The Big Blue Sea
category: adventures, animals
ageBand: 3-5
duration: short
theme: under-the-sea
music: row-01
characters: pip
cover: sea | fish 36 50 18 float | whale 68 60 30 | turtle 20 76 16 happy
---

## Page
scene: beach | boat 50 58 28 | pip 50 44 18 wave
text: Pip sailed a little boat out to sea.
camera: pan-right
tap: boat "Sail away!" wiggle whoosh
tap: pip "Ahoy!" bounce

## Page
scene: sea | fish 40 52 20 float | pip 82 16 14 happy
text: Blub, blub! Down below swam a happy orange fish.
camera: zoom-in
tap: fish "Blub, blub!" wiggle splash

## Page
scene: sea | octopus 50 56 30 wiggle | pip 82 16 14 wave
text: An octopus waved all eight arms. Wiggle, wiggle! Can you wave?
tap: octopus "Hello, hello, hello!" spin
prompt: Wave your arms like an octopus!

> quiz picture-choice: Which one is the octopus?
- octopus *
- fish
- turtle

## Page
scene: sea | turtle 46 64 24 walk | pip 82 16 14 happy
text: A slow turtle swam by. "Take your time," she said.
speaker: turtle
camera: pan-left
tap: turtle "Slow and steady." bounce

## Page
scene: sea | shell 30 84 12 twinkle | shell 50 86 12 twinkle | shell 70 84 12 twinkle | pip 82 16 14 surprised
text: Shiny shells sparkled on the sandy floor.
sfx: onEnter sparkle
tap: shell "Sparkle!" twinkle sparkle

> quiz count: How many shells are there? | shell 3 | 1 3 4

## Page
scene: sea | whale 48 56 46 | pip 84 16 14 surprised
text: Then... a giant whale swam up. Whoosh!
delivery: surprised
camera: zoom-in
sfx: onEnter whoosh
tap: whale "Hello, little fox!" grow splash

## Page
scene: sea | whale 48 56 46 | pip 84 16 14 happy
text: The whale was big, but gentle and kind.
camera: zoom-out
prompt: Ask: What is the biggest animal you know?

> quiz drag-drop: Put the fish next to the shell. | fish
- shell *
- house
- car

## Page
scene: beach | boat 50 58 28 | pip 50 44 18 wave
text: Pip waved goodbye and sailed back home.
camera: pan-left
tap: boat "Home we go!" wiggle

## Page
scene: bedroom | shell 66 66 14 twinkle | pip 36 62 26 talk
text: "The sea is full of friends," smiled Pip.
speaker: pip
camera: zoom-out
sfx: onEnter chime
