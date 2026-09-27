'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useNavVisibility } from '@/lib/navStore';
import { getLoginUrl, getSignupUrl } from '@/lib/env';
import { Wordmark } from '@/components/primitives/Wordmark';
import { UnderlineLink } from '@/components/primitives/UnderlineLink';
import { MagneticButton } from '@/components/primitives/MagneticButton';
import { duration, ease } from '@/lib/motion';

const CTA_LABEL = 'Try AI Workflow Coordinator';

/**
 * Fixed top bar, present only while the visitor is inside Chapter
 * 01 — including the very top of the page — and absent (not just
 * invisible: unmounted, so no invisible focusable links sit in the
 * tab order) for every chapter after that. Reappears if the visitor
 * scrolls back up above Chapter 01's end. Chapter 01 owns the single
 * sentinel + IntersectionObserver that decides this (see
 * Chapter01Conversation.tsx); this component only reads the result
 * and handles how it appears, via AnimatePresence rather than a bare
 * opacity toggle.
 *
 * Bold pass: frosted-glass bar (bg-background/75 + backdrop-blur)
 * instead of a flat opaque fill, so whatever's mid-scroll underneath
 * it (Hero3D's cluster, a chapter's dark panel) stays faintly visible
 * through it rather than being cut off hard by a solid rectangle —
 * the nav reads as floating over the page, not stacked on top of it.
 */
export function PersistentNav() {
  const visible = useNavVisibility((state) => state.visible);
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);

  // Bug fix: every chapter from 02 onward offsets its pinned panel by
  // the static `--nav-height` guess in tokens.css (3.5rem). That guess
  // has never actually matched this header's real rendered height —
  // border, padding, and the CTA button's own line-height add up to
  // a few pixels more — so the fixed header has been quietly painting
  // over the top sliver of every chapter's content, and each pinned
  // panel has been a few pixels short of the space chapters assume it
  // has. Measuring the real height here and writing it to the same
  // CSS variable keeps every chapter correct automatically, including
  // if the header's own content (logo, CTA copy, breakpoint) changes
  // later — no more hand-tuned magic number to fall out of sync again.
  useEffect(() => {
    const node = headerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const setNavHeight = () => {
      document.documentElement.style.setProperty('--nav-height', `${node.getBoundingClientRect().height}px`);
    };

    const observer = new ResizeObserver(setNavHeight);
    observer.observe(node);
    setNavHeight();

    return () => observer.disconnect();
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
          transition={{ duration: prefersReducedMotion ? 0 : duration.fast, ease: ease.standard }}
          className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/75 backdrop-blur-md"
        >
          <div className="mx-auto flex w-full max-w-content-max items-center justify-between px-gutter-mobile py-xs sm:px-gutter-tablet lg:px-gutter-desktop">
            <Link
              href="/"
              className="flex items-center opacity-100 transition-opacity duration-fast hover:opacity-70 focus-visible:opacity-70"
            >
              <span className="sm:hidden">
                <Wordmark compact />
              </span>
              <span className="hidden sm:inline-flex">
                <Wordmark />
              </span>
            </Link>

            <nav className="flex items-center gap-sm sm:gap-component" aria-label="Primary">
              <UnderlineLink
                href={getLoginUrl()}
                className="hidden text-body-sm text-ink-muted transition-colors duration-fast hover:text-ink sm:inline"
              >
                Login
              </UnderlineLink>
              {/* Bold pass: a light diagonal sheen sweeps across the gradient
                  CTA on hover — pure CSS transform on a child overlay, no
                  framer-motion needed since it's a one-shot linear sweep, not
                  a spring. Same treatment on Chapter 08's matching CTA. */}
              <MagneticButton
                as="a"
                href={getSignupUrl()}
                className="group relative inline-block overflow-hidden rounded-md px-component py-micro text-body-sm font-semibold transition-shadow duration-fast hover:shadow-[var(--shadow-glow-accent)]"
                style={{ background: 'var(--gradient-accent)', color: 'var(--color-ink-on-dark)' }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                <span className="sm:hidden">Try it</span>
                <span className="hidden sm:inline">{CTA_LABEL}</span>
              </MagneticButton>
            </nav>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
