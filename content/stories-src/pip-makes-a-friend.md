---
id: pip-makes-a-friend
title: Pip Makes a Friend
category: friendship, feelings
ageBand: 3-7
duration: short
theme: sunny-meadow
music: play-01
characters: pip, zig
cover: meadow | ball 50 75 14 | pip 30 62 36 happy | zig 70 60 36 happy
---

## Page
scene: meadow | ball 60 76 14 | pip 35 62 40 idle
text: Pip had a bright blue ball.
tap: ball "Bounce!" bounce boing

## Page
scene: meadow | ball 60 76 14 | pip 35 62 40 thinking
text: But playing ball alone was not much fun.
prompt: Ask: Is it more fun to play together?

> quiz feelings: How does Pip feel? | pip
- sad *
- happy
- angry

## Page
scene: meadow | tree 80 48 36 | zig 80 66 26 thinking | pip 30 62 38 thinking
text: Behind a tree, Pip saw a little robot.
tap: zig "Beep?" wiggle click

## Page
scene: meadow | zig 70 62 34 thinking | pip 30 62 38 talking
text: "Hello! I am Pip. Do you want to play?"
tap: pip "Let us play!" bounce

## Page
scene: meadow | zig 70 62 34 happy | pip 30 62 38 happy
text: "Beep boop! Yes, please! I am Zig."
tap: zig "Beep boop!" bounce

## Page
scene: meadow | ball 50 40 14 float | zig 75 62 32 happy | pip 25 62 34 happy
text: Pip threw the ball. Zig caught it!
sfx: onEnter boing
tap: ball "Wheee!" spin whoosh

> quiz picture-choice: What are Pip and Zig playing with?
- ball *
- kite
- book

## Page
scene: meadow | ball 50 76 14 | zig 72 60 32 celebrate | pip 28 60 34 celebrate
text: They played and laughed all afternoon.
sfx: onEnter tada

## Page
scene: meadow | sun 80 20 20 | zig 65 62 32 happy | pip 35 62 34 happy
text: "Will you play again tomorrow?" asked Zig.
prompt: Ask: Who is your friend?

## Page
scene: meadow | heart 50 30 16 float | zig 65 62 32 happy | pip 35 62 34 happy
text: "Yes!" said Pip. "Friends play together."
tap: heart "Friends!" grow sparkle
