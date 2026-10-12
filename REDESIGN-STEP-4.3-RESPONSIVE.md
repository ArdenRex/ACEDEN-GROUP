# Step 4.3 — Responsive check (Ch02 + Ch06), no source change
Measured with headless Chromium (WebGL off) at 390x844, 768x1024, 1024x768, scrolled to the end of Ch02 and Ch06:
- document scrollWidth == viewport width at all three sizes (no horizontal overflow).
- Ch02 glass card sits fully inside the viewport: 390px -> x 20..370; 768px -> 80..688; 1024px -> 208..816.
- Screenshots: redesign-after/step-4.3/c2_{390,768,1024}.jpg. At 390px the task card and the glass text card stack cleanly, no overlap.
Not checked: Ch06's WebGL scene (needs a real GPU), and 320px (done in Phase 9).
No code changed this step.
