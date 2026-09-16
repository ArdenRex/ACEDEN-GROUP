'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { SignalDot } from '@/components/primitives/SignalDot';
import { AmbientOrbs } from '@/components/primitives/DepthField';
import { surfaceColor } from '@/lib/motion';

// Dynamic, ssr:false, matching Hero3D/EcosystemDepth3D's own load
// pattern (see Chapter01Conversation.tsx / Chapter06Ecosystem.tsx) —
// keeps the three.js chunk shared/deduped across the site's 3D
// elements instead of bundling a second copy into this page.
const PeopleField3D = dynamic(
  () => import('@/components/primitives/PeopleField3D').then((m) => m.PeopleField3D),
  { ssr: false },
);

// STEP 53 (redesign pass — background, texture, and glow rebuilt from
// scratch, not retinted): Step 51's three-stop diagonal jewel gradient,
// plus two full-strength aurora blobs, plus a doubled dot-grid (a fine
// grid AND SecondaryGrid stacked on top of it) was explicit direction as
// "not working" / reading as childish — a bright decorative backdrop
// competing with itself rather than a designed surface. This pass:
//   - grounds Chapter 05 back in --color-surface-dark, the exact
//     near-black every other dark chapter (06/07) already uses, so this
//     chapter reads as part of the site's one dark-instrument family
//     instead of a standalone "space poster" gradient;
//   - keeps a single quiet violet undertone, gathered from one corner
//     only, as this chapter's one point of departure from flat black —
//     restraint over a multi-stop rainbow;
//   - removes the "polka dot" read entirely: both dot-grid layers are
//     gone, full stop. The faint constellation lines (already in the
//     file, already just lines) now carry the field's whole ambient
//     texture job — which suits "a human network" far better than a
//     grid of dots ever did;
//   - collapses two competing ambient blobs plus a separate edge
//     vignette into ONE glow that only gathers as the cluster actually
//     forms — light with a narrative job (this is where the work is
//     converging), not wallpaper that's on regardless of scroll
//     position. (STEP 55 note: that glow was first built in brand red;
//     explicit follow-up direction was the red wash wasn't working at
//     this scale, so it was dropped in favor of ClusterGlow's existing
//     ink-toned light — see that component and the STEP 55 comment
//     inside FieldTexture below.)
const CH05_UNDERTONE = '#241a44';
const CH05_SURFACE_BASE = `radial-gradient(130% 100% at 16% 8%, ${CH05_UNDERTONE} 0%, var(--color-surface-dark) 60%)`;
// Literal hex (not the CSS var) — framer-motion's color interpolation
// for the paper->dark scroll crossfade needs an actual color to
// interpolate toward, not a custom property. Matches --color-surface-dark
// exactly so the crossfade lands on the same near-black.
const CH05_SURFACE_SOLID = '#121116';

/**
 * Chapter 05 — "The Human Network."
 *
 * COMPLETE REDESIGN — this replaces the previous Ch.05 build in full.
 * That build, despite a genuinely different motion idea underneath,
 * still rendered as a bordered, rounded, drop-shadowed rectangle
 * sitting on the page — the exact "ProductWindow with people inside
 * it" failure this chapter's brief explicitly prohibits. This version
 * has no panel at all. There is no div with a border, a radius, or a
 * shadow anywhere in this file. The sticky viewport itself becomes
 * the dark surface — full-bleed, edge to edge — and every person,
 * signal, and task lives directly in that open field.
 *
 * ----------------------------------------------------------------
 * WHY A FULL-BLEED FIELD INSTEAD OF A GROWING RECTANGLE
 * ----------------------------------------------------------------
 * Chapters 02–04 depict a product window that starts small and grows
 * toward dominance (tokens.css: "becomes dominant by the price/CTA
 * chapters"). Chapter 04 ends at 88% width / 80vh — a large rectangle,
 * but still a rectangle with visible edges on the paper page. Chapter
 * 05 continues that growth curve to its natural next step: the frame
 * disappears and the surface *becomes* the viewport. That single
 * change is what makes this chapter unmistakably different from
 * Chapter 04 in a screenshot with no text and no animation running —
 * the anti-repetition test the brief requires (§32).
 *
 * ----------------------------------------------------------------
 * CAST — WHY PRIYA, SARAH, ALEX, IN THIS ORDER
 * ----------------------------------------------------------------
 * The source signal is Launch Checklist, the one task Chapter 04's
 * climax was about (Sarah was just added to it; its deadline just
 * moved to tomorrow). Its real owners, per Ch.04's own data, are
 * "Marketing" (a department, never a person) and Sarah. Priya is
 * introduced here as that department's lead — no established fact
 * changes, a name is added under one that already existed — and
 * because she is Launch Checklist's most direct owner, she is who
 * the first signal reaches, not an arbitrary "Sarah-first" pick.
 * Every hop after that is causal, not decorative (§06):
 *   Launch Checklist → PRIYA (its owner)
 *   → SARAH (Priya loops in the person just added to the task)
 *   → ALEX (Sarah needs his Client Review finished before launch)
 * Three people, three real reasons, one continuous chain — never
 * three independent reveals racing each other.
 *
 * ----------------------------------------------------------------
 * THREE DIFFERENT ACTIVATION GRAMMARS (§12)
 * ----------------------------------------------------------------
 * PRIYA — "resolve": her mark arrives oversized and blurred, then
 *   sharpens to resting size/focus as the signal is absorbed, with a
 *   single thin ring expanding outward once — a system finding a
 *   match, not a card fading in.
 * SARAH — "rise": her mark sits slightly low and settles upward into
 *   its resting spot exactly as she activates — the second grammar
 *   is a vertical settle, not a resolve.
 * ALEX — "track": no blur, no movement — only his name's letter-
 *   spacing collapses from wide to resting as he's identified, a
 *   purely typographic third grammar so no two of the three repeat.
 *
 * ----------------------------------------------------------------
 * THE NETWORK REORGANIZES, IT DOESN'T JUST REVEAL (§10, §13)
 * ----------------------------------------------------------------
 * All three people and the work signal hold their discovery positions
 * — spread asymmetrically, never a symmetric ring (§11) — until every
 * person is identified. Only then (≈68–85%) do their positions
 * interpolate toward a tight, organic cluster while several unnamed,
 * never-activated presences drift further out and dim (§06's "some
 * people remain inactive" made literal). Every position on screen is
 * one continuous scrollYProgress-driven interpolation — fully
 * reversible, scrubbable, no discrete state swap.
 *
 * ----------------------------------------------------------------
 * SIGNALS ARE CURVES, NOT LINES (§07)
 * ----------------------------------------------------------------
 * NetworkSignal draws a quadratic bezier with a perpendicular bend
 * (never straight), progressively drawn via Framer's `pathLength`,
 * carrying one small traveling mark. It fades in as it starts, holds
 * only briefly once arrived, and recedes — the path is not a
 * permanent diagram edge (§07, §26).
 *
 * ----------------------------------------------------------------
 * THE CLIMAX AND THE CLOSE (§15–16)
 * ----------------------------------------------------------------
 * At ~85% the three people and Launch Checklist sit as a compact,
 * asymmetric cluster — the chapter's visual payoff, never a card or
 * panel. From ~90% the cluster compresses slightly and one quiet
 * signal leaves it toward the viewport's edge — implying connection
 * beyond the team, with no integration logos, setting up Chapter 06.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * A static, fully-resolved field: three quiet presences already
 * clustered around Launch Checklist, unnamed presences faint at the
 * margins, no travel, no ring, no track-in. All relationships are
 * also stated in an sr-only heading.
 *
 * ----------------------------------------------------------------
 * NO VISUAL QA
 * ----------------------------------------------------------------
 * Visual rendering is not available in this environment. Validated
 * via tsc --noEmit, next lint, and next build only.
 */

