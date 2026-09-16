import clsx from 'clsx';

interface WordmarkProps {
  /** Compact renders just the geometric mark, no text — for tight nav space on small screens. */
  compact?: boolean;
  className?: string;
}

/**
 * The brand mark. Deliberately not a logo in the icon sense — no
 * brain, no sparkle, no infinity loop. Just the product name set with
 * intention, plus one small geometric stroke that echoes the
 * continuity line elsewhere on the site rather than introducing a
 * second, competing visual device.
 *
 * The full name is long, so the nav treatment leans on type system
 * tools already in use elsewhere (mono label sizing, tighter tracking)
 * rather than shortening the name or adding a symbol. It reads as
 * "set with precision," not "doesn't fit."
 */
export function Wordmark({ compact = false, className }: WordmarkProps) {
  return (
    <span className={clsx('inline-flex items-center gap-xs', className)}>
      <svg width="6" height="18" viewBox="0 0 6 18" aria-hidden="true" className="shrink-0">
        <line x1="3" y1="1" x2="3" y2="17" stroke="var(--color-ink)" strokeWidth="1" />
      </svg>
      {!compact && (
        <span className="text-[0.8125rem] font-medium tracking-tight whitespace-nowrap sm:text-[0.875rem] lg:text-[0.9375rem]">
          AI Workflow Coordinator
        </span>
      )}
    </span>
  );
}
