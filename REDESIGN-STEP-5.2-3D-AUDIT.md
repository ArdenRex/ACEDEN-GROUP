# Step 5.2 — 3D capability audit
Stack: three ^0.185 used directly in 5 scenes (Hero3D, Organize3D, PeopleField3D, EcosystemDepth3D, ScaleDepth3D). No React Three Fiber/drei/postprocessing package; bloom uses three/examples EffectComposer + UnrealBloomPass (Ch06, Ch07 only, strengths 0.3-0.32 = restrained). Decision: keep this stack, add nothing.
Good already: every scene disposes geometry/materials/renderer (6-18 dispose calls each), cancels its animation frame on cleanup, returns null and skips WebGL entirely under prefers-reduced-motion, caps pixel ratio at 2.
Changed (only code edit): pixel-ratio cap lowered to 1.5 on viewports < 768px in all 5 scenes (cheaper phone rendering, nearly no visible loss).
Gaps left for Step 5.7: scenes keep rendering when scrolled off-screen or the tab is hidden (no IntersectionObserver/visibilitychange pause), no webglcontextlost handling, no explicit low-power mobile scene. Reported, not changed, because each touches render loops.
Checks: tsc, lint, build.
