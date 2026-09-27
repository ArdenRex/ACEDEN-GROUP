import type { Metadata } from 'next';
import { Container } from '@/components/primitives/Container';
import { ContinuityLine } from '@/components/primitives/ContinuityLine';
import { Wordmark } from '@/components/primitives/Wordmark';
import { MagneticButton } from '@/components/primitives/MagneticButton';

export const metadata: Metadata = {
  title: 'Page not found',
};

/**
 * Custom 404 — beauty pass, step 12.
 *
 * Next.js ships a generic default here that no visitor ever sees
 * unless something's already gone wrong for them; most SaaS sites
 * leave it untouched. This one stays in the site's own voice instead
 * of borrowing a stock "oops!" page: the numeral uses `text-price`
 * (the one other place a big standalone number appears on the site)
 * in red — tokens.css's rule for red is "system response, an
 * important state," and a broken route genuinely qualifies, so this
 * is one of the deliberate few places outside the product itself
 * that's allowed to use it. The copy borrows the product's own
 * vocabulary (recognize/assignee/deadline/priority, the exact fields
 * Chapter 01 extracts) rather than a generic "page not found" line,
 * and `ContinuityLine` — the site's one recurring line motif — is
 * drawn deliberately incomplete (60%, not 100%) as a small, quiet
 * visual pun: the line that elsewhere always resolves, here doesn't.
 *
 * Static/server-rendered, no client JS beyond what MagneticButton and
 * ContinuityLine already bring in — nothing new to opt out of under
 * reduced-motion.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] w-full items-center bg-background py-section-mobile lg:py-0">
      <Container width="editorial">
        <div className="mb-lg">
          <Wordmark />
        </div>

        <p className="text-price mb-sm" style={{ color: 'var(--color-red)' }}>
          404
        </p>

        <h1 className="text-display-md mb-sm text-ink">This request wasn&rsquo;t recognized.</h1>

        <p className="text-body-lg mb-lg max-w-narrow text-ink-muted">
          No assignee, deadline, or priority on this route &mdash; because there&rsquo;s nothing here to extract.
          The page may have moved, or never existed.
        </p>

        <ContinuityLine
          orientation="horizontal"
          progress={0.6}
          color="ink-muted"
          thickness={1}
          className="mb-lg h-px w-[min(20rem,60vw)]"
        />

        <MagneticButton
          as="a"
          href="/"
          className="text-body-sm inline-block rounded-sm border border-ink px-component py-micro font-medium transition-colors duration-fast hover:bg-ink hover:text-background"
        >
          Back to the start
        </MagneticButton>
      </Container>
    </main>
  );
}
