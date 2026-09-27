'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useMotionValueEvent, useSpring, useTransform, type MotionValue } from 'framer-motion';
import clsx from 'clsx';
import { Container } from '@/components/primitives/Container';
import { RecognizedWord } from '@/components/primitives/RecognizedWord';
import { SignalTravel } from '@/components/primitives/SignalTravel';
import { Workspace, type WorkspaceField } from '@/components/primitives/Workspace';
import dynamic from 'next/dynamic';
import { HeroGlow } from '@/components/primitives/HeroGlow';

// Dynamically imported: three.js is a real dependency-weight addition,
// and it needs window/WebGL, so it can't be server-rendered anyway.
// Loading it as its own chunk after initial paint keeps Chapter 01's
// text/Workspace content (the part that matters for first paint and
// screen readers) out of the critical path for a 3D library.
const Hero3D = dynamic(() => import('@/components/primitives/Hero3D').then((m) => m.Hero3D), { ssr: false });
import { extractionState, type SignalConfig } from '@/lib/signalExtraction';
import { useNavVisibility } from '@/lib/navStore';
import { duration, ease, scrollSmoothing } from '@/lib/motion';

// The opening scene is the one entrance on the page that can't use
// the usual whileInView fadeSettle — it's already in the viewport at
// load, so there's nothing to scroll into. This mirrors fadeSettle's
// motion values but fires once on mount instead, so the very first
// thing a visitor sees still arrives with the same calm fade+settle
// as everything after it, rather than snapping in at full opacity.
const mountSettle = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.slow, ease: ease.settle, delay },
});

/**
 * The opening scene.
 *
 * STEP 5A REVISION — fixes a spatial-causality bug in the Step 4H
 * build: fields used to appear inside the Workspace at the same
 * scroll position a signal's travel *began*, not where it *ended*,
 * so the destination content and the traveling-signal animation were
 * racing each other instead of the field being a visible consequence
 * of the signal's arrival. See lib/signalExtraction.ts for the fix —
 * every signal now has two distinct moments, `recognized` (starts
 * detaching from its word) and `arrived` (has landed, destination
 * reacts), `travelSpan` apart, instead of one shared threshold.
 *
 * Everything else about the Step 4H architecture is unchanged: no
 * mount-time timers, `scrollYProgress` is the single source of truth,
 * backward scrolling is correct for free because nothing is ever
 * "undone," and the tall/sticky section is native scroll-position
 * tracking, not scroll-jacking (see the note further down).
 *
 * ----------------------------------------------------------------
 * WHY TWO REACT STATE VARIABLES INSTEAD OF ONE "STAGE" NUMBER
 * ----------------------------------------------------------------
 * `useMotionValueEvent` computes a signature string from every
 * signal's recognized/arrived booleans plus the resolved flag, and
 * only calls `setProgress` when that signature actually changes —
 * same "only re-render on a real state change" discipline as the
 * Step 4H version, just covering six-plus booleans instead of one
 * five-way stage number, since recognized and arrived can now change
 * independently per signal.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION
 * ----------------------------------------------------------------
 * Unchanged from Step 4H: an entirely separate, short, non-sticky
 * render with the resolved end-state shown immediately. No signal
 * ever needs to be measured or traveled in that branch.
 */

const TITLE = 'Onboarding Docs';

interface Signal extends Omit<SignalConfig, 'id'> {
  id: 'sarah' | 'friday' | 'priority';
  text: string;
  field: WorkspaceField;
}

// Later signals travel faster once the visitor has learned the
// interaction's grammar from the first one — travelSpan shortens
// each time rather than every beat taking identical time.
// STEP 15A: travel was tied to scroll progress but the section was
// short enough (300dvh) and the spans narrow enough that a normal
// scroll gesture — especially a trackpad flick or fast wheel scroll —
// covered a whole signal's threshold-to-arrival range in one motion,
// so the word reached the panel almost as soon as it started moving.
// Widening travelSpan (more scroll distance per word's journey) and
// growing the section height below both slow the *physical* scroll
// distance needed to complete each arrival, without changing anything
// about the scroll-scrubbed architecture itself.
const SARAH: Signal = {
  id: 'sarah',
  threshold: 0.12,
  travelSpan: 0.14,
  text: 'Sarah',
  field: { id: 'assignee', label: 'Assignee', value: 'Sarah' },
};
const FRIDAY: Signal = {
  id: 'friday',
  threshold: 0.4,
  travelSpan: 0.12,
  text: 'Friday',
  field: { id: 'deadline', label: 'Deadline', value: 'Friday' },
};
const PRIORITY: Signal = {
  id: 'priority',
  threshold: 0.68,
  travelSpan: 0.1,
  text: 'high priority',
  field: { id: 'priority', label: 'Priority', value: 'High', accent: true },
};

const SIGNALS: Signal[] = [SARAH, FRIDAY, PRIORITY];
const RESOLVED_THRESHOLD = 0.92

