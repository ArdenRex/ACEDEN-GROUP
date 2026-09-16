'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import dynamic from 'next/dynamic';
import { SignalDot } from '@/components/primitives/SignalDot';
import { AmbientOrbs, SecondaryGrid } from '@/components/primitives/DepthField';

// STEP 61 — Chapter 07's 3D layer (rectangular "crate" cards, a third
// shape language distinct from Ch05's gems and Ch06's hex chips/tube
// conduits — see ScaleDepth3D.tsx's own doc comment). Dynamically
// imported, same precedent as EcosystemDepth3D, since it only matters
// once mounted client-side and pulls in three.js.
const ScaleDepth3D = dynamic(() => import('@/components/primitives/ScaleDepth3D').then((m) => m.ScaleDepth3D), {
  ssr: false,
});

/**
 * Chapter 07 — "Scale Without Chaos."
 *
 * NEW FILE. page.tsx gains one import + one render line; no other
 * chapter is touched.
 *
 * ----------------------------------------------------------------
 * WHY A NEW MOVEMENT GRAMMAR, NOT A REUSE OF CH.05/06'S HOPS
 * ----------------------------------------------------------------
 * Ch.05 and Ch.06 both draw a single quadratic-bezier "hop" between
 * two fixed points — a relationship being revealed. Chapter 07 is
 * not about relationships, it's about volume: pieces of real work
 * physically arriving from outside the field and being routed (§18,
 * §21). So every item here travels a *two-segment* path: a short
 * straight continuation of its entry direction (it looks, briefly,
 * like it's headed somewhere else), then a curved redirect into its
 * settled position (the system "deciding"). A brief scale-pulse
 * fires exactly at the elbow — the recognition moment described in
 * §3 ("An incoming task approaches... then the system subtly
 * redirects it"). No item ever fades in place or teleports (§18);
 * position is one continuous scrollYProgress-driven function for
 * every item, fully scrubbable.
 *
 * ----------------------------------------------------------------
 * THE FIELD ITSELF: NO PANEL, NO CARD (§16)
 * ----------------------------------------------------------------
 * Same full-bleed dark sticky viewport as Ch.05/06 — no border,
 * radius, or shadow anywhere. That continuity is deliberate (the
 * "workspace" the brief refers to is this territory, not a boxed
 * product window — Ch.05's redesign already retired the box for
 * this exact reason). What makes Ch.07 unmistakably its own chapter
 * is the density arc and the physical-arrival grammar, not a new
 * container shape.
 *
 * ----------------------------------------------------------------
 * DENSITY INVERSION — THE CHAPTER'S ACTUAL STRUCTURE (§8, §19)
 * ----------------------------------------------------------------
 *   0   –0.14  MORE       field is calm, first item arrives alone
 *   0.14–0.30  MORE       two more arrive, field starts to feel busy
 *   0.30–0.50  (peak)     three items enter with overlapping windows
 *                         from three different edges — their straight
 *                         "continuation" segments visibly cross before
 *                         any of them redirects. This is the one
 *                         deliberate "too much" moment (§20) — no
 *                         extra chrome, just genuinely simultaneous
 *                         motion. A very faint darkening vignette
 *                         (ChaosVignette) breathes in and back out
 *                         across this same window, aria-hidden,
 *                         reinforcing the tension without narrating it.
 *   0.34–0.62  COORDINATION  items 4-6 bend into their rest slots;
 *                         paths recede once absorbed so the field
 *                         never becomes a permanent flowchart.
 *   0.66–0.84  WITHOUT CHAOS  field reads as settled/architectural;
 *                         a 7th item arrives calmly during this same
 *                         window to prove the system now absorbs more
 *                         volume with *less* visible effort than the
 *                         very first arrival took (§7's actual payoff:
 *                         many items, lower perceived complexity).
 *   0.86–1     pricing settles in as the quiet, factual consequence
 *              of everything just demonstrated (§11, §27) — no card,
 *              no button, no urgency language. One final 8th item
 *              approaches from the bottom-right edge but stops short
 *              of entering and stays paused there — the unresolved
 *              opening §28 asks for, handed to Chapter 08.
 *
 * ----------------------------------------------------------------
 * SEVEN REAL, VERIFIED TASK NAMES — NOTHING INVENTED (§12)
 * ----------------------------------------------------------------
 * Onboarding Docs / Review Q3 Proposal / Update Client Timeline /
 * Prepare Campaign Brief / Approve Invoice / Review Integration
 * Request / Weekly Status Update — ordinary, plausible coordinator
 * work, matching the confirmed task-field model (description,
 * assignee, deadline, priority). "High priority" on Approve Invoice
 * is the chapter's one red accent, per tokens.css's rule that red
 * means an actual priority/system state, not decoration. No fake
 * user counts, no invented integrations, no pricing tiers beyond the
 * confirmed $20/month, 7-day trial.
 *
 * ----------------------------------------------------------------
 * COPY AS PART OF THE TRANSFORMATION (§9, §10)
 * ----------------------------------------------------------------
 * "MORE" / "COORDINATION" / "WITHOUT CHAOS" render as large, quiet,
 * low-opacity background typography — behind the work items, never
 * beside them as a marketing headline. Each snaps in over a very
 * narrow scroll window (StateWord) rather than a normal fade, so it
 * reads as a conclusion the field just produced, not a caption
 * animating in on a timer.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION (§35)
 * ----------------------------------------------------------------
 * All seven items render immediately at their settled positions
 * (the calm-at-scale end state), the eighth sits at its paused point,
 * and the pricing line is already visible — no travel, no elbow
 * pulse, no vignette. Every fact (more work exists, the system
 * routes it, $20/month, 7-day trial) is additionally stated in an
 * sr-only heading.
 *
 * ----------------------------------------------------------------
 * NO VISUAL QA
 * ----------------------------------------------------------------
 * Visual rendering is not available in this environment. Validated
 * via tsc --noEmit, next lint, and next build only — the exact
 * arrival edges, elbow points, and rest-slot spacing are reasoned
 * estimates, not a measured screenshot check.
 *
 * ----------------------------------------------------------------
 * FIX (user-reported, step 2): weeklystatus vs. the pricing block
 * ----------------------------------------------------------------
 * "$20/month" and "Weekly Status Update" were rendering on top of
 * each other. weeklystatus settles at x50/y74 — dead center, low in
 * the field — while the pricing block is also x-centered and grows
 * upward from the bottom edge once scrollYProgress passes 0.86. Item
 * opacity previously only ever ramped 0→1 and held, so weeklystatus
 * was still on screen when pricing faded in. Fixed via a new
 * per-item `exitFade` window (see WorkItem/D_ITEMS/M_ITEMS/ItemMark
 * below): weeklystatus now fades back out at 0.82–0.855, fully clear
 * before "One workspace." begins appearing at 0.86. Every other item
 * is unaffected and still settles-and-stays.
 */

