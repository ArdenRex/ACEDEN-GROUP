'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CHAPTER_IDS, DARK_CHAPTER_IDS } from '@/lib/chapterSurfaces';

interface DustSpec {
  id: string;
  top: string;
  left: string;
  size: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
}

// Fixed, hand-placed positions rather than Math.random() — deterministic
// between server and client render (no hydration mismatch), spread
// across the viewport so no two dots drift through the same spot at
// the same time, and never near the exact center where the eye
// naturally lands on read content.
const DUST: DustSpec[] = [
  { id: 'a', top: '12%', left: '8%', size: 4, driftX: 10, driftY: -16, duration: 16, delay: 0 },
  { id: 'b', top: '68%', left: '15%', size: 3, driftX: -14, driftY: 12, duration: 19, delay: 2 },
  { id: 'c', top: '22%', left: '85%', size: 5, driftX: -10, driftY: 18, duration: 14, delay: 4 },
  { id: 'd', top: '82%', left: '75%', size: 3, driftX: 16, driftY: -10, duration: 21, delay: 1 },
  { id: 'e', top: '48%', left: '5%', size: 4, driftX: -12, driftY: -14, duration: 18, delay: 6 },
  { id: 'f', top: '6%', left: '55%', size: 3, driftX: 14, driftY: 14, duration: 15, delay: 3 },
  { id: 'g', top: '92%', left: '40%', size: 4, driftX: -16, driftY: -12, duration: 20, delay: 5 },
  { id: 'h', top: '38%', left: '92%', size: 3, driftX: 12, driftY: 16, duration: 17, delay: 7 },
];

/**
 * Idle "breathing" ambient motion — Step 5 of the beauty pass. A
 * handful of very faint dots, drifting and fading in and out on slow,
 * staggered, multi-second loops, so no chapter reads as perfectly
 * static during a between-chapter moment or a long reading pause.
 *
 * Deliberately NOT the SignalDot primitive or its red accent color —
 * SignalDot's own docs are explicit that red is a state indicator,
 * "something is happening here," never generic decoration, and
 * tokens.css reserves red site-wide as the one saturated color, never
 * a background wash. Reusing it here for pure ambient dust would
 * quietly break that meaning everywhere else it appears. This
 * borrows SignalDot's *shape* language only (a small plain circle),
 * in the same restrained ink tones as the rest of the UI, at a
 * genuine 5–10% peak opacity — closer to dust in a shaft of light
 * than a UI element.
 *
 * Colors switch between the light- and dark-chapter sets exactly the
 * way ScrollProgressRail does, reusing the same shared detection
 * (`lib/chapterSurfaces`) so the two can't drift out of sync.
 *
 * Off entirely under reduced-motion.
 */
export function AmbientDust() {
  const prefersReducedMotion = useReducedMotion();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const sections = CHAPTER_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setIsDark(DARK_CHAPTER_IDS.has(entry.target.id));
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  const color = isDark ? 'var(--color-ink-muted-on-dark)' : 'var(--color-ink-faint)';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[8] overflow-hidden">
      {DUST.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full transition-colors duration-slow ease-settle"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, backgroundColor: color }}
          animate={{ opacity: [0, 0.08, 0], x: [0, d.driftX, 0], y: [0, d.driftY, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
