import type { ReactNode } from 'react';
import clsx from 'clsx';
import { SignalDot } from './SignalDot';

interface ProductWindowProps {
  children: ReactNode;
  /**
   * Small mono readout in the frame's corner (e.g. "TASK", "WORKSPACE").
   * Optional — early, small instances of the window may not need one.
   * This is a data label, not a title bar; deliberately not a
   * traffic-light-dot browser-chrome mockup.
   */
  label?: string;
  /** Shows the small red status mark next to the label. Off by default — most instances are quiet. */
  live?: boolean;
  className?: string;
}

/**
 * The one recurring dark surface that represents the actual software.
 * Small and contained the first time it appears, reused as-is at
 * every later, larger scale — the growth is the surrounding layout's
 * job (how much of the viewport this occupies), not this component's.
 *
 * This is also the single place on the page allowed real shadow
 * (`shadow-product-window`): everywhere else, depth comes from
 * spacing and tone, but this element is depicting a raised surface,
 * not decorating a card.
 */
export function ProductWindow({ children, label, live = false, className }: ProductWindowProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-border-on-dark bg-surface-dark text-ink-on-dark shadow-product-window-glow',
        className,
      )}
    >
      {label && (
        <div className="flex items-center gap-xs border-b border-border-on-dark px-component py-xs">
          {live && <SignalDot surface="dark" size={6} label="Live" />}
          <span className="text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
            {label}
          </span>
        </div>
      )}
      <div className="p-component">{children}</div>
    </div>
  );
}