interface Pt {
  x: number;
  y: number;
}

type Edge = 'left' | 'right' | 'top' | 'bottom';

interface WorkItem {
  id: string;
  label: string;
  meta: string;
  accent?: boolean;
  edge: Edge;
  /** Fraction of the item's own travel spent on the straight "continuation" leg before the redirect. */
  turn: number;
  /** Perpendicular bend of the redirect curve — sign controls which way it swerves. */
  bend: number;
  /** [start, end] of scrollYProgress over which this item travels and arrives. */
  window: [number, number];
  depth: number;
  start: Pt;
  end: Pt;
  /**
   * Optional [start, end] of scrollYProgress over which a *settled* item
   * fades back out (opacity 1 → 0). Every other item settles and then
   * stays (§7 — "the field never becomes a permanent flowchart" was
   * always about the *paths*, not the item marks themselves). This is
   * a one-item exception: see the FIX note above `weeklystatus` below.
   */
  exitFade?: [number, number];
}

const D_ITEMS: WorkItem[] = [
  { id: 'onboarding', label: 'Onboarding Docs', meta: 'Sarah · Friday', edge: 'left', turn: 0.4, bend: 16, window: [0.1, 0.19], depth: 1.05, start: { x: -8, y: 26 }, end: { x: 18, y: 24 } },
  { id: 'q3proposal', label: 'Review Q3 Proposal', meta: 'Due Monday', edge: 'top', turn: 0.45, bend: -14, window: [0.17, 0.26], depth: 0.9, start: { x: 42, y: -8 }, end: { x: 40, y: 16 } },
  { id: 'clienttimeline', label: 'Update Client Timeline', meta: 'Alex · Today', edge: 'right', turn: 0.4, bend: 15, window: [0.24, 0.33], depth: 1, start: { x: 108, y: 24 }, end: { x: 62, y: 22 } },
  { id: 'campaignbrief', label: 'Prepare Campaign Brief', meta: 'Priya · Thursday', edge: 'left', turn: 0.5, bend: -18, window: [0.32, 0.44], depth: 0.95, start: { x: -8, y: 46 }, end: { x: 78, y: 40 } },
  { id: 'invoice', label: 'Approve Invoice', meta: 'High priority', accent: true, edge: 'bottom', turn: 0.42, bend: 22, window: [0.36, 0.48], depth: 1.12, start: { x: 64, y: 108 }, end: { x: 60, y: 52 } },
  { id: 'integration', label: 'Review Integration Request', meta: 'Medium priority', edge: 'right', turn: 0.48, bend: -16, window: [0.4, 0.52], depth: 0.9, start: { x: 108, y: 54 }, end: { x: 36, y: 56 } },
  // FIX (user-reported, step 2): this item settles dead-center (x50) at
  // y74 — precisely where the pricing block (also x-centered, bottom-
  // anchored) grows upward into once scrollYProgress passes 0.86. The
  // two are on completely different scroll windows (0.72–0.8 vs
  // 0.86–1) but both remained visible at once, since every item's
  // opacity only ever ramps 0→1 and holds. Rather than relocate the
  // item — every nearby slot is already occupied by another settled
  // item's label by this point in the chapter — it now fades back out
  // (exitFade) fully *before* "One workspace." starts appearing at
  // 0.86, so the two never share the screen.
  { id: 'weeklystatus', label: 'Weekly Status Update', meta: 'Sarah · Recurring', edge: 'top', turn: 0.4, bend: 14, window: [0.72, 0.8], depth: 1, start: { x: 46, y: -8 }, end: { x: 50, y: 74 }, exitFade: [0.82, 0.855] },
];
const D_PAUSED = { start: { x: 108, y: 96 }, pause: { x: 82, y: 82 }, window: [0.9, 0.96] as [number, number] };

