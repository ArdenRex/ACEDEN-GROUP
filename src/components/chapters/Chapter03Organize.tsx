'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import clsx from 'clsx';
import { RelationshipLine } from '@/components/primitives/RelationshipLine';
import { ChapterBackdrop } from '@/components/primitives/ChapterBackdrop';
import { PanelPresence } from '@/components/primitives/PanelPresence';
import { AmbientOrbs, SecondaryGrid } from '@/components/primitives/DepthField';
import { AmbientGlyphs, type AmbientGlyphSpec } from '@/components/primitives/AmbientGlyphs';
import { ChatGlyph, DocumentGlyph, PhoneGlyph } from '@/components/primitives/GlyphIcons';
import { Organize3D } from '@/components/primitives/Organize3D';
import { scrollSmoothing } from '@/lib/motion';

/**
 * STEP 34 — FILLING THE VACANT SPACE. On explicit follow-up ("the
 * panel area and the other area is looking very vacant"), two
 * additions, both staying inside this chapter's existing paper/ink
 * vocabulary rather than introducing photography or a literal 3D
 * scene that would clash with every other chapter's flat, single-
 * weight-line language:
 *
 * 1. CHAPTER_GLYPHS — a handful of quiet outline icons (see
 *    AmbientGlyphs) scattered through the wide top/bottom/side
 *    margins around the field, on their own slow independent drift,
 *    the same technique AmbientOrbs already uses for depth but with
 *    an actual shape to look at instead of a blurred smudge. Kept
 *    well clear of the field's own 92vw/56-66vh bounds and of the
 *    title/hint copy above and below it, so it reads as margin
 *    texture, never as competing content.
 * 2. Per-lane corner icon — a single small glyph inside each
 *    GroupOutline, echoing what that lane actually holds (a document
 *    for Onboarding Docs, a chat mark for Design Review, a phone for
 *    Client Call). Fades in with the same `outlineOpacity` the box
 *    border and PanelPresence corner marks already use, positioned
 *    inset from the box's own top-right corner so it never collides
 *    with PanelPresence's literal corner brackets.
 */
const CHAPTER_GLYPHS: AmbientGlyphSpec[] = [
  { kind: 'tag', top: '10%', left: '6%', size: 30, opacity: [0.2, 0.34, 0.2], duration: 24, delay: 0, driftX: [0, 6, -3, 0], driftY: [0, -4, 3, 0] },
  { kind: 'calendar', top: '14%', left: '90%', size: 34, opacity: [0.18, 0.32, 0.18], duration: 30, delay: 3, driftX: [0, -5, 3, 0], driftY: [0, 4, -3, 0] },
  { kind: 'check', top: '86%', left: '8%', size: 28, opacity: [0.16, 0.28, 0.16], duration: 27, delay: 7, driftX: [0, 4, -4, 0], driftY: [0, -3, 3, 0] },
  { kind: 'clock', top: '88%', left: '92%', size: 26, opacity: [0.18, 0.3, 0.18], duration: 33, delay: 4, driftX: [0, -4, 4, 0], driftY: [0, 3, -3, 0] },
  { kind: 'chat', top: '50%', left: '3%', size: 24, opacity: [0.14, 0.24, 0.14], duration: 22, delay: 10, driftX: [0, 3, -3, 0], driftY: [0, -5, 4, 0] },
  { kind: 'document', top: '50%', left: '96%', size: 24, opacity: [0.14, 0.24, 0.14], duration: 25, delay: 8, driftX: [0, -3, 3, 0], driftY: [0, 4, -4, 0] },
  // The two bands below are the wide, mostly-empty gaps above and
  // below the panel row itself (roughly 30–48% and 70–78% of the
  // field's height) — the flattest, most vacant part of the chapter
  // in feedback screenshots, distinct from the side margins above.
  { kind: 'tag', top: '39%', left: '16%', size: 22, opacity: [0.13, 0.24, 0.13], duration: 26, delay: 5, driftX: [0, 4, -4, 0], driftY: [0, -3, 3, 0] },
  { kind: 'calendar', top: '41%', left: '82%', size: 22, opacity: [0.13, 0.24, 0.13], duration: 29, delay: 12, driftX: [0, -4, 4, 0], driftY: [0, 3, -3, 0] },
  { kind: 'check', top: '75%', left: '22%', size: 20, opacity: [0.12, 0.22, 0.12], duration: 23, delay: 2, driftX: [0, 3, -3, 0], driftY: [0, -4, 3, 0] },
  { kind: 'clock', top: '76%', left: '78%', size: 20, opacity: [0.12, 0.22, 0.12], duration: 31, delay: 9, driftX: [0, -3, 3, 0], driftY: [0, 4, -3, 0] },
];

