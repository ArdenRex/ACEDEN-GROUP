'use client';

import { motion, type MotionValue } from 'framer-motion';

interface ChapterBackdropProps {
  /** The chapter number as shown, e.g. '02'. */
  index: string;
  /** Fade-in for the index marker only — pass a fixed number for reduced-motion/static renders. */
  markerOpacity: MotionValue<number> | number;
}

/**
 * The shared "instrument paper" backdrop: a fixed, very faint dot
 * grid across the whole frame, plus a quiet chapter-index marker in
 * the top-left gutter. First built directly inside Chapter 02 (Step
 * 20) to give an otherwise-empty sticky frame some ambient presence
 * without reading as UI chrome — sparse dots at intersections only,
 * never lines, so it can't be mistaken for the card-grid/dashboard
 * shapes the brief rules out. Factored out here (Step 22) so Chapter
 * 03 and any later chapter share the exact same texture and marker
 * device rather than each hand-rolling its own version of it.
 *
 * The grid itself needs no motion value — it's part of the frame's
 * identity, not a scroll-driven beat — only the index marker fades
 * in, matching the device each chapter already uses for its own
 * opening (see e.g. Chapter 04's "04" marker, which predates this
 * primitive and is what this one is modeled on).
 */
export function ChapterBackdrop({ index, markerOpacity }: ChapterBackdropProps) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(var(--color-ink-faint) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <motion.p
        style={{ opacity: markerOpacity }}
        className="pointer-events-none absolute left-gutter-mobile top-[6%] text-label opacity-60 sm:left-gutter-tablet lg:left-gutter-desktop"
      >
        {index}
      </motion.p>
    </>
  );
}