const M_ITEMS: WorkItem[] = [
  { id: 'onboarding', label: 'Onboarding Docs', meta: 'Sarah · Friday', edge: 'left', turn: 0.4, bend: 14, window: [0.1, 0.19], depth: 1.05, start: { x: -8, y: 11 }, end: { x: 30, y: 10 } },
  { id: 'q3proposal', label: 'Review Q3 Proposal', meta: 'Due Monday', edge: 'right', turn: 0.45, bend: -13, window: [0.17, 0.26], depth: 0.9, start: { x: 108, y: 19 }, end: { x: 66, y: 19 } },
  { id: 'clienttimeline', label: 'Update Client Timeline', meta: 'Alex · Today', edge: 'left', turn: 0.4, bend: 14, window: [0.24, 0.33], depth: 1, start: { x: -8, y: 29 }, end: { x: 32, y: 29 } },
  { id: 'campaignbrief', label: 'Prepare Campaign Brief', meta: 'Priya · Thursday', edge: 'right', turn: 0.5, bend: -16, window: [0.32, 0.44], depth: 0.95, start: { x: 108, y: 40 }, end: { x: 68, y: 40 } },
  { id: 'invoice', label: 'Approve Invoice', meta: 'High priority', accent: true, edge: 'left', turn: 0.42, bend: 18, window: [0.36, 0.48], depth: 1.12, start: { x: -8, y: 51 }, end: { x: 34, y: 51 } },
  { id: 'integration', label: 'Review Integration Request', meta: 'Medium priority', edge: 'right', turn: 0.48, bend: -15, window: [0.4, 0.52], depth: 0.9, start: { x: 108, y: 61 }, end: { x: 64, y: 61 } },
  // Same overlap + same fix as D_ITEMS' weeklystatus — see comment there.
  // Mobile's price block runs nearly the full viewport width (its
  // max-w-[26rem] rarely binds below ~480px), so the horizontal
  // component of the collision is even more direct here.
  { id: 'weeklystatus', label: 'Weekly Status Update', meta: 'Sarah · Recurring', edge: 'top', turn: 0.4, bend: 12, window: [0.72, 0.8], depth: 1, start: { x: 50, y: -8 }, end: { x: 50, y: 73 }, exitFade: [0.82, 0.855] },
];
const M_PAUSED = { start: { x: 108, y: 96 }, pause: { x: 74, y: 89 }, window: [0.9, 0.96] as [number, number] };

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