/**
 * Chapter 03 — "The work sorts itself."
 *
 * STEP 6 — COMPLETE REDESIGN, built fresh (Chapter 03 didn't exist
 * before this step). Chapter 01's verb is ASSEMBLE, Chapter 02's is
 * DISASSEMBLE/UNDERSTAND; this chapter's verb is ORGANIZE, and per
 * the brief's own rule ("no two adjacent chapters may use the same
 * primary visual mechanism") it needs a different physical grammar
 * from both: analysis → gravity → grouping → organization.
 *
 * ----------------------------------------------------------------
 * THE SIGNATURE MOVE: RELATIONSHIPS BEFORE CONTAINERS
 * ----------------------------------------------------------------
 * The chapter opens with four bare words scattered in open space —
 * Sarah, Friday, "onboarding docs," High Priority — no card, no
 * border, nothing framing them. As the visitor scrolls, thin traced
 * connections form between the three attributes and "onboarding
 * docs" (the actual work item) *before* anything resembling a
 * container exists. Only once that relationship has been discovered
 * does physical convergence happen — the attributes visibly pull
 * toward the task they belong to and settle into a tight, still-
 * borderless cluster. A container (a soft outline) is the very last
 * thing to appear, once the system has already organized several
 * such clusters into lanes — deliberately inverting the usual
 * "card first, then fill it" order every other chapter in this
 * project (and virtually every SaaS site) uses.
 *
 * Two more work items ("Design Review," "Client Call") enter later
 * from the field's edges — visibly, not from nowhere — specifically
 * so the chapter can demonstrate *organizing several things*, not
 * just one. This is what earns the "coordination is necessary" beat
 * the brief asks for, and what sets up Chapter 04's board without
 * building it: by the end there are three organized lanes, no
 * columns, no headers, no card chrome — intelligence, not UI, per
 * the brief's explicit instruction not to reveal the Kanban early.
 *
 * ----------------------------------------------------------------
 * WHY A NEW PRIMITIVE (RelationshipLine) INSTEAD OF ContinuityLine
 * ----------------------------------------------------------------
 * ContinuityLine draws one fixed/scroll-drawn path between two points
 * that don't move relative to each other. Here, both the "from" and
 * "to" of a connection are independently scroll-animated, and a
 * relationship's own visibility needs to rise *and fall* (appear,
 * then recede once physical grouping supersedes it) rather than only
 * ever settle fully drawn — a shape ContinuityLine isn't built for.
 * See RelationshipLine.tsx for the full reasoning.
 *
 * ----------------------------------------------------------------
 * WHY THERE'S NO DARK "PRODUCT SURFACE" ANYWHERE IN THIS CHAPTER
 * ----------------------------------------------------------------
 * Chapters 01 and 02 both end at (or build toward) the dark
 * Workspace surface. This chapter deliberately never touches it —
 * the brief is explicit that Ch.03 stays in the paper/ink/muted-ink
 * vocabulary throughout, and that forcing ProductWindow in "because
 * it already exists" is exactly what not to do. The soft outlines
 * that eventually appear around each organized group are plain
 * paper-surface borders, not the dark product-window treatment.
 *
 * ----------------------------------------------------------------
 * COORDINATE SYSTEM
 * ----------------------------------------------------------------
 * All positions are percentages (0-100) of one shared "field" — a
 * relatively-positioned box filling most of the sticky viewport.
 * Every text fragment is positioned via `left`/`top` percentages in
 * that same space, and a single absolutely-positioned
 * `<svg viewBox="0 0 100 100">` layer (matching the field 1:1) hosts
 * every RelationshipLine, so a connection's endpoints and a
 * fragment's own position are always expressed in the same numbers —
 * nothing needs separate DOM measurement to line them up.
 *
 * ----------------------------------------------------------------
 * MOBILE
 * ----------------------------------------------------------------
 * The field's own height grows on narrow viewports (see the
 * responsive height classes below) rather than the desktop scene
 * simply shrinking to fit — since every position is a percentage of
 * the field's own box, a taller/narrower field makes the same
 * coordinates read as a vertical composition automatically, without
 * a second set of hand-tuned mobile positions.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * A short, static, non-sticky render of the end state: three
 * organized, softly-outlined groups with dividers between them — no
 * relationship-discovery sequence, since that sequence's entire
 * point is motion.
 */

interface Point {
  x: number;
  y: number;
}

