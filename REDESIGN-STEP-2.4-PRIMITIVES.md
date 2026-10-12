# Step 2.4 — Reusable Visual Primitives

## Added (src/app/globals.css, @layer components; all opt-in, built only from tokens)
| Class | What it is |
|---|---|
| .btn + .btn-lg | Pill button base: 44px (50px lg) tall, 600 weight, soft transitions, disabled state |
| .btn-primary | Orange gradient fill, dark text (7.5:1), orange glow; hover lifts + stronger glow |
| .btn-secondary | Dark translucent fill, fine orange border, glow on hover |
| .eyebrow | Pill label: orange mono text, orange hairline border, faint orange tint |
| .card-dark | Elevated dark card (#17120E), 16px radius, fine orange border, top highlight |
| .card-glass | Translucent blurred panel with the same border/highlight |
| .card-interactive | Adds lift + border/glow on hover. Only for genuinely clickable cards (no false affordance) |
| .border-glow | Brighter orange border + soft outer glow |
| .icon-circle (+ -lg) | Round orange icon container with radial glow |
| .section-wrap / .section-inner | Section vertical rhythm + 1280px content width + responsive gutters |
| .section-heading / .section-lede | Spacing for eyebrow + heading + muted lede |
Hover effects are wrapped in `@media (hover: hover)`; keyboard focus keeps the global orange focus ring; existing reduced-motion rules still apply.

## Other changes
- Container.tsx: new `width="content"` option (max-w-content, 1280px). Existing widths untouched.
- design-system page (internal style guide route): added a "Redesign primitives" preview block so the primitives are demonstrated and verified. This is not part of the marketing page.
- No existing site text changed; no primitives are applied to the live sections yet (that starts in Step 3.1).

## Checks
tsc PASS · lint PASS · build PASS (/ = 196 kB, 340 kB first-load, unchanged; /design-system 142 kB).
Screenshot: redesign-after/step-2.4/primitives-preview.jpg (primary, secondary, disabled, eyebrow, dark card, glass+glow card, hovered interactive card, gradient text).

## Limits
- Visual check covers the preview at 1280px (including one hover state); focus/active states rely on the global focus ring and CSS and were not screenshotted.
- Primitive classes only exist in the CSS build if used somewhere; the preview and later steps use them. Unused ones are dropped by Tailwind's purge, which is fine.
