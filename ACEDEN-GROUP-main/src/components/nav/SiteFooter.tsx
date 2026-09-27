import Link from 'next/link';
import { Wordmark } from '@/components/primitives/Wordmark';
import { UnderlineLink } from '@/components/primitives/UnderlineLink';
import { getLoginUrl, getSignupUrl } from '@/lib/env';

/**
 * SiteFooter — bold pass, sub-step 1 ("a real footer payoff").
 *
 * Before this, the page simply stopped: Chapter 08's CTA was the last
 * thing rendered, with nothing after it — no closing visual beat, no
 * brand mark, no way to navigate anywhere else. On explicit direction
 * to give visitors a reason to "watch till the footer," a page with
 * no footer at all can't be that payoff — there was nothing to arrive
 * at. This adds one.
 *
 * Kept on the paper surface (--color-background/--color-ink), not the
 * dark field: Chapter 08's own doc comment is explicit that paper is
 * this site's stated resolution ("sparse -> structured -> dense ->
 * resolved -> sparse"), so the footer continues that resolution
 * rather than reopening the dark "system territory" one beat after
 * the site just deliberately closed it.
 *
 * The one deliberate flourish: a hairline top border filled with
 * --gradient-accent instead of a plain --color-border rule — same
 * "chrome carries the brand mark" precedent as the scroll-progress
 * bar (bold pass, color-thread step) and the nav logo stroke. A
 * genuine send-off color moment, not a wash.
 *
 * Every link here is real: Wordmark, Login, and the signup CTA all
 * reuse the site's existing env-driven URLs (lib/env.ts) rather than
 * a fabricated address or an unbuilt route — this project has no
 * legal-page routes yet, so none are linked here rather than pointing
 * at a 404.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full" style={{ backgroundColor: 'var(--color-background)' }}>
      <div aria-hidden="true" className="h-[2px] w-full" style={{ background: 'var(--gradient-accent)' }} />

      <div className="mx-auto flex w-full max-w-content-max flex-col gap-lg px-gutter-mobile py-section-mobile sm:px-gutter-tablet lg:flex-row lg:items-start lg:justify-between lg:px-gutter-desktop lg:py-section">
        <div className="flex flex-col gap-sm">
          <Link href="/" className="inline-flex w-fit opacity-100 transition-opacity duration-fast hover:opacity-70 focus-visible:opacity-70">
            <Wordmark />
          </Link>
          <p className="max-w-[36ch] text-body-sm text-ink-muted">
            One place for the work that was scattered across a dozen tools and threads.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-component text-body-sm">
          <UnderlineLink href={getSignupUrl()} className="text-ink-muted transition-colors duration-fast hover:text-ink">
            Start free trial
          </UnderlineLink>
          <UnderlineLink href={getLoginUrl()} className="text-ink-muted transition-colors duration-fast hover:text-ink">
            Login
          </UnderlineLink>
          <UnderlineLink href="#chapter-01" className="text-ink-muted transition-colors duration-fast hover:text-ink">
            Back to top
          </UnderlineLink>
        </nav>
      </div>

      <div className="border-t border-border px-gutter-mobile py-sm sm:px-gutter-tablet lg:px-gutter-desktop">
        <p className="text-label text-ink-faint">&copy; {year} Aceden Group. All rights reserved.</p>
      </div>
    </footer>
  );
}
