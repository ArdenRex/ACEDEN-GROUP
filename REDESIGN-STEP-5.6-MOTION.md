# Step 5.6 — 3D motion + reduced motion (no code change)
Motion in the scenes (read from source): Hero3D slow drift (group.rotation.y += 0.0015/frame) plus eased pointer parallax; Ch03/05/06/07 are scroll-linked (scrollYProgress) with gentle pulses. No scroll hijacking, no new animation dependency.
Reduced motion, tested with Chromium reducedMotion='reduce' (1440x900): 0 <canvas> elements (no WebGL started), all 8 chapter sections render as static layouts, page height 7318px, readable static cards (screenshot: redesign-after/step-5.6/reduced-motion-ch04-05.jpg).
Found: React hydration warning #418 appears ONLY with reduced motion on (server renders the animated branch, client switches to the static branch). Present identically in the Step 3.2 build, so not caused by the redesign. React recovers and the page works; fixing it means changing how each chapter picks its branch, so I left it. Can fix on request.
Not verified: actual 3D animation smoothness/jank (needs a real GPU).
