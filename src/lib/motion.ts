/**
 * Motion foundation. Framer Motion can't consume CSS custom
 * properties directly, so these literal values mirror the durations
 * and easings defined in src/styles/tokens.css — keep both in sync if
 * either changes.
 *
 * No chapter animations are defined here. This is the vocabulary
 * later chapters compose from, not a components library.
 */

export const duration = {
  fast: 0.15,
  base: 0.32,
  slow: 0.42,
} as const;

export const ease = {
  /** Default for nearly everything: calm fade+settle, no bounce. */
  settle: [0.22, 1, 0.36, 1],
  /** Standard material-style ease, for simpler UI-state transitions. */
  standard: [0.4, 0, 0.2, 1],
} as const;

/**
 * The default entrance every chapter reaches for unless a moment has
 * specifically earned something more special (per the approved spec,
 * there is exactly one such moment later — the task-consolidation
 * spring — and it is not defined here).
 */
export const fadeSettle = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-10% 0px' },
  transition: { duration: duration.base, ease: ease.settle },
} as const;

/** Subtle default for hover/focus/tap state changes on interactive elements. */
export const interactionTransition = {
  duration: duration.fast,
  ease: ease.standard,
} as const;

/**
 * The smoothing filter every scroll-scrubbed chapter runs its
 * `scrollYProgress` through before deriving any position/opacity/scale
 * from it. A mouse wheel dispatches scroll in discrete jumps (no
 * momentum), so the raw value — and everything computed from it —
 * jumps in the same discrete steps instead of gliding, which reads as
 * stutter no matter how generous the scroll distance is. A trackpad's
 * own momentum partially masks this; a wheel doesn't.
 *
 * Overdamped on purpose (damping > critical for this stiffness/mass)
 * so it settles without bounce or overshoot — a word or panel arriving
 * with a spring wobble reads as broken, not smooth.
 *
 * One shared constant so every chapter's scroll feels like the same
 * hand is turning the page, rather than each chapter tuning its own
 * feel independently.
 */
export const scrollSmoothing = { stiffness: 300, damping: 40, mass: 1, restDelta: 0.0005 } as const;

/**
 * Mirrors --color-background / --color-surface-dark from tokens.css.
 * Framer can interpolate between color strings inside useTransform,
 * but only real color values — not a CSS custom property reference —
 * so a scroll-driven paper<->dark crossfade (the hand-off into/out of
 * a dark chapter) needs its own literal pair here, same reasoning as
 * duration/ease above.
 */
export const surfaceColor = {
  paper: '#faf7f1',
  dark: '#121116',
} as const;
