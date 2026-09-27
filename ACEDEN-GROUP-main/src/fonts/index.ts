import localFont from 'next/font/local';

/*
  All three typefaces are loaded via next/font/local from files bundled
  in this repo (src/fonts/*), not next/font/google. Two reasons:
    1. Zero runtime dependency on an external font CDN — better
       privacy and performance, and the site still works if Google
       Fonts is ever unreachable.
    2. This build environment's network allowlist doesn't include
       Google's font CDN, so next/font/google couldn't be verified
       working here — next/font/local, with real files on disk, can be.
  Every file below is an official, OFL-licensed release, fetched
  directly from its source repository. Each family's OFL.txt license
  file is kept alongside it (e.g. src/fonts/inter/OFL.txt) for
  provenance.
*/

/**
 * Body / UI typeface — Inter (variable, OFL). Official Google Fonts
 * repository (google/fonts, ofl/inter).
 */
export const bodyFont = localFont({
  src: [
    { path: '../fonts/inter/Inter-Variable.ttf', weight: '100 900', style: 'normal' },
    { path: '../fonts/inter/Inter-Italic-Variable.ttf', weight: '100 900', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'ui-sans-serif', 'arial'],
});

/**
 * Display typeface — PLACEHOLDER, not the final brand choice.
 *
 * The approved visual spec calls for General Sans (Fontshare).
 * Fontshare's CDN isn't reachable from this build environment, and its
 * files aren't mirrored in a redistribution-safe official repo the way
 * Inter/IBM Plex are — so licensed files need to come from you (or be
 * fetched in an environment with access to fontshare.com) rather than
 * pulled from an unverified third-party mirror.
 *
 * Manrope (OFL, official Google Fonts repo) is substituted here so the
 * DISPLAY TYPE SYSTEM — the scale, tracking, and weight logic in
 * globals.css — can be built and validated now. Every display style
 * consumes `--font-display` by variable, never "Manrope" by name, so
 * swapping in the real General Sans later is a one-file change: drop
 * its files in src/fonts/general-sans/ and repoint `src` below.
 */
export const displayFont = localFont({
  src: [{ path: '../fonts/manrope/Manrope-Variable.ttf', weight: '200 800', style: 'normal' }],
  variable: '--font-display',
  display: 'swap',
  fallback: ['system-ui', 'ui-sans-serif', 'arial'],
});

/**
 * Technical/data typeface — IBM Plex Mono (OFL, IBM open source).
 * Used for extracted-field labels, the price moment, and other "data"
 * microcopy — never for general body text.
 */
export const monoFont = localFont({
  src: [
    { path: '../fonts/ibm-plex-mono/IBMPlexMono-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/ibm-plex-mono/IBMPlexMono-Medium.ttf', weight: '500', style: 'normal' },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
});
