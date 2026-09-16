'use client';

import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { duration, ease } from '@/lib/motion';

interface EmphasisRevealProps {
  children: ReactNode;
  className?: string;
  underlineClassName?: string;
}

/**
 * Editorial emphasis — Step 6 of the beauty pass. Wraps a short,
 * genuinely important phrase — a chapter's closing line, not routine
 * body copy (see the brief's "one or two intentional emphasis
 * techniques," deliberately not "underline everything") — with a
 * hairline that draws in underneath it once, the moment it scrolls
 * into view.
 *
 * Same `whileInView` / `once` / margin contract as `fadeSettle` so it
 * never re-fires on a scroll back up, and the same calm settle timing
 * as every other reveal on the site. A slight delay past 0 so it
 * reads as a second, quieter motion under text that's already fading
 * in via `fadeSettle` on the same trigger — not competing with it.
 *
 * Reduced motion: renders fully drawn immediately, same policy as
 * ContinuityLine.
 */
export function EmphasisReveal({ children, className, underlineClassName }: EmphasisRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className={clsx('relative inline-block', className)}>
      {children}
      <motion.span
        aria-hidden="true"
        className={clsx('pointer-events-none absolute inset-x-0 -bottom-[0.08em] h-px origin-left bg-current', underlineClassName)}
        initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: duration.slow, ease: ease.settle, delay: prefersReducedMotion ? 0 : 0.15 }}
      />
    </span>
  );
}