interface Beat {
  t: number[];
  v: number[];
}
function beat(t: number[], v: number[]): Beat {
  return { t, v };
}
function point(t: number[], x: number[], y: number[]) {
  return { x: beat(t, x), y: beat(t, y) };
}

interface Pt {
  x: number;
  y: number;
}

// ----------------------------------------------------------------
// PHASE FRACTIONS — mirrors the brief's §20 recommended scroll states
// ----------------------------------------------------------------
const WORK_PULSE: [number, number] = [0.06, 0.1];

const SIGNAL_1: [number, number] = [0.1, 0.22]; // Launch Checklist -> Priya
const PRIYA_RESOLVE: [number, number] = [0.22, 0.3];
const PRIYA_ROLE: [number, number] = [0.29, 0.33];
const SIGNAL_1_FADE: [number, number] = [0.3, 0.34];

const SIGNAL_2: [number, number] = [0.36, 0.48]; // Priya -> Sarah
const SARAH_RESOLVE: [number, number] = [0.48, 0.55];
const SARAH_ROLE: [number, number] = [0.54, 0.58];
const SIGNAL_2_FADE: [number, number] = [0.55, 0.58];

const SIGNAL_3: [number, number] = [0.58, 0.68]; // Sarah -> Alex
const ALEX_RESOLVE: [number, number] = [0.68, 0.74];
const ALEX_ROLE: [number, number] = [0.73, 0.77];
const SIGNAL_3_FADE: [number, number] = [0.74, 0.78];

const CLUSTER_START = 0.68;
const CLUSTER_END = 0.85;
const COMPRESS_END = 0.97;
const TEAM_KNIT: [number, number] = [0.85, 0.9];

const INACTIVE_DRIFT: [number, number] = [0.68, 0.85];
const OUTWARD_SIGNAL: [number, number] = [0.9, 1];
const EDITORIAL_LINE: [number, number] = [0.85, 0.9];

type Entrance = 'resolve' | 'rise' | 'track';

// ----------------------------------------------------------------
// DESKTOP — a shared 0-100 field spanning the entire viewport.
// ----------------------------------------------------------------
const D_WORK_START: Pt = { x: 84, y: 14 };
const D_WORK_CLUSTER: Pt = { x: 46, y: 60 };
const D_WORK_FINAL: Pt = { x: 46, y: 58 };

const D_PRIYA_START: Pt = { x: 24, y: 26 };
const D_PRIYA_CLUSTER: Pt = { x: 32, y: 38 };
const D_PRIYA_FINAL: Pt = { x: 34, y: 39 };

const D_SARAH_START: Pt = { x: 70, y: 36 };
const D_SARAH_CLUSTER: Pt = { x: 68, y: 52 };
const D_SARAH_FINAL: Pt = { x: 66, y: 51 };

const D_ALEX_START: Pt = { x: 44, y: 80 };
const D_ALEX_CLUSTER: Pt = { x: 52, y: 26 };
const D_ALEX_FINAL: Pt = { x: 52, y: 28 };
const D_CLIENT_REVIEW_OFFSET: Pt = { x: 9, y: -7 };

const D_INACTIVE: Pt[] = [
  { x: 8, y: 10 },
  { x: 94, y: 18 },
  { x: 18, y: 86 },
  { x: 90, y: 92 },
  { x: 4, y: 52 },
  { x: 50, y: 8 },
  { x: 96, y: 60 },
  { x: 30, y: 94 },
];
const D_INACTIVE_DRIFT: Pt[] = [
  { x: 3, y: 5 },
  { x: 98, y: 12 },
  { x: 12, y: 92 },
  { x: 95, y: 97 },
  { x: 1, y: 54 },
  { x: 50, y: 3 },
  { x: 99, y: 64 },
  { x: 26, y: 98 },
];
const D_OUTWARD_TO: Pt = { x: 97, y: 46 };

