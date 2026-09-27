'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, summary, [tabindex]';

// A target's bounding box beyond either of these reads as "a section,
// not a control" — the ring should not try to wrap it.
const LOCK_MAX_W = 320;
const LOCK_MAX_H = 96;
// Breathing room added around a locked target's real bounds.
const LOCK_PADDING = 14;

/**
 * Global cursor replacement: a small dot tracks the pointer exactly,
 * a larger ring trails behind with a spring, and the ring "locks"
 * onto whatever interactive element is under the pointer — snapping
 * to its center and growing to roughly its size — before releasing
 * back to free-following once the pointer leaves it.
 *
 * mix-blend-mode: difference means one pair of values works correctly
 * against both the paper surface and the dark product-window surface
 * without any per-chapter color branching — it's a system-wide layer,
 * not a per-chapter one.
 *
 * PERF (step 8): position/target/lock state all live in Framer Motion
 * values (useMotionValue), written to directly from the mousemove
 * handler via `.set()`. Motion values propagate to the DOM outside
 * React's render cycle, so a raw mousemove firing dozens of times a
 * second no longer re-renders this component on every pixel of
 * movement — only the two small <motion.div>s' transforms update.
 * `visible`/`isLocked` stay as real React state since they're boolean
 * flags that change rarely (pointer entering/leaving the window or an
 * interactive element), not once per mousemove.
 *
 * SHAPE (step 8b): the ring locks onto its target's actual width and
 * height independently — never forced into a `max(w, h)` circle. A
 * short, wide text link stays a shallow rounded rectangle that hugs
 * its real bounds; a square icon button still reads as a circle,
 * because its own bounds are square. Border-radius always tracks the
 * shorter axis, so the shape is a pill/stadium at any aspect ratio,
 * never an oversized disc dwarfing the thing it's wrapping. Targets
 * larger than LOCK_MAX_W/H in either axis are treated as "too big to
 * be a control" and skipped — the ring keeps free-following instead
 * of ballooning over half a section.
 *
 * Opt-outs, in order of precedence:
 *   - prefers-reduced-motion: never rendered. A spring-driven,
 *     magnetically-snapping cursor is exactly the kind of motion that
 *     preference exists to remove — the OS cursor stays.
 *   - coarse/no pointer (touch, most tablets): never rendered. There
 *     is no hovering pointer for it to represent there.
 * Only once both checks pass does default-cursor hiding (via the
 * `custom-cursor-active` body class, see globals.css) get applied —
 * so a visitor never loses their only cursor to a check that hasn't
 * resolved yet.
 */
export function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringTargetX = useMotionValue(-100);
  const ringTargetY = useMotionValue(-100);
  const ringTargetWidth = useMotionValue(30);
  const ringTargetHeight = useMotionValue(30);

  const ringX = useSpring(ringTargetX, { stiffness: 320, damping: 28, mass: 0.4 });
  const ringY = useSpring(ringTargetY, { stiffness: 320, damping: 28, mass: 0.4 });
  const ringWidth = useSpring(ringTargetWidth, { stiffness: 320, damping: 28, mass: 0.4 });
  const ringHeight = useSpring(ringTargetHeight, { stiffness: 320, damping: 28, mass: 0.4 });
  const ringOffsetX = useTransform([ringX, ringWidth], ([x, w]: number[]) => (x ?? 0) - (w ?? 0) / 2);
  const ringOffsetY = useTransform([ringY, ringHeight], ([y, h]: number[]) => (y ?? 0) - (h ?? 0) / 2);
  // Fully rounded on the shorter axis: a circle when width === height,
  // a pill/stadium shape at any other aspect ratio — never a disc
  // stretched past the element it's supposed to be hugging.
  const ringRadius = useTransform([ringWidth, ringHeight], ([w, h]: number[]) => Math.min(w ?? 0, h ?? 0) / 2);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!enabled) return;

    let wasLocked = false;

    function handleMove(e: MouseEvent) {
      dotX.set(e.clientX - 3);
      dotY.set(e.clientY - 3);
      setVisible(true);

      const el = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE_SELECTOR);
      // Oversized targets (a nav wrapper, a tabindexed section) don't
      // read as "a control" — don't lock onto them.
      const r = el?.getBoundingClientRect();
      const lockable = Boolean(r && r.width <= LOCK_MAX_W && r.height <= LOCK_MAX_H);
      if (lockable !== wasLocked) {
        wasLocked = lockable;
        setIsLocked(lockable);
      }

      if (lockable && r) {
        // Breathing room around the locked element's real bounds so
        // the ring reads as "wrapping" the control, not tracing its
        // edge — width and height grow independently, so a short wide
        // text link stays a shallow pill instead of an oversized disc.
        ringTargetX.set(r.left + r.width / 2);
        ringTargetY.set(r.top + r.height / 2);
        ringTargetWidth.set(r.width + LOCK_PADDING);
        ringTargetHeight.set(r.height + LOCK_PADDING);
      } else {
        ringTargetX.set(e.clientX);
        ringTargetY.set(e.clientY);
        ringTargetWidth.set(30);
        ringTargetHeight.set(30);
      }
    }
    function handleLeaveWindow() {
      setVisible(false);
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleLeaveWindow);
    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.documentElement.removeEventListener('mouseleave', handleLeaveWindow);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [enabled, dotX, dotY, ringTargetX, ringTargetY, ringTargetWidth, ringTargetHeight]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full mix-blend-difference"
        style={{ width: 6, height: 6, backgroundColor: 'var(--color-ink-on-dark)', x: dotX, y: dotY }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 900, damping: 45, mass: 0.15 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] border mix-blend-difference"
        style={{
          borderColor: 'var(--color-ink-on-dark)',
          x: ringOffsetX,
          y: ringOffsetY,
          width: ringWidth,
          height: ringHeight,
          borderRadius: ringRadius,
        }}
        animate={{ opacity: visible ? (isLocked ? 0.9 : 0.45) : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 0.4 }}
      />
    </>
  );
}

