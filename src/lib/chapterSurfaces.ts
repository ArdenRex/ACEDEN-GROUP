/**
 * Shared source of truth for "which chapter sits on which surface" —
 * consumed by ScrollProgressRail (to color the jump-rail ticks) and
 * AmbientDust (Step 5's idle breathing dots), so the two detectors
 * read the same eight sections the same way instead of drifting out
 * of sync with each other.
 */
export const CHAPTER_IDS = [
  'chapter-01',
  'chapter-02',
  'chapter-03',
  'chapter-04',
  'chapter-05',
  'chapter-06',
  'chapter-07',
  'chapter-08',
] as const;

// The three chapters whose root section sits on --color-surface-dark
// rather than the paper background (see tokens.css's own comment on
// the product-window layer). Chapter08 spends its first, brief
// "prelude" beat on the dark surface too, but resolves to paper for
// the much longer interactive block that follows — since "what's
// mostly behind it right now" is what both consumers care about,
// that one short exception is left off this list rather than making
// the whole chapter read as dark.
export const DARK_CHAPTER_IDS = new Set<string>(['chapter-05', 'chapter-06', 'chapter-07']);
