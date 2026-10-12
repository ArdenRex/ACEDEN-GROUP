# Step 3.6 — Hero verification (1440x900 + 390 mobile, WebGL off)
Screenshots: redesign-after/step-3.6/. Compared against the reference hero.
Found: after the 3.3 size increase, the "?" wrapped onto its own line ("? Make it").
Fixed: "Friday" + "?" now share a non-breaking span (markup only; words, order, case, punctuation identical). Headline now wraps "Can Sarah / finish the / onboarding docs / by Friday? Make / it high priority."
Mobile 390px: no horizontal overflow (scrollWidth 390).
Matches reference: dark/orange glow, pill eyebrow, heavy tight headline, orange-rimmed panel platform, orange ridge glow, orange nav CTA.
Remaining differences (content lock / not yet built): no description, CTA buttons, benefit ticks, floating app icons or task cards; no large glowing 3D object; panel is empty in the idle capture (it fills on scroll); orange words only show during scroll; 3D node network not captured (WebGL off).
Checks: tsc PASS, build PASS.
