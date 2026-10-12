# Step 1.5 — Implementation Map (plan only; no source changed)

## Key finding: the site is token-driven, so most of the recolor is cheap
- Components almost never hardcode colors (only Organize3D has 4 rgba values; og-shared.tsx has 6 hex). Everything flows from src/styles/tokens.css (57 variables) via tailwind.config.ts.
- => Flipping the palette tokens from "cream paper + red" to "black + orange" re-themes Ch01–04 and Ch08 in one edit. The dark "-on-dark" token family and data-theme="dark" already exist.
- The 3D scenes are the exception: each keeps its own JS hex constants "mirroring tokens.css" (three.js cannot read CSS vars). 5 files, ~4 constants each (ink 0xf3efe7, red 0xe2493d/0xa6332b, gold 0xd98e2b, violet 0x7c4dff, plus paper surfaces in Organize3D). These must be changed by hand: red -> orange, gold -> amber, violet -> removed/orange.
- The 3D scenes already use MeshPhysicalMaterial (15), Environment (10), bloom + EffectComposer (16), directional/hemisphere lights. We restyle materials/lights; no new rendering stack.

## Change type per component
| Area | Files | Change level | What changes |
|---|---|---|---|
| Tokens | styles/tokens.css, tailwind.config.ts | STYLE (core) | New dark palette, orange/amber accents, glow shadows, radii, border-orange tokens, gradient-accent -> orange. Keep all variable NAMES so no component breaks |
| Global | app/globals.css, layout.tsx (themeColor #faf7f1 -> #070707), og-shared.tsx, icon/manifest colours | STYLE | Dark body, selection/focus orange, OG images dark/orange |
| Surface logic | lib/chapterSurfaces.ts, ScrollProgressRail, AmbientDust, AmbientLight, GrainOverlay, ChapterBackdrop, DepthField | STYLE + small STRUCTURE | DARK_CHAPTER_IDS currently = 05–07 only; all chapters become dark, so rail/dust colouring logic is simplified; ambient layers become warm orange glow + embers |
| Nav | nav/PersistentNav | STYLE | Dark glass bar, orange active/CTA pill, bottom hairline. Text/links/behaviour unchanged ("Login", "Try it") |
| Hero | Ch01 + Hero3D + HeroGlow + ProductWindow | STYLE + 3D | Orange/amber node network, glowing platform, glass panel frame, orange emphasis on recognised words; headline wording untouched |
| Workflow strip | Ch02 | STYLE | Cards/borders/arrows in reference card style; layout stays the pinned scene |
| Feature 3D | Ch03 + Organize3D | STYLE + 3D | Paper tiles (0xfbf8f2) -> dark metal with orange emissive edges, rim light |
| Product cards | Ch04, MiniTaskBoard, ProductWindow, TiltPanel | STYLE | Dark glass, orange 1px borders, glow on hover |
| People | Ch05 + PeopleField3D | STYLE + 3D | Violet -> orange/amber, circular orange icon containers for avatars/nodes |
| Ecosystem | Ch06 + EcosystemDepth3D | STYLE + 3D | App tiles as glass squares with orange glow (like reference floating icons) |
| Scale | Ch07 + ScaleDepth3D | STYLE + 3D | Orange orb/ridge-glow atmosphere, remove violet |
| Final CTA | Ch08 | STYLE | Dark, orange primary button, textarea in glass card; real extractor logic untouched |
| Footer | nav/SiteFooter | STYLE | Dark, orange hover, hairline; existing 4 links/tagline only (no invented columns) |
| New visual assets | — | NEW (CSS/SVG only, no images, no new deps) | Ridge-line horizon glow divider, ember particles (reuse AmbientDust), orange glass-card + pill-button primitives, eyebrow pill style |

Nothing needs a new route, new copy, or a new dependency.

## Recommended execution order (each ends in one ZIP + your approval)
- 2.1 Tokens (palette, glows) — biggest visual change for least work; verify by building and viewing 4 screenshots.
- 2.2 Typography (existing Manrope/Inter/Plex Mono; adjust scale/weights/tracking only).
- 2.3 Layout tokens (widths, padding, radii, button height).
- 2.4 Primitives (button pill, eyebrow, glass/dark card, icon circle) as CSS classes/components.
- 2.5 Consistency check (build + lint + typecheck + 3 screenshots).
- 3.x Nav + Ch01 hero + Hero3D recolor/lighting.
- 4.x Ch02, Ch06 strip/cards. 5.x Ch03/Ch05 3D features. 6–7 skipped where no existing content (case studies/process/tech/testimonials/FAQ). 7.x Ch04, Ch07 visuals. 8.x Ch08 + footer. 9–12 responsive, a11y, regression, comparison, final report.
- Phases 6 and 8.1–8.2 (case studies, process timeline, tech grid, testimonials, FAQ) have no existing content: they will be reported as "not applicable (content lock)", not built.

## Risks and how they're handled
1. Content lock: only CSS/layout/3D constants change; snapshot (REDESIGN-CONTENT-SNAPSHOT.md) re-checked at the end.
2. Contrast: red/orange on dark must hit WCAG AA for small text; check in 2.5 and 9.4.
3. 3D performance: orange bloom must stay restrained; keep existing reduced-motion/mobile fallbacks.
4. Pinned scroll length vs reference's compact page: kept (structure change only if strictly needed).
5. Free-plan limits: each step = one focused edit pass; the screenshot run is the slow part, so later steps take 3–5 key screenshots, not 24.
6. Pre-existing SVG <line> x2 console error left alone unless it shows up in the redesigned areas.
