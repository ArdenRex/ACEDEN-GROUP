import type { Metadata } from 'next';
import { bodyFont, displayFont, monoFont } from '@/fonts';
import { SITE_URL } from '@/lib/env';
import { CustomCursor } from '@/components/primitives/CustomCursor';
import { ScrollProgressRail } from '@/components/primitives/ScrollProgressRail';
import { AmbientLight } from '@/components/primitives/AmbientLight';
import { AmbientDust } from '@/components/primitives/AmbientDust';
import { GrainOverlay } from '@/components/primitives/GrainOverlay';
import { FirstLoadReveal } from '@/components/primitives/FirstLoadReveal';
import { TabTitleSwap } from '@/components/primitives/TabTitleSwap';
import './globals.css';

// Icons are file-convention (icon.svg, apple-icon.png, manifest.ts)
// and need no entry here — Next wires the <link> tags automatically.
// opengraph-image.tsx / twitter-image.tsx are file-convention too;
// Next generates the image and wires og:image / twitter:image itself.
// metadataBase is what lets those resolve to real absolute URLs.
const SITE_DESCRIPTION =
  'Type a request in plain English. It recognizes the assignee, deadline, and priority, organizes it into a real workspace, and keeps it coordinated as work changes.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Workflow Coordinator — Give it the work.',
    template: '%s · AI Workflow Coordinator',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'AI Workflow Coordinator — Give it the work.',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'AI Workflow Coordinator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Workflow Coordinator — Give it the work.',
    description: SITE_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: '#faf7f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>
      <body>
        {/* Skip link — beauty pass, step 13. Invisible until focused,
            so a keyboard visitor tabbing from the very top of the page
            doesn't have to step through the entire nav (and, on the
            home route, the full 400dvh opening scene) just to reach
            real content. Styled as a small on-brand chip rather than
            the browser's default outline block, so it doesn't look
            like an accessibility afterthought bolted onto an
            otherwise carefully designed page. Targets #main-content,
            set on page.tsx's <main>. */}
        <a
          href="#main-content"
          className="fixed left-gutter-mobile top-xs z-[200] -translate-y-[200%] rounded-sm border border-ink bg-background px-component py-xs text-label text-ink transition-transform duration-fast ease-standard focus-visible:translate-y-0 motion-reduce:transition-none"
        >
          Skip to content
        </a>

        {/* Global polish layer — present on every route, not per-chapter. */}
        <AmbientLight />
        <AmbientDust />
        <CustomCursor />
        <ScrollProgressRail />
        <GrainOverlay />
        <FirstLoadReveal />
        <TabTitleSwap />
        {children}
      </body>
    </html>
  );
}