/** The straight leg's endpoint — continues the item's entry direction, barely deviating on the cross-axis. */
function redirectPoint(start: Pt, end: Pt, turn: number): Pt {
  const horizontalEntry = start.x < 0 || start.x > 100;
  if (horizontalEntry) {
    return { x: start.x + (end.x - start.x) * turn, y: start.y + (end.y - start.y) * turn * 0.18 };
  }
  return { x: start.x + (end.x - start.x) * turn * 0.18, y: start.y + (end.y - start.y) * turn };
}

function quadCtrl(from: Pt, to: Pt, bend: number): Pt {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: mid.x + (-dy / len) * bend, y: mid.y + (dx / len) * bend };
}

function pathAt(t: number, start: Pt, redirect: Pt, ctrl: Pt, end: Pt, split: number): Pt {
  if (t <= split) {
    const lt = t / split;
    return { x: start.x + (redirect.x - start.x) * lt, y: start.y + (redirect.y - start.y) * lt };
  }
  const qt = (t - split) / (1 - split);
  return {
    x: (1 - qt) ** 2 * redirect.x + 2 * (1 - qt) * qt * ctrl.x + qt ** 2 * end.x,
    y: (1 - qt) ** 2 * redirect.y + 2 * (1 - qt) * qt * ctrl.y + qt ** 2 * end.y,
  };
}

/** SVG path + traveling mark. Recedes once the item has arrived (§7 — never a permanent flowchart edge). */
function ItemPath({ scrollYProgress, item }: { scrollYProgress: MotionValue<number>; item: WorkItem }) {
  const redirect = redirectPoint(item.start, item.end, item.turn);
  const ctrl = quadCtrl(redirect, item.end, item.bend);
  const d = `M ${item.start.x} ${item.start.y} L ${redirect.x} ${redirect.y} Q ${ctrl.x} ${ctrl.y} ${item.end.x} ${item.end.y}`;

  const draw = useTransform(scrollYProgress, item.window, [0, 1]);
  const fadeStart = item.window[1];
  const pathOpacity = useTransform(scrollYProgress, [item.window[0], item.window[0] + 0.02, fadeStart, fadeStart + 0.03], [0, 0.55, 0.55, 0]);
  const dotOpacity = useTransform(draw, [0, 0.05, 0.88, 1], [0, 1, 1, 0]);
  const dotX = useTransform(draw, (t) => pathAt(t, item.start, redirect, ctrl, item.end, item.turn).x);
  const dotY = useTransform(draw, (t) => pathAt(t, item.start, redirect, ctrl, item.end, item.turn).y);
  const elbowScale = useTransform(draw, [Math.max(item.turn - 0.05, 0), item.turn, Math.min(item.turn + 0.09, 1)], [1, 1.9, 1]);

  return (
    <motion.g style={{ opacity: pathOpacity }} aria-hidden="true">
      <path d={d} fill="none" stroke="var(--color-border-on-dark-strong)" strokeWidth={0.28} vectorEffect="non-scaling-stroke" />
      <motion.circle r={0.8} cx={dotX} cy={dotY} fill={item.accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-on-dark)'} style={{ opacity: dotOpacity, scale: elbowScale }} />
    </motion.g>
  );
}

