# Step 5.5 — Atmospheric section transitions
Added one decorative CSS rule (end of globals.css) for chapters 02-08: a faint amber hairline (rgba(255,148,26,.4), fades at both ends) and a warm radial haze (rgba(255,121,0,.11), max 36rem / 70dvh tall) at the START of each chapter, behind content (z -1, isolated, pointer-events none, no text). Chapter 01 is excluded (it has its own HeroGlow + RidgeGlow).
Limits: the haze is only at each chapter's top edge, i.e. the first viewport of each long pinned scroll; Ch05-07 paint their own full-bleed backgrounds inside the pinned layer, which cover it. It is deliberately subtle (dark site, low opacity).
Verification: computed style confirmed the rule applies (576px tall, z-index -1); no horizontal overflow (1440). My screenshot at the Ch03 boundary was too dark/offset to judge the effect visually, so I cannot confirm how strong it looks — check on your screen; raise 0.11 in globals.css if you want it stronger.
Checks: tsc, lint, build.
