'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface SignalTravelProps {
  label: string;
  /** The chapter's overall scroll progress (0-1), shared across all three signals. */
  scrollYProgress: MotionValue<number>;
  /** Where along scrollYProgress this signal's travel begins. */
  threshold: number;
  /** How much scroll progress the travel itself consumes. */
  travelSpan: number;
  /** Source point in the shared overlay's coordinate space, or null until measured. */
  source: Point | null;
  /** Destination point in the shared overlay's coordinate space, or null until measured. */
  target: Point | null;
}

/**
 * NEW primitive, Step 4H. The visible "information routing" moment
 * central to this redesign: a small data fragment detaches from its
 * word in the sentence and travels to the Workspace surface.
 *
 * Deliberately not an SVG path/line — an SVG connector between two
 * points at arbitrary, responsive-dependent positions reads as a
 * flowchart arrow, which the brief explicitly rules out. A single
 * fragment translating from source to destination communicates
 * "this piece of information moved" without drawing a diagram.
 *
 * Fully derived from `scrollYProgress` via useTransform chains — no
 * imperative animate() calls, no timers, nothing that needs to be
 * "undone" on backward scroll. Position and opacity are just
 * functions of scroll position, so scrubbing in either direction is
 * automatically correct.
 *
 * `source`/`target` are measured by the parent chapter (DOM rects of
 * the actual word and the Workspace's entry point) rather than
 * guessed/hardcoded — this ties the travel to where the word and
 * surface really are on screen at any given viewport width, and
 * requires no knowledge of layout from this component.
 *
 * Renders nothing until both points are measured (avoids a flash of
 * an unpositioned chip at 0,0 on first paint). Not rendered at all
 * when the user prefers reduced motion — see Chapter01Conversation.
 */
export function SignalTravel({ label, scrollYProgress, threshold, travelSpan, source, target }: SignalTravelProps) {
  const localT = useTransform(scrollYProgress, [threshold, threshold + travelSpan], [0, 1]);
  const opacity = useTransform(localT, [0, 0.12, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(localT, [0, 0.12, 1], [0.85, 1, 0.82]);
  const x = useTransform(localT, [0, 1], [source?.x ?? 0, target?.x ?? 0]);
  const y = useTransform(localT, [0, 1], [source?.y ?? 0, target?.y ?? 0]);

  if (!source || !target) return null;

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-sm px-[0.5em] py-[0.2em] font-mono text-[0.6875rem] font-medium"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        opacity,
        scale,
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-background)',
      }}
    >
      {label}
    </motion.span>
  );
}
