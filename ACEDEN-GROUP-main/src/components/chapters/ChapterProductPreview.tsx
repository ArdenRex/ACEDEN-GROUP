'use client';

import { motion } from 'framer-motion';
import { Container } from '@/components/primitives/Container';
import { ProductWindow } from '@/components/primitives/ProductWindow';
import { fadeSettle } from '@/lib/motion';

type Task = { title: string; meta: string; accent?: boolean };
type Column = { label: string; tasks: Task[] };

// Reuses labels/people already established elsewhere on the site
// (Chapter04's lanes, Chapter07's task list) rather than inventing
// new fictional product content for this one section.
const COLUMNS: Column[] = [
  {
    label: 'To Do',
    tasks: [
      { title: 'Onboarding Docs', meta: 'Sarah · Friday' },
      { title: 'Review Integration Request', meta: 'Medium priority' },
    ],
  },
  {
    label: 'In Progress',
    tasks: [
      { title: 'Prepare Campaign Brief', meta: 'Priya · Thursday' },
      { title: 'Approve Invoice', meta: 'High priority', accent: true },
    ],
  },
  {
    label: 'Completed',
    tasks: [{ title: 'Update Client Timeline', meta: 'Alex · Today' }],
  },
];

/**
 * Product Preview — Step 2, substep 4. New section (didn't exist
 * before), spec section 9: "a polished realistic Aceden
 * workspace/product interface." Distinct from Chapter 08's
 * interactive demo (that one reacts to what the visitor types) and
 * from Chapter 04's scroll-choreographed Workspace (that one is
 * mid-animation) — this is a plain, static, fully-populated screen,
 * closer to a real product screenshot. Built on the existing
 * `ProductWindow` primitive (already used in the internal
 * /design-system reference page, not yet in any real chapter) rather
 * than a new frame component. No 3D, no scroll-pin, no interaction —
 * cheap and low-risk by design.
 */
export function ChapterProductPreview() {
  return (
    <section
      id="product-preview"
      data-theme="dark"
      className="relative w-full py-section-mobile lg:py-section-desktop"
      style={{ backgroundColor: 'var(--color-surface-dark)' }}
      aria-label="Product preview"
    >
      <Container width="wide">
        <motion.h2 {...fadeSettle} className="max-w-[20ch] text-balance text-display-md text-ink-on-dark">
          One workspace, everything you gave it.
        </motion.h2>
        <motion.div {...fadeSettle} transition={{ ...fadeSettle.transition, delay: 0.1 }} className="mt-xl lg:mt-2xl">
          <ProductWindow label="WORKSPACE" live className="w-full">
            <div className="grid grid-cols-1 gap-lg sm:grid-cols-3">
              {COLUMNS.map((col) => (
                <div key={col.label}>
                  <p className="mb-sm text-label uppercase tracking-[0.08em]" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
                    {col.label}
                  </p>
                  <div className="flex flex-col gap-xs">
                    {col.tasks.map((task) => (
                      <div
                        key={task.title}
                        className="rounded-sm border px-component py-xs"
                        style={{
                          borderColor: task.accent ? 'var(--color-red-on-dark)' : 'var(--color-border-on-dark)',
                          backgroundColor: 'rgba(243, 239, 231, 0.045)',
                        }}
                      >
                        <p className="text-body-sm text-ink-on-dark">{task.title}</p>
                        <p
                          className="mt-[2px] font-mono text-[0.6875rem] uppercase tracking-[0.06em]"
                          style={{ color: task.accent ? 'var(--color-red-on-dark)' : 'var(--color-ink-muted-on-dark)' }}
                        >
                          {task.meta}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ProductWindow>
        </motion.div>
      </Container>
    </section>
  );
}