// Loose perimeter traced through the inactive presences — pure decoration,
// no data meaning, just enough structure that the margins read as an
// evaluated network rather than random specks.
const D_CONSTELLATION: [Pt, Pt][] = [
  [{ x: 8, y: 10 }, { x: 4, y: 52 }],
  [{ x: 4, y: 52 }, { x: 18, y: 86 }],
  [{ x: 18, y: 86 }, { x: 30, y: 94 }],
  [{ x: 30, y: 94 }, { x: 90, y: 92 }],
  [{ x: 90, y: 92 }, { x: 96, y: 60 }],
  [{ x: 96, y: 60 }, { x: 94, y: 18 }],
  [{ x: 94, y: 18 }, { x: 50, y: 8 }],
  [{ x: 50, y: 8 }, { x: 8, y: 10 }],
];

// ----------------------------------------------------------------
// MOBILE — vertical field: work near top, three people spaced
// through the middle, cluster forms lower-center (§22).
// ----------------------------------------------------------------
const M_WORK_START: Pt = { x: 72, y: 8 };
const M_WORK_CLUSTER: Pt = { x: 40, y: 68 };
const M_WORK_FINAL: Pt = { x: 41, y: 66 };

const M_PRIYA_START: Pt = { x: 28, y: 22 };
const M_PRIYA_CLUSTER: Pt = { x: 28, y: 40 };
const M_PRIYA_FINAL: Pt = { x: 30, y: 41 };

const M_SARAH_START: Pt = { x: 70, y: 44 };
const M_SARAH_CLUSTER: Pt = { x: 64, y: 60 };
const M_SARAH_FINAL: Pt = { x: 62, y: 59 };

const M_ALEX_START: Pt = { x: 36, y: 70 };
const M_ALEX_CLUSTER: Pt = { x: 58, y: 32 };
const M_ALEX_FINAL: Pt = { x: 57, y: 34 };
const M_CLIENT_REVIEW_OFFSET: Pt = { x: 11, y: -8 };

const M_INACTIVE: Pt[] = [
  { x: 85, y: 10 },
  { x: 10, y: 26 },
  { x: 90, y: 44 },
  { x: 14, y: 60 },
  { x: 60, y: 8 },
  { x: 88, y: 76 },
  { x: 20, y: 92 },
  { x: 55, y: 96 },
];
const M_INACTIVE_DRIFT: Pt[] = [
  { x: 92, y: 6 },
  { x: 4, y: 22 },
  { x: 96, y: 40 },
  { x: 8, y: 64 },
  { x: 60, y: 3 },
  { x: 94, y: 80 },
  { x: 14, y: 96 },
  { x: 50, y: 99 },
];
const M_OUTWARD_TO: Pt = { x: 90, y: 72 };

const M_CONSTELLATION: [Pt, Pt][] = [
  [{ x: 60, y: 8 }, { x: 85, y: 10 }],
  [{ x: 85, y: 10 }, { x: 90, y: 44 }],
  [{ x: 90, y: 44 }, { x: 88, y: 76 }],
  [{ x: 88, y: 76 }, { x: 55, y: 96 }],
  [{ x: 55, y: 96 }, { x: 20, y: 92 }],
  [{ x: 20, y: 92 }, { x: 14, y: 60 }],
  [{ x: 14, y: 60 }, { x: 10, y: 26 }],
  [{ x: 10, y: 26 }, { x: 60, y: 8 }],
];

function workPos(start: Pt, cluster: Pt, final: Pt) {
  return point(
    [0, CLUSTER_START, CLUSTER_END, COMPRESS_END, 1],
    [start.x, start.x, cluster.x, final.x, final.x],
    [start.y, start.y, cluster.y, final.y, final.y],
  );
}

function priyaPos(start: Pt, cluster: Pt, final: Pt) {
  // "Resolve" grammar: no positional travel of its own, only holds
  // until the network-wide reorganization begins.
  return point(
    [0, CLUSTER_START, CLUSTER_END, COMPRESS_END, 1],
    [start.x, start.x, cluster.x, final.x, final.x],
    [start.y, start.y, cluster.y, final.y, final.y],
  );
}

function sarahPos(start: Pt, cluster: Pt, final: Pt) {
  // "Rise" grammar: sits ~5 field-units low, settles up into `start`
  // across her own resolve window, then holds until reorganization.
  const lowY = start.y + 5;
  return point(
    [0, SARAH_RESOLVE[0], SARAH_RESOLVE[1], CLUSTER_START, CLUSTER_END, COMPRESS_END, 1],
    [start.x, start.x, start.x, start.x, cluster.x, final.x, final.x],
    [lowY, lowY, start.y, start.y, cluster.y, final.y, final.y],
  );
}

function alexPos(start: Pt, cluster: Pt, final: Pt) {
  // "Track" grammar: purely typographic, no positional travel of its
  // own either — matches Priya's shape, differs only in what reveals.
  return point(
    [0, CLUSTER_START, CLUSTER_END, COMPRESS_END, 1],
    [start.x, start.x, cluster.x, final.x, final.x],
    [start.y, start.y, cluster.y, final.y, final.y],
  );
}