/** The settled, cardless work-item mark — a dot plus two short lines of text, per §17. */
function ItemMark({ scrollYProgress, item }: { scrollYProgress: MotionValue<number>; item: WorkItem }) {
  const draw = useTransform(scrollYProgress, item.window, [0, 1]);
  const redirect = redirectPoint(item.start, item.end, item.turn);
  const ctrl = quadCtrl(redirect, item.end, item.bend);
  const left = useTransform(draw, (t) => `${pathAt(t, item.start, redirect, ctrl, item.end, item.turn).x}%`);
  const top = useTransform(draw, (t) => `${pathAt(t, item.start, redirect, ctrl, item.end, item.turn).y}%`);
  const arriveAt = item.window[0] + (item.window[1] - item.window[0]) * item.turn;
  // Every item ramps 0→1 and holds — except one with an exitFade (see
  // weeklystatus above), which ramps 0→1→0 so it clears the field
  // before something else needs that same space.
  const opacity = useTransform(
    scrollYProgress,
    item.exitFade ? [arriveAt, item.window[1], item.exitFade[0], item.exitFade[1]] : [arriveAt, item.window[1]],
    item.exitFade ? [0, 1, 1, 0] : [0, 1],
  );

  return (
    <motion.div style={{ left, top, opacity }} className="absolute -translate-x-1/2 -translate-y-1/2">
      <div style={{ transform: `scale(${item.depth})` }} className="flex flex-col items-center gap-[6px]">
        <span
          className="block h-[6px] w-[6px] rounded-full"
          style={{ backgroundColor: item.accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-on-dark)' }}
          aria-hidden="true"
        />
        <p className="whitespace-nowrap text-mono text-[0.8125rem]" style={{ color: 'var(--color-ink-on-dark)' }}>
          {item.label}
        </p>
        <p className="whitespace-nowrap text-label" style={{ color: item.accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-muted-on-dark)' }}>
          {item.meta}
        </p>
      </div>
    </motion.div>
  );
}

/** The eighth item — approaches, then genuinely stops. The Ch.08 hook (§28). */
function PausedItem({
  scrollYProgress,
  start,
  pause,
  window: win,
}: {
  scrollYProgress: MotionValue<number>;
  start: Pt;
  pause: Pt;
  window: [number, number];
}) {
  const left = useTransform(scrollYProgress, win, [start.x, pause.x]);
  const top = useTransform(scrollYProgress, win, [start.y, pause.y]);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);
  const opacity = useTransform(scrollYProgress, [win[0], win[0] + 0.02, 1], [0, 0.75, 0.75]);
  const pulse = useTransform(scrollYProgress, [win[1], win[1] + 0.02, win[1] + 0.04], [1, 1.35, 1]);

  return (
    <motion.div style={{ left: leftPct, top: topPct, opacity }} className="absolute -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <motion.span
        style={{ scale: pulse, backgroundColor: 'var(--color-ink-on-dark)' }}
        className="block h-[6px] w-[6px] rounded-full"
      />
    </motion.div>
  );
}

/**
 * Large, quiet background typography — appears as a conclusion the
 * field just produced, not a caption fade.
 *
 * FIX (user-reported): this used to sit dead-center (50%,50%), which
 * is exactly where settled work items accumulate as the chapter
 * progresses — by the COORDINATION/WITHOUT CHAOS windows nearly the
 * whole central field is occupied, so the word rendered directly
 * behind item labels and read as garbled overlapping text. Anchoring
 * it low in the field instead keeps it clear of every item's resting
 * position for all three of its scroll windows (items only reach
 * ~y74 at the latest; the anchor here sits well below that), while
 * staying out of the way of the pricing block and the paused 8th
 * item, which only appear after this word has already faded out.
 */
function StateWord({
  scrollYProgress,
  text,
  window: win,
}: {
  scrollYProgress: MotionValue<number>;
  text: string;
  window: [number, number];
}) {
  const opacity = useTransform(scrollYProgress, [win[0], win[0] + 0.015, win[1] - 0.03, win[1]], [0, 0.14, 0.14, 0]);
  const scale = useTransform(scrollYProgress, [win[0], win[0] + 0.02], [0.96, 1]);
  return (
    // Centering via Framer's x/y instead of a Tailwind translate class,
    // since the animated `scale` here would otherwise silently drop it
    // (Same fix as Chapter03's FieldLabel/HubLabel, Step 27).
    <motion.p
      style={{ opacity, scale, left: '50%', top: '90%', x: '-50%', y: '-50%', color: 'var(--color-ink-on-dark)' }}
      className="pointer-events-none absolute z-0 w-[90%] max-w-[40rem] text-center text-display-lg"
      aria-hidden="true"
    >
      {text}
    </motion.p>
  );
}

/** Faint darkening breath across the one deliberate "too much" window (§20) — never opaque enough to hide anything. */
function ChaosVignette({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0.3, 0.42, 0.5], [0, 0.22, 0]);
  return <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0 bg-black" aria-hidden="true" />;
}

