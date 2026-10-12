# Step 3.4 — Hero 3D recolor (only Hero3D.tsx changed, no text)
Node network recolored for the dark theme: accent nodes red/gold -> orange #FF7900 / amber #FFB347; neutral nodes #9A8C7A (warm grey); lines #C98A4B at 0.30 opacity (was 0.22); halo glow 0.26 -> 0.42 (additive, cheap bloom stand-in). Geometry, counts, animation, disposal and reduced-motion untouched.
Checks: tsc + next build. Not screenshotted: WebGL stalls in the sandbox — please check the hero on a real GPU.
