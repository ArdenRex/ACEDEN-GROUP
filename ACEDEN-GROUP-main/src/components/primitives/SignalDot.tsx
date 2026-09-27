'use client';

import { useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

type Surface = 'paper' | 'dark';

const dotColor: Record<Surface, string> = {
  paper: 'var(--color-red)',
  dark: 'var(--color-red-on-dark)',
};

interface SignalDotProps {
  /** Which surface it sits on — picks the red variant tuned for that background. */
  surface?: Surface;
  /**
   * Whether the thing it's pointing at is genuinely active right now
   * (e.g. the extraction is running, a task just moved). When false,
   * it renders as a plain static dot — this is a state indicator,
   * not ambient decoration, so it must not pulse when there's
   * nothing to signal.
   */
  active?: boolean;
  /** Diameter in px. */
  size?: number;
  /** Required when the dot conveys state a screen-reader user needs (e.g. "Live"). Omit for a purely redundant/decorative instance. */
  label?: string;
  className?: string;
}

/**
 * The site's one small red "something is happening here" mark. Used
 * sparingly — inside the product window, next to a just-changed
 * value — never as generic bullet decoration. Reduced motion always
 * gets the static dot; the pulse is a bonus, never the only carrier
 * of meaning.
 */
export function SignalDot({ surface = 'dark', active = true, size = 6, label, className }: SignalDotProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldPulse = active && !prefersReducedMotion;

  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={clsx('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {shouldPulse && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: dotColor[surface],
            animation: 'signal-dot-ping 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          }}
        />
      )}
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, backgroundColor: dotColor[surface], opacity: active ? 1 : 0.4 }}
      />
    </span>
  );
}