function inactivePos(base: Pt, drift: Pt) {
  return point(
    [0, INACTIVE_DRIFT[0], INACTIVE_DRIFT[1], 1],
    [base.x, base.x, drift.x, drift.x],
    [base.y, base.y, drift.y, drift.y],
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

/**
 * Shared bezier math for a single causal signal: a curved (never
 * straight) path between two field points, driven by scroll. Used by
 * both the SVG path (which can tolerate the parent viewBox's
 * non-uniform scaling — a curve stays a curve) and the HTML travel
 * dot (which cannot: a <circle> inside a `viewBox="0 0 100 100"
 * preserveAspectRatio="none"` gets stretched into an ellipse by the
 * container's real aspect ratio, which is exactly the "childish red
 * pill" artifact from the last round. The dot is rendered as a plain
 * positioned HTML element instead, sized in real px, so it stays
 * perfectly round regardless of viewport shape.
 */
function useSignalTravel(
  scrollYProgress: MotionValue<number>,
  from: Pt,
  to: Pt,
  bend: number,
  drawWindow: [number, number],
  fadeWindow: [number, number],
) {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const ctrl = { x: mid.x + nx * bend, y: mid.y + ny * bend };
  const d = `M ${from.x} ${from.y} Q ${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`;

  const draw = useTransform(scrollYProgress, drawWindow, [0, 1]);
  const opacity = useTransform(
    scrollYProgress,
    [drawWindow[0], drawWindow[0] + 0.015, fadeWindow[0], fadeWindow[1]],
    [0, 1, 1, 0],
  );
  const dotOpacity = useTransform(draw, [0, 0.06, 0.92, 1], [0, 1, 1, 0]);
  const dotX = useTransform(draw, (t) => (1 - t) ** 2 * from.x + 2 * (1 - t) * t * ctrl.x + t ** 2 * to.x);
  const dotY = useTransform(draw, (t) => (1 - t) ** 2 * from.y + 2 * (1 - t) * t * ctrl.y + t ** 2 * to.y);

  return { d, draw, opacity, dotOpacity, dotX, dotY };
}

/** The curved line only — safe to sit inside the shared, non-uniformly-scaled SVG. */
function SignalPath({
  scrollYProgress,
  from,
  to,
  bend,
  drawWindow,
  fadeWindow,
}: {
  scrollYProgress: MotionValue<number>;
  from: Pt;
  to: Pt;
  bend: number;
  drawWindow: [number, number];
  fadeWindow: [number, number];
}) {
  const { d, draw, opacity } = useSignalTravel(scrollYProgress, from, to, bend, drawWindow, fadeWindow);
  return (
    <motion.g style={{ opacity }} aria-hidden="true">
      {/* Soft under-glow duplicate of the same path — gives the line body instead of a hairline. */}
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-ink-on-dark)"
        strokeWidth={1.1}
        strokeOpacity={0.06}
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: draw }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-border-on-dark-strong)"
        strokeWidth={0.32}
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: draw }}
      />
    </motion.g>
  );
}

