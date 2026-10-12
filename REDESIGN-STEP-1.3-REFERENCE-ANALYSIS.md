# Step 1.3 — Reference Image Analysis (audit only; no source changed)
Reference file: redesign-reference/reference-full-page.png — 751 x 2095 px (ratio 2.79:1, ≈ one 1440px-wide page at ~2.0x scale ⇒ ≈ 4000px tall).
Convert reference px → 1440 desktop px by ×1.92. Percentages below are of total page height. Values are measured/visually estimated, not exact.

## Global look
- Base near-black #080808 with warm brown-black tints (#180808–#381808). Orange accent ≈ #F87808 / #F86808 (bright #F88808, deep #D85808); orange covers ≈3.4% of pixels — it is an accent + light source, not a fill.
- Text: white #F8F8F8 headlines; grey-beige body; orange for 1–3 emphasis words per headline ("Turn Every Message Into Action.", "Partner.", "Innovation").
- Every section has a glowing orange horizon/mountain-ridge or ember glow at its bottom edge; luminance rises sharply at: hero (~3–14%), feature (~43%), AI-workflow (~74%), final CTA (~90%). Mid sections are darker (lum ≈ 12–25).
- Cards: near-black #14100C-ish fill, 1px orange/amber border at ~30–50% opacity, ~12–16px radius, faint orange outer glow, inner top highlight.

## Section geometry (reference y-range → % of page)
| Section | y px | % | Layout |
|---|---|---|---|
| Nav | 0–40 | 0–2% | Logo left, 5 links centred (active link orange + underline), ghost "Sign In" pill + solid orange pill right |
| Hero | 40–300 | 2–14% | Left col ≈ 42%: eyebrow pill, 3-line headline ~28px (≈54px at 1440), body, 2 CTAs (orange solid + dark outlined), 3 tick benefits. Right col ≈ 55%: floating app-icon tiles (glass squares, orange glow), chat card, "Task Detected" panel on glowing orange platform, performance/tasks side cards, orange sphere/planet cropped top-right |
| Integration strip | 320–410 | 15–20% | Centred heading + sub, one wide rounded panel with amber border holding 6 logos + arrow |
| Workflow | 440–585 | 21–28% | Left text block (~30%), right 5 equal cards (~13% each) with orange arrows between |
| Feature showcase | 590–920 | 28–44% | Left 50%: large glowing isometric 3D cube/platform with floating screens; right: eyebrow, 2-line headline, para, 6 rows each with circular orange icon + title + line |
| Case studies | 930–1085 | 44–52% | Left text, right 3 image cards with metrics |
| Process | 1095–1210 | 52–58% | Left text, 5 glowing hex icons joined by arrows |
| Tech stack | 1225–1345 | 58–64% | Left text, 2×5 icon-tile grid, 3D orange cubes bottom-right |
| AI workflows | 1350–1545 | 64–74% | Left text + CTA, 4 cards right, wide cinematic band below with glowing orb on dark architectural scene |
| Testimonials | 1560–1670 | 74–80% | Left heading + arrows, 3 quote cards |
| FAQ | 1680–1775 | 80–85% | Left heading, 5 accordion rows with "+" |
| Final CTA | 1790–1890 | 85–90% | Left text + 2 buttons, giant glowing orb right, ridge-line horizon |
| Footer | 1890–2095 | 90–100% | Brand + socials, 4 link columns, newsletter column, copyright row |

## Layout system (approx, at 1440)
- Content width ≈ 1280px (≈ 6% side margins); two-column sections use ≈ 30/70 or 45/55 splits; card gaps ≈ 16–24px.
- Section vertical padding ≈ 60–90px; reference is compact: whole page ≈ 4000px vs. current site's pinned-scene length (≈ 3000dvh+).
- Buttons: height ≈ 44–50px, fully rounded pills; primary = orange gradient with glow; secondary = dark fill + light border.
- Headline scale (≈1440): hero ≈ 54px/1.1, section h2 ≈ 36–40px/1.15, card title ≈ 15–16px, body ≈ 14–15px/1.5, eyebrow ≈ 10–11px uppercase tracked in orange pill.

## 3D / lighting focal points
1. Hero top-right: orange planet/sphere + glowing platform with floating glass cards.
2. Feature section: isometric stacked platform + glowing cube + floating monitors with rim light.
3. Tech stack: small stacked orange cubes (decorative).
4. AI-workflow band: luminous orb among dark architectural panels.
5. Final CTA: large wireframe-style orb behind ridge horizon.
Materials: dark glass/metal, orange emissive edges, strong warm rim light, soft bloom, floor reflections; no flat primitives.

## Fit against existing site (feasibility)
- Reusable now: your five three.js scenes (restyle materials/lights to orange emissive/dark metal); Ch06 tiles ↔ floating app icons; Ch04 board ↔ glass product cards; Ch08 ↔ final CTA.
- Cannot be reproduced without breaking the content lock: case-study metrics, process timeline, tech grid, testimonials, FAQ, services cards, newsletter, 4-column link footer (current footer has only: logo, tagline, Start free trial, Login, Back to top). Those slots will be filled with visual atmosphere only (ridge horizon, glow, 3D), never new copy.
- Biggest deviation unavoidable: page length and rhythm (pinned scroll scenes vs. compact stacked sections).

## Palette to carry into Step 2.1 (to refine against this image)
bg #070707 / #0D0B09 · surface #15110D / #17120E · orange #FF7900 / #FF941A · amber #FFB347 · text #F7F5F1 / #B8B1A8 — consistent with measured values above.
