'use client';

import { motion, useReducedMotion, type MotionValue } from 'framer-motion';
import { CalendarGlyph, ChatGlyph, CheckGlyph, ClockGlyph, DocumentGlyph, TagGlyph } from './GlyphIcons';

/**
 * AmbientGlyphs — fills otherwise-empty chapter margins with a small
 * scattered set of quiet outline icons, on explicit follow-up
 * direction that Chapter 03's field felt "vacant" even with
 * AmbientOrbs' blurred shapes behind it. Orbs read as light/depth;
 * they don't give a viewer anything to actually look at while
 * scanning the wide empty gutters on either side of the field. These
 * do, while staying in the same restrained, single-weight-line,
 * no-fill vocabulary as PanelPresence's corner marks — not
 * illustration, not UI chrome, just a handful of related-to-the-
 * content marks breathing quietly in the margins.
 *
 * Positions are percentages of the nearest positioned ancestor
 * (meant to be the full sticky viewport, not the narrower field), so
 * callers can place a set that specifically avoids the field's own
 * bounds. Each glyph drifts and breathes on its own slow independent
 * loop, same technique as AmbientOrbs, so it reads as atmosphere
 * rather than another piece of scroll-driven content competing with
 * the chapter's actual mechanic.
 *
 * Reduced motion: renders each glyph fixed, unanimated, at its
 * midpoint opacity.
 */

type GlyphKind = 'document' | 'calendar' | 'chat' | 'tag' | 'check' | 'clock';

const GLYPH_COMPONENTS: Record<GlyphKind, typeof DocumentGlyph> = {
  document: DocumentGlyph,
  calendar: CalendarGlyph,
  chat: ChatGlyph,
  tag: TagGlyph,
  check: CheckGlyph,
  clock: ClockGlyph,
};

export interface AmbientGlyphSpec {
  kind: GlyphKind;
  top: string;
  left: string;
  size: number;
  /** [rest, peak, rest] — kept low so these read as texture, not content. */
  opacity: [number, number, number];
  duration: number;
  delay: number;
  driftX: [number, number, number, number];
  driftY: [number, number, number, number];
  /** Faint accent tint instead of neutral ink-faint, kept to at most one per set. */
  accent?: boolean;
}

export function AmbientGlyphs({
  glyphs,
  overallOpacity,
}: {
  glyphs: AmbientGlyphSpec[];
  /** Optional scroll-driven master fade, e.g. so the whole layer enters with the rest of the chapter instead of always being present at full strength. */
  overallOpacity?: MotionValue<number>;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: overallOpacity }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {glyphs.map((g, i) => {
        const Glyph = GLYPH_COMPONENTS[g.kind];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: g.top,
              left: g.left,
              width: g.size,
              height: g.size,
              color: g.accent ? 'var(--color-red-muted)' : 'var(--color-ink-faint)',
            }}
            initial={false}
            animate={
              prefersReducedMotion
                ? { opacity: g.opacity[1], x: 0, y: 0 }
                : { opacity: g.opacity, x: g.driftX.map((v) => `${v}px`), y: g.driftY.map((v) => `${v}px`) }
            }
            transition={prefersReducedMotion ? undefined : { duration: g.duration, delay: g.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Glyph className="h-full w-full" strokeWidth={1.25} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
