'use client';

import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useMotionValueEvent, useTransform, useSpring, type MotionValue } from 'framer-motion';
import clsx from 'clsx';
import { ContinuityLine } from '@/components/primitives/ContinuityLine';
import { SignalDot } from '@/components/primitives/SignalDot';
import { Workspace, type WorkspaceField } from '@/components/primitives/Workspace';
import { ChapterBackdrop } from '@/components/primitives/ChapterBackdrop';
import { PanelPresence } from '@/components/primitives/PanelPresence';
import { scrollSmoothing } from '@/lib/motion';

/**
 * Chapter 02 — "The sentence gets disassembled."
 *
 * STEP 6 — COMPLETE REDESIGN. This replaces Chapter02Inspection.tsx
 * entirely (deleted). The rejected version was still, underneath its
 * "spotlight" dressing, the same category of thing as every prior
 * pass: a dark product card that animates while quiet copy sits near
 * it. This version has no card-plus-copy composition until the very
 * end — the sentence itself is the only visual object for the first
 * half of the chapter, and it is *taken apart* rather than watched.
 *
 * ----------------------------------------------------------------
 * THE FOUR BEATS (LANGUAGE → DISASSEMBLY → UNDERSTANDING → RECONSTRUCTION)
 * ----------------------------------------------------------------
 * LANGUAGE        the full Ch.01 sentence, alone, large, centered —
 *                  no heading, no UI, nothing else on screen.
 * DISASSEMBLY     Sarah / Friday / high priority peel out of the
 *                  sentence in three different directions (lateral,
 *                  diagonal-up, down) while the rest of the sentence
 *                  quiets down. Not simultaneous — one at a time, so
 *                  each has its own moment.
 * UNDERSTANDING   once settled, the three signals sit apart in open
 *                  space for a beat. A single faint horizontal plane
 *                  fades in behind them (not a line connecting each
 *                  point — see the note below on why) and fades out
 *                  before anything moves again.
 * RECONSTRUCTION  the three signals converge toward one point and,
 *                  as each arrives, becomes a field in the Workspace
 *                  primitive — literally the same component Chapter
 *                  01 ends with, which is what makes this legible as
 *                  the same task rather than a new card.
 *
 * ----------------------------------------------------------------
 * WHY NO POINT-TO-POINT CONNECTOR LINES IN THE "UNDERSTANDING" BEAT
 * ----------------------------------------------------------------
 * The brief's ASCII sketch shows dashes between the three settled
 * signals. Drawing an actual line from measured point A to measured
 * point B to measured point C, for three positions that already move
 * independently and reflow at every breakpoint, is exactly the
 * boxes-and-arrows shape the brief separately (and repeatedly) rules
 * out — three connected nodes reads as a flowchart the instant you
 * can trace an edge between them, regardless of how thin the stroke
 * is. A single faint plane behind all three, with no discrete
 * endpoints, says "these now share a coordinate system" without
 * saying "here is the wiring." This was a judgment call, flagged
 * here rather than silently deviating from the sketch.
 *
 * ----------------------------------------------------------------
 * WHY RELATIVE-TRANSFORM MOTION, NOT DOM-MEASURED TRAVEL LIKE CH.01
 * ----------------------------------------------------------------
 * Chapter 01's SignalTravel measures real DOM rects because its
 * destination (the Workspace's entry point) exists on screen the
 * whole time. Here the destination is the Workspace itself only
 * coming into existence at the end of the same motion that's
 * supposedly traveling toward it — measuring a target that doesn't
 * exist yet isn't meaningfully more accurate than a designed offset,
 * and adds a real fragility (mount-order races, a 0-opacity target
 * with a stale rect) for no real gain. So each signal's motion is a
 * set of scroll-driven vw/vh offsets from its own natural position in
 * the sentence — origin is still real (wherever the word actually
 * sits in the flowing paragraph at any breakpoint), only the
 * destination is a designed point rather than a measured one. This is
 * also why no mount-time measurement/resize-listener code is needed
 * here at all, unlike Chapter 01.
 *
 * Every signal still satisfies origin → movement → arrival → state
 * change: the word visibly leaves its slot in the sentence, travels
 * on-screen the whole way (never teleports), and fades out at the
 * exact scroll position its field fades in inside the Workspace —
 * same "don't let the destination jump ahead of the animation"
 * discipline Chapter 01's Step 5A fix established.
 *
 * ----------------------------------------------------------------
 * WHY THE RECONSTRUCTED OBJECT IS THE ACTUAL WORKSPACE PRIMITIVE
 * ----------------------------------------------------------------
 * The brief's continuity rule asks for a visitor to recognize "that's
 * the thing I saw earlier." The strongest version of that claim is
 * literal identity, not a lookalike — so this reuses `Workspace`
 * directly (same component Chapter 01 ends with), fed a `stage` that
 * increments as each signal's convergence arrives, exactly like
 * Chapter 01 feeds it from signal arrivals. The border/shadow that
 * "emerges only at the end" per the brief is handled by fading the
 * whole primitive in late (opacity 0 until convergence begins, full
 * by the last arrival) rather than modifying Workspace itself.
 *
 * ----------------------------------------------------------------
 * MOBILE
 * ----------------------------------------------------------------
 * No separate mobile branch. Every offset is vw/vh (percentage of
 * viewport), so the whole composition scales with the viewport
 * automatically rather than needing breakpoint-specific values — and
 * because this was never a two-column grid to begin with, narrow
 * viewports read as vertical/spatial by default rather than needing
 * to be forced into a "stack." No interaction depends on hover.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * A short, static, non-sticky render: the muted original sentence,
 * the fully-resolved Workspace beneath it, and the closing copy —
 * the end state, shown immediately, exactly Chapter 01's pattern.
 */

