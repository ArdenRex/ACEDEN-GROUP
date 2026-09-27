/**
 * The one place the product app's URL is read from. Every CTA that
 * points at the actual software ("Try AI Workflow Coordinator",
 * "Login") imports from here — nothing else in the codebase should
 * reference `process.env.NEXT_PUBLIC_APP_URL` or a literal domain
 * directly.
 *
 * Missing var: falls back to a local dev URL and logs a warning
 * (visible in the terminal during `next dev`/`next build`, and in
 * server logs in any environment where it's still unset). It never
 * invents a production-looking domain — the fallback is obviously
 * localhost, not a guessed real address — and it never throws, so a
 * missing var can't take down an otherwise-working build; it just
 * stays loudly wrong until configured.
 */

const DEV_FALLBACK_APP_URL = 'http://localhost:3000';

function readAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (value) return value;

  if (typeof window === 'undefined') {
    console.warn(
      `[env] NEXT_PUBLIC_APP_URL is not set — app links are falling back to "${DEV_FALLBACK_APP_URL}". ` +
        'Set NEXT_PUBLIC_APP_URL in .env.local (or the deployment environment) before shipping.',
    );
  }
  return DEV_FALLBACK_APP_URL;
}

export const APP_URL = readAppUrl();

/** Where the primary CTA ("Try AI Workflow Coordinator") should send a visitor. */
export function getSignupUrl(): string {
  return APP_URL;
}

/** Where the secondary nav action ("Login") should send a visitor. */
export function getLoginUrl(): string {
  return `${APP_URL}/login`;
}

/**
 * This marketing site's own canonical URL — used for metadataBase
 * (so relative OG/icon URLs resolve to real absolute ones), the
 * sitemap, and canonical link tags. Same discipline as APP_URL above:
 * read once, fall back loudly to localhost, never a guessed domain.
 */
const DEV_FALLBACK_SITE_URL = 'http://localhost:3001';

function readSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (value) return value;

  if (typeof window === 'undefined') {
    console.warn(
      `[env] NEXT_PUBLIC_SITE_URL is not set — metadata/OG URLs are falling back to "${DEV_FALLBACK_SITE_URL}". ` +
        'Set NEXT_PUBLIC_SITE_URL in .env.local (or the deployment environment) before shipping.',
    );
  }
  return DEV_FALLBACK_SITE_URL;
}

export const SITE_URL = readSiteUrl();
