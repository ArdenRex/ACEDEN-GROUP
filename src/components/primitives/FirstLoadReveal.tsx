'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ContinuityLine } from '@/components/primitives/ContinuityLine';
import { duration, ease } from '@/lib/motion';

const SESSION_KEY = 'awc-entrance-played';
// Roughly when ContinuityLine's own fixed 0.6s draw reads as
// "basically done" — the fade starts a touch early so the two
// motions overlap instead of visibly queuing one after the other.
const FADE_DELAY_MS = 500;

/**
 * First-load entrance — Step 4 of the beauty pass. A brief, tasteful
 * reveal on first paint, once per browser tab session (sessionStorage,
 * not a cookie — this is pure polish, not worth persisting past a
 * closed tab).
 *
 * Deliberately reuses the site's one existing line motif
 * (ContinuityLine) instead of inventing a new device — the same
 * "doesn't need reinventing" reasoning the brief already applied to
 * the opening scene itself. A paper-colored curtain holds, a single
 * hairline draws itself across the center, then both fade together —
 * uncovering Chapter01's own mount-time entrance (`mountSettle`)
 * right around when it's finishing its own settle. No bounce, same
 * `ease.settle` as everything else on the site.
 *
 * Renders the curtain by default on first paint — server and client
 * agree on that first render, so a first-time visitor never sees a
 * flash of raw content before it — then a mount-time effect checks
 * sessionStorage: if this tab session already played the entrance
 * (including a manual reload), it skips straight to removed, no
 * animation.
 *
 * Off entirely under reduced-motion: the content underneath is
 * already there and readable; a curtain has nothing to add without
 * the motion that's the whole point of it.
 */
export function FirstLoadReveal() {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(false);
      return undefined;
    }

    const alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY);
    if (alreadyPlayed) {
      setVisible(false);
      return undefined;
    }

    window.sessionStorage.setItem(SESSION_KEY, '1');
    const fadeTimer = window.setTimeout(() => setFading(true), FADE_DELAY_MS);
    return () => window.clearTimeout(fadeTimer);
  }, [prefersReducedMotion]);

  if (!visible) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: duration.slow, ease: ease.settle }}
      onAnimationComplete={() => {
        if (fading) setVisible(false);
      }}
    >
      <ContinuityLine orientation="horizontal" progress={1} color="ink-muted" thickness={1} className="h-px w-[min(18rem,40vw)]" />
    </motion.div>
  );
}