const TITLE = 'Onboarding Docs';

interface DisassemblyConfig {
  id: 'sarah' | 'friday' | 'priority';
  text: string;
  /** Scroll progress at which this word starts peeling away from the sentence. */
  start: number;
  /** Scroll progress at which it has settled into its open-space position. */
  end: number;
  /** Scroll progress at which it finishes converging and becomes a field. */
  arrive: number;
  /** Settle position, as vw/vh offsets from the word's natural spot. */
  settleX: number;
  settleY: number;
  accent?: boolean;
  field: WorkspaceField;
}

// Convergence begins at the same scroll position for all three, but
// each arrives at a different point after it — same "later signals
// move with more confidence" idea Chapter 01 uses, here expressed as
// a shared start with staggered finishes instead of shortening spans.
const CONVERGE_START = 0.72;
const ASSEMBLY_Y = 30; // vh — where the reconstructed object forms, below the sentence

// STEP 17: settle offsets were tuned assuming a tall viewport. On
// shorter ones (the sticky wrapper is `overflow-hidden`, see below)
// a word settling 20-28vh from its origin could be pushed past the
// visible area and get hard-clipped instead of gracefully leaving
// the frame — the "cut off" bug. These magnitudes are pulled in to a
// range that stays inside the visible column on every required QA
// breakpoint, while keeping each word's own direction (lateral,
// diagonal-up, down) intact.
const SARAH: DisassemblyConfig = {
  id: 'sarah',
  text: 'Sarah',
  start: 0.1,
  end: 0.24,
  arrive: 0.8,
  settleX: -22,
  settleY: 6,
  field: { id: 'assignee', label: 'Assignee', value: 'Sarah' },
};
const FRIDAY: DisassemblyConfig = {
  id: 'friday',
  text: 'Friday',
  start: 0.24,
  end: 0.38,
  arrive: 0.87,
  settleX: 20,
  settleY: -14,
  field: { id: 'deadline', label: 'Deadline', value: 'Friday' },
};
const PRIORITY: DisassemblyConfig = {
  id: 'priority',
  text: 'high priority',
  start: 0.38,
  end: 0.52,
  arrive: 0.94,
  settleX: 5,
  settleY: 18,
  accent: true,
  field: { id: 'priority', label: 'Priority', value: 'High', accent: true },
};

const SIGNALS: DisassemblyConfig[] = [SARAH, FRIDAY, PRIORITY];

const RELATIONSHIP_START = 0.56;
const RELATIONSHIP_END = 0.7;
const TEXT_START = 0.94;
const TEXT_IN = 0.98;
const SHIFT_START = 0.96;
const RESOLVED_AT = 0.97;

/** A single word that leaves its slot in the sentence, settles in open
 * space, then converges into the reconstructed object. A separate
 * component (not inlined in the chapter) purely so each instance owns
 * its own `useTransform` chains cleanly, the same reason Chapter 01
 * factors SignalTravel out rather than repeating hook calls inline. */