/** The traveling mark — plain HTML, real px size, never distorted by the SVG's aspect ratio. */
function SignalTravelDot({
  scrollYProgress,
  from,
  to,
  bend,
  drawWindow,
  fadeWindow,
}: {
  scrollYProgress: MotionValue<number>;
  from: Pt;
  to: Pt;
  bend: number;
  drawWindow: [number, number];
  fadeWindow: [number, number];
}) {
  const { dotOpacity, dotX, dotY } = useSignalTravel(scrollYProgress, from, to, bend, drawWindow, fadeWindow);
  const leftPct = useTransform(dotX, (v) => `${v}%`);
  const topPct = useTransform(dotY, (v) => `${v}%`);
  return (
    <motion.span
      style={{ left: leftPct, top: topPct, opacity: dotOpacity }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    >
      <span
        className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
        style={{ backgroundColor: 'var(--color-red-on-dark)', opacity: 0.35 }}
      />
      <span
        className="relative block h-[5px] w-[5px] rounded-full"
        style={{ backgroundColor: 'var(--color-red-on-dark)' }}
      />
    </motion.span>
  );
}

/** The residual work object carried over from Chapter 04 — a small signal, never a panel. */
function WorkMark({
  scrollYProgress,
  pos,
  pulseWindow,
}: {
  scrollYProgress: MotionValue<number>;
  pos: { x: Beat; y: Beat };
  pulseWindow: [number, number];
}) {
  const left = useTransform(scrollYProgress, pos.x.t, pos.x.v);
  const top = useTransform(scrollYProgress, pos.y.t, pos.y.v);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);

  const baseOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const pulseScale = useTransform(
    scrollYProgress,
    [pulseWindow[0], (pulseWindow[0] + pulseWindow[1]) / 2, pulseWindow[1]],
    [1, 2, 1],
  );
  const pulseColor = useTransform(
    scrollYProgress,
    [pulseWindow[0], (pulseWindow[0] + pulseWindow[1]) / 2, pulseWindow[1]],
    ['var(--color-ink-on-dark)', 'var(--color-red-on-dark)', 'var(--color-ink-on-dark)'],
  );
  const labelOpacity = useTransform(scrollYProgress, [0.02, 0.06], [0, 0.5]);

  const glowScale = useTransform(pulseScale, (s) => s * 2.2);

  return (
    <motion.div
      style={{ left: leftPct, top: topPct, opacity: baseOpacity }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
    >
      <span className="relative flex h-[10px] w-[10px] items-center justify-center" aria-hidden="true">
        <motion.span
          style={{ scale: glowScale, backgroundColor: pulseColor, opacity: 0.18 }}
          className="absolute h-[10px] w-[10px] rounded-full blur-[3px]"
        />
        <motion.span
          style={{ scale: pulseScale, backgroundColor: pulseColor, rotate: 45 }}
          className="relative block h-[8px] w-[8px]"
        />
      </span>
      <motion.p
        style={{ opacity: labelOpacity, color: 'var(--color-ink-muted-on-dark)' }}
        className="mt-[7px] whitespace-nowrap text-label"
      >
        Launch Checklist
      </motion.p>
    </motion.div>
  );
}

/**
 * The field's ambient texture — a faint dot-grid plus a soft radial glow
 * that gathers toward the forming cluster. Not a panel: no border, no
 * radius, no shadow, just a full-bleed tint so the open field reads as
 * an intentional surface rather than empty space while people and
 * signals are sparse (early/late in the scroll range).
 */
function FieldTexture({
  scrollYProgress,
  isMobile,
}: {
  scrollYProgress: MotionValue<number>;
  isMobile: boolean;
}) {
  const constellation = isMobile ? M_CONSTELLATION : D_CONSTELLATION;
  return (
    <>
      {/* STEP 53: the base surface — --color-surface-dark (the same
          near-black Ch.06/07 use) with one quiet violet wash gathered in
          the top-left corner, this chapter's sole point of color
          departure. No diagonal multi-stop gradient, no second surface
          fighting for attention underneath it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: CH05_SURFACE_BASE }}
      />
      {/* STEP 55: the diffuse red "ember gather" wash is removed. At the
          scale a radial gradient has to be to read as ambient light
          across a full-bleed viewport, --color-red-on-dark stopped
          looking like a considered accent and started looking like a
          muddy stain over the background — explicit direction was this
          wasn't working. ClusterGlow (below, in the main component) is
          the field's one arrival-light moment now: an ink-toned glow
          under the forming cluster, no color needed to read as "light
          gathering here." Red stays reserved for small, sharp, genuinely
          momentary marks — SignalDot, the signal-travel dots — where a
          little saturated color reads as a signal, not a wash. */}
      {/* Constellation lines are the field's entire ambient texture now
          — no dot-grid layered underneath them. A network of faint
          lines through the never-activated presences suits "a human
          network" on its own; it doesn't need a wallpaper of dots
          behind it too. Static and quiet; never competes with the
          signals or the named marks. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
        aria-hidden="true"
      >
        {constellation.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--color-border-on-dark)"
            strokeWidth={0.15}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <AmbientOrbs variant="network" />
      <PeopleField3D scrollYProgress={scrollYProgress} />
    </>
  );
}

/**
 * A soft, wide glow that gathers beneath the forming cluster during the
 * reorganization phase — the climax's visual payoff, not a panel or card.
 * Fades in with the cluster and holds through the compress phase, giving
 * the moment the four marks settle into a bit of collective weight.
 *
 * STEP 55: nudged up slightly (0.22 -> 0.28 peak) now that it's the
 * field's only arrival-light moment — FieldTexture's separate red wash,
 * which used to share this job, has been removed (see that file's STEP
 * 55 note) rather than retuned.
 */
function ClusterGlow({ scrollYProgress, center }: { scrollYProgress: MotionValue<number>; center: Pt }) {
  const opacity = useTransform(scrollYProgress, [CLUSTER_START, CLUSTER_END, COMPRESS_END, 1], [0, 0.28, 0.28, 0.18]);
  const scale = useTransform(scrollYProgress, [CLUSTER_START, CLUSTER_END], [0.5, 1]);
  return (
    <motion.div
      aria-hidden="true"
      style={{
        opacity,
        scale,
        left: `${center.x}%`,
        top: `${center.y}%`,
        backgroundImage: 'radial-gradient(closest-side, var(--color-ink-on-dark), transparent 72%)',
      }}
      className="pointer-events-none absolute h-[46vh] w-[46vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[24px]"
    />
  );
}

/** A never-activated presence — sells "the system evaluated people who weren't relevant" (§06). */
function InactivePresence({
  scrollYProgress,
  pos,
}: {
  scrollYProgress: MotionValue<number>;
  pos: { x: Beat; y: Beat };
}) {
  const left = useTransform(scrollYProgress, pos.x.t, pos.x.v);
  const top = useTransform(scrollYProgress, pos.y.t, pos.y.v);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.06, INACTIVE_DRIFT[0], INACTIVE_DRIFT[1]],
    [0, 0.26, 0.26, 0.07],
  );

  return (
    <motion.span
      style={{ left: leftPct, top: topPct, opacity, borderColor: 'var(--color-border-on-dark)' }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex h-[9px] w-[9px] items-center justify-center rounded-full border"
      aria-hidden="true"
    >
      <span
        className="block h-[3px] w-[3px] rounded-full"
        style={{ backgroundColor: 'var(--color-ink-muted-on-dark)' }}
      />
    </motion.span>
  );
}

/**
 * A discovered person. `entrance` selects one of three distinct
 * activation grammars (§12) — every hook below is called
 * unconditionally (rules of hooks); only the relevant motion values
 * are ever wired into the rendered style.
 */
function PersonNode({
  scrollYProgress,
  pos,
  name,
  role,
  entrance,
  resolveWindow,
  roleWindow,
  labelSide,
}: {
  scrollYProgress: MotionValue<number>;
  pos: { x: Beat; y: Beat };
  name: string;
  role: string;
  entrance: Entrance;
  resolveWindow: [number, number];
  roleWindow: [number, number];
  labelSide: 'left' | 'right';
}) {
  const left = useTransform(scrollYProgress, pos.x.t, pos.x.v);
  const top = useTransform(scrollYProgress, pos.y.t, pos.y.v);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);

  const presence = useTransform(
    scrollYProgress,
    [0, 0.06, resolveWindow[0], resolveWindow[1]],
    [0, 0.24, 0.24, 1],
  );

  const nameOpacity = useTransform(
    scrollYProgress,
    [resolveWindow[0], resolveWindow[0] + 0.02, CLUSTER_START, CLUSTER_END],
    [0, 1, 1, 0.4],
  );
  const roleOpacity = useTransform(
    scrollYProgress,
    [roleWindow[0], roleWindow[1], CLUSTER_START, CLUSTER_END],
    [0, 1, 1, 0.32],
  );

  // "resolve" — Priya: oversized + blurred, sharpens to rest, one ring.
  const resolveDotScale = useTransform(scrollYProgress, resolveWindow, [2.1, 1]);
  const resolveBlurPx = useTransform(scrollYProgress, resolveWindow, [5, 0]);
  const resolveFilter = useTransform(resolveBlurPx, (b) => (b > 0.05 ? `blur(${b}px)` : 'none'));
  const ringScale = useTransform(scrollYProgress, resolveWindow, [0.6, 2.6]);
  const ringOpacity = useTransform(
    scrollYProgress,
    [resolveWindow[0], (resolveWindow[0] + resolveWindow[1]) / 2, resolveWindow[1]],
    [0.5, 0.2, 0],
  );

  // "track" — Alex: letter-spacing collapses, dot itself never moves/blurs.
  const trackSpacing = useTransform(scrollYProgress, resolveWindow, [0.3, 0.02]);
  const trackSpacingEm = useTransform(trackSpacing, (v) => `${v}em`);

  const dotScale = entrance === 'resolve' ? resolveDotScale : undefined;
  const dotFilter = entrance === 'resolve' ? resolveFilter : undefined;
  const nameLetterSpacing = entrance === 'track' ? trackSpacingEm : undefined;

  const initial = name.charAt(0);

  return (
    <motion.div style={{ left: leftPct, top: topPct, opacity: presence }} className="absolute -translate-x-1/2 -translate-y-1/2">
      <motion.span
        style={{ scale: dotScale, filter: dotFilter }}
        className="relative flex h-[34px] w-[34px] items-center justify-center"
        aria-hidden="true"
      >
        {/* STEP 55: the ambient halo (a 52px blurred near-white circle,
            breathing behind every mark) is removed outright rather than
            retuned. At any opacity it reads as a fuzzy grey smudge sitting
            behind a crisp glass disc — two different visual languages in
            one mark. The disc's own border/backdrop-blur already reads as
            "lit" on its own; the one-time resolve ring below still gives
            arrival its moment without a glow that's on continuously. */}

        {/* Resolve grammar: one thin ring expands outward once, on arrival. */}
        {entrance === 'resolve' && (
          <motion.span
            style={{ scale: ringScale, opacity: ringOpacity, borderColor: 'var(--color-ink-on-dark)' }}
            className="absolute h-[34px] w-[34px] rounded-full border"
          />
        )}

        {/* The mark itself: a glass-like disc with a thin border and the person's initial. */}
        <span
          className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--color-border-on-dark-strong)',
            backgroundColor: 'var(--color-border-on-dark)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <span
            className="text-body-sm select-none"
            style={{ color: 'var(--color-ink-on-dark)' }}
          >
            {initial}
          </span>
        </span>
      </motion.span>

      <div
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
          labelSide === 'right' ? 'left-[42px] text-left' : 'right-[42px] text-right',
        )}
      >
        <motion.p
          style={{ opacity: nameOpacity, letterSpacing: nameLetterSpacing, color: 'var(--color-ink-on-dark)' }}
          className="text-body-sm uppercase tracking-[0.06em]"
        >
          {name}
        </motion.p>
        <motion.p style={{ opacity: roleOpacity, color: 'var(--color-ink-muted-on-dark)' }} className="text-label">
          {role}
        </motion.p>
      </div>
    </motion.div>
  );
}

