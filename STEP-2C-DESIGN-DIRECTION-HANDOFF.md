# Step 2C — Design Direction Handoff

*No code was changed for this step except this document. Chapter 1 has
not started. This records the audit of Step 2B and the visual-direction
decision, per explicit instruction.*

---

## 1. Audit of the Step 2B foundation

What Step 2B actually established, and how much of it is direction-independent
(survives any of the three options below) vs. direction-specific (tied to the
warm-paper/verdigris choice specifically):

| Step 2B piece | Direction-independent? |
|---|---|
| Spacing scale (`micro` → `chapter`), gutter/width tokens | Yes — pure geometry, no color opinion |
| Radius scale (hairline, restrained) | Yes |
| Shadow scale (near-absent by default) | Yes — though a direction leaning darker/more "product-window"-like may want one deliberate exception (see §6) |
| Motion tokens (durations, easing, `fadeSettle`) | Yes |
| Typography *architecture* (semantic classes, fluid scale, three-family system) | Yes — the classes and scale logic hold regardless of which typefaces or colors sit inside them |
| `Container` / `Section` primitives | Yes |
| `ContinuityLine` primitive | Yes, structurally — but its default `color` prop values (`accent` / `red` / `ink-muted`) name a specific palette that may need to change |
| Color tokens (`--color-background`, `--color-ink`, **`--color-accent` (verdigris)**, `--color-red`) | **Partially direction-specific** — background/ink/red are reasonable in more than one direction; the verdigris `accent` is the one token that was a direction-specific bet, not an architectural necessity |
| Font choices (Inter, Manrope-as-placeholder, IBM Plex Mono) | Direction-independent per your instruction — approved to keep, not rebuilding |

**Conclusion of the audit:** Step 2B's *architecture* — the token system, the
spacing/type/motion scales, the primitives — was built generically enough
that it doesn't lock in a visual direction. The one real creative bet baked
into it was the verdigris accent color, which is exactly the piece this step
reconsiders.

I also re-read the existing product app's code (from the Step 1 repo audit)
for grounding: the live app is currently dark-mode with blue/violet/cyan/amber
accents, which the product is moving away from toward red+black. Nothing in
the current app UI needs to be matched — only the *future* red+black identity
is relevant here, as a destination the marketing site gestures toward.

---

## 2. Three visual directions

### Direction A — "Editorial Precision" (Step 2B as built, continued)

- **Visual character:** warm paper, hairline rules, generous whitespace, very
  quiet. Reads like a well-typeset essay that happens to contain product UI.
- **Color:** off-white paper, near-black ink, verdigris accent, red held back
  entirely until pricing/CTA.
- **Typography:** large but restrained display type; hierarchy from spacing
  and weight, never loud.
- **Motion:** calm fade+settle only; nothing performs.
- **Opening experience:** a single chat message on empty paper, minimal chrome.
- **Why it could fit:** it's genuinely premium-feeling and doesn't look like a
  template — the risk called out in the brief.
- **Risks:** this is the direction most likely to read as "agency portfolio"
  or "minimalist design exercise" — two things explicitly called out as
  failure modes. It also has the weakest link to red+black: verdigris has no
  relationship to the product's future identity, so the "doorway into the
  product" feeling has to be manufactured late (Ch.7–8) rather than felt
  throughout.
- **Memorability:** moderate. Restraint reads as taste, but restraint alone
  doesn't make someone stop scrolling.
- **Bridge to red+black:** weak. The accent color is disconnected from the
  destination; red only shows up as an ending, not a thread.

### Direction B — "Operations Console" (dark-first, red-as-alarm)

- **Visual character:** near-black background from the first viewport, warm
  off-white text, red used as an active/alert signal throughout — closer to a
  flight-deck or terminal aesthetic.
- **Color:** near-black base, off-white text, red as the single saturated
  color for state changes (priority=High/Critical, live extraction, CTA).
- **Typography:** monospace-forward, technical.
- **Motion:** sharper, more mechanical — think readouts updating, not soft fades.
- **Opening experience:** the chat message appears on a dark terminal-like
  surface, already close to the future product.
