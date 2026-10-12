# Step 3.2 — Hero composition (visual only; no copy changed)

## Files
- NEW src/components/primitives/RidgeGlow.tsx — two decorative, aria-hidden, non-animated pieces: RidgeGlow (dark mountain-ridge silhouette with a glowing orange edge and warm wash) and PlatformGlow (orange light pool + fine ring under a panel)
- src/components/primitives/HeroGlow.tsx — renders RidgeGlow at the bottom of the first screen (inside the sticky hero layer, so it sits at the viewport bottom)
- src/components/chapters/Chapter01Conversation.tsx — eyebrow now uses the .eyebrow pill primitive (same text, same uppercase); the product panel is wrapped so PlatformGlow sits under it (both the animated and the reduced-motion branches)
- src/components/primitives/RecognizedWord.tsx — recognised words "Sarah", "Friday", "high priority" turn orange when recognised (text-red-on-dark) and settle to muted orange (text-red-muted) instead of white/grey. Colour only; same words, same reveal logic.

## Reference elements reproduced
Orange pill eyebrow · large white left-aligned headline with selective orange emphasis · glowing platform under the product panel · orange horizon/ridge glow at the bottom of the first screen · atmospheric orange wash (existing HeroGlow, now orange) · dark glass nav (3.1).

## Reference elements NOT reproduced (content lock)
Supporting description, "Start Free Trial"/"Watch Demo" buttons, "7-Day Free Trial / No Credit Card / Setup in Minutes" ticks, floating Slack/Notion/WhatsApp icons, "Sarah Chen"/"Task Detected" cards and the performance/tasks widgets all contain text or claims that do not exist on your hero, so none were added. Your own hero already carries the message-to-task story through the typed sentence + panel.

## Checks
tsc PASS · lint PASS · build PASS (/ = 197 kB, 341 kB first-load; +1 kB for the new decorative component).
Screenshots (redesign-after/step-3.2/): desktop at top, desktop after scroll with words orange, mobile.

## Limitations (please read)
- WebGL was OFF in these screenshots (headless software WebGL stalls in this sandbox), so the 3D node network is absent from them; the 3D recolour comes in Step 3.4 and needs a real-GPU check on your side.
- In headless Chromium CSS colour transitions stall at their start value, so the first capture showed the words still white. With transitions disabled the computed colour is exactly #C4681A and the capture shows orange; in a normal browser the 300ms transition completes.
- The orange emphasis is applied when words are recognised (during the scroll animation), not at rest, to keep your existing reveal behaviour.
- Headline size/line breaks are unchanged (already 4 lines left-aligned at ~45% width, close to the reference's proportions).