// STEP 15B FOLLOW-UP: pacing (how much scroll distance a word needs)
// was fixed in Step 15B, but the *motion itself* was still driven
// directly by raw scrollYProgress. `useSpring` (config: shared
// `scrollSmoothing` in lib/motion, STEP 16 — previously a local
// constant here, now centralized so every scroll-scrubbed chapter
// shares one pacing feel) is a smoothing filter, not a physics toy:
// it interpolates between raw wheel-scroll jumps on every animation
// frame, so the word's position, opacity and scale — and the
// recognized/arrived state derived from the same value below — all
// glide continuously regardless of what kind of input produced the
// scroll.

interface Point {
  x: number;
  y: number;
}

interface Positions {
  sarah: Point | null;
  friday: Point | null;
  priority: Point | null;
  entry: Point | null;
}

/**
 * ScrollCue — bold pass: a quiet invitation to keep scrolling, at the
 * very bottom of the opening scene. Nothing previously told a visitor
 * this was the start of a longer journey rather than a static page,
 * which works against the explicit goal of getting people to scroll
 * all the way to the footer. Fades out almost immediately once
 * scrolling actually starts (over the first 4% of this chapter's
 * 400dvh pin) — a hint for the still frame, gone the instant it's no
 * longer needed, never competing with content once the story begins.
 * Animated branch only: reduced-motion visitors get the reduced-
 * motion layout directly, with no pinned scroll to cue in the first
 * place.
 */
