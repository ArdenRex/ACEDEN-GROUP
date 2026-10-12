# Step 2.1 — Design Tokens (black / orange)

## Files changed (6)
- src/styles/tokens.css: palette inverted, glow shadows added, new tokens (variable NAMES unchanged)
- tailwind.config.ts: +4 colour mappings (orange-bright, surface-card, on-accent, border-glow)
- src/app/globals.css: color-scheme light -> dark (native scrollbar/form chrome)
- src/app/layout.tsx: viewport themeColor #faf7f1 -> #070707
- src/components/nav/PersistentNav.tsx and src/components/chapters/Chapter08GiveItTheWork.tsx: CTA text colour var(--color-ink-on-dark) -> var(--color-on-accent) (one line each; no text changed)

## Token values (measured reference palette, refined)
| Token | Old | New |
|---|---|---|
| --color-background | #faf7f1 | #070707 |
| --color-surface / surface-sunken | #fff / #f2ede3 | #15110D / #0D0B09 |
| --color-ink / ink-muted / ink-faint | #16151a / #6b6660 / #a39d93 | #F7F5F1 / #B8B1A8 / #8A8379 |
| --color-border / border-strong | ink 12% / 24% | orange 18% / 38% (rgba 255,148,26) |
| --color-red (now "the accent") | #a6332b | #FF7900 |
| --color-red-muted / red-wash | #c77c74 / #f3e4e2 | #C4681A / #2A1708 |
| --color-gold / gold-soft | #d98e2b / #f0c98a | #FFB347 / #FFD08A |
| --gradient-accent | red -> gold | #FF7900 -> #FF941A |
| --color-surface-dark (product window) | #121116 | #15110D |
| --color-ink-on-dark / muted-on-dark | #f3efe7 / #9a948c | #F7F5F1 / #B8B1A8 |
| --color-red-on-dark | #e2493d | #FF941A |
| --color-focus-ring | ink | #FF941A |
| NEW --color-orange-bright, surface-card, on-accent, border-glow | — | #FF941A, #17120E, #120A03, rgba(255,121,0,.5) |
| NEW --glow-orange-soft / --glow-orange-strong | — | orange box-shadow glows |
Shadows (xs, sm, product-window, product-window-glow, glow-accent) re-tuned to black + orange halos.

## Contrast (WCAG, computed)
ink/bg 18.5 · ink-muted/bg 9.5 · ink-faint/bg 5.4 · orange/bg 7.7 · orange-bright/bg 9.1 · orange/surface 7.1 · ink-muted/surface 8.9 · on-accent/orange 7.5 (AA/AAA).
The old light text on the orange CTA would be only 2.3:1 (fails), which is why the two CTA buttons now use --color-on-accent.

## Checks
- tsc --noEmit: PASS · next build: PASS (`/` 196 kB, 340 kB first-load, unchanged)
- Screenshots (desktop 1440, redesign-after/step-2.1/): hero, Ch02, Ch04, Ch08 — the whole page is now black with orange glow, orange nav CTA with dark text, orange focus/active indicators.

## Known / expected leftovers (handled in later steps)
- The five 3D scenes still use their own old hex constants: hero nodes still red/gold-brown, Organize3D tiles still cream, violet still in People/Ecosystem/Scale. (Steps 3.4, 5.x)
- Some components may still use the old "paper vs dark" logic (chapterSurfaces DARK_CHAPTER_IDS, data-theme, ScrollProgressRail, AmbientDust). (Step 2.5 / 3.x)
- Typography, radius, spacing, pill buttons, glass cards: Steps 2.2–2.4.
- Ch04/Ch08 screenshots show pinned-scene moments that are mostly dark at the sampled scroll position (same as baseline behaviour); a fuller visual pass happens in 2.5.
- Text content untouched.
