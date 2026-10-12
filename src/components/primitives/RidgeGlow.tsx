/**
 * Decorative orange atmosphere pieces taken from the reference design
 * (Step 3.2). Both are purely visual: aria-hidden, no pointer events,
 * no text, no animation (so nothing here needs a reduced-motion branch).
 *
 * RidgeGlow  — a dark mountain-ridge silhouette with a glowing orange
 *              edge and a warm wash rising behind it. Sits along the
 *              bottom edge of its (relatively positioned) parent.
 * PlatformGlow — a soft orange elliptical "light pool" with a fine ring,
 *              placed under a panel so it reads as sitting on a glowing
 *              platform.
 */
export function RidgeGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0"
      style={{ height: 'var(--ridge-glow-height)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(70% 100% at 72% 100%, rgba(255,121,0,0.34) 0%, rgba(255,121,0,0.12) 45%, rgba(255,121,0,0) 75%)',
        }}
      />
      <svg
        className="absolute inset-x-0 bottom-0 h-[70%] w-full"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ filter: 'drop-shadow(0 -3px 10px rgba(255,121,0,0.65))' }}
      >
        <defs>
          <linearGradient id="ridge-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#ff7900" stopOpacity="0.15" />
            <stop offset="0.55" stopColor="#ff941a" stopOpacity="0.95" />
            <stop offset="1" stopColor="#ffb347" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <path
          d="M0 92 L90 74 L170 86 L270 52 L350 76 L440 44 L530 70 L630 38 L710 64 L810 30 L910 62 L1010 40 L1110 68 L1210 48 L1310 74 L1390 56 L1440 66 L1440 120 L0 120 Z"
          fill="#070707"
          stroke="url(#ridge-edge)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export function PlatformGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-[4%] -bottom-10 h-20">
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,121,0,0.55) 0%, rgba(255,121,0,0) 68%)',
          filter: 'blur(14px)',
        }}
      />
      <div
        className="absolute inset-x-[8%] bottom-3 h-8 rounded-[50%]"
        style={{
          border: '1px solid rgba(255,148,26,0.55)',
          boxShadow: '0 0 24px -4px rgba(255,121,0,0.7)',
        }}
      />
    </div>
  );
}
