---
id: pip-makes-a-friend
title: Pip Makes a Friend
category: friendship, feelings
ageBand: 3-7
duration: short
theme: sunny-meadow
music: play-01
characters: pip, zig
cover: meadow-day | ball 50 78 12 | pip 30 62 26 happy | zig 70 62 26 happy left
---

## Page
scene: meadow-day | ball 58 78 12 bounce | pip 34 62 28 happy
text: Bounce, bounce! Pip had a bright blue ball.
camera: zoom-in
tap: ball "Bounce!" bounce boing

## Page
scene: meadow-day | ball 60 80 12 | pip 36 62 28 sad-soft
text: But playing ball all alone... was not much fun.
delivery: sad
prompt: Ask: Is it more fun to play together?

> quiz feelings: How does Pip feel? | pip
- sad *
- happy
- angry

## Page
scene: forest | zig 80 66 20 think left | pip 30 62 26 surprised
text: Behind a tree, Pip saw a little robot.
camera: pan-right
tap: zig "Beep?" wiggle click

## Page
scene: meadow-day | zig 70 62 26 think left | pip 30 62 28 talk
text: "Hello! I am Pip. Do you want to play?"
speaker: pip
cue: 0 pip wave
tap: pip "Let us play!" bounce

## Page
scene: meadow-day | zig 70 62 26 talk left | pip 30 62 28 happy
text: "Beep boop! Yes, please! I am Zig."
speaker: zig
cue: 2 zig cheer
tap: zig "Beep boop!" bounce

## Page
scene: meadow-day | ball 50 36 12 float | zig 76 62 24 cheer left | pip 24 62 26 happy
text: Pip threw the ball... and Zig caught it! Wheee!
effects: petals
sfx: onEnter boing
tap: ball "Wheee!" spin whoosh

> quiz picture-choice: What are Pip and Zig playing with?
- ball *
- kite
- book

## Page
scene: meadow-day | ball 50 78 12 bounce | zig 72 62 24 dance left | pip 28 62 26 dance
text: Throw, catch, giggle! They played and laughed all afternoon.
delivery: excited
effects: petals
sfx: onEnter tada

## Page
scene: meadow-sunset | zig 66 62 24 talk left | pip 34 62 26 happy
text: "Will you play again tomorrow?" asked Zig.
speaker: zig
effects: sunrays
prompt: Ask: Who is your friend?

## Page
scene: meadow-sunset | heart 50 26 14 float | zig 66 62 24 cheer left | pip 34 62 26 cheer
text: "Yes!" said Pip. "Friends play together."
speaker: pip
effects: sunrays
camera: zoom-out
tap: heart "Friends!" grow sparkle
