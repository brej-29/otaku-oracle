# Design system: manga proof sheet

Idea: manga is drafted in non-photo blue pencil (it does not scan), inked in black, and documents are verified with a hanko seal. Otaku Oracle uses those three real materials as its meaning system.

| Material | Means | Treatment |
|---|---|---|
| Ink, indigo black | Checked, stated as fact | solid text, thick panel borders |
| Blue pencil, dashed | Not checked | dashed rules, pencil blue text, "Not checked" tag |
| Red seal (確, "confirmed") | Matches the AniList record | 4 pixel rough-edge SVG stamp, springs in |

## Tokens (web/src/tokens.css)
| Token | Light | Dark | Contrast |
|---|---|---|---|
| paper | #f1f5f8 | #12162b | base |
| ink | #1a1f3a | #e9eef6 | 14.6:1 on paper |
| ink-soft | #444b6b | #b4bdd6 | 7.9:1 |
| pencil | #266190 | #7fb8e3 | 5.5:1 on paper, 4.9:1 on paper-2 |
| seal | #c0291f | #ff6b5c | 5.6:1 on paper |

Contrast values for the pairs I changed were confirmed by Lighthouse (accessibility 100). The other ratios are my calculations, not tool-verified.

## Type
Dela Gothic One for display (headlines, numerals), Zen Kaku Gothic New 400/500/700 for body. Fluid scale `--step--1` to `--step-4`. Body line length under 66 characters. The seal glyph is a 1.1 KB subset of Dela Gothic One (確認証).

## Layout
Uneven manga panels: 3 px ink borders, no radius, one gutter token. Hero is two staggered panels, the pipeline is four panels of different heights. Panel numbers appear only on the pipeline, the one real sequence.

## Motion language
- One orchestrated moment: a seal lands on the hero panel (spring, 0.9 s delay, rotates to -9 degrees).
- Answers: each sentence starts in pencil, inks to black and gets stamped, 0.62 s apart (spring, stiffness 520, damping 22).
- Chart bars grow once on scroll. Buttons press into their offset shadow.
- `prefers-reduced-motion`: every animation is skipped and the final state shows at once. Shimmer skeletons stop.

## Honesty rules in the UI
- Accuracy numbers load only from `public/data/eval-summary.json`. It currently says PENDING and shows no chart.
- `?sample` loads a labelled sample file so the chart can be reviewed. The sample is visibly tagged "Not results".
- The explanation line in an answer is a fixed placeholder, tagged "Demo answer", until a backend exists.

## References studied (conceptual, no assets copied)
Not yet recorded: see docs/UI_BRIEF.md. I have not opened reference sites in this pass, so no reference-based claims are made here.
