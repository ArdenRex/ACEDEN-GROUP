# Step 2.3 — Layout Tokens (tokens.css + tailwind.config.ts only)

## Changed existing tokens
| Token | Old | New | Why |
|---|---|---|---|
| --radius-sm / md / lg | 2 / 4 / 8px | 6 / 12 / 16px | Reference uses soft 12-16px cards |
| --space-section (+mobile) | 8rem / (smaller) | 6rem / 3.5rem | Reference sections are compact (60-90px) |
| --space-chapter (+mobile) | 12rem / (smaller) | 8rem / 5rem | Same; affects only the static (non-pinned) fallback layouts and footer |

## New tokens (all also mapped in Tailwind)
--width-content 80rem (1280px reference content width) · --header-height 4.5rem (applied in Step 3.1) · --radius-input 10px · --radius-card 16px · --radius-pill 9999px · --button-height-md 2.75rem / -lg 3.125rem · --button-padding-x 1.5rem · --gap-card 1rem · --gap-grid 1.5rem · --card-padding 1.5rem · --section-fade-height 8rem · --ridge-glow-height 14rem.
Tailwind: rounded-input/card/pill, max-w-content, h-/min-h-btn-md|btn-lg, gap/p-gap-card|gap-grid|card-pad.
Breakpoints stay Tailwind defaults (640/768/1024/1280/1536); the redesign will be verified at 1440, 1280, 1024, 768, 390, 320.

## Checks
tsc PASS · lint PASS · build PASS (/ = 196 kB, 340 kB first-load, unchanged).
Screenshots (redesign-after/step-2.3/): hero (nav CTA now softly rounded), Ch03 (dark, still cream 3D tiles), footer + Ch08 (card/input softly rounded, dark footer).
Text content untouched.

## Notes / limitations
- Existing pinned scenes keep their own layout; the new spacing/width tokens are applied in later steps as each section is restyled.
- Earlier chapter screenshots (Steps 1.4, 2.1) used smooth scrolling and some landed mid-scroll (near-empty frames). From this step on, screenshots use instant scroll. The Step 1.4 baseline therefore under-represents some chapters; it does not affect any build/typecheck/lint result.
- 3D tiles in Ch03 are still the old cream/paper colour (handled in Step 5.x).
