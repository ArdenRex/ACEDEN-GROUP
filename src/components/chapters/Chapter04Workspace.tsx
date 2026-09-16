'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { SignalDot } from '@/components/primitives/SignalDot';
import { TiltPanel } from '@/components/primitives/TiltPanel';
import { RelationshipLine } from '@/components/primitives/RelationshipLine';

/**
 * Chapter 04 — "The workspace coordinates itself."
 *
 * FULL CREATIVE REDESIGN — supersedes the previous Ch.04 build in
 * full. That build was still, at its core, "two objects travel into
 * a box that gets labels": legible in one screenshot as a Kanban
 * demo with nicer easing. This brief asks for something structurally
 * different — the workspace must be seen *discovering* organization,
 * not receiving it — so the chapter was rebuilt from its data model
 * up, not restyled.
 *
 * KEPT from every prior step: the continuous-scrollYProgress-only
 * architecture (no discrete stage state, fully reversible), the real
 * product statuses (To Do / In Progress / Completed / Cancelled),
 * and Onboarding Docs' identity carried over from Chapter 03.
 *
 * NEW DATA: two more real work items — Client Review (Alex, Today)
 * and Design Approval (Sarah, Tomorrow) — specifically so the
 * "relationship discovery" beat has something to discover: Sarah
 * owns both Onboarding Docs and Design Approval, and that shared
 * owner is the first relationship the workspace surfaces, before any
 * column exists. Four items is also what makes "the workspace sorts
 * many things at once" (this chapter's whole argument) legible.
 *
 * ----------------------------------------------------------------
 * THE NARRATIVE SPINE (mirrors the brief's STATE A → H)
 * ----------------------------------------------------------------
 * RAW (0–12%) — four titles only, irregularly scattered, no
 * metadata, no field, no structure.
 *
 * DISCOVERY (12–28%) — owners fade in one at a time, staggered per
 * item. The instant both Onboarding Docs and Design Approval show
 * "Sarah," a restrained line (RelationshipLine, reused from Ch.03)
 * draws between them and both titles lift slightly — a relationship
 * being noticed, not a diagram.
 *
 * CONNECTION (28–48%) — deadlines and (for Onboarding Docs) priority
 * fade in; the Sarah line recedes once it's made its point.
 *
 * SELF-ORGANIZATION (48–65%) — the hero beat: all four items drift
 * from scatter toward their eventual cluster positions at once,
 * so the room reads as one system finding equilibrium, not four
 * independent moves.
 *
 * STRUCTURE (65–74%) — two dividers draw across clusters that
 * already exist; only once both are drawn do labels surface,
 * bottom-up (66–83%), Cancelled last, smallest, dividerless.
 *
 * NEW INFORMATION (82–89%) — a plain sentence rooted in the actual
 * product ("Sarah finished the onboarding docs. Can she review the
 * launch checklist tomorrow?") rises in from outside the workspace
 * frame — never a chat bubble — and is read, not sent.
 *
 * RE-COORDINATION (89–95%) — the sentence is absorbed at Launch
 * Checklist's position: its deadline updates Wednesday → Tomorrow,
 * "Sarah" joins its owner field, and it gives a small settling
 * nudge; Onboarding Docs, being referenced, answers with a brief
 * acknowledge pulse.
 *
 * SETTLED (95–100%) — the sentence is gone, the room is calm, one
 * small peripheral signal hints at Chapter 05 without explaining it.
 *
 * ----------------------------------------------------------------
 * WHY THE RELATIONSHIP LINE RECEDES INSTEAD OF PERSISTING
 * ----------------------------------------------------------------
 * A connection left drawn permanently turns this into a flowchart
 * the moment a second relationship appears. It appears, does its job
 * (make the shared owner legible), and recedes once the organization
 * it revealed becomes physical.
 *
 * ----------------------------------------------------------------
 * THE "NEW INFORMATION" OBJECT
 * ----------------------------------------------------------------
 * Rendered as a plain editorial sentence — same typographic register
 * as everything else in the chapter — positioned outside the dark
 * surface's own bounds so its entrance reads as arriving from
 * outside the workspace, per the brief's instruction not to build a
 * chat or email affordance. It is read once, then dissolves at the
 * exact point (Launch Checklist) where its content takes effect.
 *
 * ----------------------------------------------------------------
 * COORDINATE SYSTEM
 * ----------------------------------------------------------------
 * One shared 0–100 field per breakpoint, matching the growing dark
 * surface 1:1 — the convention Chapter 03 and the prior Ch.04 build
 * both use, so no DOM measurement is needed to keep items, lines and
 * dividers aligned.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * A short, static, fully-resolved 4-zone grid: Onboarding Docs in
 * Completed, Launch Checklist in In Progress already showing the
 * post-update deadline and owner, Client Review + Design Approval in
 * To Do, Cancelled empty. No discovery sequence, no traveling
 * sentence — none of it is needed to understand the outcome.
 *
 * ----------------------------------------------------------------
 * NO VISUAL QA
 * ----------------------------------------------------------------
 * Visual rendering was not available in this environment. Validated
 * via tsc --noEmit, next lint, and next build only.
 */

