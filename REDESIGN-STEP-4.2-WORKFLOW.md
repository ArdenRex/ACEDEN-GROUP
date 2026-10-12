# Step 4.2 — Workflow overview (Chapter 02 "Understanding")
Content lock: Ch02 is a scroll scene (sentence is disassembled into Sarah / Friday / high priority, then rebuilt as a task). It has no numbered step cards, headings or descriptions of its own, so the reference's 5-card row (Message > AI Understands > Task Created ...) is NOT reproduced; adding it would need new copy.
Applied the reference look to what exists (classes/styles only, no text):
- Explanatory block ("A request is more than a sentence...") now sits in a glass card (.card-glass: dark translucent, fine amber border, blur) in both the scroll scene and the static/reduced-motion fallback.
- Horizontal continuity line: grey -> orange (red-on-dark token).
- Bridge slot into Ch03: dashed border now orange with a soft glow.
Recognised words already turn orange via var(--color-red) (= #FF7900 since Step 2.1); unchanged.
Checks: tsc, lint, build. Not screenshotted (pinned scroll scene at 340dvh; WebGL/transitions stall headless).