function StaticMark({ pos, label, meta, accent }: { pos: Pt; label: string; meta: string; accent?: boolean }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[6px]" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
      <span
        className="block h-[6px] w-[6px] rounded-full"
        style={{ backgroundColor: accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-on-dark)' }}
        aria-hidden="true"
      />
      <p className="whitespace-nowrap text-mono text-[0.8125rem]" style={{ color: 'var(--color-ink-on-dark)' }}>
        {label}
      </p>
      <p className="whitespace-nowrap text-label" style={{ color: accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-muted-on-dark)' }}>
        {meta}
      </p>
    </div>
  );
}

export function Chapter07Scale() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const items = isMobile ? M_ITEMS : D_ITEMS;
  const paused = isMobile ? M_PAUSED : D_PAUSED;

  const markerOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 0.6]);
  const priceLineOpacity = useTransform(scrollYProgress, [0.86, 0.89], [0, 0.85]);
  const priceOpacity = useTransform(scrollYProgress, [0.89, 0.92], [0, 1]);
  const trialOpacity = useTransform(scrollYProgress, [0.92, 0.95], [0, 0.85]);

  if (prefersReducedMotion) {
    return (
      <section id="chapter-07" data-theme="dark" className="relative w-full" aria-label="Scale without chaos">
        <h3 className="sr-only">
          As more work enters the system — onboarding docs, proposals, invoices, integration requests — it is
          automatically routed rather than piling up. The workspace stays as organized with seven active items as it
          was with one. One workspace costs $20 per month, with a 7-day free trial. One more piece of work is
          approaching but has not yet entered.
        </h3>
        <div
          className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-lg py-section-mobile lg:py-0"
          style={{ backgroundColor: 'var(--color-surface-dark)' }}
        >
          <AmbientOrbs variant="scale" />
          <SecondaryGrid id="ch07-dot-grid-secondary-static" />
          <div className="relative h-[56vh] w-[92vw] max-w-wide">
            {items.map((item) => (
              <StaticMark key={item.id} pos={item.end} label={item.label} meta={item.meta} accent={item.accent} />
            ))}
            <StaticMark pos={paused.pause} label="Prepare Onboarding Kit" meta="Priya" />
          </div>
          <div className="flex flex-col items-center gap-xs px-gutter-mobile text-center">
            <p className="text-body-sm italic" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
              More work. Not more chaos.
            </p>
            <p className="text-price" style={{ color: 'var(--color-ink-on-dark)' }}>
              $20 / month
            </p>
            <p className="text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
              One workspace · 7-day free trial
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-07" ref={sectionRef} data-theme="dark" className="relative w-full h-[520dvh]" aria-label="Scale without chaos">
      <h3 className="sr-only">
        Work begins arriving from every direction — onboarding docs, proposals, client updates, invoices, integration
        requests. Each piece is automatically redirected into an organized position rather than piling up. As more
        work continues to arrive, the workspace becomes more organized, not less. One workspace costs $20 per month,
        with a 7-day free trial. One further piece of work approaches but pauses, not yet entered.
      </h3>

      <div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <AmbientOrbs variant="scale" />
        <ScaleDepth3D
          scrollYProgress={scrollYProgress}
          items={items.map((item) => ({
            id: item.id,
            accent: item.accent,
            turn: item.turn,
            bend: item.bend,
            window: item.window,
            depth: item.depth,
            start: item.start,
            end: item.end,
          }))}
          paused={paused}
        />
        <SecondaryGrid id="ch07-dot-grid-secondary" />
        <ChaosVignette scrollYProgress={scrollYProgress} />

        <motion.p
          style={{ opacity: markerOpacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute left-gutter-mobile top-[6%] z-10 text-label sm:left-gutter-tablet lg:left-gutter-desktop"
        >
          07
        </motion.p>

        <StateWord scrollYProgress={scrollYProgress} text="MORE" window={[0.08, 0.28]} />
        <StateWord scrollYProgress={scrollYProgress} text="COORDINATION" window={[0.34, 0.62]} />
        <StateWord scrollYProgress={scrollYProgress} text="WITHOUT CHAOS" window={[0.66, 0.85]} />

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
          {items.map((item) => (
            <ItemPath key={item.id} scrollYProgress={scrollYProgress} item={item} />
          ))}
        </svg>

        <div className="absolute inset-0 z-[2]">
          {items.map((item) => (
            <ItemMark key={item.id} scrollYProgress={scrollYProgress} item={item} />
          ))}
          <PausedItem scrollYProgress={scrollYProgress} start={paused.start} pause={paused.pause} window={paused.window} />
        </div>

        <div className="absolute bottom-[9%] left-1/2 z-[3] flex w-[86%] max-w-[26rem] -translate-x-1/2 flex-col items-center gap-[6px] text-center">
          <motion.p style={{ opacity: priceLineOpacity, color: 'var(--color-ink-muted-on-dark)' }} className="text-body-sm italic">
            One workspace.
          </motion.p>
          <motion.p style={{ opacity: priceOpacity, color: 'var(--color-ink-on-dark)' }} className="text-price">
            $20 / month
          </motion.p>
          <motion.p style={{ opacity: trialOpacity, color: 'var(--color-ink-muted-on-dark)' }} className="text-label">
            7-day free trial
          </motion.p>
        </div>
      </div>
    </section>
  );
}