interface FieldPos {
  /** Position while scattered (0-15%). */
  scatter: Point;
  /** Position once clustered near its task (30-60%), or held-entry position for a task that enters later. */
  hold: Point;
  /** Final lane position (60% onward). */
  lane: Point;
}

const ATTRIBUTES: Record<'sarah' | 'friday' | 'priority', FieldPos & { label: string; accent?: boolean }> = {
  sarah: { label: 'Sarah', scatter: { x: 16, y: 28 }, hold: { x: 46, y: 46 }, lane: { x: 15, y: 45 } },
  friday: { label: 'Friday', scatter: { x: 80, y: 22 }, hold: { x: 54, y: 46 }, lane: { x: 25, y: 45 } },
  priority: { label: 'High Priority', scatter: { x: 26, y: 80 }, hold: { x: 50, y: 60 }, lane: { x: 20, y: 53 }, accent: true },
};

const HUB: FieldPos & { label: string } = {
  label: 'Onboarding Docs',
  scatter: { x: 50, y: 52 },
  hold: { x: 50, y: 52 },
  lane: { x: 19, y: 36 }, // STEP 26: box1's exact center (left 6 + width 26 / 2), was 20
};

const OTHER_TASKS: Record<'design' | 'client', FieldPos & { label: string }> = {
  // STEP 21: hold was {40,62}/{62,62} — nearly on top of
  // ATTRIBUTES.priority.hold {50,60}, and both are visible at the
  // same time (priority sits at hold from CONVERGE_END to
  // ORGANIZE_START, exactly when ENTER_OTHERS fades these in) — that
  // collision is the "Design Review"/"HIGH PRIORITY" text overlap
  // reported. Pulled well clear of the whole attribute/hub cluster
  // (which sits ~40-60% x, ~45-60% y) rather than nudged, so no
  // future retuning of the cluster can re-collide these by accident.
  // STEP 23: lane.y moved 46 → 40 to leave room below the title for
  // LANE_FIELDS (see below) inside the same GroupOutline box.
  design: { label: 'Design Review', scatter: { x: -15, y: 55 }, hold: { x: 22, y: 78 }, lane: { x: 50, y: 40 } },
  client: { label: 'Client Call', scatter: { x: 115, y: 55 }, hold: { x: 78, y: 78 }, lane: { x: 78, y: 40 } },
};

/**
 * STEP 23 — LANE FIELDS. The two lanes Design Review and Client Call
 * organize into previously held nothing but a title, which is what
 * made the resolved three-lane state (the brief's own screenshot)
 * read as empty compared to Onboarding Docs' three attributes. These
 * don't get the full relationship-discovery treatment Sarah/Friday/
 * High Priority get — repeating that mechanic two more times in the
 * same chapter would be the exact "same primary mechanism twice"
 * problem the brief rules out, and it would also bury the one thing
 * this chapter is actually demonstrating (coordination across several
 * items) under three near-identical animations. Instead these are
 * fixed at their final lane position the whole time and simply fade
 * in once the lanes themselves settle (STABILIZE_START), reading as
 * "the system already understood these too — here's the detail,
 * now that everything's organized" rather than a second discovery
 * beat. No accent color on any of them: red stays reserved for the
 * one genuinely high-priority field, as everywhere else on the site.
 */
const LANE_FIELDS: { x: number; y: number; label: string }[] = [
  { x: 44, y: 50, label: 'Priya' },
  { x: 58, y: 50, label: 'Mon' },
  { x: 72, y: 50, label: 'Jordan' },
  { x: 84, y: 50, label: 'Thu' },
];

// Phase boundaries, as fractions of this chapter's own scroll range.
const OPEN_END = 0.15;
const RELATE_SARAH: [number, number] = [0.15, 0.2];
const RELATE_FRIDAY: [number, number] = [0.19, 0.24];
const RELATE_PRIORITY: [number, number] = [0.23, 0.28];
const CONVERGE_START = 0.3;
const CONVERGE_END = 0.45;
const ENTER_OTHERS_START = 0.45;
const ENTER_OTHERS_END = 0.6;
const ORGANIZE_START = 0.6;
const ORGANIZE_END = 0.75;
const STABILIZE_START = 0.75;
const STABILIZE_END = 0.9;
const EXPAND_START = 0.9;