function ScrollCue({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute bottom-[5%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-[6px]"
      aria-hidden="true"
    >
      <span className="text-label uppercase tracking-[0.14em] text-ink-faint">Scroll</span>
      <motion.svg
        width="14"
        height="20"
        viewBox="0 0 14 20"
        fill="none"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M1 1 L7 7 L13 1" stroke="var(--color-ink-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  );
}

export function Chapter01Conversation() {
  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sarahWordRef = useRef<HTMLSpanElement>(null);
  const fridayWordRef = useRef<HTMLSpanElement>(null);
  const priorityWordRef = useRef<HTMLSpanElement>(null);
  const entryRef = useRef<HTMLSpanElement>(null);

  const setNavVisible = useNavVisibility((state) => state.setVisible);

  const [progress, setProgress] = useState(0);
  const signatureRef = useRef('');
  const [positions, setPositions] = useState<Positions>({
    sarah: null,
    friday: null,
    priority: null,
    entry: null,
  });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // Every downstream consumer — the traveling chips and the
  // recognized/arrived state below — reads this smoothed value
  // instead of scrollYProgress directly, so the visual travel and
  // the moment a field appears stay perfectly in sync (the exact
  // pairing Step 5A fixed) while both gain the same smoothing.
  const smoothProgress = useSpring(scrollYProgress, scrollSmoothing);

  useMotionValueEvent(smoothProgress, 'change', (v) => {
    const states = extractionState(v, SIGNALS);
    const resolved = v >= RESOLVED_THRESHOLD;
    const signature = states.map((s) => `${s.recognized ? 1 : 0}${s.arrived ? 1 : 0}`).join('') + (resolved ? '1' : '0');
    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      setProgress(v);
    }
  });

  const states = extractionState(progress, SIGNALS);
  const stateById = Object.fromEntries(states.map((s) => [s.id, s])) as Record<
    'sarah' | 'friday' | 'priority',
    (typeof states)[number]
  >;
  const sarahState = stateById.sarah;
  const fridayState = stateById.friday;
  const priorityState = stateById.priority;
  const resolved = progress >= RESOLVED_THRESHOLD;
  const arrivedCount = states.filter((s) => s.arrived).length as 0 | 1 | 2 | 3;
  const title = arrivedCount >= 2 ? TITLE : null;
  const fields = states.filter((s) => s.arrived).map((s) => SIGNALS.find((sig) => sig.id === s.id)!.field);

  // Re-measure whenever the layout might have changed shape: on
  // mount, whenever recognition/arrival has just changed (a word's
  // font swapped, a field was added — either can shift surrounding
  // layout), and on resize.
  useEffect(() => {
    function measure() {
      const container = overlayRef.current;
      if (!container) return;
      const c = container.getBoundingClientRect();
      const point = (el: HTMLElement | null): Point | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 };
      };
      setPositions({
        sarah: point(sarahWordRef.current),
        friday: point(fridayWordRef.current),
        priority: point(priorityWordRef.current),
        entry: point(entryRef.current),
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [progress]);

  // STEP 46 (replaces the STEP 36 sentinel/IntersectionObserver
  // approach entirely): that approach only reported at the *instant*
  // a 1px element crossed a viewport edge. That's fragile in two
  // ways that both produce the same symptom — the nav getting stuck
  // visible on every later chapter: (1) on mobile, the address bar
  // collapsing/expanding as you scroll changes 100dvh, which resizes
  // this 400dvh section and can shift the sentinel without an
  // IntersectionObserver "crossing" ever firing for it, so the last
  // known state (often the initial `true`) never gets corrected; and
  // (2) a single discrete crossing event has no self-correction if
  // it's ever missed — there's no ongoing check behind it.
  //
  // `scrollYProgress` below already tracks this exact section
  // continuously (0 = top of Chapter 01, 1 = fully scrolled past it)
  // via Framer Motion's useScroll, which re-measures on resize —
  // including dvh changes — on its own. Deriving nav visibility from
  // it instead of a separate sentinel means the same continuous value
  // that already drives this chapter's own animations also drives
  // the nav, so there's no second, independently-fallible mechanism
  // that can drift out of sync with it.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setNavVisible(v < 1);
  });

  useEffect(() => {
    // Syncs the initial value on mount (useMotionValueEvent only
    // fires on subsequent changes), matching the default `visible:
    // true` in navStore for a visitor who lands at the top of the
    // page.
    setNavVisible(scrollYProgress.get() < 1);
  }, [scrollYProgress, setNavVisible]);

  function wordPhase(recognized: boolean, arrived: boolean): 0 | 1 | 2 {
    if (arrived) return 2;
    if (recognized) return 1;
    return 0;
  }

  const sentence = (phases: { sarah: 0 | 1 | 2; friday: 0 | 1 | 2; priority: 0 | 1 | 2 }, dim: boolean) => (
    <h1
      className={clsx(
        'text-display-lg max-w-[15ch] text-balance transition-colors duration-500 sm:max-w-[17ch]',
        dim ? 'text-ink-muted' : 'text-ink',
      )}
    >
      Can{' '}
      <RecognizedWord ref={sarahWordRef} phase={phases.sarah}>
        Sarah
      </RecognizedWord>{' '}
      finish the onboarding docs by{' '}
      <RecognizedWord ref={fridayWordRef} phase={phases.friday}>
        Friday
      </RecognizedWord>
      ? Make it{' '}
      <RecognizedWord ref={priorityWordRef} phase={phases.priority}>
        high priority
      </RecognizedWord>
      .
    </h1>
  );

  if (prefersReducedMotion) {
    return (
      <section id="chapter-01" className="relative w-full" aria-label="Opening">
        <HeroGlow />
        <Hero3D />
        <div className="flex min-h-[100dvh] w-full items-center py-section-mobile lg:py-0">
          <Container width="max">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-6">
              <div className="lg:col-span-6">
                <div className="mb-sm inline-flex items-center gap-[6px] rounded-full border px-sm py-[3px] text-label uppercase tracking-[0.08em]" style={{ borderColor: 'var(--color-border-strong)' }}>
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: 'var(--gradient-accent)' }} aria-hidden="true" />
                  AI Workflow Coordinator
                </div>
                <p className="text-label mb-sm">Alex &middot; 9:41 AM</p>
                {sentence({ sarah: 2, friday: 2, priority: 2 }, false)}
              </div>
              <div className="lg:col-span-6 lg:col-start-7 lg:mt-lg">
                <Workspace stage={3} resolved title={TITLE} fields={SIGNALS.map((s) => s.field)} entryRef={entryRef} />
              </div>
            </div>
          </Container>
        </div>
      </section>
    );
  }

  return (
    <section id="chapter-01" ref={sectionRef} className="relative w-full h-[400dvh]" aria-label="Opening">
      <div className="sticky top-0 flex min-h-[100dvh] w-full items-center py-section-mobile lg:py-0">
        <HeroGlow />
        <Hero3D />
        <ScrollCue scrollYProgress={scrollYProgress} />
        <Container width="max">
          <div ref={overlayRef} className="relative">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-6">
              <motion.div {...mountSettle(0)} className="lg:col-span-6">
                <div className="mb-sm inline-flex items-center gap-[6px] rounded-full border px-sm py-[3px] text-label uppercase tracking-[0.08em]" style={{ borderColor: 'var(--color-border-strong)' }}>
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: 'var(--gradient-accent)' }} aria-hidden="true" />
                  AI Workflow Coordinator
                </div>
                <p className="text-label mb-sm">Alex &middot; 9:41 AM</p>
                {sentence(
                  {
                    sarah: wordPhase(sarahState.recognized, sarahState.arrived),
                    friday: wordPhase(fridayState.recognized, fridayState.arrived),
                    priority: wordPhase(priorityState.recognized, priorityState.arrived),
                  },
                  resolved,
                )}
              </motion.div>
              <motion.div {...mountSettle(0.12)} className="lg:col-span-6 lg:col-start-7 lg:mt-lg">
                <Workspace stage={arrivedCount} resolved={resolved} title={title} fields={fields} entryRef={entryRef} />
              </motion.div>
            </div>

            <div className="pointer-events-none absolute inset-0 z-20">
              {SIGNALS.map((s) => (
                <SignalTravel
                  key={s.id}
                  label={s.text}
                  scrollYProgress={smoothProgress}
                  threshold={s.threshold}
                  travelSpan={s.travelSpan}
                  source={positions[s.id]}
                  target={positions.entry}
                />
              ))}
            </div>
          </div>
        </Container>
      </div>

    </section>
  );
}