export function Chapter05People() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const markerOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 0.6]);
  const editorialOpacity = useTransform(scrollYProgress, EDITORIAL_LINE, [0, 0.7]);
  // STITCH (beauty pass, step 3): Chapter 04 sits on paper with no
  // background override of its own, so without this the very first
  // frame of Chapter 05's sticky wrapper hard-cuts straight to
  // --color-surface-dark the instant its section reaches the top of
  // the viewport — the one hand-off on the page that had no easing
  // at all (unlike Ch02->Ch03's entrance-fade treatment, or Ch07-
  // >Ch08's dedicated curtain). Crossfading paper->dark across just
  // the first 5% of this chapter's own scroll turns that cut into a
  // quick, deliberate dissolve instead.
  const bgColor = useTransform(scrollYProgress, [0, 0.05], [surfaceColor.paper, CH05_SURFACE_SOLID]);

  // ---- positions ----
  const workP = isMobile
    ? { start: M_WORK_START, cluster: M_WORK_CLUSTER, final: M_WORK_FINAL }
    : { start: D_WORK_START, cluster: D_WORK_CLUSTER, final: D_WORK_FINAL };
  const priyaP = isMobile
    ? { start: M_PRIYA_START, cluster: M_PRIYA_CLUSTER, final: M_PRIYA_FINAL }
    : { start: D_PRIYA_START, cluster: D_PRIYA_CLUSTER, final: D_PRIYA_FINAL };
  const sarahP = isMobile
    ? { start: M_SARAH_START, cluster: M_SARAH_CLUSTER, final: M_SARAH_FINAL }
    : { start: D_SARAH_START, cluster: D_SARAH_CLUSTER, final: D_SARAH_FINAL };
  const alexP = isMobile
    ? { start: M_ALEX_START, cluster: M_ALEX_CLUSTER, final: M_ALEX_FINAL }
    : { start: D_ALEX_START, cluster: D_ALEX_CLUSTER, final: D_ALEX_FINAL };
  const inactiveBase = isMobile ? M_INACTIVE : D_INACTIVE;
  const inactiveDrift = isMobile ? M_INACTIVE_DRIFT : D_INACTIVE_DRIFT;
  const outwardTo = isMobile ? M_OUTWARD_TO : D_OUTWARD_TO;

  const workPosBeat = workPos(workP.start, workP.cluster, workP.final);
  const priyaPosBeat = priyaPos(priyaP.start, priyaP.cluster, priyaP.final);
  const sarahPosBeat = sarahPos(sarahP.start, sarahP.cluster, sarahP.final);
  const alexPosBeat = alexPos(alexP.start, alexP.cluster, alexP.final);

  // ---- outward hint toward Chapter 06 ----
  const outwardX = useTransform(scrollYProgress, OUTWARD_SIGNAL, [workP.cluster.x, outwardTo.x]);
  const outwardY = useTransform(scrollYProgress, OUTWARD_SIGNAL, [workP.cluster.y, outwardTo.y]);
  const outwardXPct = useTransform(outwardX, (v) => `${v}%`);
  const outwardYPct = useTransform(outwardY, (v) => `${v}%`);
  const outwardOpacity = useTransform(scrollYProgress, [0.9, 0.95, 1], [0, 0.55, 0.55]);
  const outwardDraw = useTransform(scrollYProgress, OUTWARD_SIGNAL, [0, 1]);
  const outwardPathOpacity = useTransform(scrollYProgress, [0.9, 0.95, 1], [0, 0.22, 0.22]);
  const outwardPathD = `M ${workP.cluster.x} ${workP.cluster.y} L ${outwardTo.x} ${outwardTo.y}`;

  if (prefersReducedMotion) {
    const cluster = isMobile
      ? { work: M_WORK_FINAL, priya: M_PRIYA_FINAL, sarah: M_SARAH_FINAL, alex: M_ALEX_FINAL }
      : { work: D_WORK_FINAL, priya: D_PRIYA_FINAL, sarah: D_SARAH_FINAL, alex: D_ALEX_FINAL };
    return (
      <section id="chapter-05" data-theme="dark" className="relative w-full" aria-label="The human network">
        <h3 className="sr-only">
          Launch Checklist is understood as belonging to a small team: Priya, its owner, Sarah, recently added to
          review it, and Alex, whose Client Review must finish first. The three sit together around the task; other
          people in the network were considered but are not involved.
        </h3>
        <div
          className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden py-section-mobile lg:py-0"
          style={{ backgroundImage: CH05_SURFACE_BASE }}
        >
          {/* STEP 55: the static red ember wash is removed here too, to
              match the scroll-driven version — see the note above
              FieldTexture's base surface layer. */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
            aria-hidden="true"
          >
            {(isMobile ? M_CONSTELLATION : D_CONSTELLATION).map(([a, b], i) => (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--color-border-on-dark)"
                strokeWidth={0.15}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <AmbientOrbs variant="network" />
          {(isMobile ? M_INACTIVE : D_INACTIVE).map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute block h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: 'var(--color-ink-muted-on-dark)', opacity: 0.2 }}
            />
          ))}
          <div className="relative h-[52vh] w-[92vw] max-w-wide">
            <StaticMark pos={cluster.work} label="Launch Checklist" muted />
            <StaticMark pos={cluster.priya} label="Priya" sub="Marketing" />
            <StaticMark pos={cluster.sarah} label="Sarah" sub="Design" />
            <StaticMark pos={cluster.alex} label="Alex" sub="Accounts" />
          </div>
          <p
            className="mt-lg max-w-[26rem] px-gutter-mobile text-center text-body-sm italic"
            style={{ color: 'var(--color-ink-muted-on-dark)' }}
          >
            Work finds the people who move it forward.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-05" ref={sectionRef} data-theme="dark" className="relative w-full h-[440dvh]" aria-label="The human network">
      <h3 className="sr-only">
        The work discovers who it belongs to: Launch Checklist reaches Priya, its owner. Priya brings in Sarah, who
        was just added to review it. Sarah brings in Alex, whose own work must finish first. The three form a small
        team around the task while other people in the network remain uninvolved.
      </h3>

      <motion.div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden" style={{ backgroundColor: bgColor }}>
        <FieldTexture scrollYProgress={scrollYProgress} isMobile={isMobile} />
        <ClusterGlow scrollYProgress={scrollYProgress} center={workP.cluster} />

        <motion.p
          style={{ opacity: markerOpacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute left-gutter-mobile top-[6%] z-10 text-label sm:left-gutter-tablet lg:left-gutter-desktop"
        >
          05
        </motion.p>

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <SignalPath scrollYProgress={scrollYProgress} from={workP.start} to={priyaP.start} bend={14} drawWindow={SIGNAL_1} fadeWindow={SIGNAL_1_FADE} />
          <SignalPath scrollYProgress={scrollYProgress} from={priyaP.start} to={sarahP.start} bend={-12} drawWindow={SIGNAL_2} fadeWindow={SIGNAL_2_FADE} />
          <SignalPath scrollYProgress={scrollYProgress} from={sarahP.start} to={alexP.start} bend={10} drawWindow={SIGNAL_3} fadeWindow={SIGNAL_3_FADE} />
        </svg>
        {/* Travel dots rendered as plain HTML siblings, not inside the svg above —
            see useSignalTravel's comment: a <circle> inside that non-uniformly
            scaled viewBox stretches into an ellipse, which is the "childish red
            pill" artifact from the last round. */}
        <SignalTravelDot scrollYProgress={scrollYProgress} from={workP.start} to={priyaP.start} bend={14} drawWindow={SIGNAL_1} fadeWindow={SIGNAL_1_FADE} />
        <SignalTravelDot scrollYProgress={scrollYProgress} from={priyaP.start} to={sarahP.start} bend={-12} drawWindow={SIGNAL_2} fadeWindow={SIGNAL_2_FADE} />
        <SignalTravelDot scrollYProgress={scrollYProgress} from={sarahP.start} to={alexP.start} bend={10} drawWindow={SIGNAL_3} fadeWindow={SIGNAL_3_FADE} />

        {inactiveBase.map((base, i) => {
          const drift = inactiveDrift[i] ?? base;
          return <InactivePresence key={i} scrollYProgress={scrollYProgress} pos={inactivePos(base, drift)} />;
        })}

        <WorkMark scrollYProgress={scrollYProgress} pos={workPosBeat} pulseWindow={WORK_PULSE} />

        <PersonNode
          scrollYProgress={scrollYProgress}
          pos={priyaPosBeat}
          name="Priya"
          role="Marketing"
          entrance="resolve"
          resolveWindow={PRIYA_RESOLVE}
          roleWindow={PRIYA_ROLE}
          labelSide={priyaP.start.x > 55 ? 'left' : 'right'}
        />
        <PersonNode
          scrollYProgress={scrollYProgress}
          pos={sarahPosBeat}
          name="Sarah"
          role="Design"
          entrance="rise"
          resolveWindow={SARAH_RESOLVE}
          roleWindow={SARAH_ROLE}
          labelSide={sarahP.start.x > 55 ? 'left' : 'right'}
        />
        <PersonNode
          scrollYProgress={scrollYProgress}
          pos={alexPosBeat}
          name="Alex"
          role="Accounts"
          entrance="track"
          resolveWindow={ALEX_RESOLVE}
          roleWindow={ALEX_ROLE}
          labelSide={alexP.start.x > 55 ? 'left' : 'right'}
        />

        <SecondaryWorkChip
          scrollYProgress={scrollYProgress}
          anchor={alexP.start}
          offset={isMobile ? M_CLIENT_REVIEW_OFFSET : D_CLIENT_REVIEW_OFFSET}
          label="Client Review"
          revealWindow={ALEX_ROLE}
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <TeamKnit scrollYProgress={scrollYProgress} a={priyaP.final} b={sarahP.final} c={alexP.final} drawWindow={TEAM_KNIT} />
        </svg>

        {/* Quiet signal leaving the formed team toward the edge — the Ch.06 bridge, no explanation given. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <motion.path
            d={outwardPathD}
            fill="none"
            stroke="var(--color-border-on-dark-strong)"
            strokeWidth={0.28}
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: outwardDraw, opacity: outwardPathOpacity }}
          />
        </svg>
        <motion.div
          style={{ left: outwardXPct, top: outwardYPct, opacity: outwardOpacity }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <span
            className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[5px]"
            style={{ backgroundColor: 'var(--color-red-on-dark)', opacity: 0.25 }}
          />
          <SignalDot surface="dark" active size={5} />
        </motion.div>

        <motion.p
          style={{ opacity: editorialOpacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute bottom-[7%] left-1/2 w-[86%] max-w-[24rem] -translate-x-1/2 text-center text-body-sm italic"
        >
          Work finds the people who move it forward.
        </motion.p>
      </motion.div>
    </section>
  );
}

/**
 * TEAM KNIT — a new choreography beat, not present in the earlier build.
 * Once the three people have arrived at their cluster position, a thin
 * triangle draws itself between them — Priya–Sarah, Sarah–Alex, Alex–
 * Priya — the literal moment the network becomes a team rather than
 * three individually-resolved marks sitting near each other. Uses the
 * cluster's resting positions (the interpolation from cluster->final is
 * a few field-units at most, so a static triangle stays visually
 * attached without needing a per-frame recompute).
 */
function TeamKnit({
  scrollYProgress,
  a,
  b,
  c,
  drawWindow,
}: {
  scrollYProgress: MotionValue<number>;
  a: Pt;
  b: Pt;
  c: Pt;
  drawWindow: [number, number];
}) {
  const draw = useTransform(scrollYProgress, drawWindow, [0, 1]);
  const opacity = useTransform(scrollYProgress, [drawWindow[0], drawWindow[1], 1], [0, 0.2, 0.28]);
  const edges: [Pt, Pt][] = [
    [a, b],
    [b, c],
    [c, a],
  ];
  return (
    <motion.g style={{ opacity }} aria-hidden="true">
      {edges.map(([from, to], i) => (
        <motion.line
          key={i}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="var(--color-ink-on-dark)"
          strokeWidth={0.16}
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: draw }}
        />
      ))}
    </motion.g>
  );
}

/**
 * SECONDARY WORK CHIP — a new element: "Client Review," Alex's own task
 * (the reason Sarah's signal reaches him in the first place, per the
 * chain in the header comment), arrives as a small mark near Alex once
 * he's identified. It's what he's holding, not decoration — makes the
 * "his work must finish first" line visible instead of only stated in
 * the sr-only heading. A short tick connects it to Alex's mark.
 */
function SecondaryWorkChip({
  scrollYProgress,
  anchor,
  offset,
  label,
  revealWindow,
}: {
  scrollYProgress: MotionValue<number>;
  anchor: Pt;
  offset: Pt;
  label: string;
  revealWindow: [number, number];
}) {
  const pos = { x: anchor.x + offset.x, y: anchor.y + offset.y };
  const opacity = useTransform(
    scrollYProgress,
    [revealWindow[0], revealWindow[1], CLUSTER_START, CLUSTER_END],
    [0, 1, 1, 0.4],
  );
  const scale = useTransform(scrollYProgress, revealWindow, [0.6, 1]);
  const tickDraw = useTransform(scrollYProgress, revealWindow, [0, 1]);

  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <motion.line
          x1={anchor.x}
          y1={anchor.y}
          x2={pos.x}
          y2={pos.y}
          stroke="var(--color-border-on-dark-strong)"
          strokeWidth={0.18}
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: tickDraw, opacity }}
        />
      </svg>
      <motion.div
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity, scale }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[5px]"
        aria-hidden="true"
      >
        <span
          className="block h-[7px] w-[7px] rotate-45 border"
          style={{ borderColor: 'var(--color-ink-muted-on-dark)' }}
        />
        <p className="whitespace-nowrap text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
          {label}
        </p>
      </motion.div>
    </>
  );
}

function StaticMark({ pos, label, sub, muted }: { pos: Pt; label: string; sub?: string; muted?: boolean }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[8px] text-center"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      {muted ? (
        <span
          className="block h-[8px] w-[8px] rotate-45"
          style={{ backgroundColor: 'var(--color-ink-muted-on-dark)', opacity: 0.6 }}
          aria-hidden="true"
        />
      ) : (
        <span
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--color-border-on-dark-strong)',
            backgroundColor: 'var(--color-border-on-dark)',
          }}
          aria-hidden="true"
        >
          <span className="text-body-sm" style={{ color: 'var(--color-ink-on-dark)' }}>
            {label.charAt(0)}
          </span>
        </span>
      )}
      <p
        className={muted ? 'text-label' : 'text-body-sm uppercase tracking-[0.06em]'}
        style={{ color: muted ? 'var(--color-ink-muted-on-dark)' : 'var(--color-ink-on-dark)' }}
      >
        {label}
      </p>
      {sub && (
        <p className="text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
