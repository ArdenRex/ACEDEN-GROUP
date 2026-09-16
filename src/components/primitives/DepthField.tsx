'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * DepthField — beauty-pass step 2 ("fill the empty chapters"),
 * extended in step 4 to Chapter 07, the one remaining full-bleed dark
 * chapter that had no ambient texture layer at all (its own
 * `ChaosVignette` is a momentary narrative flash, not ambience), and
 * extended again on explicit follow-up direction ("chapter 3 is
 * looking very empty") with a `paper` variant for Chapter 03's light
 * surface — much lower orb opacity than the dark variants (a shape
 * reads far more strongly against white paper than a near-black
 * field), warm surface-sunken tone instead of neutral ink, and
 * `SecondaryGrid`'s dot color switched to the light-theme border
 * token via its new `surface` prop. Chapter 03's own "bare words in
 * open space, no card, no border" mechanic is untouched — this sits
 * behind it as atmosphere, not a container.
 *
 * Chapters 05 and 06 each already have a `FieldTexture`: one soft
 * radial wash plus one flat dot/tick grid. That reads correctly as
 * "restrained," per the rest of the site's ink-on-paper language, but
 * on an otherwise mostly-empty full-bleed dark viewport it also reads
 * as thin — a single texture layer with a handful of small marks
 * floating in a lot of unclaimed space.
 *
 * This adds two more layers, shared by all three dark chapters so
 * they gain real depth without duplicating logic or drifting out of
 * sync with each other stylistically. Chapters 02–04 are deliberately
 * left out: their whitespace is the point (see
 * STEP-2C-DESIGN-DIRECTION-HANDOFF.md on the paper layer's "generous
 * whitespace" as an explicit design choice, not an oversight), and
 * Chapter 04's own dark surface is a floating product-window panel
 * that already carries its own content, not an empty field:
 *
 * AmbientOrbs — two or three heavily blurred shapes per chapter that
 * drift and breathe on slow independent loops, the same technique
 * HeroGlow uses for the hero. Bold pass: one of each chapter's three
 * orbs now carries --gradient-accent instead of neutral ink — real,
 * visible color threaded through the dark chapters on explicit
 * direction, not just Chapter 01 and the CTA. The other two orbs stay
 * neutral ink-tone, so the accent orb reads as a genuine warm light
 * source in the field rather than a wash, and SignalDot/WorkOrigin's
 * pulse still stand out as the sharper, small, saturated marks against
 * this larger, softer glow.
 *
 * SecondaryGrid — a second, coarser dot pattern sitting behind the
 * chapter's own fine grid, breathing in and out on its own slow loop,
 * offset half a cell from the first so the two never simply overlay
 * into one grid. Two grids at different densities is what makes a
 * flat field read as layered space rather than a single wallpaper
 * tile.
 *
 * Both pieces are pure ambience: aria-hidden, pointer-events-none,
 * and — unlike the chapters' own scroll-scrubbed content — not driven
 * by scrollYProgress at all. They're meant to feel like the room the
 * scroll-driven content is happening *in*, not more of the content
 * itself, so they loop independently rather than tracking scroll.
 *
 * Reduced motion: orbs render as fixed, unanimated shapes at their
 * midpoint opacity (still adds visual depth to the static frame,
 * still perfectly still); the secondary grid renders at a fixed
 * opacity with no breathing. Neither ever animates when the user has
 * asked for less motion.
 */

interface Orb {
  top: string;
  left: string;
  size: string;
  opacity: [number, number, number];
  duration: number;
  delay: number;
  driftX: [number, number, number, number];
  driftY: [number, number, number, number];
  /** Bold pass: true for the one or two orbs per field allowed to carry
   * --gradient-accent instead of neutral ink — real color threaded
   * through the dark chapters, not just Chapter 01 and the CTA. Kept
   * to a minority of each field's orbs so warmth reads as atmosphere,
   * not a wash — the neutral orbs still carry most of the depth. */
  accent?: boolean;
  /** STEP 51: explicit literal color/gradient, overriding both `accent`
   * and the variant's neutral baseColor. Added for Chapter 05's
   * violet/blue redesign so its orbs can carry that chapter's specific
   * palette without changing `accent`'s meaning (still --gradient-accent)
   * for every other variant. Optional — every existing orb with neither
   * `color` nor `accent` set keeps its exact prior look. */
  color?: string;
}

// STEP 53: back to neutral — STEP 51's full-saturation violet+blue pair
// (on top of Chapter 05's own aurora, its dot-grids, and 18 colored glass
// gems) was part of what made the field read as a bright decorative
// scatter rather than designed depth. This variant now matches the same
// restrained pattern ECOSYSTEM_ORBS/SCALE_ORBS already use: two neutral
// ink-tone orbs for depth, one accent orb (brand red/gold) for warmth —
// color stays rare here too, so it still means something when Chapter
// 05's own cluster-arrival glow (see Chapter05People.tsx) shows up.
const NETWORK_ORBS: Orb[] = [
  {
    top: '-8%',
    left: '62%',
    size: '50vmax',
    opacity: [0.1, 0.16, 0.1],
    duration: 30,
    delay: 0,
    driftX: [0, -3, 1.5, 0],
    driftY: [0, 2, -1, 0],
  },
  {
    top: '58%',
    left: '-12%',
    size: '40vmax',
    opacity: [0.08, 0.14, 0.08],
    duration: 36,
    delay: 4,
    driftX: [0, 2.5, -1.5, 0],
    driftY: [0, -2, 1.5, 0],
  },
  {
    top: '72%',
    left: '78%',
    size: '30vmax',
    opacity: [0.08, 0.14, 0.08],
    duration: 26,
    delay: 9,
    driftX: [0, -2, 1, 0],
    driftY: [0, 1.5, -2, 0],
    accent: true,
  },
];

const ECOSYSTEM_ORBS: Orb[] = [
  {
    top: '5%',
    left: '10%',
    size: '42vmax',
    opacity: [0.08, 0.14, 0.08],
    duration: 33,
    delay: 2,
    driftX: [0, 2, -1.5, 0],
    driftY: [0, -1.5, 2, 0],
  },
  {
    top: '64%',
    left: '86%',
    size: '48vmax',
    opacity: [0.12, 0.2, 0.12],
    duration: 37,
    delay: 6,
    driftX: [0, -2.5, 1.5, 0],
    driftY: [0, 2, -1.5, 0],
    accent: true,
  },
  {
    top: '30%',
    left: '48%',
    size: '26vmax',
    opacity: [0.05, 0.09, 0.05],
    duration: 24,
    delay: 12,
    driftX: [0, 1.5, -1.5, 0],
    driftY: [0, -1, 1.5, 0],
  },
];

const SCALE_ORBS: Orb[] = [
  {
    top: '-10%',
    left: '20%',
    size: '46vmax',
    opacity: [0.08, 0.15, 0.08],
    duration: 29,
    delay: 1,
    driftX: [0, -2, 2, 0],
    driftY: [0, 2.5, -1, 0],
  },
  {
    top: '46%',
    left: '96%',
    size: '40vmax',
    opacity: [0.12, 0.2, 0.12],
    duration: 34,
    delay: 5,
    driftX: [0, -2.5, 1, 0],
    driftY: [0, -2, 1.5, 0],
    accent: true,
  },
  {
    top: '88%',
    left: '30%',
    size: '32vmax',
    opacity: [0.06, 0.11, 0.06],
    duration: 27,
    delay: 10,
    driftX: [0, 2, -1.5, 0],
    driftY: [0, -1.5, 1, 0],
  },
];

/** Paper (light-surface) orbs — much lower opacity than the dark-chapter
 * orbs, since any shape reads far more strongly against white paper than
 * against a near-black field. Warm surface-sunken tone plus one faint
 * accent orb, not the neutral ink used on dark, so it reads as a soft
 * warm patch of light rather than a grey smudge. */
const PAPER_ORBS: Orb[] = [
  {
    top: '-14%',
    left: '68%',
    size: '46vmax',
    opacity: [0.4, 0.6, 0.4],
    duration: 32,
    delay: 0,
    driftX: [0, -2.5, 1.5, 0],
    driftY: [0, 2, -1, 0],
  },
  {
    top: '54%',
    left: '-16%',
    size: '38vmax',
    opacity: [0.35, 0.55, 0.35],
    duration: 38,
    delay: 5,
    driftX: [0, 2, -1.5, 0],
    driftY: [0, -1.5, 2, 0],
  },
  {
    top: '68%',
    left: '74%',
    size: '20vmax',
    opacity: [0.06, 0.1, 0.06],
    duration: 25,
    delay: 10,
    driftX: [0, -1.5, 1, 0],
    driftY: [0, 1.5, -1.5, 0],
    accent: true,
  },
];

export function AmbientOrbs({ variant }: { variant: 'network' | 'ecosystem' | 'scale' | 'paper' }) {
  const prefersReducedMotion = useReducedMotion();
  const orbs = variant === 'network' ? NETWORK_ORBS : variant === 'ecosystem' ? ECOSYSTEM_ORBS : variant === 'scale' ? SCALE_ORBS : PAPER_ORBS;
  // STEP 36: the paper orbs' original tone (--color-surface-sunken,
  // a warm off-white) sits almost on top of Chapter 03's own page
  // background, so at any reasonable opacity they were nearly
  // invisible in practice — part of why the chapter still read as
  // flat/empty even with this layer present. --color-border-strong
  // is a low-alpha ink tone instead of another near-white, so the
  // same soft shapes now actually register as gentle warmth/shadow
  // against the paper rather than disappearing into it.
  const baseColor = variant === 'paper' ? 'var(--color-border-strong)' : 'var(--color-ink-muted-on-dark)';

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: orb.color ?? (orb.accent ? 'var(--gradient-accent)' : baseColor),
            filter: 'blur(80px)',
          }}
          initial={false}
          animate={
            prefersReducedMotion
              ? { opacity: orb.opacity[1], x: 0, y: 0 }
              : { opacity: orb.opacity, x: orb.driftX.map((v) => `${v}vmax`), y: orb.driftY.map((v) => `${v}vmax`) }
          }
          transition={prefersReducedMotion ? undefined : { duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function SecondaryGrid({ id, surface = 'dark' }: { id: string; surface?: 'dark' | 'paper' }) {
  const prefersReducedMotion = useReducedMotion();
  const dotColor = surface === 'paper' ? 'var(--color-border)' : 'var(--color-border-on-dark)';

  return (
    <motion.svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      initial={false}
      animate={prefersReducedMotion ? { opacity: 0.22 } : { opacity: [0.14, 0.26, 0.14] }}
      transition={prefersReducedMotion ? undefined : { duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="translate(7 7)">
          <circle cx="0.55" cy="0.55" r="0.45" fill={dotColor} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
    </motion.svg>
  );
}
