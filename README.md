# AI Workflow Coordinator — Marketing Website

Marketing site for **AI Workflow Coordinator** (Aceden Group), to be deployed
at `acedengroup.com`. This is a fully independent Next.js project — it shares
no code, dependencies, or deployment with the existing product application
(`app/` + `frontend/`). Nothing in the existing repo is touched by this
project.

Status: **foundation/scaffolding only.** No chapter content has been built
yet (see `docs/roadmap.md` — added in a later step).

---

## Stack & exact versions (as installed)

| Package | Version |
|---|---|
| next | 15.5.24 |
| react / react-dom | 18.3.1 |
| typescript | ^5.6.3 (resolved: see package-lock.json) |
| tailwindcss | ^3.4.13 |
| framer-motion | ^11.11.9 |
| zustand | ^4.5.5 |
| @dnd-kit/core | ^6.1.0 |
| eslint / eslint-config-next | 8.57.1 / 15.5.24 |

React stays on 18.3.1 — Next 15.5.24's peer range (`^18.2.0 || ^19.0.0`)
supports it, so no React 19 migration was needed.

**Why Next 15, not 14:** Next.js 14 is EOL and missed security backports for
several CVEs (SSRF via rewrites/Server Actions, RSC cache poisoning, a
middleware/i18n bypass, DoS in Server Actions and Image Optimization) that
were only fixed starting in the 15.x line. 15.5.24 is the latest stable
(non-canary) 15.x release at time of writing and carries none of those.
Radix UI is intentionally not yet installed — it'll be added when a
component actually needs it, to avoid unused dependencies.

---

## Folder structure (current)

```
website/
├── src/
│   └── app/
│       ├── layout.tsx      ← placeholder root layout (real metadata/fonts: next sub-step)
│       ├── page.tsx        ← placeholder home page (no chapter content yet)
│       └── globals.css     ← Tailwind entrypoint (design tokens: next sub-step)
├── public/                 ← empty, reserved for static assets
├── .env.example
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

The full planned structure (`components/chapters`, `components/primitives`,
`components/demo`, `lib/`, `styles/`, `data/`) is documented but not yet
created — it lands as those pieces are actually built, so there are no empty
placeholder folders sitting unused.

---

## Environment variables

Copy `.env.example` to `.env.local` for local dev:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000      # or the real app's Vercel URL
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

No secrets live in this project — it's a static/SSR marketing site with no
backend calls of its own.

---

## How to run

```bash
npm install
cp .env.example .env.local   # adjust values as needed
npm run dev                  # http://localhost:3000 (or next available port)
```

## How to preview a production build

```bash
npm run build
npm run start
```

## Validation commands (all passed — see handoff message)

```bash
npm run typecheck   # tsc --noEmit
npm run lint         # next lint
npm run build        # production build
npm audit            # dependency vulnerability scan
```

---

## Decisions made without explicit prior sign-off (flagged per your process)

1. **TypeScript over plain JS.** Not specified in the brief either way. Chose
   TypeScript for the type safety it gives across Zustand state, dnd-kit
   Kanban logic, and the extraction-parser demo — all places where a silent
   `undefined` would be easy to ship. Happy to strip typing out if you'd
   rather match the existing frontend's plain JS.
2. **Test setup deferred.** The brief allows "basic test setup if
   appropriate." There's no logic yet to test — the first real candidate is
   the Ch.02 extraction parser. Proposing to add Vitest (unit tests for the
   parser) + Playwright (the brief's own QC-checklist tool) when that code
   exists, rather than scaffolding empty test files now.
3. **`next lint` used as-is.** It works and passes cleanly on 15.5.24, but
   Next has deprecated it in favor of the plain ESLint CLI (removal targeted
   for Next 16). Not migrating now since it works today; flagging so it
   isn't a surprise on a future Next upgrade.

---

## Step 2B — Design tokens & global visual foundation

Added on top of the Step 2 scaffold. Still no chapter content — this
establishes the system every chapter will inherit.

### New files

```
src/styles/tokens.css                    ← single source of truth: color,
                                            spacing, radius, shadow, motion,
                                            content-width variables
src/app/globals.css                      ← rewritten: imports tokens.css,
                                            base element styles, focus,
                                            selection, reduced-motion,
                                            semantic typography classes
src/app/layout.tsx                       ← rewritten: wires font CSS vars
tailwind.config.ts                       ← rewritten: every value maps to
                                            a CSS variable, nothing hardcoded
