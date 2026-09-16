'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Global grain layer — Step 3 (ambient depth) of the beauty pass,
 * alongside AmbientLight. Mounted once in layout.tsx, like
 * CustomCursor and ScrollProgressRail.
 *
 * An SVG `feTurbulence` filter renders the noise (no image asset to
 * ship or cache), redrawn a few times a second by mutating the
 * filter's `seed` attribute directly via a ref — bypassing React
 * state so the flicker never triggers a re-render. `mix-blend-mode:
 * overlay` at very low opacity means the same single layer reads
 * correctly as texture against both the paper and dark surfaces,
 * the same trick CustomCursor uses for `difference`, without any new
 * color or per-chapter branching.
 *
 * Sits below PersistentNav (z-50) so the nav stays perfectly crisp;
 * above ordinary page content so the texture reads over every
 * chapter, light and dark alike.
 *
 * Off entirely under reduced-motion — a flickering full-viewport
 * texture is exactly the kind of motion that preference exists to
 * remove. (A future call could keep a single static frame instead of
 * removing it outright; omitted for now since the brief called this
 * an animated effect.)
 */
const FRAME_INTERVAL_MS = 130; // ~7-8fps — grain reads as texture, not video; redrawing at 60fps would be wasted GPU work for something this subtle.

export function GrainOverlay() {
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    let raf = 0;
    let last = 0;
    function tick(time: number) {
      if (time - last >= FRAME_INTERVAL_MS) {
        turbulenceRef.current?.setAttribute('seed', String(Math.floor(Math.random() * 100)));
        last = time;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] opacity-[0.035] mix-blend-overlay">
      <svg className="h-full w-full">
        <filter id="site-grain-filter">
          <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={1} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#site-grain-filter)" />
      </svg>
    </div>
  );
}
