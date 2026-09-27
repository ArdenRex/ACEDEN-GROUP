'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { SignalDot } from '@/components/primitives/SignalDot';
import dynamic from 'next/dynamic';
import { AmbientOrbs, SecondaryGrid } from '@/components/primitives/DepthField';

// Dynamic, ssr:false, matching Hero3D's own load pattern exactly (see
// Chapter01Conversation.tsx) — this is what lets webpack share one
// three.js chunk across both 3D elements instead of bundling a second,
// undeduped copy into the page (confirmed via build output: a static
// import here added ~136kB gzipped in two new chunks that duplicated
// code already present in Hero3D's chunks; switching to this pattern
// removed the duplication entirely).
const EcosystemDepth3D = dynamic(
  () => import('@/components/primitives/EcosystemDepth3D').then((m) => m.EcosystemDepth3D),
  { ssr: false },
);

/**
 * Chapter 06 — "The Ecosystem."
 *
 * NEW FILE. page.tsx gained one import + one render line; no other
 * chapter was touched.
 *
 * ----------------------------------------------------------------
 * WHY THESE SIX SYSTEMS, AND NOT THE BRIEF'S EXAMPLE LIST
 * ----------------------------------------------------------------
 * The brief's own text listed Slack/Email/Notion/Jira/Trello/Teams as
 * illustrative examples but explicitly required using only what the
 * product actually supports. Per the confirmed product spec supplied
 * for this step, all six of those happen to be real: Slack (native
 * bot, OAuth, event handling, NL task extraction), Email (inbound
 * endpoint + AI extraction), Microsoft Teams (tenant config, channel
 * registration, webhooks), Notion (implemented/configurable), Jira
 * (implemented), and Trello (import-oriented only — deliberately
 * rendered with an "imported" grammar, never a live two-way sync, so
 * the chapter doesn't overclaim). No integration is invented.
 *
 * ----------------------------------------------------------------
 * THE CHAIN IS A REAL WORKFLOW, NOT A RANDOM TOUR
 * ----------------------------------------------------------------
 * The signal carried over from Chapter 05 (it starts at the exact
 * field position Ch.05's Launch Checklist settled at, making the
 * "people → systems" handoff literal, not a new section starting
 * cold) visits systems in an order a real coordination event would
 * plausibly take: discussed in Slack → followed up by Email → shared
 * to a Teams channel → filed as a Jira issue → given context in
 * Notion → imported onto a Trello board. Every hop is causal (§06),
 * never six independent reveals.
 *
 * ----------------------------------------------------------------
 * SIX DISTINCT REACTIONS, NOT ONE ANIMATION REPEATED (§07)
 * ----------------------------------------------------------------
 * No logos are drawn (avoids both trademark recreation and the "mini
 * app" trap in §08). Each system is a name plus one small abstract,
 * behavior-specific fragment:
 *   Slack  — a second message line writes itself in.
 *   Email  — a mark travels along a line, then the line settles ("sent").
 *   Teams  — a channel-activity bar rises then settles.
 *   Jira   — a ticket outline tilts and untilts as it "files" (re-organizes).
 *   Notion — three outline bars resolve top-to-bottom (a page structuring itself).
 *   Trello — a card mark inside an outline shifts down (an import landing).
 * These are geometry/typography only — no icon or logo library exists
 * in this project, and none was added.
 *
 * ----------------------------------------------------------------
 * FRAGMENTATION → SYNCHRONIZATION (§09, §11, §12)
 * ----------------------------------------------------------------
 * 0–~78%: the six hops above, each system's own reveal only.
 * ~80–89%: three staggered "coordination pulses" — the systems that
 * already exist simply flash together in growing combinations
 * (Slack+Jira, then +Email/Notion/Teams, then all six near-together)
 * — no new lines are drawn for this; it is pure shared timing, which
 * is what makes it read as rhythm rather than another diagram.
 * During the same window each system's position drifts a few field-
 * units off its resting spot (§13, "break the rectangle") — small,
 * asymmetric, never a re-grid.
 * ~93–100%: one quiet signal leaves the field toward the viewport
 * edge — the Chapter 07 bridge — while a second, closing editorial
 * line settles in.
 *
 * ----------------------------------------------------------------
 * WHY NO PHYSICAL MERGING
 * ----------------------------------------------------------------
 * Per §12 explicitly: the six systems never move into one cluster the
 * way Chapter 05's people did. Their positions only ever drift a
 * little, staying spread across the full viewport — the payoff is
 * that their behavior synchronizes while they stay visually distinct,
 * which is also what keeps this chapter from reading as "Chapter 05
 * again" (§28 Test 5).
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * A static field: the six system names (each with its glimpse frozen
 * at its fully-resolved state) already spread at their settled
 * positions, plus both editorial lines. No travel, no pulses, no
 * drift. All relationships are additionally stated in an sr-only
 * heading.
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

type SystemId = 'slack' | 'email' | 'teams' | 'jira' | 'notion' | 'trello';
const CHAIN: SystemId[] = ['slack', 'email', 'teams', 'jira', 'notion', 'trello'];
const SYSTEM_LABEL: Record<SystemId, string> = {
  slack: 'Slack',
  email: 'Email',
  teams: 'Microsoft Teams',
  jira: 'Jira',
  notion: 'Notion',
  trello: 'Trello',
};

// ----------------------------------------------------------------
// PHASE FRACTIONS
// ----------------------------------------------------------------
const OPEN: [number, number] = [0, 0.05];
const EDITORIAL_1: [number, number] = [0.02, 0.07];

const HOP_DRAW: Record<SystemId, [number, number]> = {
  slack: [0.05, 0.13],
  email: [0.19, 0.28],
  teams: [0.34, 0.43],
  jira: [0.49, 0.57],
  notion: [0.59, 0.66],
  trello: [0.68, 0.75],
};
const HOP_FADE: Record<SystemId, [number, number]> = {
  slack: [0.13, 0.17],
  email: [0.28, 0.32],
  teams: [0.43, 0.47],
  jira: [0.57, 0.6],
  notion: [0.66, 0.69],
  trello: [0.75, 0.78],
};
const REACT: Record<SystemId, [number, number]> = {
  slack: [0.12, 0.18],
  email: [0.27, 0.33],
  teams: [0.42, 0.48],
  jira: [0.56, 0.62],
  notion: [0.65, 0.7],
  trello: [0.74, 0.79],
};

const PULSE_A: [number, number] = [0.8, 0.83]; // slack, jira
const PULSE_B: [number, number] = [0.83, 0.86]; // email, notion, teams
const PULSE_C: [number, number] = [0.865, 0.895]; // all six
// Same three windows, flattened for EcosystemDepth3D — the 3D field
// brightens on the identical shared-timing beats the 2D system nodes
// already pulse on, so the "systems synchronizing" payoff gains a
// volumetric component instead of the 3D layer running on its own
// unrelated schedule.
const ALL_PULSE_WINDOWS: [number, number][] = [PULSE_A, PULSE_B, PULSE_C];

const PULSE_WINDOWS: Record<SystemId, [number, number][]> = {
  slack: [PULSE_A, PULSE_C],
  jira: [PULSE_A, PULSE_C],
  email: [PULSE_B, PULSE_C],
  notion: [PULSE_B, PULSE_C],
  teams: [PULSE_B, PULSE_C],
  trello: [PULSE_C],
};

const BREAK_START = 0.8;
const BREAK_END = 0.93;
const OUTWARD_SIGNAL: [number, number] = [0.93, 1];
const EDITORIAL_2: [number, number] = [0.93, 0.98];

// ----------------------------------------------------------------
// DESKTOP FIELD — asymmetric, varied depth (§13, §14). Origin
// matches Chapter 05's Launch Checklist final resting position
// exactly, so the work signal reads as carried forward, not new.
// ----------------------------------------------------------------
const D_ORIGIN: Pt = { x: 46, y: 52 };
const D_BASE: Record<SystemId, Pt> = {
  slack: { x: 16, y: 30 },
  email: { x: 34, y: 80 },
  teams: { x: 66, y: 16 },
  jira: { x: 83, y: 50 },
  notion: { x: 58, y: 86 },
  trello: { x: 90, y: 78 },
};
const D_DRIFT: Record<SystemId, Pt> = {
  slack: { x: 13, y: 26 },
  email: { x: 37, y: 76 },
  teams: { x: 69, y: 13 },
  jira: { x: 80, y: 55 },
  notion: { x: 61, y: 82 },
  trello: { x: 87, y: 82 },
};
const D_DEPTH: Record<SystemId, number> = {
  slack: 1.15,
  email: 0.85,
  teams: 1,
  jira: 1.1,
  notion: 0.8,
  trello: 0.95,
};
const D_OUTWARD_TO: Pt = { x: 3, y: 60 };

// ----------------------------------------------------------------
// MOBILE FIELD — vertical journey, top to bottom, mild left/right
// asymmetry so it never reads as a centered list (§21).
// ----------------------------------------------------------------
const M_ORIGIN: Pt = { x: 50, y: 4 };
const M_BASE: Record<SystemId, Pt> = {
  slack: { x: 30, y: 15 },
  email: { x: 66, y: 29 },
  teams: { x: 28, y: 45 },
  jira: { x: 70, y: 59 },
  notion: { x: 30, y: 73 },
  trello: { x: 66, y: 87 },
};
const M_DRIFT: Record<SystemId, Pt> = {
  slack: { x: 27, y: 13 },
  email: { x: 69, y: 27 },
  teams: { x: 25, y: 47 },
  jira: { x: 73, y: 57 },
  notion: { x: 27, y: 75 },
  trello: { x: 69, y: 89 },
};
const M_DEPTH: Record<SystemId, number> = {
  slack: 1.1,
  email: 0.85,
  teams: 1,
  jira: 1.05,
  notion: 0.82,
  trello: 0.92,
};
const M_OUTWARD_TO: Pt = { x: 92, y: 96 };

const SYSTEM_ANCHOR_COLOR: Record<SystemId, number> = {
  slack: 0xf3efe7,
  email: 0xf3efe7,
  teams: 0x7c4dff,
  jira: 0xf3efe7,
  notion: 0xd98e2b,
  trello: 0xf3efe7,
};

function bendPoint(from: Pt, to: Pt, bend: number): Pt {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return { x: mid.x + nx * bend, y: mid.y + ny * bend };
}

function systemPos(base: Pt, drift: Pt) {
  return point([0, BREAK_START, BREAK_END, 1], [base.x, base.x, drift.x, drift.x], [base.y, base.y, drift.y, drift.y]);
}

// ----------------------------------------------------------------
// AMBIENT GLOW PATH — the same t-checkpoints as the hop chain
// (depart at each HOP_DRAW start, settle at each REACT start), so
// the glow trails the traveling work signal itself rather than
// sitting in one fixed spot. Converges on the field's centroid once
// the six systems start synchronizing (§11's pulses).
// ----------------------------------------------------------------
const GLOW_T = [
  0,
  HOP_DRAW.slack[0],
  REACT.slack[0],
  HOP_DRAW.email[0],
  REACT.email[0],
  HOP_DRAW.teams[0],
  REACT.teams[0],
  HOP_DRAW.jira[0],
  REACT.jira[0],
  HOP_DRAW.notion[0],
  REACT.notion[0],
  HOP_DRAW.trello[0],
  REACT.trello[0],
  BREAK_START,
  (PULSE_C[0] + PULSE_C[1]) / 2,
  1,
];
function glowPath(origin: Pt, base: Record<SystemId, Pt>, centroid: Pt) {
  const seq = [origin, origin, base.slack, base.slack, base.email, base.email, base.teams, base.teams, base.jira, base.jira, base.notion, base.notion, base.trello, base.trello, centroid, centroid];
  return point(GLOW_T, seq.map((p) => p.x), seq.map((p) => p.y));
}
const D_CENTROID: Pt = { x: 58, y: 57 };
const M_CENTROID: Pt = { x: 48, y: 51 };

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

/** One causal hop — curved, self-drawing, briefly traveled, then recedes. Identical grammar to Ch.05's NetworkSignal. */
function NetworkHop({
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

  return (
    <motion.g style={{ opacity }} aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke="var(--color-border-on-dark-strong)"
        strokeWidth={0.3}
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: draw }}
      />
      <motion.circle r={0.85} cx={dotX} cy={dotY} fill="var(--color-red-on-dark)" style={{ opacity: dotOpacity }} />
    </motion.g>
  );
}