src/fonts/index.ts                       ← next/font/local setup (see below)
src/fonts/inter/*.ttf, OFL.txt           ← real font files + license
src/fonts/manrope/*.ttf, OFL.txt         ← real font files + license
src/fonts/ibm-plex-mono/*.ttf, OFL.txt   ← real font files + license
src/lib/motion.ts                        ← Framer Motion duration/easing
                                            tokens, default entrance
src/components/primitives/Container.tsx  ← Container + Section layout
                                            primitives
src/components/primitives/ContinuityLine.tsx ← the reusable line primitive
src/app/design-system/page.tsx           ← isolated token-preview route,
                                            delete-safe, not part of the site
```

### Color tokens

| Token | Value | Role |
|---|---|---|
| `--color-background` | `#faf7f1` | warm paper base |
| `--color-surface` | `#ffffff` | raised surfaces/cards |
| `--color-surface-sunken` | `#f2ede3` | recessed panels |
| `--color-ink` | `#16151a` | primary text (near-black, not pure black) |
| `--color-ink-muted` | `#6b6660` | secondary text |
| `--color-ink-faint` | `#a39d93` | tertiary/disabled |
| `--color-border` | `rgba(22,21,26,.12)` | hairline dividers |
| `--color-accent` | `#1f6f5c` | continuity line, interactive states |
| `--color-accent-muted` / `-wash` | `#6fa396` / `#e7efec` | secondary accent, tints |
| `--color-red` | `#a6332b` | pricing/CTA/handoff bridge only |
| `--color-red-muted` / `-wash` | `#c77c74` / `#f3e4e2` | red tints |

**Accent rationale:** a deep, desaturated verdigris — chosen specifically to avoid Tailwind-blue, SaaS-purple, AI-cyan, and startup-orange/amber. It reads as considered and technical without matching what every other product in this space already uses, and it sits comfortably next to both the warm paper background and the reserved red without competing with it.

### Typography

Three semantic type families, each bound to a CSS variable consumed everywhere else (`--font-display`, `--font-body`, `--font-mono`) — no component ever references a font by name.

- **Display:** approved spec calls for **General Sans** (Fontshare). Fontshare's CDN isn't in this environment's network allowlist, and its files aren't in an official redistribution-safe repo the way Inter/IBM Plex are, so I couldn't fetch licensed files here to verify a real build. **Manrope** (OFL, official Google Fonts repo) is substituted as a close-in-spirit placeholder so the display scale/tracking system could be built and tested for real. Swapping in real General Sans later is a one-file change in `src/fonts/index.ts` — nothing else touches it by name. **Flagging for your call:** send over the licensed General Sans files (or approve keeping Manrope) whenever convenient — not blocking.
- **Body/UI:** Inter (OFL, official Google Fonts repo) — as specified.
- **Technical/data:** IBM Plex Mono (OFL, IBM open source) — as specified.

All three are loaded via `next/font/local` from files bundled in the repo, not `next/font/google` — this build environment's network allowlist doesn't include Google's font CDN, so `next/font/google` couldn't be verified working here. Bundling local files also means zero runtime dependency on an external font CDN in production, which is arguably better practice anyway (privacy, performance, no external SPOF). Each family's `OFL.txt` license is kept alongside its files for provenance.

Semantic classes in `globals.css`: `text-display-xl/lg/md`, `text-heading-lg/md/sm`, `text-body-lg/md/sm`, `text-label`, `text-mono`, `text-price` — all fluid (`clamp()`) where size needs to scale, hierarchy built from size + weight + line-height + tracking together, not raw boldness.

### Continuity-line primitive

`<ContinuityLine>` renders an SVG `<path>` — either a straight line from an `orientation` prop (`vertical`/`horizontal`) or a fully custom `path` string for curves/branches later. Takes `progress` (a number or a Framer Motion `MotionValue`, for future scroll-driven drawing), `color` (`accent`/`red`/`ink-muted`), and `thickness`. No chapter is hardcoded into it — each future chapter feeds it a different path/orientation and the same component renders every instance. Reduced motion (or no `progress` supplied) always renders fully drawn.

### Motion foundation

`src/lib/motion.ts` mirrors the CSS duration/easing tokens as JS literals (Framer Motion can't consume CSS variables), plus a `fadeSettle` default (opacity+12px→0, 320ms, settle ease) that every chapter reaches for unless a moment has specifically earned something more — per the spec, that's the one still-undefined task-consolidation spring, not built here.

### Accessibility & responsive foundation

- `:focus-visible` always shown (2px accent outline, 3px offset) — never suppressed
- `prefers-reduced-motion: reduce` zeroes out durations at the token level *and* forces near-instant transitions globally in `globals.css`, so reduced motion is enforced even if a future component forgets to check it
- Selection color set explicitly (accent bg, paper text)
- Gutter tokens (`gutter-mobile`/`-tablet`/`-desktop`) and content-width tokens (`narrow`/`editorial`/`wide`/`content-max`) are consumed by `Container`, so responsive behavior is centralized rather than re-declared per chapter later

### Validation results

- `npm install` → clean, 380 packages
- `tsc --noEmit` → 0 errors (caught and fixed one real bug: a code comment containing the literal text `fonts/*/OFL.txt` accidentally closed early because `*/`  appears inside that path — rewritten to avoid the collision)
- `next lint` → 0 warnings/errors
- `next build` → succeeds; both routes (`/`, `/design-system`) prerender static
- Ran `next start` and hit both routes for real: HTTP 200 on each, all 7 expected `@font-face` rules present in the shipped CSS, all 3 font binaries served with byte sizes matching the source downloads, CSS variables (e.g. `--color-accent:#1f6f5c`, `--space-chapter:12rem`) resolve correctly in the built output, and the token-preview page's actual content (heading text, the `$20` price token, the SVG line primitive) is present in the rendered HTML
- Diffed the extracted repo against a fresh unzip of the original upload — byte-for-byte identical, confirming nothing outside `website/` was touched
- No new dependencies were added in this step — reused framer-motion and clsx already installed in Step 2

### Known residual item (non-blocking)

`npm audit` shows one high-severity advisory for `postcss@8.4.31`, but it's
nested *inside* `next`'s own bundled build tooling
(`node_modules/next/node_modules/postcss`) — not a dependency this project
controls via `package.json`, and not something our code touches. Our own
top-level `postcss` (used by Tailwind) is `8.5.26`, which is unaffected. The
only fix path npm offers is forcing a Next 16 upgrade, which you asked to
avoid unless required — so this is left as-is and noted for future review.