/** One text fragment, positioned in field-percent space across the three phases it passes through. */
function FieldLabel({
  pos,
  label,
  scrollYProgress,
  mono,
  accentDuring,
  className,
  opacity,
}: {
  pos: FieldPos;
  label: string;
  scrollYProgress: MotionValue<number>;
  mono: boolean;
  /** Optional [start,end] window during which this label briefly turns red — the priority attribute only. */
  accentDuring?: [number, number];
  className?: string;
  /** STEP 21: entrance fade — see the file-level note above `entryOpacity`. Optional so OTHER_TASKS (which already fades via its own wrapper) isn't double-applied. */
  opacity?: MotionValue<number>;
}) {
  const left = useTransform(
    scrollYProgress,
    [0, CONVERGE_START, CONVERGE_END, ORGANIZE_START, ORGANIZE_END],
    [pos.scatter.x, pos.scatter.x, pos.hold.x, pos.hold.x, pos.lane.x],
  );
  const top = useTransform(
    scrollYProgress,
    [0, CONVERGE_START, CONVERGE_END, ORGANIZE_START, ORGANIZE_END],
    [pos.scatter.y, pos.scatter.y, pos.hold.y, pos.hold.y, pos.lane.y],
  );
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);
  // STEP 26: this used to grow to 1.1x for titles right as they
  // settled into their box — Step 24 sized the boxes against scale-1
  // text width, so that growth is what kept pushing "Design Review"/
  // "Client Call" past their box edge even after widening the boxes.
  // Settling down slightly (matching the mono attributes' own
  // shrink-to-fit, just milder) removes the overflow risk entirely
  // instead of needing another round of box-width guessing.
  const scale = useTransform(scrollYProgress, [ORGANIZE_START, ORGANIZE_END], mono ? [1, 0.85] : [1, 0.92]);

  return (
    <motion.div
      // STEP 27: `scale` here is a Framer Motion style value, and
      // Framer writes its own `transform` directly onto the element
      // for anything it animates — that inline transform completely
      // replaces (not merges with) whatever `transform` a Tailwind
      // utility class like `-translate-x-1/2` would otherwise set,
      // since only one `transform` declaration can win and Framer's
      // inline style always beats a class. The class was silently
      // losing the centering translate on every element that also
      // animates scale — invisible on short mono words (a few px
      // either way), glaring on "Onboarding Docs"/"Design Review"/
      // "Client Call", which is exactly the "still off-center, text
      // outside the panel" bug reported after two rounds of coordinate
      // tuning that couldn't have fixed it. Expressing the same -50%
      // centering as Framer motion values (`x`/`y`) instead of a
      // Tailwind class lets Framer compose translate + scale into one
      // correct transform, the way the class alone never could once
      // scale entered the picture.
      style={{ left: leftPct, top: topPct, x: '-50%', y: '-50%', scale, opacity }}
      className={clsx('absolute whitespace-nowrap', className)}
    >
      <AccentText scrollYProgress={scrollYProgress} mono={mono} accentDuring={accentDuring}>
        {label}
      </AccentText>
    </motion.div>
  );
}

/** Separated purely so the optional red-during-window logic has its own small, readable transform chain. */
function AccentText({
  scrollYProgress,
  mono,
  accentDuring,
  children,
}: {
  scrollYProgress: MotionValue<number>;
  mono: boolean;
  accentDuring?: [number, number];
  children?: string;
}) {
  const color = useTransform(
    scrollYProgress,
    accentDuring
      ? [accentDuring[0], accentDuring[0] + 0.02, CONVERGE_START, CONVERGE_START + 0.05]
      : [0, 1],
    accentDuring ? ['var(--color-ink)', 'var(--color-red)', 'var(--color-red)', 'var(--color-ink-muted)'] : ['var(--color-ink)', 'var(--color-ink)'],
  );
  return (
    <motion.span
      style={{ color }}
      className={clsx(mono ? 'text-label' : 'text-body-sm font-medium text-ink', 'transition-[font-weight] duration-300')}
    >
      {children}
    </motion.span>
  );
}