function DisassemblingWord({
  config,
  scrollYProgress,
  recognized,
}: {
  config: DisassemblyConfig;
  scrollYProgress: MotionValue<number>;
  recognized: boolean;
}) {
  const { start, end, arrive, settleX, settleY } = config;

  const x = useTransform(
    scrollYProgress,
    [0, start, end, CONVERGE_START, arrive],
    ['0vw', '0vw', `${settleX}vw`, `${settleX}vw`, '0vw'],
  );
  const y = useTransform(
    scrollYProgress,
    [0, start, end, CONVERGE_START, arrive],
    ['0vh', '0vh', `${settleY}vh`, `${settleY}vh`, `${ASSEMBLY_Y}vh`],
  );
  const opacity = useTransform(scrollYProgress, [arrive - 0.03, arrive], [1, 0]);
  const scale = useTransform(scrollYProgress, [CONVERGE_START, arrive], [1, 0.45]);
  const dotOpacity = useTransform(
    scrollYProgress,
    [end, end + 0.03, RELATIONSHIP_END, CONVERGE_START],
    [0, 1, 1, 0],
  );

  return (
    <motion.span style={{ x, y, opacity, scale }} className="relative inline-block">
      <span
        className={clsx(
          'transition-colors duration-500',
          recognized ? 'font-mono' : 'font-display',
        )}
        style={{
          color: config.accent && recognized ? 'var(--color-red)' : recognized ? 'var(--color-ink-muted)' : 'var(--color-ink)',
        }}
      >
        {config.text}
      </span>
      <motion.span
        aria-hidden="true"
        style={{ opacity: dotOpacity }}
        className="absolute left-1/2 top-full mt-xs -translate-x-1/2"
      >
        <SignalDot surface="paper" active={false} size={5} />
      </motion.span>
    </motion.span>
  );
}

/** STEP 25: PanelPresence (glow + corner marks) moved to
 * @/components/primitives/PanelPresence so Chapter 03's lane boxes
 * can reuse it — used here via `<PanelPresence opacity={...} />` below. */
/**
 * STEP 16 — SCROLL SMOOTHING
 * ----------------------------------------------------------------
 * This chapter previously drove every transform straight off raw
 * `scrollYProgress`, unlike Chapter 01 (see its Step 15B note). A
 * mouse wheel dispatches scroll in discrete jumps, so words peeling
 * out of the sentence, the convergence, and the panel arrival all
 * visibly stepped instead of gliding — the "smooth transition" gap
 * this step closes. `smoothProgress` (the shared `scrollSmoothing`
 * spring from lib/motion, same constant Chapter 01 uses) now feeds
 * every `useTransform` below and the `DisassemblingWord` instances,
 * so this chapter's pacing matches Chapter 01's exactly rather than
 * each chapter feeling like a different hand is scrolling.
 */
