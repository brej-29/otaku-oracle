# Design competition: Claude entry vs Codex entry

Reviewer: the lead (Claude). Single reviewer, scores are judgments from screenshots at 390/768/1440 and each entry's own report. Codex's Lighthouse numbers are self-reported and not re-run here. Motion was judged from the code and descriptions for Codex (no video).

| Criterion | Claude: manga proof sheet | Codex: field journal |
|---|---|---|
| Distinctive identity | 5. Pencil, ink and hanko seal are real manga objects and carry meaning | 3. Cream ground, serif display, terracotta accent, small caps labels, italic accent words: the common default look |
| Meaning built into the UI | 5. Stamped, pencil and struck states are the product's promise made visible | 3.5. Verified and unverified are small chips |
| Imagery and richness | 2.5. No artwork on the home page | 4.5. Real covers in a collage, starter-title row |
| Flow and features | 3.5 | 4.5. Result page, copy, share, starter titles |
| Motion | 4.5. One orchestrated moment: the seal lands on the hero; answers ink and stamp in turn | Not verified |
| Polish | 4 | 4.5 |
| Performance, a11y (mobile Lighthouse) | 96 / 100 / 100 / 100, 120 KB gzip JS (measured here) | 94-98 / 100 / 100 / 100, 70 KB gzip JS (self-reported) |
| Defects seen | Dead space in short answers (fixed), seal covered text on phone (fixed) | Skip link visible over the answer area on desktop and phone |

Decision: build on the Claude entry. Port from the Codex entry: real cover art on the home page, a starter-titles row, copy and share on answers. Reduce JS where cheap.
Limits: one reviewer, no user testing. The user has the final say.