export function Chapter03Organize() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // STEP 40: passed down to Organize3D so it can *measure* the real
  // rendered positions of the title copy, the panel row, and the
  // closing copy, instead of relying on hand-guessed percentages —
  // see Organize3D.tsx's file header for why the guessed numbers
  // kept being wrong even after two rounds of adjustment.
  const titleRef = useRef<HTMLDivElement>(null);
  const panelRowRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: rawProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // STEP 22 — PACE. This chapter previously drove every transform
  // straight off raw scrollYProgress, unlike Chapters 01/02, which
  // both run it through the shared `scrollSmoothing` spring first
  // (see lib/motion.ts) specifically because a mouse wheel dispatches
  // scroll in discrete jumps. Chapter 03 has more independently-
  // animated fragments than either — three attributes, a hub, two
  // later-entering tasks, plus the relationship lines — so the
  // stepping was more visible here, not less. Assigning the smoothed
  // value back to the name every downstream line already uses
  // (`scrollYProgress`) means this is a one-line fix, not a rewrite:
  // every transform below, and both RelationshipLine instances,
  // automatically pick up the same easing every other chapter uses.
  const scrollYProgress = useSpring(rawProgress, scrollSmoothing);

  // Unlike Chapters 01/02, nothing here needs a discrete React-state
  // "stage" — no list of fields grows, no title mounts/unmounts.
  // Every visual change (position, opacity, color, scale) is a
  // continuous function of scrollYProgress via useTransform, so this
  // chapter never re-renders on scroll at all, only on breakpoint
  // changes — cheaper than the signature-diffing pattern Ch.01/02 use,
  // and correct here specifically because there's no conditional JSX
  // to keep in sync with a threshold.

  // Relationship line visibility: rise during the RELATE window, hold, then fade back out as CONVERGE begins.
  const sarahVisibility = useTransform(
    scrollYProgress,
    [RELATE_SARAH[0], RELATE_SARAH[0] + 0.02, CONVERGE_START, CONVERGE_START + 0.06],
    [0, 1, 1, 0],
  );
  const sarahTravel = useTransform(scrollYProgress, RELATE_SARAH, [0, 1]);
  const fridayVisibility = useTransform(
    scrollYProgress,
    [RELATE_FRIDAY[0], RELATE_FRIDAY[0] + 0.02, CONVERGE_START, CONVERGE_START + 0.06],
    [0, 1, 1, 0],
  );
  const fridayTravel = useTransform(scrollYProgress, RELATE_FRIDAY, [0, 1]);
  const priorityVisibility = useTransform(
    scrollYProgress,
    [RELATE_PRIORITY[0], RELATE_PRIORITY[0] + 0.02, CONVERGE_START, CONVERGE_START + 0.06],
    [0, 1, 1, 0],
  );
  const priorityTravel = useTransform(scrollYProgress, RELATE_PRIORITY, [0, 1]);

  const otherTasksOpacity = useTransform(scrollYProgress, [ENTER_OTHERS_START, ENTER_OTHERS_START + 0.05], [0, 1]);

  // STEP 21 — CHAPTER HAND-OFF. Chapter 02 hands off into this chapter
  // via a normal sticky-section boundary, and this chapter's own
  // opening beat (the four bare words scattered in space) previously
  // rendered at full opacity from progress 0 with no fade-in — so
  // whatever residual co-visibility exists at that boundary showed
  // this chapter's content already at full strength, reading as a
  // collision rather than a hand-off. A quiet entrance fade (same
  // device Chapter 02 already uses for its own closing copy) fixes
  // that regardless of the exact scroll-timing at the seam, and gives
  // this chapter's own opening beat a proper entrance either way.
  const entryOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const dividerOpacity = useTransform(scrollYProgress, [STABILIZE_START, STABILIZE_END], [0, 0.4]);
  const outlineOpacity = useTransform(scrollYProgress, [STABILIZE_START, STABILIZE_END], [0, 1]);
  // STEP 23: starts slightly after the outlines/dividers so the lane
  // fields read as landing inside an already-forming container rather
  // than arriving in the same instant as its border.
  const laneFieldOpacity = useTransform(scrollYProgress, [STABILIZE_START + 0.03, STABILIZE_END], [0, 1]);
  const fieldScale = useTransform(scrollYProgress, [EXPAND_START, 1], [1, 1.07]);
  const hintOpacity = useTransform(scrollYProgress, [EXPAND_START, EXPAND_START + 0.06, 1], [0, 1, 1]);
  // STEP 25: a quiet stem from the organized row down to the closing
  // line, arriving together with it — gives the otherwise-empty space
  // below the lanes a reason to exist (leads somewhere) rather than
  // just being unused field, without adding a fourth distinct element.
  const stemOpacity = useTransform(scrollYProgress, [EXPAND_START, EXPAND_START + 0.06], [0, 0.3]);

  if (prefersReducedMotion) {
    return (
      <section id="chapter-03" className="relative w-full" aria-label="Organize">
        <h3 className="sr-only">Related pieces of work organize themselves into distinct groups</h3>
        <AmbientOrbs variant="paper" />
        <SecondaryGrid id="ch03-dot-grid-static" surface="paper" />
        <ChapterBackdrop index="03" markerOpacity={1} />
        <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-lg py-section-mobile lg:py-0">
          {/* STEP 32: matches the same real editorial copy the
              animated path now carries — the static/reduced-motion
              render shouldn't be the thin version. */}
          <div className="max-w-narrow px-gutter-mobile text-center sm:px-gutter-tablet lg:px-gutter-desktop">
            <p className="text-heading-sm">The work finds its own place.</p>
            <p className="mt-xs text-body-sm text-ink-muted">
              No folders to file into, no tags to remember — every new request recognizes what it already belongs
              with.
            </p>
          </div>
          <div className="relative grid w-full max-w-wide grid-cols-3 gap-md px-gutter-mobile sm:px-gutter-tablet lg:px-gutter-desktop">
            <LaneStatic title="Onboarding Docs" attributes={['Sarah', 'Friday', 'High Priority']} />
            <LaneStatic title="Design Review" attributes={['Priya', 'Mon']} />
            <LaneStatic title="Client Call" attributes={['Jordan', 'Thu']} />
          </div>
          <div className="max-w-narrow px-gutter-mobile text-center">
            <p className="text-heading-sm">Understanding isn&rsquo;t the end.</p>
            <p className="mt-[2px] text-body-sm text-ink-muted">
              Related work finds its group. Now it needs somewhere real to live.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-03" ref={sectionRef} className="relative w-full h-[380dvh]" aria-label="Organize">
      <h3 className="sr-only">Related pieces of work organize themselves into distinct groups</h3>
      {/* STEP 25: this wrapper was missing — Chapter 02's animated
          version and this chapter's own reduced-motion fallback both
          center their content vertically in the viewport; this path
          didn't, leaving the field pinned near the top with the
          entire lower half of the sticky frame empty regardless of
          anything drawn inside the field itself. */}
      <div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden">
        <Organize3D titleRef={titleRef} panelRowRef={panelRowRef} closingRef={closingRef} />
        <AmbientOrbs variant="paper" />
        <SecondaryGrid id="ch03-dot-grid" surface="paper" />
        <AmbientGlyphs glyphs={CHAPTER_GLYPHS} overallOpacity={entryOpacity} />
        <ChapterBackdrop index="03" markerOpacity={entryOpacity} />
        <div className="relative flex h-full w-full flex-col items-center justify-center">
        {/* STEP 32: this chapter previously had no visible reading
            copy anywhere — only the sr-only h3 and a single small
            mono closing label. Every sibling chapter pairs its visual
            mechanic with a real editorial line (Ch02's disassembling
            sentence, Ch04/06/08's captions); this one didn't, which
            is what actually read as "empty," not a lack of ambient
            decoration (the depth layer already covers that). Placed
            above the field, not inside its percentage coordinate
            space, so it can't collide with the scatter/converge/
            organize choreography below it. */}
        <motion.div
          ref={titleRef}
          style={{ opacity: entryOpacity }}
          className="relative z-10 mb-sm max-w-narrow px-gutter-mobile text-center sm:mb-md sm:px-gutter-tablet lg:mb-lg lg:px-gutter-desktop"
        >
          {/* STEP 38: soft same-tone scrim behind the copy, blurred so
              it has no visible edge of its own — just quietly clears
              the reading area so Organize3D's cards (or anything
              else drifting behind) never fight with the text, even
              if a card's bob animation drifts it close to this band. */}
          <div className="absolute -inset-x-8 -inset-y-8 -z-10 rounded-[2.5rem] bg-background/85 blur-2xl sm:-inset-x-14 sm:-inset-y-10" aria-hidden="true" />
          <p className="text-heading-sm">The work finds its own place.</p>
          <p className="mt-xs hidden text-body-sm text-ink-muted sm:block">
            No folders to file into, no tags to remember — every new request recognizes what it already belongs
            with.
          </p>
        </motion.div>
        <motion.div
          style={{ scale: fieldScale }}
          className="relative mx-auto h-[66vh] w-[92vw] max-w-wide sm:h-[60vh] lg:h-[56vh]"
        >
          {/* Relationship lines share one coordinate-matched SVG layer. */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <RelationshipLine from={ATTRIBUTES.sarah.scatter} to={HUB.scatter} visibility={sarahVisibility} travel={sarahTravel} />
            <RelationshipLine from={ATTRIBUTES.friday.scatter} to={HUB.scatter} visibility={fridayVisibility} travel={fridayTravel} />
            <RelationshipLine
              from={ATTRIBUTES.priority.scatter}
              to={HUB.scatter}
              visibility={priorityVisibility}
              travel={priorityTravel}
              color="red"
            />

            {/* Dividers between the three organized lanes — the only hint of "columns," never drawn as UI chrome. */}
            <motion.line x1={36} y1={28} x2={36} y2={60} style={{ opacity: dividerOpacity }} stroke="var(--color-ink-muted)" strokeWidth={0.3} vectorEffect="non-scaling-stroke" aria-hidden="true" />
            <motion.line x1={64} y1={28} x2={64} y2={60} style={{ opacity: dividerOpacity }} stroke="var(--color-ink-muted)" strokeWidth={0.3} vectorEffect="non-scaling-stroke" aria-hidden="true" />

            {/* Quiet stem down to the closing line — see stemOpacity note above. */}
            <motion.line x1={50} y1={62} x2={50} y2={95} style={{ opacity: stemOpacity }} stroke="var(--color-ink-muted)" strokeWidth={0.3} strokeDasharray="1 2" vectorEffect="non-scaling-stroke" aria-hidden="true" />
          </svg>

          {/* Soft outline around each organized group — the one and only "container," and the last thing to appear.
              STEP 24: widened symmetrically about each box's original center (19/50/78 — unchanged, so every
              label anchor above still lands correctly) after a screenshot showed "Onboarding Docs" and "HIGH
              PRIORITY" running right up to, and past, the box's own right edge. The 15-character hub title was
              the tightest fit of the three, hence the larger increase there. */}
          {/* STEP 33: boxes tightened around their actual content —
              a screenshot showed each lane box holding just 2-3 short
              lines inside a box sized for far more, reading as
              "empty panels" even after Step 32's copy pass. Text
              positions (FieldPos.lane, LANE_FIELDS) are unchanged;
              only the border/glow bounds shrink to hug them, since
              GroupOutline has no overflow-hidden to risk clipping. */}
          <GroupOutline opacity={outlineOpacity} left={6} top={32} width={26} height={24} />
          <GroupOutline opacity={outlineOpacity} left={38} top={35} width={24} height={18} />
          <GroupOutline opacity={outlineOpacity} left={66} top={35} width={24} height={18} />

          {/* STEP 40: invisible — exists only so Organize3D can
              measure exactly where the panel row actually renders
              (union of all three boxes above: left edge of
              Onboarding Docs to right edge of Client Call, top of
              the tallest box to the bottom of the tallest box).
              Real measurement instead of a guessed percentage — see
              Organize3D.tsx's file header. */}
          <div ref={panelRowRef} aria-hidden="true" className="absolute" style={{ left: '6%', top: '32%', width: '84%', height: '24%' }} />

          {/* STEP 25: the same glow + corner-mark "presence" Chapter 02
              gives its single panel, applied per lane box once each one
              settles — the box-mode variant renders at the box's own
              field-percent bounds instead of Ch02's inset-relative mode. */}
          <PanelPresence opacity={outlineOpacity} mode="box" left={6} top={32} width={26} height={24} />
          <PanelPresence opacity={outlineOpacity} mode="box" left={38} top={35} width={24} height={18} />
          <PanelPresence opacity={outlineOpacity} mode="box" left={66} top={35} width={24} height={18} />

          {/* STEP 34: one quiet, content-appropriate icon per lane —
              see the file-level note above. Inset from the box's own
              top-right corner so it sits clear of PanelPresence's
              corner brackets. */}
          <PanelGlyph icon={DocumentGlyph} left={29} top={34.5} opacity={outlineOpacity} />
          <PanelGlyph icon={ChatGlyph} left={59.5} top={37.5} opacity={outlineOpacity} />
          <PanelGlyph icon={PhoneGlyph} left={87.5} top={37.5} opacity={outlineOpacity} />

          <FieldLabel pos={ATTRIBUTES.sarah} label={ATTRIBUTES.sarah.label} scrollYProgress={scrollYProgress} mono opacity={entryOpacity} />
          <FieldLabel pos={ATTRIBUTES.friday} label={ATTRIBUTES.friday.label} scrollYProgress={scrollYProgress} mono opacity={entryOpacity} />
          <FieldLabel
            pos={ATTRIBUTES.priority}
            label={ATTRIBUTES.priority.label}
            scrollYProgress={scrollYProgress}
            mono
            accentDuring={RELATE_PRIORITY}
            opacity={entryOpacity}
          />

          <HubLabel scrollYProgress={scrollYProgress} opacity={entryOpacity} />

          <motion.div style={{ opacity: otherTasksOpacity }}>
            <FieldLabel pos={OTHER_TASKS.design} label={OTHER_TASKS.design.label} scrollYProgress={scrollYProgress} mono={false} />
            <FieldLabel pos={OTHER_TASKS.client} label={OTHER_TASKS.client.label} scrollYProgress={scrollYProgress} mono={false} />
          </motion.div>

          {/* STEP 23: quiet detail fields for the two lanes that
              previously held only a title — see the LANE_FIELDS note
              above for why these fade in fixed rather than traveling. */}
          {LANE_FIELDS.map((f) => (
            <LaneField key={f.label} x={f.x} y={f.y} label={f.label} opacity={laneFieldOpacity} />
          ))}

          {/* STEP 32: expanded from a single mono label to match the
              closing-copy weight every other chapter gives its
              resolved state (see Ch02's "A request is more than a
              sentence." pairing). The stem above already leads here
              on purpose (see stemOpacity note) — it previously arrived
              at a single small line with nothing else around it. */}
          <motion.div
            ref={closingRef}
            style={{ opacity: hintOpacity }}
            className="absolute bottom-[3%] left-1/2 max-w-narrow -translate-x-1/2 px-gutter-mobile text-center"
          >
            <div className="absolute -inset-x-8 -inset-y-8 -z-10 rounded-[2.5rem] bg-background/85 blur-2xl sm:-inset-x-14 sm:-inset-y-10" aria-hidden="true" />
            <p className="text-heading-sm">Understanding isn&rsquo;t the end.</p>
            <p className="mt-[2px] hidden text-body-sm text-ink-muted sm:block">
              Related work finds its group. Now it needs somewhere real to live.
            </p>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}

function HubLabel({ scrollYProgress, opacity }: { scrollYProgress: MotionValue<number>; opacity?: MotionValue<number> }) {
  const left = useTransform(
    scrollYProgress,
    [0, ORGANIZE_START, ORGANIZE_END],
    [HUB.scatter.x, HUB.scatter.x, HUB.lane.x],
  );
  const top = useTransform(
    scrollYProgress,
    [0, ORGANIZE_START, ORGANIZE_END],
    [HUB.scatter.y, HUB.scatter.y, HUB.lane.y],
  );
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);
  // STEP 26: same fix as FieldLabel above — this grew to 1.12x right
  // as the hub settled into Onboarding Docs' box, the tightest fit of
  // the three (longest title). Growth removed.
  const scale = useTransform(scrollYProgress, [ORGANIZE_START, ORGANIZE_END], [1, 0.95]);

  return (
    // STEP 27: same fix as FieldLabel above — -50% centering expressed
    // via Framer's own x/y values instead of a Tailwind translate class,
    // so it survives alongside the animated scale instead of being
    // silently dropped by it. This was the actual cause of "Onboarding
    // Docs" sitting right-shifted in its box.
    <motion.div style={{ left: leftPct, top: topPct, x: '-50%', y: '-50%', scale, opacity }} className="absolute whitespace-nowrap">
      <span className="text-body-sm font-semibold text-ink">{HUB.label}</span>
    </motion.div>
  );
}

function GroupOutline({ opacity, left, top, width, height }: { opacity: MotionValue<number>; left: number; top: number; width: number; height: number }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, borderColor: 'var(--color-border)' }}
      className="absolute rounded-lg border"
    />
  );
}