- **Why it could fit:** maximum, immediate connection to the red+black
  product — there's no "transition" to stage because it starts there.
- **Risks:** this is the direction most likely to collapse into "AI startup
  cliché" — dark mode + one accent color is *the* current pattern for AI
  products, which the brief explicitly warns against. It also fights the
  earlier locked instruction that the marketing site stay light-mode-first
  and premium/editorial rather than becoming the red/black product itself
  ahead of schedule.
- **Memorability:** could be high, but for the wrong reason — it risks
  blending into a genre rather than standing outside it.
- **Bridge to red+black:** strong, arguably too strong — there's no journey
  left to make once you're already there in Chapter 1.

### Direction C — "The Instrument" (light-first, with staged dark product-windows) — recommended, see §3

- **Visual character:** keeps Direction A's calm paper/ink foundation, but
  introduces a second surface — a near-black "product-window" frame, styled
  like an actual application screen — that appears small and rare early on
  and grows larger, more frequent, and more dominant as the page progresses,
  until it's the dominant surface by the pricing/CTA chapters.
- **Color:** paper + ink for the editorial layer (unchanged from Step 2B);
  a new near-black surface + off-white text for the product-window layer;
  red demoted from "one of several UI accents" to "the only saturated color
  in the entire system," appearing exclusively where the product is *doing*
  something — extraction happening, a Critical/High priority tag, the price,
  the final CTA. The verdigris accent is retired.
- **Typography:** unchanged architecture; display type gets to be more
  confident/large at true narrative beats (the transformation moments)
  rather than uniformly restrained throughout.
- **Motion:** Direction A's calm default for the editorial layer; the
  product-window moments get slightly more precise, mechanical transitions
  (still no bounce) to feel like software responding, not a page animating.
- **Opening experience:** a single message on paper, exactly as Direction A
  proposed — because the brief's own Chapter 1 idea (a message appearing,
  the system starting to understand it) is genuinely strong and doesn't need
  reinventing. The difference from A shows up starting Chapter 2, when the
  first small dark product-window appears around the extracted fields.
- **Why it fits:** it satisfies "premium/cinematic/interactive" (the paper
  layer) *and* "doorway into red+black product" (the growing dark layer) at
  the same time, without going full dark-mode too early. The visual
  progression — light page slowly giving way to dark product screens — *is*
  the page's own version of "conversation → understanding → task → workflow"
  playing out visually, not just narratively. It also makes red rare and
  meaningful by construction, directly satisfying "the red should have
  meaning."
- **Risks:** requires discipline — if the dark product-windows show up too
  often or too early, it collapses into Direction B's risk (looking like a
  generic dark AI product). The size/frequency progression has to be real,
  not decorative.
- **Memorability:** high — "a light page that's visibly turning into dark
  software as you scroll" is a genuinely uncommon structural idea, not a
  reskin of an existing pattern.
- **Bridge to red+black:** the strongest of the three, and the only one that
  makes the transition feel *earned* rather than either absent (A) or
  instant (B).

---

## 3. Recommendation: Direction C — "The Instrument"

Direction C is the only one of the three that treats "doorway into the
product" as a structural idea rather than a color choice. It keeps
everything Step 2B got right (the paper/ink editorial layer already reads as
premium and un-templated) while giving red an actual job — signaling that
the system is alive — instead of decorating a pricing section.

---

## 4. How Direction C evolves through the full site

| Chapter | Editorial (paper) layer | Product-window (dark) layer | Red |
|---|---|---|---|
| 01 Conversation | Full — a message on empty paper | None yet | None |
| 02 Understanding | Dominant | First appearance — small, framed, around the 3 extracted fields only | A field label pulses/lights briefly as it's "understood" |
| 03 Task | Dominant | Slightly larger — the consolidated task card | Priority tag, if High/Critical |
| 04 Workflow | Shrinking | Larger still — the Kanban board itself lives inside the dark frame | Priority tags in-board |
| 05 Team | Balanced | A role-switcher panel in the dark frame | none required |
| 06 Connections | Balanced | The task's journey between tools rendered in the dark frame | the "in-flight" moment as a task moves |
| 07 Workspace/Price | Shrinking | Large — pricing is staged *inside* the dark frame, like a receipt from the product itself | the price figure itself, and the fixed-$20 demonstration |
| 08/09 CTA | Minimal | Dominant — CTA sits on/near the dark surface | the CTA button |