type ItemId = 'onboarding' | 'launch' | 'review' | 'approval';

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

// ----------------------------------------------------------------
// PHASE FRACTIONS
// ----------------------------------------------------------------
const SARAH_LINE_DRAW: [number, number] = [0.2, 0.27];
const SARAH_LINE_FADE: [number, number] = [0.34, 0.4];
const SELF_ORGANIZE: [number, number] = [0.48, 0.65];
const DIVIDER_1_DRAW: [number, number] = [0.63, 0.7];
const DIVIDER_2_DRAW: [number, number] = [0.67, 0.74];
const LABEL_TODO: [number, number] = [0.66, 0.71];
const LABEL_INPROGRESS: [number, number] = [0.7, 0.75];
const LABEL_COMPLETED: [number, number] = [0.74, 0.79];
const LABEL_CANCELLED: [number, number] = [0.78, 0.83];
const MESSAGE_ENTER: [number, number] = [0.82, 0.86];
const MESSAGE_ABSORB: [number, number] = [0.89, 0.93];
const LAUNCH_UPDATE: [number, number] = [0.9, 0.95];
const ACK_PULSE: [number, number] = [0.9, 0.95];
const PERIPHERAL_HINT: [number, number] = [0.96, 1];
const LAUNCH_UPDATE_THRESHOLD = 0.9;

const OWNER_WINDOW: Record<ItemId, [number, number]> = {
  onboarding: [0.12, 0.18],
  launch: [0.14, 0.2],
  review: [0.16, 0.22],
  approval: [0.18, 0.24],
};
const DEADLINE_WINDOW: Record<ItemId, [number, number]> = {
  onboarding: [0.28, 0.34],
  launch: [0.3, 0.36],
  review: [0.32, 0.38],
  approval: [0.34, 0.4],
};
const PRIORITY_WINDOW: [number, number] = [0.38, 0.44];

// ----------------------------------------------------------------
// DESKTOP — scatter (raw) → lane (organized) positions, 0-100 field.
// ----------------------------------------------------------------
const D_SCATTER: Record<ItemId, { x: number; y: number }> = {
  onboarding: { x: 24, y: 22 },
  launch: { x: 68, y: 18 },
  review: { x: 18, y: 68 },
  approval: { x: 76, y: 64 },
};
const D_ZONE_Y = 8;
const D_TODO_X = 16;
const D_INPROGRESS_X = 47;
const D_COMPLETED_X = 80;
const D_CANCELLED = { x: 16, y: 88 };
const D_LANE: Record<ItemId, { x: number; y: number }> = {
  review: { x: D_TODO_X, y: 30 },
  approval: { x: D_TODO_X, y: 45 },
  launch: { x: D_INPROGRESS_X, y: 37 },
  onboarding: { x: D_COMPLETED_X, y: 30 },
};
const D_LAUNCH_NUDGE = { x: D_INPROGRESS_X, y: 40 };
const D_DIVIDER_1_X = 32;
const D_DIVIDER_2_X = 64;

// ----------------------------------------------------------------
// MOBILE — same phase fractions, vertical field.
// ----------------------------------------------------------------
const M_SCATTER: Record<ItemId, { x: number; y: number }> = {
  onboarding: { x: 62, y: 16 },
  launch: { x: 32, y: 32 },
  review: { x: 72, y: 48 },
  approval: { x: 28, y: 62 },
};
const M_ZONE_X = 50;
const M_TODO_Y = 12;
const M_INPROGRESS_Y = 43;
const M_COMPLETED_Y = 68;
const M_CANCELLED = { x: 86, y: 6 };
const M_LANE: Record<ItemId, { x: number; y: number }> = {
  review: { x: 32, y: M_TODO_Y + 6 },
  approval: { x: 68, y: M_TODO_Y + 6 },
  launch: { x: M_ZONE_X, y: M_INPROGRESS_Y + 6 },
  onboarding: { x: M_ZONE_X, y: M_COMPLETED_Y + 6 },
};
const M_LAUNCH_NUDGE = { x: M_ZONE_X, y: M_INPROGRESS_Y + 9 };
const M_DIVIDER_1_Y = 30;
const M_DIVIDER_2_Y = 58;

