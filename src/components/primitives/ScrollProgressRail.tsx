'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import clsx from 'clsx';
import { scrollSmoothing } from '@/lib/motion';
import { DARK_CHAPTER_IDS } from '@/lib/chapterSurfaces';

const CHAPTERS = [
  { id: 'chapter-01', number: '01', label: 'Opening' },
  { id: 'chapter-02', number: '02', label: 'Understanding' },
  { id: 'chapter-03', number: '03', label: 'Organize' },
  { id: 'chapter-04', number: '04', label: 'Workspace' },
  { id: 'chapter-05', number: '05', label: 'The human network' },
  { id: 'chapter-06', number: '06', label: 'The ecosystem' },
  { id: 'chapter-07', number: '07', label: 'Scale without chaos' },
  { id: 'chapter-08', number: '08', label: 'Give it the work' },
] as const;

/**
 * Two small, global navigation aids, both decorative-until-used:
 *
 *  1. A slim line pinned to the very top edge (above PersistentNav,
 *     which is always on the light --color-background strip whenever
 *     it's mounted) filling with overall page-scroll progress. Always
 *     ink-on-light — it never sits over anything but that nav strip
 *     or Chapter01's own light opening, so it doesn't need the
 *     dark/light branching the tick rail below does. Beauty-pass step
 *     3: filled with --gradient-accent rather than flat ink — the
 *     same brand mark PersistentNav's logo already uses, so this is
 *     chrome carrying the brand identity, not a content wash.
 *
 *  2. A vertical rail of eight small ticks (desktop/tablet only — a
 *     single long-form scroll doesn't need this competing for space
 *     on a small screen) that mark which chapter is currently in
 *     view and let a visitor jump straight to any of them. Real
 *     focusable buttons with descriptive aria-labels, not purely
 *     decorative — a keyboard or screen-reader visitor gets the same
 *     "jump to a chapter" affordance as anyone scrolling. The active
 *     tick is filled red/red-on-dark rather than ink: "this is the
 *     chapter you're in" is a genuine state, the one thing red is
 *     reserved to mean, so this stays inside that rule rather than
 *     bending it.
 */
export function ScrollProgressRail() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, scrollSmoothing);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const sections = CHAPTERS.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      // A section only counts as "current" once it occupies the
      // vertical center of the viewport, not merely the top or
      // bottom edge — avoids the rail flickering between two
      // chapters during the long cross-fade most of them end with.
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  const isDarkActive = activeId !== null && DARK_CHAPTER_IDS.has(activeId);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
        style={{ scaleX: barScale, background: 'var(--gradient-accent)' }}
      />

      <nav
        aria-label="Chapters"
        className="pointer-events-none fixed right-gutter-desktop top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-sm lg:flex"
      >
        {CHAPTERS.map((c) => {
          const isActive = activeId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpTo(c.id)}
              aria-label={`Jump to chapter ${c.number}: ${c.label}`}
              aria-current={isActive ? 'true' : undefined}
              className="group pointer-events-auto flex items-center gap-xs"
            >
              <span
                className={clsx(
                  'text-label transition-opacity duration-fast',
                  isDarkActive ? 'text-ink-muted-on-dark' : 'text-ink-muted',
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                )}
              >
                {c.number}
              </span>
              <span
                className={clsx(
                  'block rounded-full border transition-all duration-base ease-settle',
                  isDarkActive ? 'border-on-dark-strong group-hover:border-ink-on-dark' : 'border-ink-faint group-hover:border-ink',
                  isActive
                    ? clsx('h-[8px] w-[8px]', isDarkActive ? 'border-red-on-dark bg-red-on-dark' : 'border-red bg-red')
                    : 'h-[6px] w-[6px] bg-transparent',
                )}
              />
            </button>
          );
        })}
      </nav>
    </>
  );
}