// ----------------------------------------------------------------
// SIX DISTINCT REACTION FRAGMENTS — geometry/typography only.
// ----------------------------------------------------------------
function SlackGlimpse({ progress }: { progress: MotionValue<number> }) {
  const bar2Width = useTransform(progress, [0, 1], [0, 26]);
  const bar2WidthPx = useTransform(bar2Width, (v) => `${v}px`);
  const bar1Opacity = useTransform(progress, [0, 1], [0.35, 1]);
  return (
    <div className="flex flex-col gap-[4px]">
      <motion.span
        style={{ opacity: bar1Opacity, backgroundColor: 'var(--color-ink-on-dark)' }}
        className="block h-[2px] w-[30px] rounded-full"
      />
      <motion.span style={{ width: bar2WidthPx, backgroundColor: 'var(--color-ink-muted-on-dark)' }} className="block h-[2px] rounded-full" />
    </div>
  );
}

function EmailGlimpse({ progress }: { progress: MotionValue<number> }) {
  const lineOpacity = useTransform(progress, [0, 1], [0.35, 1]);
  const dotX = useTransform(progress, [0, 1], [0, 30]);
  const dotXPx = useTransform(dotX, (v) => `${v}px`);
  const dotOpacity = useTransform(progress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
  return (
    <div className="relative h-[6px] w-[32px]">
      <motion.span
        style={{ opacity: lineOpacity, backgroundColor: 'var(--color-ink-on-dark)' }}
        className="absolute top-1/2 block h-[1px] w-full -translate-y-1/2"
      />
      <motion.span
        style={{ left: dotXPx, opacity: dotOpacity, backgroundColor: 'var(--color-red-on-dark)' }}
        className="absolute top-1/2 block h-[5px] w-[5px] -translate-y-1/2 rounded-full"
      />
    </div>
  );
}

function TeamsGlimpse({ progress }: { progress: MotionValue<number> }) {
  const barHeight = useTransform(progress, [0, 0.55, 1], [5, 16, 10]);
  const barHeightPx = useTransform(barHeight, (v) => `${v}px`);
  const dashOpacity = useTransform(progress, [0, 1], [0.35, 1]);
  return (
    <div className="flex h-[16px] items-end gap-[5px]">
      <motion.span style={{ height: barHeightPx, backgroundColor: 'var(--color-ink-on-dark)' }} className="block w-[2px] rounded-full" />
      <motion.span
        style={{ opacity: dashOpacity, backgroundColor: 'var(--color-ink-muted-on-dark)' }}
        className="mb-[3px] block h-[2px] w-[18px] rounded-full"
      />
    </div>
  );
}

function JiraGlimpse({ progress }: { progress: MotionValue<number> }) {
  const rotate = useTransform(progress, [0, 0.55, 1], [0, -7, 0]);
  const innerWidth = useTransform(progress, [0, 1], [5, 15]);
  const innerWidthPx = useTransform(innerWidth, (v) => `${v}px`);
  const opacity = useTransform(progress, [0, 1], [0.4, 1]);
  return (
    <motion.div
      style={{ rotate, opacity, borderColor: 'var(--color-border-on-dark-strong)' }}
      className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border"
    >
      <motion.span style={{ width: innerWidthPx, backgroundColor: 'var(--color-ink-on-dark)' }} className="block h-[2px] rounded-full" />
    </motion.div>
  );
}

function NotionGlimpse({ progress }: { progress: MotionValue<number> }) {
  const o1 = useTransform(progress, [0, 0.35], [0.3, 1]);
  const o2 = useTransform(progress, [0.25, 0.65], [0.2, 1]);
  const o3 = useTransform(progress, [0.55, 1], [0.15, 1]);
  return (
    <div className="flex flex-col gap-[3px]">
      <motion.span style={{ opacity: o1, backgroundColor: 'var(--color-ink-on-dark)' }} className="block h-[2px] w-[26px] rounded-full" />
      <motion.span style={{ opacity: o2, backgroundColor: 'var(--color-ink-muted-on-dark)' }} className="block h-[2px] w-[19px] rounded-full" />
      <motion.span style={{ opacity: o3, backgroundColor: 'var(--color-ink-muted-on-dark)' }} className="block h-[2px] w-[12px] rounded-full" />
    </div>
  );
}

function TrelloGlimpse({ progress }: { progress: MotionValue<number> }) {
  const barTop = useTransform(progress, [0, 1], [3, 10]);
  const barTopPx = useTransform(barTop, (v) => `${v}px`);
  const opacity = useTransform(progress, [0, 1], [0.4, 1]);
  return (
    <motion.div
      style={{ opacity, borderColor: 'var(--color-border-on-dark-strong)' }}
      className="relative h-[20px] w-[16px] rounded-[3px] border"
    >
      <motion.span style={{ top: barTopPx, backgroundColor: 'var(--color-ink-on-dark)' }} className="absolute left-[3px] block h-[2px] w-[10px] rounded-full" />
    </motion.div>
  );
}

function SystemGlimpse({ id, progress }: { id: SystemId; progress: MotionValue<number> }) {
  switch (id) {
    case 'slack':
      return <SlackGlimpse progress={progress} />;
    case 'email':
      return <EmailGlimpse progress={progress} />;
    case 'teams':
      return <TeamsGlimpse progress={progress} />;
    case 'jira':
      return <JiraGlimpse progress={progress} />;
    case 'notion':
      return <NotionGlimpse progress={progress} />;
    case 'trello':
      return <TrelloGlimpse progress={progress} />;
  }
}

/** Combines this system's rhythm-phase flashes into one scale motion value. */
/**
 * The field's ambient texture — deliberately a different motif from
 * Chapter 05's fixed dot-grid + static gathering glow, so this reads
 * as its own chapter rather than a reskin:
 *  - a sparser crosshair/tick pattern (schematic reference marks, not
 *    dots) — a "circuit board" register rather than a "starfield" one
 *  - a glow that TRAVELS with the work signal from system to system
 *    (glowPath above) rather than sitting still and only brightening
 *    — it settles at the field's centroid only once the six systems
 *    start synchronizing
 * Not a panel: no border, no radius, no shadow.
 */
function FieldTexture({
  scrollYProgress,
  origin,
  base,
  drift,
  centroid,
}: {
  scrollYProgress: MotionValue<number>;
  origin: Pt;
  base: Record<SystemId, Pt>;
  drift: Record<SystemId, Pt>;
  centroid: Pt;
}) {
  const path = glowPath(origin, base, centroid);
  const glowX = useTransform(scrollYProgress, path.x.t, path.x.v);
  const glowY = useTransform(scrollYProgress, path.y.t, path.y.v);
  const glowXPct = useTransform(glowX, (v) => `${v}%`);
  const glowYPct = useTransform(glowY, (v) => `${v}%`);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, BREAK_START, PULSE_C[0], PULSE_C[1], 1],
    [0.06, 0.14, 0.14, 0.3, 0.3, 0.18],
  );
  const glowBackground = useTransform(
    [glowXPct, glowYPct],
    ([x, y]: string[]) => `radial-gradient(38% 34% at ${x} ${y}, var(--color-ink-muted-on-dark), transparent 72%)`,
  );

  // STEP 57 (sub-step 2 — real 3D anchors for the six systems): each
  // system gets one small lit gem in EcosystemDepth3D, positioned at
  // that exact system's own field coordinate (base -> drift, same
  // curve the 2D mark itself follows via systemPos), and revealed on
  // that system's own HOP_DRAW/REACT window — never all six appearing
  // together. This is additive atmosphere behind the real 2D marks,
  // not a replacement for them, and it never draws a logo — same
  // "no icon/logo library" rule §08 already established for the 2D
  // SystemGlimpse fragments.
  const systemAnchors = CHAIN.map((id) => ({
    id,
    base: base[id],
    drift: drift[id],
    revealStart: HOP_DRAW[id][0],
    revealEnd: REACT[id][1],
    pulseWindows: PULSE_WINDOWS[id],
    color: SYSTEM_ANCHOR_COLOR[id],
  }));

  // STEP 58 (sub-step 3 — 3D transitions): the signal traveling between
  // systems only ever moved along a flat 2D line (NetworkHop's own
  // dotX/dotY, below in the SVG). This gives each of the same six hops
  // a companion 3D gem in EcosystemDepth3D that traces the *identical*
  // curve (same bend/control point) but lifts into real depth mid-hop
  // before settling back — a genuine 3D transition riding along the
  // real signal path, not a decorative flight path invented separately.
  const hopDefs = [
    { from: origin, to: base.slack, bend: 16, drawWindow: HOP_DRAW.slack },
    { from: base.slack, to: base.email, bend: -14, drawWindow: HOP_DRAW.email },
    { from: base.email, to: base.teams, bend: 12, drawWindow: HOP_DRAW.teams },
    { from: base.teams, to: base.jira, bend: -10, drawWindow: HOP_DRAW.jira },
    { from: base.jira, to: base.notion, bend: 14, drawWindow: HOP_DRAW.notion },
    { from: base.notion, to: base.trello, bend: -12, drawWindow: HOP_DRAW.trello },
  ];
  const hops = hopDefs.map((h) => ({
    from: h.from,
    to: h.to,
    ctrl: bendPoint(h.from, h.to, h.bend),
    drawWindow: h.drawWindow,
  }));

  return (
    <>
      <AmbientOrbs variant="ecosystem" />
      <EcosystemDepth3D
        scrollYProgress={scrollYProgress}
        pulseWindows={ALL_PULSE_WINDOWS}
        systems={systemAnchors}
        hops={hops}
        breakStart={BREAK_START}
        breakEnd={BREAK_END}
      />
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity, backgroundImage: glowBackground }}
        className="pointer-events-none absolute inset-0"
      />
      <SecondaryGrid id="ch06-dot-grid-secondary" />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
        aria-hidden="true"
      >
        <defs>
          <pattern id="ch06-tick-grid" width="9" height="9" patternUnits="userSpaceOnUse">
            <path d="M 4.5 3.6 L 4.5 5.4 M 3.6 4.5 L 5.4 4.5" stroke="var(--color-border-on-dark)" strokeWidth="0.18" vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#ch06-tick-grid)" />
      </svg>
    </>
  );
}