The continuity line evolves the same way it always was going to (per the
approved concept) — it just now also carries the job of visually stitching
the paper layer to the product-window layer at each transition, rather than
only living on the paper.

---

## 5. Token changes

**Retire:**
- `--color-accent` / `--color-accent-muted` / `--color-accent-wash`
  (verdigris) — no longer used for general UI interactivity. General
  interactive states (links, hover, focus) move to ink-weight/underline
  treatments instead of a second hue, so red stays the only saturated color
  in the system.

**Add:**
- `--color-surface-dark` — the product-window background (near-black, e.g.
  in the `#0e0d10` range, distinct from pure `--color-ink` so it can sit as
  its own layer rather than reading as "text-colored").
- `--color-ink-on-dark` — near-white text for use inside product-windows.
- `--color-ink-muted-on-dark` — secondary text on dark.
- `--color-border-on-dark` — hairline borders on dark surfaces.
- `--color-red-on-dark` — the same red family, contrast-checked against
  `--color-surface-dark` specifically (it may need a slightly different
  lightness than `--color-red` reads correctly on paper).
- One deliberate shadow exception for the product-window (`--shadow-frame`
  or similar) — the single place Step 2B's "almost no shadow" rule bends,
  because these frames are meant to read as distinct physical
  objects/screens sitting on the page, which is the one case Step 2B's own
  shadow section already carved out an exception for.

**Keep unchanged:**
- `--color-background`, `--color-surface`, `--color-surface-sunken`
- `--color-ink`, `--color-ink-muted`, `--color-ink-faint`
- `--color-border`, `--color-border-strong`
- `--color-red`, `--color-red-muted`, `--color-red-wash` (still the pricing/
  CTA/handoff palette — now also the general "system is alive" signal)
- All spacing, radius, motion, and content-width tokens
- The full typography architecture

---

## 6. New primitives needed before Chapter 1

- **`ProductWindow`** — the dark frame primitive. Needs a `size` or `scale`
  prop (so it can be small in Ch.02 and large by Ch.08), dark
  background/text/border tokens, and the one shadow exception. This is the
  one genuinely new primitive Direction C requires.
- **`SignalDot`** — a small red indicator for "the system is actively
  processing" (e.g., during the live extraction demo). Must have a fully
  static (non-pulsing) rendering under `prefers-reduced-motion`, per the
  existing accessibility foundation.

Both are content-agnostic — same rule as `ContinuityLine`: no chapter logic
baked in, just a reusable dark-surface/signal-color primitive that later
chapters compose with.

I'm deliberately **not** building a scroll-stage/camera primitive in this
step, even though Chapter 1 planning will likely want one — that's
chapter-specific enough that it should be scoped and reviewed with the
Chapter 1 handoff, not added speculatively now.

---

## 7. Architecture confirmation

The Step 2B architecture supports this without a rebuild:
- Tokens are already centralized in `tokens.css` and consumed via
  `tailwind.config.ts` — adding the dark-surface/on-dark tokens and
  retiring the accent tokens is a contained edit to those two files, not a
  restructuring.
- `Container` / `Section` need no changes — `ProductWindow` composes inside
  them like any other block.
- `ContinuityLine`'s `color` prop already accepts `'accent' | 'red' |
  'ink-muted'` as a union — swapping `'accent'` out (since verdigris is
  retired) for something like `'ink'` as the paper-layer default is a small,
  compatible change to that one file, not an API redesign.
- No new dependencies are required for any of this — no WebGL, no video, no
  particle system. `ProductWindow` and `SignalDot` are both plain
  CSS/SVG components, consistent with the "only use heavy tools when they
  earn their place" instruction.

---

## 8. Status

This step made **no changes to `src/`** — the token/primitive changes
described in §5–§6 are scoped and ready, but implementing them is scoped to
the next step, pending your approval of Direction C (or a different call).
