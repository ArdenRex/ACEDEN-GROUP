# Phase 7 — Large visuals (Ch04 Workspace, Ch07 Scale), transitions
Checked static (reduced-motion) renders at 1440x900 (screenshots in redesign-after/step-7/).
- 7.1 capability cards: not applicable (no services/capability content exists; content lock).
- 7.2 large visuals: Ch04 already reads like the reference (dark panel, orange rim glow, panel hover from 4.4) - no change. Ch07 showed a grey, muddy glow: the dark-variant background orbs used neutral grey (--color-ink-muted-on-dark). Changed to warm amber #B8651A (DepthField.tsx baseColor, and two radial gradients in Chapter06Ecosystem.tsx). Result: warm amber haze behind the work items. No text changed. No fake dashboard added.
- 7.3 transitions: chapter-start haze/hairline from 5.5 plus the now-warm backgrounds make Ch04 -> Ch07 consistent. Pinned scenes' in-between frames not inspected.
- 7.4 mid-page: reviewed Ch04 and Ch07 static only; WebGL looks (Ch05-07 3D) still need a real-GPU look.
Tried and reverted-by-uselessness: AmbientLight (cursor glow) changed from soft-light surface to a faint orange screen glow (opacity 0.1); it was not the cause of the grey stain but suits the dark theme.
Checks: tsc, build (lint below).
