/**
 * GlyphIcons — a small set of quiet, single-weight line icons used to
 * give otherwise-empty space and otherwise-bare panels a little more
 * visual identity, without introducing photography, gradients, or
 * any kind of "illustration" style that would clash with the rest of
 * the site's flat ink-on-paper/dark-surface vocabulary.
 *
 * Every icon shares the same contract: 24x24 viewBox, stroke-only
 * (no fill), `currentColor` for its stroke so the caller controls
 * color via a wrapping element's `color` (or an inline `style`), and
 * a `strokeWidth` prop (default 1.5, matching PanelPresence's corner
 * marks) so the same icon can be drawn thin-and-faint as ambient
 * texture or slightly bolder as a panel accent, without needing two
 * separate assets.
 */

interface GlyphProps {
  className?: string;
  strokeWidth?: number;
}

export function DocumentGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M9 13h6M9 16.5h6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function CalendarGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M4 9.5h16" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      <circle cx="8.5" cy="13.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function ChatGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4.5 6.5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 3.5v-3.5H5.5a1 1 0 0 1-1-1v-9Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function TagGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12.5 4h5.5a1 1 0 0 1 1 1v5.5a1 1 0 0 1-.3.7l-8 8a1 1 0 0 1-1.4 0l-6.2-6.2a1 1 0 0 1 0-1.4l8-8a1 1 0 0 1 .7-.3Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="15.5" cy="8.5" r="1.1" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}

export function CheckGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M8.5 12.3l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.2 4.5h2.6l1.3 3.4-1.7 1.6a10.5 10.5 0 0 0 5.4 5.4l1.6-1.7 3.4 1.3v2.6a1 1 0 0 1-1.1 1C11 17.6 6.4 13 5.9 6.6a1 1 0 0 1 .3-2.1Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClockGlyph({ className, strokeWidth = 1.5 }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