function usePulseScale(scrollYProgress: MotionValue<number>, windows: [number, number][]) {
  const t: number[] = [0];
  const v: number[] = [1];
  for (const [a, b] of windows) {
    const mid = (a + b) / 2;
    t.push(a, mid, b);
    v.push(1, 1.14, 1);
  }
  t.push(1);
  v.push(1);
  return useTransform(scrollYProgress, t, v);
}

function SystemNode({
  scrollYProgress,
  id,
  pos,
  depthScale,
}: {
  scrollYProgress: MotionValue<number>;
  id: SystemId;
  pos: { x: Beat; y: Beat };
  depthScale: number;
}) {
  const left = useTransform(scrollYProgress, pos.x.t, pos.x.v);
  const top = useTransform(scrollYProgress, pos.y.t, pos.y.v);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);

  const reactWindow = REACT[id];
  const baseOpacity = useTransform(scrollYProgress, [0, 0.05, reactWindow[0], reactWindow[1]], [0, 0.4, 0.4, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.05, reactWindow[0], reactWindow[1]], [0, 0.3, 0.3, 0.85]);
  const reactProgress = useTransform(scrollYProgress, reactWindow, [0, 1]);
  const pulse = usePulseScale(scrollYProgress, PULSE_WINDOWS[id]);

  return (
    <motion.div style={{ left: leftPct, top: topPct, opacity: baseOpacity }} className="absolute -translate-x-1/2 -translate-y-1/2">
      <motion.div style={{ scale: pulse }}>
        <div style={{ transform: `scale(${depthScale})` }} className="flex flex-col items-center gap-[7px]">
          <SystemGlimpse id={id} progress={reactProgress} />
          <motion.p style={{ opacity: labelOpacity, color: 'var(--color-ink-muted-on-dark)' }} className="whitespace-nowrap text-label">
            {SYSTEM_LABEL[id]}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WorkOrigin({ scrollYProgress, pos }: { scrollYProgress: MotionValue<number>; pos: Pt }) {
  const opacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);
  const pulseScale = useTransform(scrollYProgress, [OPEN[0], (OPEN[0] + OPEN[1]) / 2, OPEN[1]], [1, 2.1, 1]);
  const pulseColor = useTransform(
    scrollYProgress,
    [OPEN[0], (OPEN[0] + OPEN[1]) / 2, OPEN[1]],
    ['var(--color-ink-on-dark)', 'var(--color-red-on-dark)', 'var(--color-ink-on-dark)'],
  );
  return (
    <motion.div style={{ left: `${pos.x}%`, top: `${pos.y}%`, opacity }} className="absolute -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <motion.span style={{ scale: pulseScale, backgroundColor: pulseColor }} className="block h-[7px] w-[7px] rounded-full" />
    </motion.div>
  );
}

