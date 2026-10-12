# Step 3.1 — Navigation redesign (styling only)

## Files changed
- src/components/nav/PersistentNav.tsx (classes only)
- src/components/primitives/Wordmark.tsx (mark colour/weight; also used in footer and 404)

## What changed
- Bar: darker frosted-glass surface (bg-background/70, backdrop-blur-lg), deeper drop shadow, plus a decorative orange hairline glow along the lower edge (aria-hidden).
- Height: 72px on sm+ (--header-height, reference), 60px on mobile. The existing ResizeObserver still writes the real height into --nav-height, so every pinned chapter adapts automatically.
- Brand: the existing vertical stroke in the wordmark is now orange (2px) and the name is semibold. Link target ("/") unchanged.
- "Login": was a text link with an underline-draw; now a ghost pill (fine orange border, brightens + soft glow on hover). Underline is hidden to avoid a line inside the pill. Same URL (getLoginUrl) and visibility (sm and up).
- CTA: now a pill with the orange gradient, dark text (7.5:1), orange glow, stronger glow on hover; the existing hover sheen and MagneticButton behaviour are kept. Same URL (getSignupUrl).

## Preserved
Labels exactly: "Login", "Try it" (mobile), "Try AI Workflow Coordinator" (desktop); aria-label "Primary"; visibility logic (only inside Chapter 01), AnimatePresence, reduced-motion handling, routes/anchors.

## Not applicable (content lock)
The reference's five centre links, active-link underline and "Pricing"/"Resources" items have no counterpart in your site and were not created. The reference's "active orange indicator" is carried by the orange brand stroke and CTA instead.

## Checks
tsc PASS · lint PASS · build PASS (/ = 196 kB, 340 kB first-load, unchanged).
Screenshots (redesign-after/step-3.1/nav-desktop-mobile.jpg): desktop 1440 and mobile 390 nav bars. Taken with WebGL disabled (see below), so the hero 3D is absent in those frames.

## Limitations
- In this sandbox the headless browser (software WebGL) stalled on screenshots of the hero with the new nav, so the nav screenshots were taken with WebGL off. The final change of backdrop-blur-xl -> backdrop-blur-lg (lighter on GPUs) was applied after the screenshot and verified by build only.
- Hover on the CTA and keyboard focus were not screenshotted; focus uses the global orange ring.
