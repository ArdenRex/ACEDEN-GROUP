'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { getLoginUrl, getSignupUrl } from '@/lib/env';
import { Wordmark } from '@/components/primitives/Wordmark';
import { UnderlineLink } from '@/components/primitives/UnderlineLink';
import { MagneticButton } from '@/components/primitives/MagneticButton';
import { duration, ease } from '@/lib/motion';

const CTA_LABEL = 'Try Aceden';

/** The four sections a visitor can jump to directly. Anchors point at
 * the existing chapter ids that already carry this content (see the
 * Step 2 substep-1 report for the reasoning behind each mapping) —
 * provisional until the fuller information-architecture pass gives
 * each of these its own dedicated section/id. */
const NAV_LINKS = [
  { label: 'Product', href: '#chapter-04' },
  { label: 'How it works', href: '#chapter-02' },
  { label: 'Integrations', href: '#chapter-06' },
  { label: 'Pricing', href: '#chapter-07' },
] as const;

/**
 * Premium sticky navigation — Step 2, substep 1.
 *
 * REPLACES the prior chapter-01-only nav. That version unmounted
 * itself the instant the visitor scrolled past the opening scene
 * (see navStore.ts / Chapter01Conversation's scrollYProgress-driven
 * setNavVisible calls) — appropriate for the old 8-chapter build's
 * "quiet chrome" brief, but incompatible with this step's explicit
 * spec: "Create a premium sticky navigation" with real anchor links
 * to Product / How it works / Integrations / Pricing, which only
 * make sense if the nav is reachable from anywhere on the page, not
 * just the top.
 *
 * navStore.ts's visibility flag and Chapter01Conversation's writes to
 * it are left in place rather than torn out here — they're now inert
 * (nothing reads the flag any more) but touching Chapter01's scroll
 * logic is out of scope for a nav-only substep. Flagged as a known
 * cleanup item in the substep report.
 *
 * Frosted-glass bar (bg-background/75 + backdrop-blur), same visual
 * treatment as before. Desktop shows all four links + Login + CTA
 * inline; below `lg` those collapse into a hamburger toggle that
 * reveals the same items in a dropdown panel, dismissed on link
 * click, Escape, or an outside click.
 */
export function PersistentNav() {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Real rendered height, not a guessed constant — see tokens.css's
  // own note on --nav-height. Unchanged from the prior version.
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
  }, [mobileOpen]);

  // Close the mobile panel on Escape, and on route-external clicks
  // via a simple outside-click check against the header itself.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [mobileOpen]);

  return (
    <motion.header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/75 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-content-max items-center justify-between px-gutter-mobile py-xs sm:px-gutter-tablet lg:px-gutter-desktop">
        <Link
          href="/"
          className="flex items-center opacity-100 transition-opacity duration-fast hover:opacity-70 focus-visible:opacity-70"
          onClick={() => setMobileOpen(false)}
        >
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-lg lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <UnderlineLink
              key={link.href}
              href={link.href}
              className="text-body-sm text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              {link.label}
            </UnderlineLink>
          ))}
        </nav>

        <div className="hidden items-center gap-component lg:flex">
          <UnderlineLink
            href={getLoginUrl()}
            className="text-body-sm text-ink-muted transition-colors duration-fast hover:text-ink"
          >
            Login
          </UnderlineLink>
          <CtaButton />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className="flex h-9 w-9 items-center justify-center rounded-sm text-ink transition-colors duration-fast hover:bg-surface-sunken lg:hidden"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <>
                <path d="M1 1 L17 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M17 1 L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : duration.base, ease: ease.standard }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md lg:hidden"
          >
            <nav
              className="flex flex-col gap-component px-gutter-mobile py-lg sm:px-gutter-tablet"
              aria-label="Primary, mobile"
            >
              {NAV_LINKS.map((link) => (
                <UnderlineLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-heading-sm text-ink"
                >
                  {link.label}
                </UnderlineLink>
              ))}
              <div className="mt-sm flex flex-col gap-component border-t border-border pt-lg">
                <UnderlineLink
                  href={getLoginUrl()}
                  onClick={() => setMobileOpen(false)}
                  className="text-body-lg text-ink-muted"
                >
                  Login
                </UnderlineLink>
                <CtaButton onClick={() => setMobileOpen(false)} full />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/**
 * Shared CTA button — desktop inline and mobile full-width share the
 * same gradient/sweep treatment (bold-pass precedent, previously
 * inline in this file only) so the two never drift apart visually.
 */
function CtaButton({ onClick, full }: { onClick?: () => void; full?: boolean }) {
  return (
    <MagneticButton
      as="a"
      href={getSignupUrl()}
      onClick={onClick}
      className={`group relative inline-block overflow-hidden rounded-md px-component py-micro text-body-sm font-semibold transition-shadow duration-fast hover:shadow-[var(--shadow-glow-accent)] ${full ? 'text-center' : ''}`}
      style={{ background: 'var(--gradient-accent)', color: 'var(--color-ink-on-dark)' }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
      />
      {CTA_LABEL} →
    </MagneticButton>
  );
}
