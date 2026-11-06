---
name: Otaku Oracle field atlas
description: A continuous route from curiosity to a source
colors:
  paper: "#f4f0e4"
  sheet: "#fffdf5"
  ink: "#252b25"
  muted: "#626958"
  vermilion: "#ac3929"
  forest: "#34553e"
  sage: "#dce6bc"
  line: "#c9cbbb"
  dark-paper: "#1c2420"
  dark-sheet: "#263029"
  dark-ink: "#f2efdf"
  dark-muted: "#b8c1ad"
  dark-vermilion: "#f08b72"
  dark-forest: "#d7e4b3"
typography:
  display:
    fontFamily: "Journal, Georgia, serif"
    fontSize: "clamp(74px, 6.5vw, 110px)"
    fontWeight: 400
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Field, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  paper: "4px"
  control: "5px"
spacing:
  small: "8px"
  medium: "20px"
  large: "40px"
components:
  primary-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
---

## Overview

An illustrated field atlas: editorial paper, a travelling source trail and an original leaf-hooded guide. The first stop is a working question desk; the next two reveal the claim language and return to the source. The character, logo, scenery and wording are original. Reference influence is documented in docs/JOURNEY_DESIGN.md; no reference assets or code are shipped.

## Colors

The light ink/paper pair measures 12.70:1; muted/paper 5.01:1; vermilion/paper 5.47:1; verified forest/sheet 8.20:1. Dark ink/paper is 13.75:1; muted/paper 8.52:1; vermilion/paper 6.53:1; verified forest/sheet 10.17:1. These are calculated sRGB ratios for text pairs, not a claim about decorative illustration colors. States also have labels and icons: closed check, crossed contradiction and dashed unchecked notation.

## Typography

Journal is the self-hosted Instrument Serif face, normal and italic; Field is self-hosted DM Sans, regular and semibold. The display voice preserves the owner-selected field-journal identity. Desktop display scales with the viewport; phone display is 64px. Reading copy is 13-15px, controls 11-14px and secondary annotations 9-12px. Narrow annotations are a known refinement opportunity, not a universal prescription. Font licenses are retained in public/fonts.

## Layout

Three connected desktop scenes occupy a sticky stage across three viewport heights. The foreground moves horizontally; scenery planes travel at different speeds and rise slightly. The traveller follows the actual source-path geometry. Portrait uses a continuous sticky landscape behind a vertically readable foreground, preserving native input and scroll behavior. At 390px the question desk remains usable without sideways page scroll. Reading pages use a 1260px maximum, answers 1160px; answer source notes become a single column on phones.

## Elevation & Depth

Near and far landscape planes carry camera depth. Journal sheets use soft offset shadows rather than thick panels. Reading content is above the traveller; occlusion puts it behind the paper instead of over links. On reading/answer pages it has an assigned resting place. Its movement uses transforms and reserves no layout space.

## Shapes

The new identity is a six-sided eye/compass. The original traveller has a leaf hood, dark face, pale eyes, a vermilion scarf and a satchel. Sheets have small corners; check seals are round; unchecked borders are dashed. The illustration is deliberately flat vector work, not a borrowed three-dimensional asset.

## Components

The title combobox supports arrows, Enter and Escape; labels match accessible names. Question input remains freeform with a 200-character limit. Verified claims have green source-linked seals; conflicts strike through the disputed sentence and show AniList's value; unchecked prose never receives a verified treatment. The answer service is behind the existing adapter. Demo mode is visible and abstains on questions outside its record fields. Loading reports real source retrieval and a pending answer; checks appear only when the response arrives. Cancellation keeps the question.

Motion uses native scroll, CSS and small frame callbacks, with no animation dependency. Routine control feedback is 150-300ms, page arrival 500ms and seals 600ms. Walking only runs while scrolling; input, loading, success and error select curious/thinking/happy/puzzled poses. Reduced motion and the visible pause control stop spatial animation and walking, yielding readable static scenes. System reduced motion cannot accidentally be overridden by the play control.

## Do's and Don'ts

Keep record links and all three statuses explicit. Preserve the original question on errors. Read evaluation status and scores at runtime; label samples as not results. Never promote commentary to verified, substitute a canned answer, use fake progress stages, obscure controls with the traveller, or claim that a record match makes the source infallible. AniList is the reference, not the truth.
