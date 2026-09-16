'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface RelationshipLineProps {
  /** Endpoints in the same 0-100 coordinate space as the parent `<svg viewBox="0 0 100 100">`. */
  from: Point;
  to: Point;
  /**
   * The line's own opacity, fully controlled by the caller — this is
   * what lets a relationship fade back out once physical grouping
   * supersedes it (see Chapter 03), rather than only ever fading in.
   */
  visibility: MotionValue<number>;
  /** 0 = at `from`, 1 = arrived at `to`. Drives a small marker that visibly travels the connection, independent of `visibility`. */
  travel: MotionValue<number>;
  color?: 'ink-muted' | 'ink' | 'red';
}

/**
 * NEW primitive, Chapter 03 (Step 6). Unlike `ContinuityLine` — which
 * draws a fixed or scroll-drawn path between two points that don't
 * move relative to each other — this connects two points that are
 * each independently animating, and its own visibility can rise and
 * fall rather than only ever settling fully drawn. That's the new
 * requirement Chapter 03 introduces: "relationships must appear
 * before containers," then recede once the things they connect
 * physically converge — a shape `ContinuityLine` doesn't cover.
 *
 * Renders a plain SVG line plus a small traveling dot, so it reads as
 * "the system found a connection and moved along it," never a
 * boxes-and-arrows diagram, since nothing here draws a container.
 *
 * Must be rendered inside a parent
 * `<svg viewBox="0 0 100 100" preserveAspectRatio="none">` — this
 * component renders `<line>`/`<circle>` children only, so several
 * instances can share one SVG layer (see Chapter03Organize).
 */
export function RelationshipLine({ from, to, visibility, travel, color = 'ink-muted' }: RelationshipLineProps) {
  const stroke =
    color === 'ink' ? 'var(--color-ink)' : color === 'red' ? 'var(--color-red)' : 'var(--color-ink-muted)';

  const dotOpacity = useTransform(travel, [0, 0.08, 0.85, 1], [0, 1, 1, 0]);
  const dotX = useTransform(travel, [0, 1], [from.x, to.x]);
  const dotY = useTransform(travel, [0, 1], [from.y, to.y]);

  return (
    <>
      <motion.line
        aria-hidden="true"
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        style={{ opacity: visibility }}
        stroke={stroke}
        strokeWidth={0.35}
        vectorEffect="non-scaling-stroke"
      />
      <motion.circle aria-hidden="true" r={0.9} fill={stroke} cx={dotX} cy={dotY} style={{ opacity: dotOpacity }} />
    </>
  );
}
