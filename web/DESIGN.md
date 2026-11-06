---
name: Dusk cinema
colors:
  paper: "#f4f0e7"
  sheet: "#fffdf5"
  ink: "#26212b"
  muted: "#655b66"
  red: "#ae352e"
  dusk: "#282137"
  cream: "#fff0cf"
  gold: "#efc872"
typography:
  display:
    fontFamily: "Journal, Georgia, serif"
    fontWeight: 400
  body:
    fontFamily: "Field, Arial, sans-serif"
    fontWeight: 400
rounded:
  desk: 14
  button: 8
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
---

## Overview

An anime night festival in front of a warm editorial journal. Real covers identify the subject immediately. The original fox courier Nori connects the gallery, the question and the source. The night world remains alive before scrolling and becomes a complete still poster when motion is paused.

## Colors

Warm paper, near-black plum ink, vermilion and lantern gold. The moving world uses deep dusk, cream lettering and protected dark surfaces behind reading. Light and dark surface tokens live in src/tokens.css; the night scene retains its cinematic palette in both themes. Status is never colour alone: a tilted solid seal for verified, a crossed open square and visible correction for conflict, and a dashed open mark for unchecked.

## Typography

Instrument Serif, normal and italic, is self-hosted under the Journal alias. DM Sans 400 and 600 is self-hosted under Field. Original font licences remain beside the four files. Headlines use the serif and italic accent; controls use the sans. Main hero display reaches 96 px desktop and 76 px phone. Reading and answer headings are quieter, with long questions allowed to wrap at the full available width.

## Layout

An immediate cover-led opening, a horizontal desktop question desk, a real-title starter row, then a three-scene pinned native-scroll journey. Phone controls stack vertically; the journey still travels sideways and diagonally. No wheel/touch input is intercepted. Scene navigation can move the camera without scrolling by hand. With reduced motion the same scenes form a vertical static sequence.

## Elevation & Depth

Real image planes, offset soft shadows and a separate foreground gate create depth. The scene track travels 2 viewport widths and 40 px vertically; mountains, skyline, gate and moon move at different rates. Clouds drift over 28 seconds, lanterns swing over 5 seconds, and particles render at a capped cadence only while visible. The world is deliberately cel-shaded, not a simulated 3D environment.

## Shapes

Thick original ink contours for the character and scenery; rectangular paper covers and source notes; restrained rounding for working controls. The fox mark, favicon and wordmark belong to the same courier identity. Nori has eight authored leg-frame silhouettes, an animated coat and tail, pointer-aware eyes, blink/look behaviour and separate curious, thinking, happy and puzzled poses.

## Components

- Cover stacks use real AniList image URLs, keep their title captions and respond to the pointer with tilt.
- Primary actions have a small magnetic response and an arrow movement. Keyboard focus remains a visible outline.
- The waiting view combines the selected title with Nori and a moving source scene. Progress labels advance only on actual source/response events. A pending response never displays a completed verification.
- Verified seals land with a brief six-petal burst after the response arrives. Conflicts keep the original statement struck through and show what AniList says. Unchecked prose receives no verified seal.
- The Why page reads the existing evaluation file at runtime. Illustrative samples remain labelled not results.
- Pause and reduced motion disable all animation and transitions, including canvas updates, while retaining every control and claim.

## Do's and Don'ts

Keep anime art, human curiosity and the companion ahead of the checking mechanism. Keep the original source close. Do not replace an unsupported demo question with default facts, publish made-up accuracy, or make unchecked prose look verified. Do not add a motion framework to solve effects already handled by the current native animation. Do not hide errors behind decorative loading or use a timer to claim that checking has finished.

Known limits: the world has flatter depth than the strongest reference, some annotations are small, and external art availability depends on the source CDN. Hardware screen-reader, touch-device and native share-sheet verification remains outstanding.
