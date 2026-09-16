'use client';

import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { interactionTransition } from '@/lib/motion';

/**
 * Shared "magnetic button" micro-interaction — Step 2 (beauty pass)
 * of the site-wide interaction language, alongside UnderlineLink.
 *
 * Used for the bordered, button-shaped CTAs (the nav sign-up button,
 * the chapter-08 icon submit button, the post-extraction CTA) — the
 * elements that already read as "press this," not plain text links
 * (those use UnderlineLink instead, so the two languages stay
 * distinct rather than overlapping).
 *
 * The pull is deliberately subtle and capped — this system doesn't
 * do bounce or overshoot anywhere else, so the button eases toward
 * the pointer and back with the same calm `interactionTransition`
 * every other hover/focus state on the site already uses, not a
 * spring. Off entirely under reduced-motion or while disabled.
 *
 * PRESS FEEDBACK (beauty pass, step 11): a small `whileTap` scale
 * down (2%) gives an actual click a felt response — before this, a
 * press looked identical to a hover, and the only sign anything
 * happened was the page navigating. Kept inside the same
 * `interactionTransition` timing as everything else here rather than
 * a bespoke tap animation, so click and hover read as one consistent
 * material, not two different button systems layered together.
 */
const MAGNETIC_STRENGTH = 0.3;
const MAGNETIC_MAX_PX = 8;

type MagneticButtonProps = {
  as?: 'a' | 'button';
  className?: string;
  children: ReactNode;
  disabled?: boolean;
} & Record<string, unknown>;

export function MagneticButton({ as = 'button', className, children, disabled, ...rest }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  function handleMouseMove(event: MouseEvent) {
    if (prefersReducedMotion || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    setOffset({
      x: clamp(relX * MAGNETIC_STRENGTH, -MAGNETIC_MAX_PX, MAGNETIC_MAX_PX),
      y: clamp(relY * MAGNETIC_STRENGTH, -MAGNETIC_MAX_PX, MAGNETIC_MAX_PX),
    });
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  const MotionComponent = as === 'a' ? motion.a : motion.button;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      disabled={as === 'button' ? disabled : undefined}
      aria-disabled={as === 'a' ? disabled : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      whileTap={disabled || prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={interactionTransition}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