/** A quiet, fixed-position detail field for Design Review/Client Call
 * — see the LANE_FIELDS note above. Deliberately simpler than
 * FieldLabel: no scatter/hold/lane travel, just a fade-in at a fixed
 * spot, since these were never meant to repeat the primary chapter
 * mechanic. */
function LaneField({ x, y, label, opacity }: { x: number; y: number; label: string; opacity: MotionValue<number> }) {
  return (
    <motion.span
      style={{ left: `${x}%`, top: `${y}%`, opacity }}
      className="text-label absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
    >
      {label}
    </motion.span>
  );
}

/** Single small identifying icon inset from a lane box's top-right corner — see STEP 34 note above. */
function PanelGlyph({
  icon: Icon,
  left,
  top,
  opacity,
}: {
  icon: typeof DocumentGlyph;
  left: number;
  top: number;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ left: `${left}%`, top: `${top}%`, opacity, color: 'var(--color-ink-faint)' }}
      className="absolute h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]"
    >
      <Icon className="h-full w-full" strokeWidth={1.3} />
    </motion.div>
  );
}

function LaneStatic({ title, attributes }: { title: string; attributes: string[] }) {
  return (
    <div className="flex flex-col items-center gap-xs rounded-lg border border-border p-component text-center">
      <p className="text-body-sm font-semibold text-ink">{title}</p>
      {attributes.map((a) => (
        <p key={a} className="text-label">
          {a}
        </p>
      ))}
    </div>
  );
}
