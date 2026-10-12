# Step 4.4 — Card hover
- Existing primitives already follow the rule: .card-dark/.card-glass have NO hover; only .card-interactive (clickable cards, currently only on /design-system) lifts and glows. Ch02's glass card is non-clickable and stays static.
- Bug found in Ch04 (Workspace) item panels: the hover glow never worked because inline style boxShadow/borderColor overrode the hover class. Moved to new class .panel-hover (globals.css): on hover the border turns orange and a soft orange glow appears; no lift, no pointer cursor, so it doesn't suggest a click. Hover-capable devices only. Same default look as before, no text touched.
- Ch08 buttons/links hover states re-read: still correct on the dark theme.
Checks: tsc, lint, build. Hover not exercised in a browser.
