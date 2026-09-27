'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/primitives/Container';
import { MagneticButton } from '@/components/primitives/MagneticButton';
import { fadeSettle } from '@/lib/motion';
import { getSignupUrl } from '@/lib/env';

/**
 * Final CTA — Step 2, substep 3. New section (didn't exist before),
 * spec section 11, distinct from Chapter 08's Interactive Demo
 * (section 8) even though both close with a CTA — the brief lists
 * them as two separate beats, so this gives the page one last,
 * undistracted close rather than leaving the demo's textarea as the
 * final word. Plain, static, cheap (no 3D, no scroll-pin), same
 * whileInView fade as Philosophy.
 */
export function ChapterFinalCTA() {
  return (
    <section id="final-cta" className="relative w-full py-section-mobile lg:py-section-desktop" aria-label="Get started">
      <Container width="editorial">
        <motion.div {...fadeSettle} className="flex flex-col items-center text-center">
          <h2 className="text-display-md max-w-[16ch] text-balance text-ink">Give it the work.</h2>
          <div className="mt-lg">
            <MagneticButton
              as="a"
              href={getSignupUrl()}
              className="group relative inline-block overflow-hidden rounded-md px-component py-xs text-body-sm font-semibold transition-shadow duration-fast hover:shadow-[var(--shadow-glow-accent)]"
              style={{ background: 'var(--gradient-accent)', color: 'var(--color-ink-on-dark)' }}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              Start your 7-day free trial →
            </MagneticButton>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
