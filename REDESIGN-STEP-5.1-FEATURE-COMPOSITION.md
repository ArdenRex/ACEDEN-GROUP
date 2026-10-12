# Step 5.1 — Feature composition (Chapter 03 "Organize" + Organize3D)
Content lock: Ch03 is a scroll scene (floating work cards sort into groups). It has no feature list with icon circles, so the reference's "illustration left / heading + feature list right" layout is not reproduced (it would need new copy and a structural rewrite of the pinned scene). Instead the existing scene was restyled to the reference's look; text untouched.
- 3D cards: paper (#FBF8F2) -> dark warm metal (#1D1812, side #0E0B08), roughness 0.45 / metalness 0.35; edges orange #FF7900 / amber #FFB347 (neutral #9A8C7A); halos amber.
- Lighting: warm ambient + key, warm fill, strong orange rim light from behind (0xFF7A1A, 1.1) for the "warm edge lighting" of the reference.
- Group outlines: grey hairline -> orange border with soft glow.
- Static/reduced-motion group boxes: now .card-glass.
Also covers part of Step 5.3/5.4 for this scene (materials + lights); remaining 5.2 audit: all scenes use raw three.js, no R3F; no new stack added.
Checks: tsc, lint, build. Not screenshotted (WebGL stalls sandbox) — check Ch03 on a real GPU: if cards look too dark, raise ambient or surface lightness.
