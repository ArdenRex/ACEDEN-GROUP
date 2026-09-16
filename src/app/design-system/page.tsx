import { Container, Section } from '@/components/primitives/Container';
import { ContinuityLine } from '@/components/primitives/ContinuityLine';
import { ProductWindow } from '@/components/primitives/ProductWindow';
import { SignalDot } from '@/components/primitives/SignalDot';

/*
  TEMPORARY validation route. Not part of the eventual marketing site
  — exists solely so the design-token system (color, type, spacing,
  the continuity-line primitive) can be inspected visually before any
  chapter is built on top of it. Safe to delete this entire
  `design-system/` folder at any point; nothing else references it.
*/

const swatches: Array<{ name: string; varName: string }> = [
  { name: 'background', varName: '--color-background' },
  { name: 'surface', varName: '--color-surface' },
  { name: 'surface-sunken', varName: '--color-surface-sunken' },
  { name: 'ink', varName: '--color-ink' },
  { name: 'ink-muted', varName: '--color-ink-muted' },
  { name: 'ink-faint', varName: '--color-ink-faint' },
  { name: 'red', varName: '--color-red' },
  { name: 'red-muted', varName: '--color-red-muted' },
  { name: 'red-wash', varName: '--color-red-wash' },
];

const darkSwatches: Array<{ name: string; varName: string }> = [
  { name: 'surface-dark', varName: '--color-surface-dark' },
  { name: 'ink-on-dark', varName: '--color-ink-on-dark' },
  { name: 'ink-muted-on-dark', varName: '--color-ink-muted-on-dark' },
  { name: 'red-on-dark', varName: '--color-red-on-dark' },
];

export default function DesignSystemPreview() {
  return (
    <main>
      <Section spacing="section">
        <Container width="wide">
          <p className="text-label mb-micro">Internal — validation only</p>
          <h1 className="text-display-lg mb-lg">Design token preview</h1>

          {/* Color */}
          <h2 className="text-heading-md mb-component">Color</h2>
          <div className="grid grid-cols-2 gap-component sm:grid-cols-3 lg:grid-cols-4 mb-xl">
            {swatches.map((s) => (
              <div key={s.name} className="rounded border border-border overflow-hidden">
                <div className="h-20" style={{ backgroundColor: `var(${s.varName})` }} />
                <div className="p-xs bg-surface">
                  <p className="text-body-sm">{s.name}</p>
                  <p className="text-label">{s.varName}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-heading-md mb-component">Product-window layer</h2>
          <div className="grid grid-cols-2 gap-component sm:grid-cols-4 mb-xl">
            {darkSwatches.map((s) => (
              <div key={s.name} className="rounded border border-border-on-dark overflow-hidden bg-surface-dark">
                <div className="h-20" style={{ backgroundColor: `var(${s.varName})` }} />
                <div className="p-xs">
                  <p className="text-body-sm text-ink-on-dark">{s.name}</p>
                  <p className="text-label" style={{ color: 'var(--color-ink-muted-on-dark)' }}>
                    {s.varName}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <h2 className="text-heading-md mb-component">Typography</h2>
          <div className="space-y-component mb-xl">
            <p className="text-display-xl">Display XL</p>
            <p className="text-display-lg">Display LG</p>
            <p className="text-display-md">Display MD</p>
            <p className="text-heading-lg">Heading LG</p>
            <p className="text-heading-md">Heading MD</p>
            <p className="text-heading-sm">Heading SM</p>
            <p className="text-body-lg">Body LG — the quick brown fox jumps over the lazy dog.</p>
            <p className="text-body-md">Body MD — the quick brown fox jumps over the lazy dog.</p>
            <p className="text-body-sm">Body SM — the quick brown fox jumps over the lazy dog.</p>
            <p className="text-label">Label — assignee</p>
            <p className="text-mono">Mono — sarah.chen@workspace.dev</p>
            <p className="text-price">$20</p>
          </div>

          {/* Spacing */}
          <h2 className="text-heading-md mb-component">Spacing scale</h2>
          <div className="space-y-micro mb-xl">
            {['micro', 'xs', 'sm', 'component', 'md', 'lg', 'xl'].map((token) => (
              <div key={token} className="flex items-center gap-sm">
                <span className="text-label w-24">{token}</span>
                <div className="h-3 bg-ink-faint" style={{ width: `var(--space-${token})` }} />
              </div>
            ))}
          </div>

          {/* Shape / shadow */}
          <h2 className="text-heading-md mb-component">Shape &amp; shadow</h2>
          <div className="flex flex-wrap gap-component mb-xl">
            <div className="w-40 h-24 bg-surface border border-border rounded-sm flex items-center justify-center text-label">
              radius-sm
            </div>
            <div className="w-40 h-24 bg-surface border border-border rounded flex items-center justify-center text-label">
              radius-md
            </div>
            <div className="w-40 h-24 bg-surface border border-border rounded-lg flex items-center justify-center text-label">
              radius-lg
            </div>
            <div className="w-40 h-24 bg-surface rounded shadow-xs flex items-center justify-center text-label">
              shadow-xs
            </div>
            <div className="w-40 h-24 bg-surface rounded shadow-sm flex items-center justify-center text-label">
              shadow-sm
            </div>
            <div className="w-40 h-24 bg-surface-dark text-ink-on-dark rounded-lg shadow-product-window flex items-center justify-center text-label">
              shadow-product-window
            </div>
          </div>

          {/* Focus state */}
          <h2 className="text-heading-md mb-component">Focus state (tab to it)</h2>
          <button className="text-body-md border border-border rounded px-component py-xs mb-xl">
            Focusable element
          </button>

          {/* Continuity line primitive */}
          <h2 className="text-heading-md mb-component">Continuity line primitive</h2>
          <div className="flex items-center gap-xl mb-xl">
            <div className="h-32 w-4">
              <ContinuityLine orientation="vertical" color="ink" className="h-full w-full" />
            </div>
            <div className="h-4 w-64">
              <ContinuityLine orientation="horizontal" color="ink-muted" className="h-full w-full" />
            </div>
            <div className="h-24 w-24">
              <ContinuityLine
                path="M 0 100 C 40 100, 40 0, 100 0"
                color="red"
                thickness={1.5}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Product window + signal dot primitives */}
          <h2 className="text-heading-md mb-component">Product window &amp; signal dot</h2>
          <div className="flex flex-wrap items-start gap-component mb-xl">
            <ProductWindow className="w-72">
              <p className="text-body-sm text-ink-on-dark">Quiet instance — no label, no signal.</p>
            </ProductWindow>
            <ProductWindow label="TASK · 004" live className="w-72">
              <p className="text-body-sm text-ink-on-dark">Labeled instance with a live signal.</p>
            </ProductWindow>
            <div className="flex items-center gap-sm">
              <SignalDot surface="paper" active label="Active, on paper" />
              <SignalDot surface="paper" active={false} label="Idle, on paper" />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
