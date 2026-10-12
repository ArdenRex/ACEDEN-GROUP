# Step 1.4 — Baseline (nothing in src/ was changed)

## Commands run (npm ci from lockfile; NEXT_PUBLIC_APP_URL=https://app.example.test for the build)
| Check | Result |
|---|---|
| npm ci | OK, 390 packages (eslint 8 deprecation warning only) |
| tsc --noEmit (project's own TypeScript) | PASS, 0 errors |
| next lint | PASS, "No ESLint warnings or errors" |
| next build | PASS, 10 static pages. `/` = 196 kB page JS, 340 kB first-load JS (shared 103 kB); `/design-system` 142 kB |
| Unit/integration tests | None exist (playwright is a devDependency but there are no tests) |
Note: bare `npx tsc` outside node_modules pulls TypeScript 6 and reports a `baseUrl` deprecation. That is not a project failure.

## Page metrics (production build, headless Chromium, software WebGL)
- Mobile (390px) document height 28,488px. Chapter heights: 01 3376 · 02 2870 · 03 3207 · 04 3882 · 05 3714 · 06 4051 · 07 4389 · 08 2671.
- Horizontal overflow at 390px: none.
- PRE-EXISTING console error (not from the redesign): `<line> attribute x2: Expected length, "[object Object]"` — an SVG <line> receives an object for x2 (seen on mobile load). Left untouched for now.

## Screenshots (redesign-baseline/, JPG)
- Desktop 1440x900: hero-0 plus two scroll positions per chapter (-a at 15%, -b at 60%). Contact sheet: _contact-sheet-desktop.png (alphabetical order, not page order).
- Mobile 390x844: hero-0, chapters 01/03/05/07/08 at 60%, footer.
- Not captured: desktop footer (first run hit the 300s tool limit; software WebGL is slow). Will be captured in Step 11.1.

## Observed look
- Hero: cream paper background with a peach wash, 3D node network, large dark headline "Can Sarah finish the onboarding docs by Friday? Make it high priority.", dark window frame at right, orange/red gradient nav CTA.
- Ch02 cream; Ch03 light grey with 3D tiles; Ch04 dark window on cream; Ch05–07 near-black with violet/white 3D bodies; Ch08 dark.
- Today: cream then dark, violet/white accents. Reference: black and orange throughout.

## Limitations
- Headless Chromium uses software WebGL, so 3D looks and timing differ from a real GPU. Later comparisons use the same setup.
- Pinned scroll scenes make full-page screenshots meaningless, so scroll-position screenshots are used.
