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
  conversation: "#58436e"
  conversationDark: "#d5b9ee"
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
  conversation: 12
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.button}"
---

## Overview

An anime night festival in front of a warm editorial journal. Real covers identify the subject immediately. A samurai wanderer connects the gallery, the question and the source. The night world remains alive before scrolling and becomes a complete still poster when motion is paused.

## Colors

Warm paper, near-black plum ink, vermilion and lantern gold. The moving world uses deep dusk, cream lettering and protected dark surfaces behind reading. Light and dark surface tokens live in src/tokens.css; the night scene retains its cinematic palette in both themes. Status is never colour alone: a tilted solid seal for verified, a crossed open square and visible correction for conflict, and a dashed open mark for unchecked.

## Typography

Instrument Serif, normal and italic, is self-hosted under the Journal alias. DM Sans 400 and 600 is self-hosted under Field. Original font licences remain beside the four files. Headlines use the serif and italic accent; controls use the sans. Main hero display reaches 96 px desktop and 76 px phone. Reading and answer headings are quieter, with long questions allowed to wrap at the full available width.

## Layout

An immediate cover-led opening, a horizontal desktop question desk, a real-title starter row, then a three-scene pinned native-scroll journey. Phone controls stack vertically; the journey still travels sideways and diagonally. No wheel/touch input is intercepted. Scene navigation can move the camera without scrolling by hand. With reduced motion the same scenes form a vertical static sequence.

## Elevation & Depth

Real image planes, offset soft shadows and a separate foreground gate create depth. The scene track travels 2 viewport widths and 40 px vertically; mountains, skyline, gate and moon move at different rates. Clouds drift over 28 seconds, lanterns swing over 5 seconds, and particles render at a capped cadence only while visible. The world is deliberately cel-shaded, not a simulated 3D environment.

## Shapes

Thick original ink contours for the character and scenery; rectangular paper covers and source notes; restrained rounding for working controls. The topknot-and-blade seal, favicon and refined serif wordmark belong to the wanderer identity. The owner-supplied 20-frame atlas has a distance-driven walk and distinct idle, look, think, gesture and sword-flourish poses. A neutral samurai silhouette is the only fallback. The landing hero has a quiet 26-second idle-action cycle, pointer-aware facing and subtle breathing, suspended offscreen or in hidden tabs. Other screens react only to real product states. A validated sprite pack can replace the atlas; see docs/MASCOT_ASSET_SPEC.md.

## Components

- The three-card stack retains its original positions. A shuffled deck cycles through popular and trending AniList titles without simultaneous duplicates; source notes derive from the same front-title object. One six-hour cached metadata request and 32 real bundled records avoid per-card requests. Hover/focus pauses, leaving resumes, and reduced motion keeps one still set. The continuous dusk world reaches behind the type through an atmospheric veil.
- Primary actions have a small magnetic response and an arrow movement. Keyboard focus remains a visible outline.
- The waiting view combines the selected title with the wanderer and a moving source scene. Progress labels advance only on actual source/response events. A pending response never displays a completed verification.
- Verified seals land with a brief six-petal burst after the response arrives. Conflicts keep the original statement struck through and show what AniList says. Unchecked prose receives no verified seal.
- The Why page reads the existing evaluation file at runtime. Illustrative samples remain labelled not results.
- Pause and reduced motion disable all animation and transitions, including canvas updates, while retaining every control and claim.

## Do's and Don'ts

Keep anime art, human curiosity and the companion ahead of the checking mechanism. Keep the original source close. Do not replace an unsupported demo question with default facts, publish made-up accuracy, or make unchecked prose look verified. Do not add a motion framework to solve effects already handled by the current native animation. Do not hide errors behind decorative loading or use a timer to claim that checking has finished.

Known limits: the world has flatter depth than the strongest reference, some annotations are small, and external art availability depends on the source CDN. Hardware screen-reader, touch-device and native share-sheet verification remains outstanding.


## Source extension

Source agreement uses linked evidence chips and a calm stamp; disagreement shows each source value on equal paper planes. Insufficient or stale evidence stays unchecked. News, opinion and unclear questions receive a violet conversation shelf, never a verified stamp. Source availability is expandable and explicit. The evaluation chart still measures AniList grounding only; the source extension is unmeasured.
