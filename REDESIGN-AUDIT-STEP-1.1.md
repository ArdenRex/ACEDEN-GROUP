# Step 1.1 — Project Inspection (no code changed)

## Stack
- Next.js 15.5.24 (App Router), React 18.3, TypeScript 5.6, npm (package-lock.json)
- Tailwind CSS 3.4 driven by CSS variables (src/styles/tokens.css -> tailwind.config.ts)
- Animation: framer-motion 11; state: zustand; drag/drop: @dnd-kit
- 3D: three 0.185 (raw Three.js, NO react-three-fiber) in 5 primitives
- Playwright 1.62 is in devDependencies (usable for screenshots)
- Scripts: dev, build, start, lint, typecheck (no unit tests)
- Fonts: next/font/local, bundled (Inter, Manrope, IBM Plex Mono)

## Entry points / routes
- src/app/layout.tsx — metadata, fonts, global overlays (CustomCursor, ScrollProgressRail, AmbientLight, AmbientDust, GrainOverlay, FirstLoadReveal, TabTitleSwap), skip link
- src/app/page.tsx — the single page: PersistentNav, Chapter01..Chapter08, SiteFooter
- Other routes: /design-system (src/app/design-system/page.tsx), not-found, opengraph/twitter images, manifest, icon
- Single-page structure confirmed: 8 chapters + nav + footer in one scroll

## Section order (must stay)
1 Conversation (392 lines) · 2 Disassembly (484) · 3 Organize (691) · 4 Workspace (659)
5 People (1214) · 6 Ecosystem (811) · 7 Scale (522) · 8 GiveItTheWork (587) · SiteFooter (70)

## 3D primitives (Three.js)
Hero3D, Organize3D, PeopleField3D, EcosystemDepth3D, ScaleDepth3D (+ DepthField)

## Styling architecture
- tokens.css (168 lines) = single source of truth; globals.css (275 lines)
- CURRENT THEME: light "warm paper" (#faf7f1) with near-black ink and ONE red accent (#a6332b),
  with a dark "product-window" surface family growing through chapters 2-8.
- TARGET THEME: black/charcoal + orange/amber. This is a full palette inversion, so the work
  is mostly token-level plus per-chapter fixes for hardcoded colors.

## Integrations / functionality to protect
- src/lib/env.ts: NEXT_PUBLIC_APP_URL (all app links) and NEXT_PUBLIC_SITE_URL (metadata/OG)
- .env.example and .env.production exist
- One form handler: Chapter08GiveItTheWork.tsx (onSubmit, line ~328) — behavior to be verified in Step 1.2
- No fetch() calls, no mailto/external hardcoded links found in src
- SEO: metadata + OG/Twitter images in layout.tsx; themeColor is currently #faf7f1 (light) and will need updating with the palette

## Assets
- public/ has only icon-192.png and icon-512.png; no photos/illustrations. Visuals are code-generated (Three.js + CSS).

## Notes / risks for later steps
- Existing handoff doc (STEP-2C-DESIGN-DIRECTION-HANDOFF.md) describes the old direction; it is superseded by this redesign.
- Chapter05People.tsx (1214 lines) is the largest file; edit it surgically.
- Content lock: text will be inventoried in Step 1.2 before any visual change.
- The reference image was NOT supplied with the prompt documents; it is needed for Step 1.3.
