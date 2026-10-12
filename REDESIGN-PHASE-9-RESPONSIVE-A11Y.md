# Phase 9 — Responsive + accessibility (measured, no code change)
Method: production build, headless Chromium (WebGL off), 1440/1280/1024/768/390/320 wide.
- Horizontal overflow: document scrollWidth equals viewport width at all six sizes. Elements wider than the screen are decorative glow orbs inside clipped containers.
- Hero at 320x640: headline wraps in 6 lines inside 20..300px, no clipping (screenshot redesign-after/step-9/hero-320.jpg).
- axe-core (WCAG 2 A + AA rules, 1440 desktop, top of page): 0 violations. Includes text contrast for what was on screen. Not run on every scroll state or on the mobile layout.
- Keyboard: Tab reaches the nav and the chapter rail; focus ring is the orange 2px outline + halo (rgb 255,148,26) from 3.5.
- Headings: h1 (hero), h2s and several h3 descriptions; the order skips levels (h1 -> h3) because chapters carry visually hidden h3 descriptions. Pre-existing structure, left alone.
Observations (not fixed):
1. At 320x640 the eyebrow pill sits ~3px under the nav border (tall 6-line headline on a very short screen). Fine at 390x844.
2. At 320px the nav shows no wordmark text and the CTA shows a short label; I believe this is the original responsive behaviour (labels not touched) but did not diff it against the baseline.
3. Not tested: real screen reader, tablet landscape states mid-scroll, forms in Ch08 beyond rendering, reduced-motion at every width.
