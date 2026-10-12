# Step 3.3 — Hero typography (text unchanged)
- Hero h1 gets class `hero-headline` (Chapter01Conversation.tsx) + rule `.text-display-lg.hero-headline` in globals.css.
- Weight 700→800, size cap 4rem→4.5rem (clamp 2.5rem..4.5rem, still limited by 9.5vh), line-height 1.06→1.03, tracking -0.024em→-0.032em. Mobile (<=640px): line-height 1.1, tracking -0.02em.
- Width/wrapping, orange emphasis and reveal logic unchanged. No words, case or punctuation touched.
- Checks: tsc PASS, next build PASS. Not screenshotted (WebGL stalls sandbox) — check wrapping in your browser.
