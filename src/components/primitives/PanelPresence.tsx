'use client';

import { motion, type MotionValue } from 'framer-motion';
import clsx from 'clsx';

const CORNERS = [
  ['left-0 top-0', 'border-l border-t'],
  ['right-0 top-0', 'border-r border-t'],
  ['left-0 bottom-0', 'border-l border-b'],
  ['right-0 bottom-0', 'border-r border-b'],
] as const;

/**
 * Soft radial glow + four instrument corner marks, giving a panel or
 * box "presence" — this is now in focus, not floating alone. Built
 * for Chapter 02's single centered panel (Step 20), then factored
 * out here (Step 25) so Chapter 03's three lane boxes can reuse the
 * exact same device rather than a new invention. No glass, no
 * rounded card, no dashboard chrome — just ink-toned glow and four
 * small L-marks, matching the "Direction C, The Instrument" language.
 *
 * Two modes:
 *  - `inset` (default): renders relative to its parent, expanding
 *    outward by `inset`. Use for a panel whose own box isn't known in
 *    the same coordinate system (Chapter 02's Workspace).
 *  - `box`: renders at an explicit left/top/width/height, in the same
 *    percent units as the caller's own field. Use when the target
 *    (e.g. a GroupOutline) already has known field-percent bounds.
 */
type PanelPresenceProps =
  | { opacity: MotionValue<number> | number; mode?: 'inset'; inset?: string; className?: string }
  | { opacity: MotionValue<number> | number; mode: 'box'; left: number; top: number; width: number; height: number; pad?: number };

export function PanelPresence(props: PanelPresenceProps) {
  const { opacity } = props;
  const isBox = props.mode === 'box';

  const style = isBox
    ? {
        opacity,
        left: `${props.left - (props.pad ?? 2)}%`,
        top: `${props.top - (props.pad ?? 2)}%`,
        width: `${props.width + (props.pad ?? 2) * 2}%`,
        height: `${props.height + (props.pad ?? 2) * 2}%`,
      }
    : { opacity };

  return (
    <motion.div
      aria-hidden="true"
      style={style}
      className={clsx('pointer-events-none absolute', isBox ? undefined : (props.className ?? '-inset-10 sm:-inset-14'))}
    >
      {/* STEP 26: the glow is skipped in box mode. It was built to sit
          behind Chapter 02's opaque panel and bleed out past the
          edges — here the box has no fill (just a border), so the
          same gradient rendered as a visible smudge inside otherwise
          empty, transparent boxes instead of an ambient halo. Corner
          marks alone read as "in focus" without that side effect. */}
      {!isBox && (
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(closest-side, rgba(22,21,26,0.06), rgba(22,21,26,0) 70%)' }}
        />
      )}
      {CORNERS.map(([pos, sides]) => (
        <span key={pos} className={clsx('absolute h-4 w-4', pos, sides)} style={{ borderColor: 'var(--color-ink-faint)' }} />
      ))}
    </motion.div>
  );
}
