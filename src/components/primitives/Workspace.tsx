'use client';

import { forwardRef, type MouseEvent as ReactMouseEvent, type Ref } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import clsx from 'clsx';
import { SignalDot } from './SignalDot';

export interface WorkspaceField {
  id: string;
  label: string;
  value: string;
  /** Marks the one field allowed to use red — see tokens.css's rule on restraint. */
  accent?: boolean;
}

interface WorkspaceProps {
  /** Count of fields that have actually arrived (0-3). Drives content, not the traveling animation. */
  stage: 0 | 1 | 2 | 3;
  /** True once the whole sequence has settled — separate from `stage` so the panel's final "settle" isn't tied to a fourth fake field count. */
  resolved: boolean;
  title: string | null;
  fields: WorkspaceField[];
  /** Exposes the panel's landing point for SignalTravel to target. */
  entryRef: Ref<HTMLSpanElement>;
  className?: string;
}

// Tilt is capped small and spring-damped hard past critical — this is
// meant to read as "a raised physical surface responding to you," the
// same weight-bearing metaphor `shadow-product-window` already gives
// it, never a game-UI swoop. No overshoot, matching the rest of the
// site's motion language (see lib/motion.ts's note on ease.settle).
const TILT_MAX_DEG = 5;
const TILT_SPRING = { stiffness: 220, damping: 26, mass: 0.6 };

/**
 * The product surface Chapter 01 builds up in front of the visitor.
 *
 * REVISED, Step 5A. `stage`/`resolved` are now driven by *arrival*
 * (see lib/signalExtraction.ts + Chapter01Conversation), not by the
 * same threshold that starts a signal's travel — this is the actual
 * bug fix this step makes: a field used to appear here the instant
 * its word left the sentence, before the traveling signal had
 * visually reached this surface at all. Now a field only exists here
 * once its signal has actually landed, so SignalTravel's fade-out and
 * this panel gaining new content happen at the same moment instead of
 * the content jumping ahead of the animation.
 *
 * Not a reuse of ProductWindow — see the Step 4H note on that
 * decision, unchanged here. Stage 0 (no arrivals yet) still renders
 * quiet instrument geometry instead of an empty box. No field is ever
 * pre-filled ahead of its signal actually landing. `layout` on the
 * outer panel lets Framer Motion animate the height change as rows
 * are added.
 *
 * No footer/product-name label inside the artifact — still explicitly
 * out of scope per the Step 4H brief.
 *
 * POINTER TILT (beauty pass, step 10): on a fine pointer, the panel
 * leans very slightly toward the cursor — the same "raised, physical
 * surface" idea `shadow-product-window` already carries, made
 * perceptible on interaction, not just implied by a static shadow.
 * `e.currentTarget`'s own rect is measured on every move — no extra
 * ref plumbing needed alongside the `ref`/`entryRef` this component
 * already forwards. Off entirely under reduced-motion; on a coarse
 * pointer the handlers simply never fire (nothing to leave-reset), so
 * no separate touch branch is needed.
 */
export const Workspace = forwardRef<HTMLDivElement, WorkspaceProps>(function Workspace(
  { stage, resolved, title, fields, entryRef, className },
  ref,
) {
  const prefersReducedMotion = useReducedMotion();
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const rotateX = useSpring(rotateXTarget, TILT_SPRING);
  const rotateY = useSpring(rotateYTarget, TILT_SPRING);

  function handleMouseMove(e: ReactMouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    rotateYTarget.set(relX * TILT_MAX_DEG * 2);
    rotateXTarget.set(relY * -TILT_MAX_DEG * 2);
  }

  function handleMouseLeave() {
    rotateXTarget.set(0);
    rotateYTarget.set(0);
  }

  return (
    <motion.div
      ref={ref}
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900, rotateX, rotateY }}
      className={clsx(
        'relative min-h-[220px] overflow-hidden rounded-lg border bg-surface-dark text-ink-on-dark shadow-product-window-glow sm:min-h-[260px]',
        resolved ? 'border-border-on-dark-strong' : 'border-border-on-dark',
        className,
      )}
    >
      {/* Landing point for traveling signals — top-left inset, not
          the visual center, so arriving fragments read as "entering"
          the surface rather than teleporting to its middle. */}
      <span ref={entryRef} className="absolute left-6 top-6 h-px w-px" aria-hidden="true" />

      <AnimatePresence>
        {stage === 0 && (
          <motion.svg
            key="dormant"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-40"
          >
            <line x1="0" y1="34" x2="100" y2="34" stroke="var(--color-border-on-dark)" strokeWidth="0.4" />
            <line x1="0" y1="66" x2="100" y2="66" stroke="var(--color-border-on-dark)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="1.2" fill="var(--color-border-on-dark)" />
          </motion.svg>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-[220px] flex-col justify-center gap-sm p-component sm:min-h-[260px] sm:p-lg">
        <AnimatePresence>
          {title && (
            <motion.p
              key="title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="text-[1.0625rem] font-semibold leading-snug"
            >
              {title}
            </motion.p>
          )}
        </AnimatePresence>

        {fields.length > 0 && (
          <dl className="flex flex-col gap-xs">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
                  className={clsx('flex items-baseline gap-xs', field.accent && 'border-l pl-xs')}
                  style={field.accent ? { borderColor: 'var(--color-red-on-dark)' } : undefined}
                >
                  <dt
                    className="font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
                    style={{ color: 'var(--color-ink-muted-on-dark)' }}
                  >
                    {field.label}
                  </dt>
                  <dd
                    className="text-mono flex items-center gap-xs"
                    style={field.accent ? { color: 'var(--color-red-on-dark)' } : undefined}
                  >
                    {field.value}
                    {field.accent && <SignalDot surface="dark" active={stage === 3 && !resolved} size={6} />}
                  </dd>
                </motion.div>
              ))}
            </AnimatePresence>
          </dl>
        )}
      </div>
    </motion.div>
  );
});
