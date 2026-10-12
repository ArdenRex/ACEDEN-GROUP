# Phase 10 — Functional regression + performance
Method: production build (NEXT_PUBLIC_APP_URL=https://app.example.test), headless Chromium, WebGL off.
- Text integrity: all 155 strings recorded in REDESIGN-CONTENT-SNAPSHOT.md still exist in the current source (whitespace-normalised): 0 missing. Earlier source diff vs Step 3.2 showed no wording changes.
- Links (rendered): Login -> {APP_URL}/login; Try / Prefer to skip ahead / Start free trial -> {APP_URL}; logo -> /; Back to top -> #chapter-01; skip link -> #main-content. Anchors #chapter-01..08 all exist.
- Routes: / 200, /design-system 200, unknown path 404 page. No console/page errors, no failed requests.
- Ch08 interaction: typed "Ask Priya to send the Q3 report by Monday, high priority", clicked Extract structured work -> structured card appears (Priority High Priority, Copy result, draggable workspace with the task in To Do). Works. There is no backend/form submission on this site (unchanged).
- Build/lint/types: tsc PASS, next lint PASS (0 warnings), next build PASS.
- Size: / = 198 kB page JS, 342 kB first-load (baseline Step 1.4: 196 / 340); shared 103 kB unchanged; /design-system 142 kB unchanged. +2 kB total for the whole redesign so far, no new dependencies.
- Media: site has no raster images; all visuals are CSS/SVG/WebGL, nothing to compress or lazy-load.
- 3D: render gating, disposal, context-loss handling and mobile pixel-ratio cap done in 5.2/5.7. Real-GPU frame rate still unmeasured.
Not tested: unit/integration tests (project has none), cross-browser (Safari/Firefox), real-device performance.
