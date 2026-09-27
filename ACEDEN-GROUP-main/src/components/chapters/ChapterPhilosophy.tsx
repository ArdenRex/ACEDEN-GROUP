'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/primitives/Container';
import { fadeSettle } from '@/lib/motion';

/**
 * Philosophy — Step 2, substep 2. New section (didn't exist before).
 *
 * Deliberately NOT scroll-pinned and NOT WebGL: every other section on
 * this page is an expensive sticky/3D set piece, so one plain,
 * static, whileInView-fade section between Hero and Understand gives
 * the page (and the visitor) a breath, and keeps this substep cheap
 * to build and cheap to render. A two-line comparison, not a diagram —
 * the content is the argument here, not the motion.
 */
export function ChapterPhilosophy() {
  return (
    <section id="philosophy" className="relative w-full py-section-mobile lg:py-section-desktop" aria-label="Philosophy">
      <Container width="editorial">
        <motion.h2
          {...fadeSettle}
          className="text-display-md max-w-[18ch] text-balance text-ink"
        >
          Work shouldn&rsquo;t require a language of its own.
        </motion.h2>
        <div className="mt-xl grid grid-cols-1 gap-lg lg:mt-2xl lg:grid-cols-2 lg:gap-2xl">
          <motion.div {...fadeSettle} transition={{ ...fadeSettle.transition, delay: 0.08 }}>
            <p className="text-label mb-xs text-ink-faint">The old way</p>
            <p className="text-body-lg text-ink-muted">
              Translate what needs to happen into fields, tags, boards, and assignees before any tool can act on
              it — the request has to learn the system&rsquo;s language first.
            </p>
          </motion.div>
          <motion.div {...fadeSettle} transition={{ ...fadeSettle.transition, delay: 0.16 }}>
            <p className="text-label mb-xs text-ink-faint">With Aceden</p>
            <p className="text-body-lg text-ink">
              Say what needs to happen, in plain language. Aceden does the translating — the system learns to
              speak yours.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
