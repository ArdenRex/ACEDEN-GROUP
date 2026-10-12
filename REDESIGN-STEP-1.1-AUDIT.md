# Step 1.1 — Project Inspection (audit only; no source files changed)

## Stack
- Next.js 15.5.24 (App Router), React 18.3, TypeScript 5.6, Tailwind 3.4, npm (package-lock.json)
- Animation: framer-motion 11 (used in ~35 files), custom lib/motion.ts
- 3D: three 0.185 used directly (no R3F/drei): Hero3D, Organize3D, PeopleField3D, EcosystemDepth3D, ScaleDepth3D
- State/interaction: zustand (lib/navStore.ts), @dnd-kit (MiniTaskBoard)
- Fonts: local files via next/font/local — Inter (body), Manrope (display), IBM Plex Mono (mono)
- Scripts: dev, build, start, lint, typecheck. No unit-test runner. playwright is a devDependency (no tests in repo).

## Entry points / routes
- src/app/layout.tsx: metadata + OG/Twitter, skip link, global overlays (CustomCursor, ScrollProgressRail, AmbientLight, AmbientDust, GrainOverlay, FirstLoadReveal, TabTitleSwap). viewport themeColor #faf7f1 (light).
- src/app/page.tsx: the ONE single-page site. Order: PersistentNav → Chapter01Conversation → 02Disassembly → 03Organize → 04Workspace → 05People → 06Ecosystem → 07Scale → 08GiveItTheWork → SiteFooter
- Other routes: /design-system (internal), not-found, opengraph-image, twitter-image, icon.svg, apple-icon, manifest. No API routes.

## Styling architecture
- src/styles/tokens.css (168 lines) is the single token source; tailwind.config.ts maps every value to CSS vars; src/app/globals.css (275 lines).
- CURRENT THEME IS LIGHT: warm paper #faf7f1, ink #16151a, red #a6332b as the one accent. A dark "product-window" family exists and Ch.07 uses data-theme="dark".
  => Reference (black/orange) is a full palette inversion; tokens.css is the right place to do it.

## Components
- chapters/ (8 files, 392–1214 lines each); primitives/ (~32); nav/PersistentNav (117), nav/SiteFooter (70).
- Chapters are scroll-driven "pinned scenes" (heights 340–520dvh) each with a static reduced-motion/mobile fallback.
- Anchors: #chapter-01 … #chapter-08, #main-content.

## Functional surface to protect
- Nav: logo → "/", Login → getLoginUrl(), Signup → getSignupUrl() (src/lib/env.ts, from NEXT_PUBLIC_APP_URL; falls back to localhost with warning).
- Footer: logo, signup, login, "#chapter-01" link.
- No forms, no fetch calls, no mailto/external hrefs found in src.
- Interactive: MiniTaskBoard (dnd-kit), signalExtraction.ts (Ch.01 typing/recognition), navStore, custom cursor, scroll progress rail.

## Assets
- public/: icon-192.png, icon-512.png only. No photography/illustration assets; all visuals are code-drawn (SVG/CSS/three).
- Env: .env.example, .env.production committed.

## Observations relevant to the redesign
1. Nothing in the repo is "reference-like" yet: no orange, no dark base, no integration strip, FAQ, testimonials, or case studies. Per the content lock, those reference sections have no existing counterpart and must NOT be invented; I will map reference visuals onto the 8 existing chapters only.
2. Heavy scroll-pinned scenes + 5 separate three.js scenes: restyle in place; don't add a new rendering stack.
3. Existing hex/colors may be hardcoded inside components in addition to tokens — to be measured in Step 1.2.

## Blocker for Step 1.3
- The reference image was NOT received (only the two prompt documents arrived). Needed before Step 1.3.
