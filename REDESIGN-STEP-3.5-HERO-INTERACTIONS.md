# Step 3.5 — Hero/nav interactions (no text changed)
- Focus ring: token was already orange-bright; added a soft 4px orange halo around the 2px ring, and made the dark-chapter override orange too (it was light ink).
- Nav Login pill and Sign-up CTA: added a subtle active (press) scale 0.97; CTA now transitions box-shadow + transform. Existing hover glow and sheen sweep kept.
- CTA destinations (getLoginUrl/getSignupUrl, #chapter anchors) untouched. The hero itself has no buttons (content lock), so there is nothing else to wire.
- Reduced motion already handled globally (transitions/animations collapse to 0.01ms), covering the new press transition.
Checks: tsc, lint, build. Not tested visually (headless, no real keyboard/GPU).
