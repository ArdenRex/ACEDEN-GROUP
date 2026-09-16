'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * HeroGlow — visual-identity pass, extended into a generative motion
 * backdrop (beauty-pass step 4), then made significantly more vivid
 * in the bold pass (per explicit direction: the first thing a visitor
 * sees should read as striking, not merely "present"). A large,
 * softly blurred instance of --gradient-accent (red -> gold), sitting
 * behind Chapter 01's content only. This is the site's first
 * deliberate departure from pure ink-on-paper: a real color moment
 * right where a visitor's eye lands first — now turned up enough to
 * actually register as color, not just a faint warmth.
 *
 * There's no real hero video/footage to source in this environment,
 * so this is the procedural stand-in for that: three soft shapes
 * drift and breathe on slow, independent, staggered loops rather
 * than sitting frozen — the same "nothing on the page is ever
 * perfectly static" idea AmbientDust already applies elsewhere, given
 * to the one moment that actually gets a visitor's full, undivided
 * attention (first paint, before any scroll). Off-kilter placement
 * (upper-right, lower-left, a smaller third accent near center-right)
 * so it reads as considered art direction rather than a generic
 * centered glow.
 *
 * Movement is still large-scale, not frantic — a few vmax of drift,
 * gentle scale/opacity breathing, no bounce — this is ambient
 * atmosphere sitting behind legible body copy and the Workspace
 * panel, not something meant to be watched frame-by-frame. But it is
 * now genuinely bright enough to be the visual signature of the
 * opening moment, not a background detail. Sits behind everything
 * (z-0) inside the section's existing stacking order, painted before
 * the sticky content div so it's always behind it without needing an
 * explicit z-index that could fight SignalTravel's z-20 layer.
 *
 * Reduced-motion gets the original static placement, unanimated —
 * safe to render unconditionally in both the reduced-motion and full
 * Chapter 01 branches either way.
 */
export function HeroGlow() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -right-[12vw] -top-[18vh] h-[68vmax] w-[68vmax] rounded-full"
        style={{ background: 'var(--gradient-accent)', filter: 'blur(100px)' }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.34, x: 0, y: 0, scale: 1 }
            : { opacity: [0.28, 0.4, 0.28], x: [0, '-3vmax', '1vmax', 0], y: [0, '2vmax', '-1vmax', 0], scale: [1, 1.08, 1] }
        }
        transition={prefersReducedMotion ? undefined : { duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-[24vh] -left-[14vw] h-[50vmax] w-[50vmax] rounded-full"
        style={{ background: 'var(--gradient-accent)', filter: 'blur(100px)' }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.24, x: 0, y: 0, scale: 1 }
            : { opacity: [0.18, 0.28, 0.18], x: [0, '2.5vmax', '-1.5vmax', 0], y: [0, '-2vmax', '1.5vmax', 0], scale: [1, 1.1, 1] }
        }
        transition={prefersReducedMotion ? undefined : { duration: 32, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[18vw] top-[30vh] h-[22vmax] w-[22vmax] rounded-full"
        style={{ background: 'var(--gradient-accent)', filter: 'blur(70px)' }}
        initial={false}
        animate={
          prefersReducedMotion
            ? { opacity: 0.2, x: 0, y: 0, scale: 1 }
            : { opacity: [0.14, 0.24, 0.14], x: [0, '-1.5vmax', '1vmax', 0], y: [0, '1.5vmax', '-1vmax', 0], scale: [1, 1.12, 1] }
        }
        transition={prefersReducedMotion ? undefined : { duration: 21, delay: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
