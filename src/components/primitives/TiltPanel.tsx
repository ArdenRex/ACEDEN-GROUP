'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/**
 * TiltPanel — shared pointer-driven 3D tilt for static cards/panels.
 * Beauty-pass step 2: give a resting surface the same pointer-aware
 * depth AmbientLight already gave the whole page's background.
 *
 * Wrap a card/panel that is otherwise at rest (not mid scroll-jack)
 * and it leans a few degrees toward the pointer in 3D, spring-easing
 * back to flat on leave. Deliberately restrained — a handful of
 * degrees, no bounce or overshoot, matching a system that has none
 * of that anywhere else.
 *
 * OPT-OUTS, same precedence as CustomCursor:
 *   - prefers-reduced-motion: never active, plain wrapper.
 *   - coarse/no pointer (touch): never active, plain wrapper — a
 *     tap has no hover position for the tilt to track.
 *
 * PERF: mousemove writes straight to Framer motion values via
 * `.set()`, never React state — same discipline as CustomCursor's
 * step 8 rewrite, so pointer movement over a tilted panel causes
 * zero React re-renders. `enabled` is the only real state, and it
 * only changes when pointer capability changes, not per mousemove.
 *
 * DELIBERATELY NOT wired into anything that carries its own live
 * scroll-driven transform or dimensions (a chapter's growing product
 * panel, any scrollYProgress-scrubbed field, Chapter 08's live-typing
 * textarea) — a visitor resting their pointer there while still
 * scrolling would fight the scroll-driven motion rather than add
 * polish. This is for surfaces a visitor reaches only once they've
 * actually stopped to look — which is exactly what Chapter 04's
 * StaticZone task cards are: genuinely at rest, not mid-scroll-jack,
 * not a live input, so this is where the primitive was first wired up
 * (bold pass, sub-step 2, alongside the glass-card treatment on the
 * same cards).
 */
const TILT_MAX_DEG = 5;
const PERSPECTIVE_PX = 1000;
const TILT_SPRING = { stiffness: 220, damping: 22, mass: 0.5 } as const;

interface TiltPanelProps {
  children: ReactNode;
  className?: string;
  /** Escape hatch to turn tilt off for a particular instance without unmounting the wrapper. */
  disabled?: boolean;
}

export function TiltPanel({ children, className, disabled = false }: TiltPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, TILT_SPRING);
  const springRotateY = useSpring(rotateY, TILT_SPRING);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [prefersReducedMotion]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!enabled || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-relY * TILT_MAX_DEG * 2);
    rotateY.set(relX * TILT_MAX_DEG * 2);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  if (!enabled || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: PERSPECTIVE_PX }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}>
        {children}
      </motion.div>
    </div>
  );
}
