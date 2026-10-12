# Step 2.2 — Typography (only src/app/globals.css changed)

## Fonts (unchanged, no new dependency)
Manrope (display, variable 200-800), Inter (body, variable), IBM Plex Mono (labels). The reference's geometric bold sans is matched by Manrope at weight 700.

## Existing classes retuned (names unchanged, so every component picks them up)
| Class | Weight | Line-height | Tracking | Size |
|---|---|---|---|---|
| .text-display-xl | 600 -> 700 | 1.02 -> 1.04 | -0.02em -> -0.028em | unchanged (clamp up to 5.5rem) |
| .text-display-lg | 600 -> 700 | 1.05 -> 1.06 | -0.015em -> -0.024em | unchanged |
| .text-display-md | 500 -> 700 | 1.1 -> 1.12 | -0.01em -> -0.018em | unchanged |
| .text-heading-lg/md/sm | 600 Inter -> 700 Manrope | unchanged | unchanged | unchanged |
| .text-label (eyebrows) | 500 | 1.4 | 0.08em -> 0.12em | 0.6875rem |
Sizes were deliberately NOT changed: the pinned scroll scenes are laid out around the current clamp() sizes, so only weight, tracking and leading were moved toward the reference. The mobile (<=640px) loosening block is kept as it was.

## New opt-in utilities (not applied anywhere yet; used in Steps 2.4+)
.text-accent (orange colour emphasis) · .text-gradient-accent (orange gradient text) · .text-card-title (16px/700) · .text-card-body (14px muted) · .text-button (14px/600) · .text-nav (13px/500).
No text-transform was added anywhere, so capitalisation of existing copy is untouched.

## Hierarchy now
Hero headline: display-xl/lg 700 · Section headings: display-md / heading-lg 700 · Eyebrow: label (mono, wide tracking) · Body: body-lg/md/sm 400 · Card heading/description: card-title / card-body · Nav + buttons: text-nav / text-button · Footer: body-sm.

## Checks
tsc PASS · lint PASS · next build PASS (/ = 196 kB, 340 kB first-load, unchanged). Screenshot: redesign-after/step-2.2/desktop-hero-0.jpg — hero headline is visibly bolder and tighter, closer to the reference.
Text content untouched.

## Not verified / limits
Only the hero was visually checked (a second planned screenshot landed on the hero again because of scroll timing). Wider effects on the other chapters are checked in Step 2.5.
