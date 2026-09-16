'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { scrollSmoothing } from '@/lib/motion';

/**
 * Global ambient light — Step 3 (ambient depth) of the beauty pass,
 * alongside GrainOverlay. Mounted once in layout.tsx.
 *
 * A large, heavily blurred radial glow that drifts a slow elliptical
 * path tied to overall page-scroll progress (run through the same
 * `scrollSmoothing` spring every scroll-scrubbed chapter uses, so it
 * glides rather than jumping on a wheel tick). `mix-blend-mode:
 * soft-light` composites it against whatever is already painted
 * beneath it — paper or the dark product-window surface — so one
 * layer works everywhere without a color of its own: it reuses
 * `--color-surface`, already in the palette, and simply lifts
 * whatever's under it a little. That reads as a faint warm lift on
 * paper chapters and a more visible soft glow on the dark chapters,
 * which is the right asymmetry — a light source is more noticeable
 * against a dark surface than a light one.
 *
 * The path is one function of scroll progress rather than fixed
 * waypoints, so it never repeats identically and never has a visible
 * "turnaround" moment — closer to a slow-drifting cloud than a
 * scripted pan.
 *
 * POINTER PARALLAX (beauty pass, step 9): on a fine pointer, the same
 * glow also leans gently toward the cursor — a small, spring-damped
 * offset layered on top of the scroll drift, not a replacement for
 * it. This is the one place on the page a "light source" is allowed
 * to feel aware of the visitor, which is what starts to read as real
 * depth rather than a flat scrolling backdrop. Capped small (±6vmax)
 * and spring-smoothed so it never darts or competes with the slow
 * drift; off entirely without a fine pointer, since there's no
 * cursor to react to. Reduced-motion keeps the whole layer unrendered
 * exactly as before.
 *
 * Sits below PersistentNav/ScrollProgressRail/GrainOverlay so it
 * never competes with legible UI chrome. Never rendered under
 * reduced-motion — its entire purpose is the drift.
 */
export function AmbientLight() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const t = useSpring(scrollYProgress, scrollSmoothing);

  const scrollLeft = useTransform(t, (v) => 50 + 32 * Math.sin(v * Math.PI * 2));
  const scrollTop = useTransform(t, (v) => 50 + 38 * Math.cos(v * Math.PI * 1.4 + 0.6));

  // Pointer offset, in the same percentage units as the scroll path,
  // so the two combine as one number instead of fighting in two unit
  // systems. Starts at rest (0,0) — a visitor who never moves a fine
  // pointer sees exactly the original scroll-only drift.
  const pointerLeft = useMotionValue(0);
  const pointerTop = useMotionValue(0);
  const pointerLeftSpring = useSpring(pointerLeft, { stiffness: 40, damping: 20, mass: 1 });
  const pointerTopSpring = useSpring(pointerTop, { stiffness: 40, damping: 20, mass: 1 });

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return undefined;

    function handleMove(e: MouseEvent) {
      // Normalize to -1..1 from viewport center, then scale to a small
      // percentage lean — deliberately subtle, this is ambience, not
      // a cursor-tracking spotlight.
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerLeft.set(nx * 6);
      pointerTop.set(ny * 6);
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [prefersReducedMotion, pointerLeft, pointerTop]);

  const left = useTransform([scrollLeft, pointerLeftSpring], ([s, p]: number[]) => `${(s ?? 0) + (p ?? 0)}%`);
  const top = useTransform([scrollTop, pointerTopSpring], ([s, p]: number[]) => `${(s ?? 0) + (p ?? 0)}%`);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed z-[15] h-[60vmax] w-[60vmax] rounded-full mix-blend-soft-light"
      style={{
        left,
        top,
        x: '-50%',
        y: '-50%',
        opacity: 0.5,
        filter: 'blur(70px)',
        background: 'radial-gradient(circle, var(--color-surface) 0%, transparent 70%)',
      }}
    />
  );
}
