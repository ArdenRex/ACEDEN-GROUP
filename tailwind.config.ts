import type { Config } from 'tailwindcss';

// Every value here maps to a CSS variable defined in
// src/styles/tokens.css. Change a value once, in one file, and it
// propagates everywhere — nothing here is a hardcoded design decision
// in its own right.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-sunken': 'var(--color-surface-sunken)',
        ink: 'var(--color-ink)',
        'ink-muted': 'var(--color-ink-muted)',
        'ink-faint': 'var(--color-ink-faint)',
        border: 'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        red: 'var(--color-red)',
        'red-muted': 'var(--color-red-muted)',
        'red-wash': 'var(--color-red-wash)',
        'surface-dark': 'var(--color-surface-dark)',
        'ink-on-dark': 'var(--color-ink-on-dark)',
        'ink-muted-on-dark': 'var(--color-ink-muted-on-dark)',
        'border-on-dark': 'var(--color-border-on-dark)',
        'border-on-dark-strong': 'var(--color-border-on-dark-strong)',
        'red-on-dark': 'var(--color-red-on-dark)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        none: 'var(--radius-none)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        none: 'var(--shadow-none)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        'product-window': 'var(--shadow-product-window)',
        'product-window-glow': 'var(--shadow-product-window-glow)',
      },
      spacing: {
        micro: 'var(--space-micro)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        component: 'var(--space-component)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        'section-mobile': 'var(--space-section-mobile)',
        section: 'var(--space-section)',
        'chapter-mobile': 'var(--space-chapter-mobile)',
        chapter: 'var(--space-chapter)',
        'gutter-mobile': 'var(--gutter-mobile)',
        'gutter-tablet': 'var(--gutter-tablet)',
        'gutter-desktop': 'var(--gutter-desktop)',
      },
      maxWidth: {
        narrow: 'var(--width-narrow)',
        editorial: 'var(--width-editorial)',
        wide: 'var(--width-wide)',
        'content-max': 'var(--width-max)',
      },
      transitionTimingFunction: {
        settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '320ms',
        slow: '420ms',
      },
    },
  },
  plugins: [],
};

export default config;
