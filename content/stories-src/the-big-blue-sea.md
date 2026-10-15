---
id: the-big-blue-sea
title: The Big Blue Sea
category: adventures, animals
ageBand: 3-5
duration: short
theme: under-the-sea
music: row-01
characters: pip
cover: sea | fish 40 50 22 float | whale 70 60 34
---

## Page
scene: beach | boat 50 56 30 | pip 50 46 20 happy
text: Pip sailed a little boat out to sea.
tap: boat "Sail away!" wiggle whoosh

## Page
scene: sea | fish 40 50 24 float | pip 80 20 18 happy
text: Down below swam a happy orange fish.
tap: fish "Blub, blub!" wiggle splash

## Page
scene: sea | octopus 50 55 34 | pip 80 20 18 happy
text: An octopus waved all eight arms.
tap: octopus "Hello, hello, hello!" spin
prompt: Wave your arms like an octopus!

> quiz picture-choice: Which one is the octopus?
- octopus *
- fish
- turtle

## Page
scene: sea | turtle 50 62 30 | pip 80 20 18 happy
text: A slow turtle swam by. "Take your time," she said.
tap: turtle "Slow and steady." float

## Page
scene: sea | shell 30 82 14 | shell 50 84 14 | shell 70 82 14 | pip 80 20 18 happy
text: Shiny shells sparkled on the sandy floor.
sfx: onEnter sparkle

> quiz count: How many shells are there? | shell 3 | 1 3 4

## Page
scene: sea | whale 50 55 50 | pip 82 18 16 surprised
text: Then a giant whale swam up. Whoosh!
sfx: onEnter whoosh
tap: whale "Hello, little fox!" grow splash

## Page
scene: sea | whale 50 55 50 | pip 82 18 16 happy
text: The whale was big, but gentle and kind.
prompt: Ask: What is the biggest animal you know?

> quiz drag-drop: Put the fish next to the shell. | fish
- shell *
- house
- car

## Page
scene: beach | sun 80 20 18 | boat 50 56 30 | pip 50 46 20 happy
text: Pip waved goodbye and sailed back home.
tap: sun "Welcome back!" grow

## Page
scene: room | shell 50 60 20 | pip 30 62 32 happy
text: "The sea is full of friends," smiled Pip.
sfx: onEnter chime