export function Chapter02Disassembly() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const entryRef = useRef<HTMLSpanElement>(null);

  const [progress, setProgress] = useState(0);
  const signatureRef = useRef('');

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smoothProgress = useSpring(scrollYProgress, scrollSmoothing);

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    const stage = SIGNALS.filter((s) => v >= s.arrive).length;
    const resolved = v >= RESOLVED_AT;
    const textVisible = v >= TEXT_START;
    const recognized = SIGNALS.map((s) => (v >= s.start ? 1 : 0)).join('');
    const signature = `${stage}${resolved ? 1 : 0}${textVisible ? 1 : 0}${recognized}`;
    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      setProgress(v);
    }
  });

  const stage = SIGNALS.filter((s) => progress >= s.arrive).length as 0 | 1 | 2 | 3;
  const resolved = progress >= RESOLVED_AT;
  const title = stage >= 1 ? TITLE : null;
  const fields = SIGNALS.filter((s) => progress >= s.arrive).map((s) => s.field);

  // Rest of the sentence (everything but the three signals) quiets
  // down as extraction proceeds, and the whole sentence pulls back
  // slightly once all three have separated — the "camera" cue the
  // brief asks for, without an actual video.
  //
  // STEP 17: previously this didn't reach its dim floor until
  // PRIORITY.end (0.52) — the entire disassembly sequence (0.1-0.52)
  // ran with the backdrop sentence still 70%+ opaque, so a fully
  // opaque peeling word was reading against an almost-as-bright
  // static sentence the whole time it traveled, which is what looked
  // like overlapping/misaligned text rather than one word clearly
  // separating from a quieted paragraph. Now it dims to a quiet floor
  // *before* SARAH.start, so by the time anything starts moving the
  // backdrop has already stepped back, and settles quieter still by
  // convergence so the "three signals alone in open space" beat reads
  // as genuinely quiet, not just dim.
  // STEP 19: the resting floor (after convergence) was 0.14 — quiet
  // enough to avoid competing with the peeling words, but dim enough
  // that once the panel settles, the backdrop sentence reads as
  // almost gone, leaving the panel floating in a lot of bare canvas.
  // The fix for the overlap bug was the *timing* (quiet before
  // SARAH.start) — nothing arrives near this backdrop anymore by the
  // time convergence finishes, so raising just this resting value
  // restores some presence around the panel without reopening the
  // original problem.
  const restOpacity = useTransform(smoothProgress, [0, 0.05, SARAH.start, CONVERGE_START], [1, 1, 0.3, 0.28]);
  // STEP 18: sentenceScale/sentenceY previously only pulled back to
  // 0.86 / -4vh — leaving the sentence still large enough that, once
  // the panel (mt-xl below it) and closing copy (mt-lg below that)
  // both need to share the same 100dvh frame, the combined stack
  // regularly exceeded typical viewport heights and got clipped by
  // this section's `overflow-hidden`. Pulling back further here does
  // the actual work of making room, rather than just tightening the
  // gaps below and hoping the sentence's leftover size doesn't eat
  // it back up.
  const sentenceScale = useTransform(smoothProgress, [PRIORITY.end, CONVERGE_START], [1, 0.74]);
  const sentenceY = useTransform(smoothProgress, [PRIORITY.end, CONVERGE_START], ['0vh', '-7vh']);

  const planeOpacity = useTransform(
    smoothProgress,
    [RELATIONSHIP_START, RELATIONSHIP_START + 0.04, RELATIONSHIP_END - 0.04, RELATIONSHIP_END],
    [0, 0.16, 0.16, 0],
  );

  const panelOpacity = useTransform(smoothProgress, [CONVERGE_START, PRIORITY.arrive], [0, 1]);
  const panelScale = useTransform(smoothProgress, [CONVERGE_START, PRIORITY.arrive], [0.85, 1]);
  const panelShiftX = useTransform(smoothProgress, [SHIFT_START, 1], ['0%', '-16%']);
  const bridgeOpacity = useTransform(smoothProgress, [SHIFT_START, 1], [0, 1]);

  // STEP 20 — BACKDROP PRESENCE. Step 19 only raised the sentence's
  // resting opacity, which couldn't fix the actual complaint (see the
  // uploaded screenshot): once the panel resolves, the paper around
  // it is genuinely empty, not just dim. Three additions, all tied to
  // the same scroll math already driving everything else rather than
  // arbitrary decoration:
  //   1. `markerOpacity` — a quiet "02" chapter index, same device
  //      Chapter 04 already uses in its top-left gutter. Reusing an
  //      established site pattern instead of inventing a new one.
  //   2. `presenceOpacity` — fades in slightly ahead of the panel
  //      itself, driving a soft radial glow + four instrument corner
  //      marks that frame the panel once it exists, evoking "this is
  //      now in focus" rather than a generic vignette.
  //   3. A fixed, very faint dot grid across the whole frame (no
  //      motion value needed — see gridOpacity below) that reads as
  //      instrument/measurement paper, not UI chrome — sparse dots at
  //      intersections only, never lines, so it can't be mistaken for
  //      the card-grid/dashboard shapes the brief rules out.
  const markerOpacity = useTransform(smoothProgress, [0, 0.04], [0, 1]);
  // STEP 21: softened at the very tail (TEXT_IN → 1) rather than
  // holding at full strength through the chapter boundary — one less
  // thing competing with the closing copy and the Chapter 03 hand-off.
  const presenceOpacity = useTransform(
    smoothProgress,
    [CONVERGE_START - 0.04, PRIORITY.arrive, TEXT_IN, 1],
    [0, 1, 1, 0.4],
  );

  const textOpacity = useTransform(smoothProgress, [TEXT_START, TEXT_IN], [0, 1]);
  const textY = useTransform(smoothProgress, [TEXT_START, TEXT_IN], ['0.5rem', '0rem']);

  const recognizedFor = (id: DisassemblyConfig['id']) => {
    const cfg = SIGNALS.find((s) => s.id === id)!;
    return progress >= cfg.start;
  };

  const sentence = (dim: boolean) => (
    <h2
      className={clsx(
        'text-display-lg max-w-[22ch] text-balance text-center transition-colors duration-500',
        dim ? 'text-ink-muted' : 'text-ink',
      )}
    >
      <motion.span style={!prefersReducedMotion ? { opacity: restOpacity } : undefined}>Can </motion.span>
      {prefersReducedMotion ? (
        <span className="font-mono text-ink-muted">Sarah</span>
      ) : (
        <DisassemblingWord config={SARAH} scrollYProgress={smoothProgress} recognized={recognizedFor('sarah')} />
      )}
      <motion.span style={!prefersReducedMotion ? { opacity: restOpacity } : undefined}>
        {' '}
        finish the onboarding docs by{' '}
      </motion.span>
      {prefersReducedMotion ? (
        <span className="font-mono text-ink-muted">Friday</span>
      ) : (
        <DisassemblingWord config={FRIDAY} scrollYProgress={smoothProgress} recognized={recognizedFor('friday')} />
      )}
      <motion.span style={!prefersReducedMotion ? { opacity: restOpacity } : undefined}>? Make it </motion.span>
      {prefersReducedMotion ? (
        <span className="font-mono" style={{ color: 'var(--color-red)' }}>
          high priority
        </span>
      ) : (
        <DisassemblingWord config={PRIORITY} scrollYProgress={smoothProgress} recognized={recognizedFor('priority')} />
      )}
      <motion.span style={!prefersReducedMotion ? { opacity: restOpacity } : undefined}>.</motion.span>
    </h2>
  );

  if (prefersReducedMotion) {
    return (
      <section id="chapter-02" className="relative w-full" aria-label="Understanding">
        <h3 className="sr-only">The sentence is disassembled, understood, and reconstructed as structured work</h3>
        <ChapterBackdrop index="02" markerOpacity={1} />
        <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-lg py-section-mobile lg:py-0">
          {sentence(true)}
          <div className="relative">
            <PanelPresence opacity={1} />
            <Workspace stage={3} resolved title={TITLE} fields={SIGNALS.map((s) => s.field)} entryRef={entryRef} />
          </div>
          <div className="max-w-narrow text-center">
            <p className="text-heading-sm mb-xs">A request is more than a sentence.</p>
            <p className="text-body-sm text-ink-muted">
              People, timing, urgency and work can be understood without forcing the person to structure the
              request first.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-02" ref={sectionRef} className="relative w-full h-[340dvh]" aria-label="Understanding">
      <h3 className="sr-only">The sentence is disassembled, understood, and reconstructed as structured work</h3>
      <div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden">
        {/* STEP 20/22: fixed, very faint dot grid + chapter marker —
            factored into ChapterBackdrop so every chapter shares it. */}
        <ChapterBackdrop index="02" markerOpacity={markerOpacity} />

        <div className="relative flex h-full w-full flex-col items-center justify-center px-gutter-mobile sm:px-gutter-tablet lg:px-gutter-desktop">
          {/* The shared-plane cue for the "understanding" beat — see
              the file-level note on why this isn't point-to-point lines. */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: planeOpacity }}
            className="pointer-events-none absolute left-1/2 top-1/2 w-[70vw] -translate-x-1/2 -translate-y-1/2"
          >
            <ContinuityLine orientation="horizontal" color="ink-muted" thickness={1} className="h-px w-full" />
          </motion.div>

          <motion.div style={{ scale: sentenceScale, y: sentenceY }} className="relative z-10 flex justify-center">
            {sentence(false)}
          </motion.div>

          <motion.div
            style={{ opacity: panelOpacity, scale: panelScale, x: panelShiftX }}
            className="relative z-10 mt-lg"
          >
            <PanelPresence opacity={presenceOpacity} />
            <Workspace stage={stage} resolved={resolved} title={title} fields={fields} entryRef={entryRef} />
          </motion.div>

          {/* Bridge into Chapter 03 — an emerging second slot, only at the very end. */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: bridgeOpacity, borderColor: 'var(--color-border-on-dark)' }}
            className="pointer-events-none absolute left-1/2 top-[calc(50%+11rem)] hidden h-[8rem] w-[min(40vw,12rem)] translate-x-[3rem] rounded-lg border border-dashed sm:block"
          />

          <motion.div style={{ opacity: textOpacity, y: textY }} className="relative z-10 mt-md max-w-narrow text-center">
            <p className="text-heading-sm mb-xs">A request is more than a sentence.</p>
            <p className="text-body-sm text-ink-muted">
              People, timing, urgency and work can be understood without forcing the person to structure the
              request first.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
