import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

/**
 * Same visual system as the site, not a separate "social card" design:
 * warm paper, near-black ink, the one recurring hairline (echoing
 * Wordmark/ContinuityLine), red spent only as the single signal dot.
 * No product-window mockup here — a screenshot-style card reads as
 * generic and goes stale the moment the UI changes; the brand mark
 * itself doesn't.
 */
export async function renderOgImage() {
  // Satori (the renderer behind ImageResponse) can't parse the site's
  // variable font files — every weight throws the same opaque error
  // at build time. These are static single-weight instances of the
  // exact same typefaces, generated with fonttools' varLib.instancer
  // (see src/fonts/*-static/), not a different font substituted in.
  const [displayFontData, bodyFontData] = await Promise.all([
    readFile(path.join(process.cwd(), 'src/fonts/manrope-static/Manrope-SemiBold.ttf')),
    readFile(path.join(process.cwd(), 'src/fonts/inter-static/Inter-Regular.ttf')),
  ]);

  const { ImageResponse } = await import('next/og');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#faf7f1',
          padding: '0 96px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 96,
            top: 130,
            width: 2,
            height: 260,
            background: '#16151a',
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 92,
            top: 400,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#a6332b',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 64 }}>
          <div
            style={{
              fontFamily: 'Manrope',
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: '#6b6660',
              marginBottom: 28,
            }}
          >
            AI Workflow Coordinator
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Manrope',
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#16151a',
              lineHeight: 1.05,
            }}
          >
            Give it the work.
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Inter',
              fontSize: 30,
              fontWeight: 400,
              color: '#6b6660',
              marginTop: 32,
              maxWidth: 760,
            }}
          >
            Type a request — it recognizes the assignee, deadline, and priority, and gets to work.
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Manrope', data: displayFontData, weight: 600, style: 'normal' },
        { name: 'Inter', data: bodyFontData, weight: 400, style: 'normal' },
      ],
    }
  );
}