function positionFor(id: ItemId, mobile: boolean) {
  const scatter = mobile ? M_SCATTER[id] : D_SCATTER[id];
  const lane = mobile ? M_LANE[id] : D_LANE[id];
  const nudge = id === 'launch' ? (mobile ? M_LAUNCH_NUDGE : D_LAUNCH_NUDGE) : lane;
  const isAckItem = id === 'onboarding';
  return point(
    [0, SELF_ORGANIZE[0], SELF_ORGANIZE[1], LAUNCH_UPDATE[0], (LAUNCH_UPDATE[0] + LAUNCH_UPDATE[1]) / 2, 1],
    [scatter.x, scatter.x, lane.x, lane.x, nudge.x, isAckItem ? lane.x : nudge.x],
    [scatter.y, scatter.y, lane.y, lane.y, isAckItem ? lane.y - 1.4 : nudge.y, lane.y],
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

interface MetaFieldSpec {
  text: string;
  window: [number, number];
  accent?: boolean;
}

/**
 * One work object — editorial text, not a card. Fields reveal
 * independently on their own opacity windows, so a title can have
 * zero, one, two, or three visible fields at once — matching the
 * brief's "information should emerge progressively" instruction.
 */
function WorkItem({
  scrollYProgress,
  pos,
  title,
  fields,
  emphasize,
  ackPulse,
}: {
  scrollYProgress: MotionValue<number>;
  pos: { x: Beat; y: Beat };
  title: string;
  fields: MetaFieldSpec[];
  emphasize?: MotionValue<number>;
  ackPulse?: boolean;
}) {
  const left = useTransform(scrollYProgress, pos.x.t, pos.x.v);
  const top = useTransform(scrollYProgress, pos.y.t, pos.y.v);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);

  const fallbackEmphasis = useMotionValue(0);
  const e = emphasize ?? fallbackEmphasis;
  const scale = useTransform(e, [0, 1], [1, 1.05]);
  const titleColor = useTransform(e, [0, 1], ['var(--color-ink-on-dark)', '#ffffff']);

  const ackOpacity = useTransform(
    scrollYProgress,
    [ACK_PULSE[0], (ACK_PULSE[0] + ACK_PULSE[1]) / 2, ACK_PULSE[1]],
    [0, 1, 0.35],
  );

  return (
    // Same fix as Chapter03's FieldLabel/HubLabel (Step 27): centering
    // expressed via Framer's x/y instead of a Tailwind translate class,
    // so it isn't silently dropped by the animated `scale` above.
    <motion.div style={{ left: leftPct, top: topPct, x: '-50%', y: '-50%', scale }} className="absolute whitespace-nowrap text-center">
      <motion.p
        style={{ color: titleColor }}
        className="flex items-center justify-center gap-xs text-label uppercase tracking-[0.08em]"
      >
        {title}
        {ackPulse && (
          <motion.span style={{ opacity: ackOpacity }}>
            <SignalDot surface="dark" active size={5} />
          </motion.span>
        )}
      </motion.p>
      <p
        className="mt-[3px] flex items-center justify-center gap-[6px] text-body-sm"
        style={{ color: 'var(--color-ink-muted-on-dark)' }}
      >
        {fields.map((f, i) => (
          <MetaField key={i} scrollYProgress={scrollYProgress} field={f} />
        ))}
      </p>
    </motion.div>
  );
}

function MetaField({
  scrollYProgress,
  field,
}: {
  scrollYProgress: MotionValue<number>;
  field: MetaFieldSpec;
}) {
  const opacity = useTransform(scrollYProgress, field.window, [0, 1]);
  return (
    <motion.span
      style={{ opacity, color: field.accent ? 'var(--color-red-on-dark)' : undefined }}
      className="inline-flex items-center gap-xs"
    >
      {field.text}
      {field.accent && <SignalDot surface="dark" active={false} size={5} />}
    </motion.span>
  );
}

/** A structural boundary drawing itself, only after both clusters it separates already exist. */
function Divider({
  axis,
  fixedPos,
  fixedAt,
  scrollYProgress,
  drawT,
}: {
  axis: 'v' | 'h';
  fixedPos: number;
  fixedAt: [number, number];
  scrollYProgress: MotionValue<number>;
  drawT: [number, number];
}) {
  const draw = useTransform(scrollYProgress, drawT, [0, 1]);
  const opacity = useTransform(scrollYProgress, [drawT[0], drawT[0] + 0.01], [0, 0.4]);
  const end = useTransform(draw, (d) => fixedAt[0] + (fixedAt[1] - fixedAt[0]) * d);

  if (axis === 'v') {
    return (
      <motion.line
        x1={fixedPos}
        y1={fixedAt[0]}
        x2={fixedPos}
        y2={end}
        style={{ opacity }}
        stroke="var(--color-border-on-dark-strong)"
        strokeWidth={0.3}
        vectorEffect="non-scaling-stroke"
        aria-hidden="true"
      />
    );
  }
  return (
    <motion.line
      x1={fixedAt[0]}
      y1={fixedPos}
      x2={end}
      y2={fixedPos}
      style={{ opacity }}
      stroke="var(--color-border-on-dark-strong)"
      strokeWidth={0.3}
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
    />
  );
}

export function Chapter04Workspace() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // The field grows and drifts toward the edge continuously across the
  // whole chapter, never settling into a static rectangle.
  const surfaceWidth = useTransform(scrollYProgress, [0, 0.3, 1], [52, 74, 88]);
  const surfaceHeight = useTransform(scrollYProgress, [0, 0.3, 1], [38, 58, 80]);
  const widthPct = useTransform(surfaceWidth, (v) => `${v}%`);
  const heightVh = useTransform(surfaceHeight, (v) => `${v}vh`);

  const markerOpacity = useTransform(scrollYProgress, [0, 0.04], [0, 1]);

  // ---- item positions ----
  const onboardingPos = positionFor('onboarding', isMobile);
  const launchPos = positionFor('launch', isMobile);
  const reviewPos = positionFor('review', isMobile);
  const approvalPos = positionFor('approval', isMobile);

  // ---- Sarah relationship line + emphasis ----
  const sarahFrom = isMobile ? M_SCATTER.onboarding : D_SCATTER.onboarding;
  const sarahTo = isMobile ? M_SCATTER.approval : D_SCATTER.approval;
  const sarahVisibility = useTransform(
    scrollYProgress,
    [SARAH_LINE_DRAW[0], SARAH_LINE_DRAW[1], SARAH_LINE_FADE[0], SARAH_LINE_FADE[1]],
    [0, 0.55, 0.55, 0],
  );
  const sarahTravel = useTransform(scrollYProgress, SARAH_LINE_DRAW, [0, 1]);
  const sarahEmphasis = useTransform(
    scrollYProgress,
    [SARAH_LINE_DRAW[0], SARAH_LINE_DRAW[1], SARAH_LINE_FADE[0]],
    [0, 1, 0],
  );

  // ---- zone label / divider opacities ----
  const todoOpacity = useTransform(scrollYProgress, LABEL_TODO, [0, 1]);
  const inProgressOpacity = useTransform(scrollYProgress, LABEL_INPROGRESS, [0, 1]);
  const completedOpacity = useTransform(scrollYProgress, LABEL_COMPLETED, [0, 1]);
  const cancelledOpacity = useTransform(scrollYProgress, LABEL_CANCELLED, [0, 0.7]);

  // ---- incoming message ----
  const messageOpacity = useTransform(
    scrollYProgress,
    [MESSAGE_ENTER[0], MESSAGE_ENTER[1], MESSAGE_ABSORB[0], MESSAGE_ABSORB[1]],
    [0, 1, 1, 0],
  );
  const messageY = useTransform(scrollYProgress, [MESSAGE_ENTER[0], MESSAGE_ENTER[1]], [24, 0]);
  const messageDrift = useTransform(scrollYProgress, [MESSAGE_ABSORB[0], MESSAGE_ABSORB[1]], [0, -14]);

  // ---- launch checklist text swap (Wednesday -> Tomorrow, + Sarah) ----
  const [launchUpdated, setLaunchUpdated] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const updated = v >= LAUNCH_UPDATE_THRESHOLD;
    setLaunchUpdated((prev) => (prev === updated ? prev : updated));
  });
  // STEP 28: removed the standalone "settling nudge" SignalDot that
  // used to render near Launch Checklist's meta row — it landed close
  // enough to "Sarah" in the updated field text to read as a stray
  // red mark sitting on top of the word, reported as looking wrong
  // regardless of where exactly it was nudged. The card's own brief
  // position nudge (in positionFor() above) already communicates the
  // update; this was a redundant, poorly-placed second signal for the
  // same moment, not information on its own — removing it rather than
  // re-guessing a position I can't verify without live rendering.
  const peripheralOpacity = useTransform(scrollYProgress, PERIPHERAL_HINT, [0, 0.6]);

  if (prefersReducedMotion) {
    return (
      <section id="chapter-04" className="relative w-full" aria-label="Workspace">
        <h3 className="sr-only">
          Tasks organized into To Do, In Progress, Completed, and Cancelled inside the product workspace. Client
          Review and Design Approval sit in To Do. Launch Checklist is In Progress, now scheduled for tomorrow with
          Sarah added as a reviewer. Onboarding Docs is Completed. Cancelled is empty.
        </h3>
        <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center py-section-mobile lg:py-0">
          <div
            className="relative mx-auto grid w-[92vw] max-w-wide grid-cols-4 gap-md rounded-lg border p-lg"
            style={{
              backgroundColor: 'var(--color-surface-dark)',
              borderColor: 'var(--color-border-on-dark)',
              boxShadow: 'var(--shadow-product-window-glow)',
            }}
          >
            <StaticZone label="To Do" items={[{ title: 'Client Review', meta: 'Alex · Today' }, { title: 'Design Approval', meta: 'Sarah · Tomorrow' }]} />
            <StaticZone label="In Progress" items={[{ title: 'Launch Checklist', meta: 'Marketing, Sarah · Tomorrow' }]} />
            <StaticZone label="Completed" items={[{ title: 'Onboarding Docs', meta: 'Sarah · Friday · High Priority' }]} />
            <StaticZone label="Cancelled" items={[]} subordinate />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-04" ref={sectionRef} className="relative w-full h-[460dvh]" aria-label="Workspace">
      <h3 className="sr-only">
        Work is discovered, organized into To Do, In Progress, Completed, and Cancelled, and re-coordinated when new
        information arrives: Launch Checklist moves to tomorrow with Sarah added, once Onboarding Docs is complete.
      </h3>
      <div className="sticky top-[var(--nav-height)] flex h-[calc(100dvh-var(--nav-height))] w-full items-center overflow-hidden">
        <motion.p
          style={{ opacity: markerOpacity }}
          className="absolute left-gutter-mobile top-[6%] text-label opacity-60 sm:left-gutter-tablet lg:left-gutter-desktop"
        >
          04
        </motion.p>

        <motion.div
          style={{ width: widthPct, height: heightVh, boxShadow: 'var(--shadow-product-window-glow)' }}
          className="relative mx-auto overflow-hidden rounded-lg border"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'var(--color-surface-dark)' }}
          />
          <div
            className="absolute inset-0 rounded-lg border"
            style={{ borderColor: 'var(--color-border-on-dark)' }}
            aria-hidden="true"
          />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <RelationshipLine from={sarahFrom} to={sarahTo} visibility={sarahVisibility} travel={sarahTravel} />

            {isMobile ? (
              <>
                <Divider axis="h" fixedPos={M_DIVIDER_1_Y} fixedAt={[10, 90]} scrollYProgress={scrollYProgress} drawT={DIVIDER_1_DRAW} />
                <Divider axis="h" fixedPos={M_DIVIDER_2_Y} fixedAt={[10, 90]} scrollYProgress={scrollYProgress} drawT={DIVIDER_2_DRAW} />
              </>
            ) : (
              <>
                <Divider axis="v" fixedPos={D_DIVIDER_1_X} fixedAt={[16, 84]} scrollYProgress={scrollYProgress} drawT={DIVIDER_1_DRAW} />
                <Divider axis="v" fixedPos={D_DIVIDER_2_X} fixedAt={[16, 84]} scrollYProgress={scrollYProgress} drawT={DIVIDER_2_DRAW} />
              </>
            )}
          </svg>

          <motion.p
            style={{ left: `${isMobile ? M_ZONE_X : D_TODO_X}%`, top: `${isMobile ? M_TODO_Y : D_ZONE_Y}%`, opacity: todoOpacity }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-label uppercase tracking-[0.1em]"
          >
            To Do
          </motion.p>
          <motion.p
            style={{ left: `${isMobile ? M_ZONE_X : D_INPROGRESS_X}%`, top: `${isMobile ? M_INPROGRESS_Y : D_ZONE_Y}%`, opacity: inProgressOpacity }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-label uppercase tracking-[0.1em]"
          >
            In Progress
          </motion.p>
          <motion.p
            style={{ left: `${isMobile ? M_ZONE_X : D_COMPLETED_X}%`, top: `${isMobile ? M_COMPLETED_Y : D_ZONE_Y}%`, opacity: completedOpacity }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-label uppercase tracking-[0.1em]"
          >
            Completed
          </motion.p>
          <motion.p
            style={{
              left: `${isMobile ? M_CANCELLED.x : D_CANCELLED.x}%`,
              top: `${isMobile ? M_CANCELLED.y : D_CANCELLED.y}%`,
              opacity: cancelledOpacity,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.625rem] uppercase tracking-[0.1em] opacity-70"
          >
            Cancelled
          </motion.p>

          <WorkItem
            scrollYProgress={scrollYProgress}
            pos={onboardingPos}
            title="Onboarding Docs"
            ackPulse
            fields={[
              { text: 'Sarah', window: OWNER_WINDOW.onboarding },
              { text: 'Friday', window: DEADLINE_WINDOW.onboarding },
              { text: 'High Priority', window: PRIORITY_WINDOW, accent: true },
            ]}
            emphasize={sarahEmphasis}
          />
          <WorkItem
            scrollYProgress={scrollYProgress}
            pos={launchPos}
            title="Launch Checklist"
            fields={
              launchUpdated
                ? [
                    { text: 'Marketing, Sarah', window: OWNER_WINDOW.launch },
                    { text: 'Tomorrow', window: [LAUNCH_UPDATE[0], LAUNCH_UPDATE[0] + 0.01] },
                  ]
                : [
                    { text: 'Marketing', window: OWNER_WINDOW.launch },
                    { text: 'Wednesday', window: DEADLINE_WINDOW.launch },
                  ]
            }
          />
          <WorkItem
            scrollYProgress={scrollYProgress}
            pos={reviewPos}
            title="Client Review"
            fields={[
              { text: 'Alex', window: OWNER_WINDOW.review },
              { text: 'Today', window: DEADLINE_WINDOW.review },
            ]}
          />
          <WorkItem
            scrollYProgress={scrollYProgress}
            pos={approvalPos}
            title="Design Approval"
            fields={[
              { text: 'Sarah', window: OWNER_WINDOW.approval },
              { text: 'Tomorrow', window: DEADLINE_WINDOW.approval },
            ]}
            emphasize={sarahEmphasis}
          />

          {/* New information arriving from outside the workspace frame. */}
          <motion.p
            style={{ opacity: messageOpacity, y: messageDrift }}
            className="absolute bottom-[6%] left-1/2 w-[80%] max-w-[26rem] -translate-x-1/2 text-center text-body-sm italic"
          >
            <motion.span style={{ y: messageY, display: 'inline-block' }}>
              &ldquo;Sarah finished the onboarding docs. Can she review the launch checklist tomorrow?&rdquo;
            </motion.span>
          </motion.p>

          {/* Quiet peripheral activity — the Ch.04 → 05 bridge, no explanation given. */}
          <motion.div style={{ opacity: peripheralOpacity, right: '4%', top: '6%' }} className="absolute" aria-hidden="true">
            <SignalDot surface="dark" active size={5} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function StaticZone({
  label,
  items,
  subordinate,
}: {
  label: string;
  items: { title: string; meta: string }[];
  subordinate?: boolean;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <p
        className={subordinate ? 'text-[0.625rem] uppercase tracking-[0.1em] opacity-60' : 'text-label uppercase tracking-[0.1em]'}
        style={{ color: 'var(--color-ink-muted-on-dark)' }}
      >
        {label}
      </p>
      {items.map((item) => (
        <TiltPanel key={item.title}>
          <div
            className="flex flex-col gap-[2px] rounded-md border p-sm backdrop-blur-sm transition-shadow duration-base hover:shadow-[var(--shadow-glow-accent)]"
            style={{
              borderColor: 'var(--color-border-on-dark)',
              backgroundColor: 'rgba(243, 239, 231, 0.045)',
              boxShadow: 'inset 0 1px 0 0 rgba(243, 239, 231, 0.07)',
            }}
          >
            <p className="text-body-sm uppercase tracking-[0.06em]" style={{ color: 'var(--color-ink-on-dark)' }}>
              {item.title}
            </p>
            <p className="text-body-sm" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
              {item.meta}
            </p>
          </div>
        </TiltPanel>
      ))}
    </div>
  );
}
