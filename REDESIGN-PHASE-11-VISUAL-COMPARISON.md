# Phase 11 — Visual comparison against the reference
Captured: full page at 1440 wide in static (reduced-motion) mode, 7542px tall (redesign-after/step-11/full-page-static-1440.jpg). The live page is a ~30000px pinned-scroll experience, so a full-page shot only shows its static form, not the animated scenes or WebGL.
Compared section by section (reference sections that exist on your site only):
- Navigation: dark bar, orange CTA pill, orange hairline - matches.
- Hero: black/orange glow, ridge horizon, heavy headline, orange emphasis words, product panel on glowing platform - matches the look; reference's description, buttons, ticks, floating icons are absent (content lock).
- Workflow (Ch02), Organize (Ch03), Workspace (Ch04): dark glass cards, amber borders, orange glow - consistent with the reference.
- People/Ecosystem/Scale (Ch05-07): warm orange palette in 3D + atmospheric haze.
- Final CTA + footer: amber-bordered input card, ridge-glow band, dark footer - matches the reference's closing rhythm in spirit; reference's multi-column footer/newsletter absent (content lock).
Sections that do not exist on your site and were therefore not built: integration logo strip as a separate band, case studies, process timeline, tech grid, testimonials, FAQ.
Fix made this phase: static backgrounds in Ch05-Ch07 read as muddy brown clouds (low-opacity orange on near-black). Darkened the orb colour (#B8651A -> #8F4C10) and Ch05 undertone (#2A1708 -> #1D1006). Result is slightly cleaner but still brownish compared with the reference's near-black with sharp orange light.
Remaining differences (honest list): Ch05-07 and parts of Ch03 have large empty dark areas in static form; backgrounds are softer/browner than the reference's crisp black + bright orange; no large hero 3D object, no floating app icons; 3D scenes unseen on a real GPU.
Checks: tsc, lint, build pass.
