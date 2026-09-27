'use client';

import { motion, useReducedMotion, type MotionValue } from 'framer-motion';

type Orientation = 'vertical' | 'horizontal';
/**
 * No general-purpose accent hue: the line is ink by default (its
 * meaning is structural, not decorative) and only takes on color at
 * the moments red is actually meaningful — the price underline, the
 * CTA lead-in, a stretch of it running across the dark product
 * surface. `red-on-dark` exists because a straight `red` doesn't
 * hold its weight against `--color-surface-dark`.
 */
type LineColor = 'ink' | 'ink-muted' | 'red' | 'red-on-dark';

const colorVar: Record<LineColor, string> = {
  ink: 'var(--color-ink)',
  'ink-muted': 'var(--color-ink-muted)',
  red: 'var(--color-red)',
  'red-on-dark': 'var(--color-red-on-dark)',
};

interface ContinuityLineProps {
  /** Used when no custom `path` is supplied. Ignored if `path` is set. */
  orientation?: Orientation;
  /**
   * Custom SVG path data (drawn in the coordinate space of `viewBox`)
   * for curved or branching segments. This is how later chapters give
   * the line a new shape without this component knowing about them.
   */
  path?: string;
  viewBox?: string;
  /**
   * Draw progress from 0 to 1. Pass a plain number for a fixed reveal,
   * a Framer Motion MotionValue (e.g. from useScroll/useTransform) for
   * scroll-driven drawing later, or omit for fully drawn.
   */
  progress?: number | MotionValue<number>;
  color?: LineColor;
  /** Stroke width in px, at the primitive's own scale (non-scaling). */
  thickness?: number;
  className?: string;
  /** Only set this if the line is carrying real meaning beyond decoration. */
  label?: string;
}

/**
 * The site's single recurring visual line, as a clean abstraction.
 * Nothing about "the conversation," "the workflow," or any other
 * chapter lives in this file — a chapter gives it a path/orientation
 * and progress value, and the same component renders every instance.
 *
 * Reduced motion: when the user prefers reduced motion, or when no
 * `progress` is supplied, the line renders fully drawn immediately —
 * its meaning never depends on watching it animate.
 */
export function ContinuityLine({
  orientation = 'vertical',
  path,
  viewBox = '0 0 100 100',
  progress,
  color = 'ink-muted',
  thickness = 1,
  className,
  label,
}: ContinuityLineProps) {
  const prefersReducedMotion = useReducedMotion();

  const d = path ?? (orientation === 'vertical' ? 'M 50 0 L 50 100' : 'M 0 50 L 100 50');
  const isMotionValue = typeof progress === 'object' && progress !== null;
  const staticDraw = prefersReducedMotion || progress === undefined;

  return (
    <svg
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={className}
      style={{ overflow: 'visible' }}
    >
      {staticDraw ? (
        <path d={d} fill="none" stroke={colorVar[color]} strokeWidth={thickness} vectorEffect="non-scaling-stroke" />
      ) : (
        <motion.path
          d={d}
          fill="none"
          stroke={colorVar[color]}
          strokeWidth={thickness}
          vectorEffect="non-scaling-stroke"
          style={isMotionValue ? { pathLength: progress as MotionValue<number> } : undefined}
          initial={isMotionValue ? undefined : { pathLength: 0 }}
          animate={isMotionValue ? undefined : { pathLength: progress as number }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </svg>
  );
}
