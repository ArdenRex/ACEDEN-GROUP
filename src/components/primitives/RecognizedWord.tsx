import { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';

interface RecognizedWordProps {
  children: ReactNode;
  /**
   * 0 = plain sentence text.
   * 1 = recognized — mid-extraction, still visually part of the
   *     sentence, not yet sent anywhere.
   * 2 = sent — its signal has already arrived in the Workspace, so
   *     it quiets down here rather than continuing to compete for
   *     attention in two places at once.
   */
  phase: 0 | 1 | 2;
}

/**
 * A word inside the Ch.01 request that visibly participates in
 * extraction, staying visually integrated with the sentence rather
 * than becoming a token/pill.
 *
 * REVISED, Step 5A. The previous version (still Step 4H) swapped in a
 * background surface + rounded token shape the instant a word was
 * "recognized" — closer to "here's a UI chip" than "the system
 * noticed this word in place," which this step's brief specifically
 * asks to avoid. This version keeps the word inline, in the same
 * type color as its neighbors at rest, and only shifts font (the
 * system's existing "data moment" rule) plus a 1px lift at phase 1,
 * settling to a quieter ink-muted tone at phase 2 once its signal has
 * actually landed in the Workspace — not before, which is the timing
 * fix this step makes (see lib/signalExtraction.ts).
 *
 * Forwards a ref to the underlying <span> so the chapter can measure
 * its on-screen position — the actual point a traveling signal
 * animates from.
 */
export const RecognizedWord = forwardRef<HTMLSpanElement, RecognizedWordProps>(function RecognizedWord(
  { children, phase },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx(
        'inline-block transition-all duration-300 ease-out',
        phase === 0 && 'font-display text-ink',
        phase === 1 && 'font-mono text-ink -translate-y-px',
        phase === 2 && 'font-mono text-ink-muted',
      )}
    >
      {children}
    </span>
  );
});
