# Step 5.7 — 3D performance
All 5 scenes (Hero3D, Organize3D, PeopleField3D, EcosystemDepth3D, ScaleDepth3D) now:
- stop their render loop when their container is scrolled off-screen (IntersectionObserver) or the tab is hidden (visibilitychange), and resume automatically; previously all five rendered every frame always.
- call preventDefault() on webglcontextlost so the browser can restore the context rather than leaving a blank canvas.
- remove the observer and listeners on cleanup (together with the existing dispose calls).
Earlier (5.2): pixel ratio capped at 1.5 under 768px. Already present: dispose on unmount, reduced-motion skips WebGL.
Not done: separate simplified low-poly mobile scenes (no evidence yet that they are needed; needs a real-device test).
Checks: tsc, lint, build, plus headless load test below. Real GPU frame-rate not measured.