function StaticSystem({ id, pos }: { id: SystemId; pos: Pt }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[7px]" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
      <span className="flex h-[18px] w-[24px] items-center justify-center" aria-hidden="true">
        <span className="block h-[2px] w-[22px] rounded-full" style={{ backgroundColor: 'var(--color-ink-on-dark)' }} />
      </span>
      <p className="whitespace-nowrap text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
        {SYSTEM_LABEL[id]}
      </p>
    </div>
  );
}

export function Chapter06Ecosystem() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  const markerOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 0.6]);
  const editorial1Opacity = useTransform(scrollYProgress, EDITORIAL_1, [0, 0.75]);
  const editorial2Opacity = useTransform(scrollYProgress, EDITORIAL_2, [0, 0.75]);

  const origin = isMobile ? M_ORIGIN : D_ORIGIN;
  const base = isMobile ? M_BASE : D_BASE;
  const drift = isMobile ? M_DRIFT : D_DRIFT;
  const depth = isMobile ? M_DEPTH : D_DEPTH;
  const outwardTo = isMobile ? M_OUTWARD_TO : D_OUTWARD_TO;

  const outwardX = useTransform(scrollYProgress, OUTWARD_SIGNAL, [origin.x, outwardTo.x]);
  const outwardY = useTransform(scrollYProgress, OUTWARD_SIGNAL, [origin.y, outwardTo.y]);
  const outwardXPct = useTransform(outwardX, (v) => `${v}%`);
  const outwardYPct = useTransform(outwardY, (v) => `${v}%`);
  const outwardOpacity = useTransform(scrollYProgress, [0.93, 0.97, 1], [0, 0.55, 0.55]);

  if (prefersReducedMotion) {
    return (
      <section id="chapter-06" data-theme="dark" className="relative w-full" aria-label="The ecosystem">
        <h3 className="sr-only">
          The same work reaches every system your team already uses: it is discussed in Slack, followed up by email,
          shared in Microsoft Teams, filed as a Jira issue, given context in Notion, and imported onto a Trello
          board. All six now respond in a shared, coordinated rhythm rather than as separate disconnected tools.
        </h3>
        <div
          className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center gap-lg overflow-hidden py-section-mobile lg:py-0"
          style={{ backgroundColor: 'var(--color-surface-dark)' }}
        >
          <AmbientOrbs variant="ecosystem" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(38% 34% at ${isMobile ? M_CENTROID.x : D_CENTROID.x}% ${
                isMobile ? M_CENTROID.y : D_CENTROID.y
              }%, var(--color-ink-muted-on-dark), transparent 72%)`,
            }}
          />
          <SecondaryGrid id="ch06-dot-grid-secondary-static" />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
            aria-hidden="true"
          >
            <defs>
              <pattern id="ch06-tick-grid-static" width="9" height="9" patternUnits="userSpaceOnUse">
                <path
                  d="M 4.5 3.6 L 4.5 5.4 M 3.6 4.5 L 5.4 4.5"
                  stroke="var(--color-border-on-dark)"
                  strokeWidth="0.18"
                  vectorEffect="non-scaling-stroke"
                />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#ch06-tick-grid-static)" />
          </svg>
          <div className="relative h-[56vh] w-[92vw] max-w-wide">
            {CHAIN.map((id) => (
              <StaticSystem key={id} id={id} pos={isMobile ? M_DRIFT[id] : D_DRIFT[id]} />
            ))}
          </div>
          <p className="max-w-[26rem] px-gutter-mobile text-center text-body-sm italic" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
            The work doesn&rsquo;t live in one place. Your workflow doesn&rsquo;t have to either.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-06" ref={sectionRef} data-theme="dark" className="relative w-full h-[480dvh]" aria-label="The ecosystem">
      <h3 className="sr-only">
        One piece of work travels from Slack to Email to Microsoft Teams to Jira to Notion to Trello, and each
        system responds in its own way. By the end, all six systems respond together in a shared, coordinated
        rhythm, while remaining separate tools.
      </h3>

      <div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <FieldTexture scrollYProgress={scrollYProgress} origin={origin} base={base} drift={drift} centroid={isMobile ? M_CENTROID : D_CENTROID} />

        <motion.p
          style={{ opacity: markerOpacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute left-gutter-mobile top-[6%] z-10 text-label sm:left-gutter-tablet lg:left-gutter-desktop"
        >
          06
        </motion.p>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <NetworkHop scrollYProgress={scrollYProgress} from={origin} to={base.slack} bend={16} drawWindow={HOP_DRAW.slack} fadeWindow={HOP_FADE.slack} />
          <NetworkHop scrollYProgress={scrollYProgress} from={base.slack} to={base.email} bend={-14} drawWindow={HOP_DRAW.email} fadeWindow={HOP_FADE.email} />
          <NetworkHop scrollYProgress={scrollYProgress} from={base.email} to={base.teams} bend={12} drawWindow={HOP_DRAW.teams} fadeWindow={HOP_FADE.teams} />
          <NetworkHop scrollYProgress={scrollYProgress} from={base.teams} to={base.jira} bend={-10} drawWindow={HOP_DRAW.jira} fadeWindow={HOP_FADE.jira} />
          <NetworkHop scrollYProgress={scrollYProgress} from={base.jira} to={base.notion} bend={14} drawWindow={HOP_DRAW.notion} fadeWindow={HOP_FADE.notion} />
          <NetworkHop scrollYProgress={scrollYProgress} from={base.notion} to={base.trello} bend={-12} drawWindow={HOP_DRAW.trello} fadeWindow={HOP_FADE.trello} />
        </svg>

        <WorkOrigin scrollYProgress={scrollYProgress} pos={origin} />

        {CHAIN.map((id) => (
          <SystemNode key={id} scrollYProgress={scrollYProgress} id={id} pos={systemPos(base[id], drift[id])} depthScale={depth[id]} />
        ))}

        {/* Quiet signal leaving the synchronized ecosystem toward the edge — the Ch.07 bridge, no explanation given. */}
        <motion.div style={{ left: outwardXPct, top: outwardYPct, opacity: outwardOpacity }} className="absolute -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <SignalDot surface="dark" active size={5} />
        </motion.div>

        <motion.p
          style={{ opacity: editorial1Opacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute left-1/2 top-[10%] w-[86%] max-w-[22rem] -translate-x-1/2 text-center text-body-sm italic"
        >
          The work doesn&rsquo;t live in one place.
        </motion.p>
        <motion.p
          style={{ opacity: editorial2Opacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute bottom-[7%] left-1/2 w-[86%] max-w-[24rem] -translate-x-1/2 text-center text-body-sm italic"
        >
          Your workflow doesn&rsquo;t have to either.
        </motion.p>
      </div>
    </section>
  );
}
