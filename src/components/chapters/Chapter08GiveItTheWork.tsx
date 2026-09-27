'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Container } from '@/components/primitives/Container';
import { SignalDot } from '@/components/primitives/SignalDot';
import { UnderlineLink, UnderlineButton } from '@/components/primitives/UnderlineLink';
import { MagneticButton } from '@/components/primitives/MagneticButton';
import { TiltPanel } from '@/components/primitives/TiltPanel';
import { EmphasisReveal } from '@/components/primitives/EmphasisReveal';
import { MiniTaskBoard } from '@/components/primitives/MiniTaskBoard';
import { getSignupUrl } from '@/lib/env';
import { duration, ease, fadeSettle } from '@/lib/motion';

/**
 * Chapter 08 — "Give It The Work." The final chapter.
 *
 * NEW FILE. page.tsx gains one import + one render line; Chapters
 * 01–07 are untouched.
 *
 * ----------------------------------------------------------------
 * WHY THIS CHAPTER IS STRUCTURALLY DIFFERENT FROM 01–07
 * ----------------------------------------------------------------
 * Every earlier chapter is a pure, passive, scroll-driven playback —
 * the visitor watches. Chapter 08's entire premise (§2, §31) is that
 * the visitor stops watching and becomes the source of the next
 * task, so this is the one chapter with a real, typable, submittable
 * <textarea> in it. Scroll-jacking a live text input inside a pinned
 * sticky container would fight the visitor's own typing, so the
 * chapter is split into two genuinely different mechanisms instead
 * of forcing one:
 *
 *   1. A short sticky PRELUDE (GiveItTheWorkPrelude) — pure scroll
 *      -driven, exactly like Ch.01–07's pattern — that does only the
 *      "system makes space" transition (§15): a handful of residual
 *      signals, the last quiet trace of Ch.07's coordinated field,
 *      contract toward the center and fade, and the dark
 *      product-territory surface itself is crossfaded away by a
 *      paper-colored curtain, revealing tokens.css's own "sparse"
 *      resolution — the site's stated end-of-arc — as an actual
 *      visual event, not a metaphor. "Give it the work." appears on
 *      that paper the moment the curtain finishes.
 *
 *   2. A normal, non-pinned, static block (GiveItTheWorkInteractive)
 *      that follows it in ordinary document flow — because real
 *      keyboard/touch interaction needs normal page behavior, not a
 *      scroll-jacked container. This is also why its entrance uses
 *      `fadeSettle`, the site's one shared non-scroll default, rather
 *      than a bespoke scrollYProgress rig.
 *
 * ----------------------------------------------------------------
 * WHY PAPER, NOT THE DARK FIELD (§5)
 * ----------------------------------------------------------------
 * Chapters 05–07 all live on `--color-surface-dark` — that dark
 * field is the system's own territory. tokens.css's own comment
 * describes the site's intended arc as "sparse -> structured ->
 * dense -> resolved -> sparse," and §5 of this chapter's brief
 * explicitly calls for "warm paper, near-black ink, restrained
 * borders" for the input surface. Returning to
 * `--color-background`/`--color-ink` for the interactive block is
 * therefore not an arbitrary style choice — it's the site's own
 * documented resolution, and it's what makes Ch.08 unmistakably
 * different from every dark chapter before it (§36 Test 2): the
 * system's dark territory recedes, and the visitor's own plain page
 * is what's left.
 *
 * ----------------------------------------------------------------
 * THE RECOGNITION MECHANIC — REAL INPUT, SCOPED RECOGNITION (§7, §18)
 * ----------------------------------------------------------------
 * No fake API call, no invented NLP. `parseSegments` runs a plain
 * regex over whatever the visitor actually types and marks only the
 * three terms Ch.01 already taught the visitor to recognize — Sarah,
 * Friday, "high priority" — exactly per §18 ("recognize only words
 * relevant to the known example"). A transparent-text <textarea> sits
 * exactly over a same-metrics mirror <div> that renders the styled
 * segments, so the highlighting is genuinely live as the visitor
 * types (a standard editor-overlay technique), while the real text
 * the screen reader hears is the plain, unstyled textarea value.
 *
 * The example sentence offered as a one-tap prefill is Ch.01's own
 * sentence verbatim ("Can Sarah finish the onboarding docs by
 * Friday? Make it high priority.") — not a paraphrase — so a visitor
 * who uses it is deliberately replaying the site's opening line
 * themselves (§8, §36 Test 4).
 *
 * ----------------------------------------------------------------
 * THE RESULT IS NOT A REUSE OF Workspace (Ch.01's primitive)
 * ----------------------------------------------------------------
 * Workspace.tsx's stage/resolved/entryRef props are built for Ch.01's
 * signal-travel choreography and don't fit a typed-input result — so,
 * consistent with that file's own note about not reusing ProductWindow
 * for a mismatched shape, this chapter hand-rolls a small local
 * dt/dd result row using the same typographic language (font-mono
 * label + value, red only on the priority value) rather than forcing
 * the prop shape. It deliberately stays small and recedes into being
 * "proof," never the hero (§10) — the CTA below it is.
 *
 * ----------------------------------------------------------------
 * THE CTA IS NEVER FULLY GATED (ACCESSIBILITY)
 * ----------------------------------------------------------------
 * §24 asks that the CTA "remain clearly available" once the demo
 * completes. A quiet, always-present, real `<a href={getSignupUrl()}>`
 * fallback link exists before submission too, so a keyboard user, a
 * screen-reader user, or someone who simply doesn't want to type
 * still has an unconditional path to the real product — the crafted
 * reveal is a reward for interacting, never a requirement to convert.
 *
 * ----------------------------------------------------------------
 * REDUCED MOTION (§25)
 * ----------------------------------------------------------------
 * Skips the sticky prelude entirely — no contraction, no curtain —
 * and renders the interactive block directly, fully functional
 * (typing, the highlight overlay, and submission all still work; only
 * the entrance/extraction timings collapse to 0). The fallback CTA is
 * visible immediately, per §25's "show the CTA clearly."
 *
 * ----------------------------------------------------------------
 * NO VISUAL QA
 * ----------------------------------------------------------------
 * Visual rendering is not available in this environment. Validated
 * via tsc --noEmit, next lint, and next build only.
 *
 * ----------------------------------------------------------------
 * FIX (user-reported, step 3): empty at start + duplicate heading
 * ----------------------------------------------------------------
 * Two separate bugs in GiveItTheWorkPrelude:
 *   1. The residual signals and the "08" marker faded in FROM zero
 *      starting at scrollYProgress 0, so the instant the chapter was
 *      scrolled into and pinned — before any further scroll input —
 *      the screen was flat, empty black. Both now start already at
 *      their resting opacity, exactly as Ch.07 left them, so the
 *      chapter never presents a blank frame.
 *   2. The prelude's own title duplicated "Give it the work.", which
 *      also renders moments later in GiveItTheWorkInteractive just
 *      below it — and it was rendering visibly off-center (right of
 *      center), the same Tailwind-translate-vs-Framer-motion-style
 *      conflict already fixed elsewhere (Chapter03's FieldLabel/
 *      HubLabel, step 27; Chapter07's StateWord): an animated Framer
 *      `y` style silently drops a Tailwind `-translate-x/y-1/2` class
 *      on the same element, since both target the CSS `transform`
 *      property. Replaced with a distinct, quieter transitional line
 *      (properly centered via Framer's own x/y) that hands off to the
 *      interactive heading rather than repeating it.
 *
 * ----------------------------------------------------------------
 * BOLD PASS: THE RESULT AS A REAL PAYOFF CARD
 * ----------------------------------------------------------------
 * The extracted assignee/deadline/priority fields used to render as
 * plain unbordered text — easy to miss as the actual outcome of the
 * one interaction the whole site builds toward. Now wrapped in
 * TiltPanel: this is the one moment on the page where a visitor's
 * cursor is essentially guaranteed to already be resting nearby (they
 * just clicked submit), so the pointer-tilt reads as a direct,
 * satisfying response to their own action rather than an ambient
 * effect they might never notice.
 */

const EXAMPLE_SENTENCE = 'Can Sarah finish the onboarding docs by Friday? Make it high priority.';

type MatchType = 'assignee' | 'deadline' | 'priority';

interface Segment {
  text: string;
  match?: MatchType;
}

const RECOGNITION_PATTERN = /(\bsarah\b)|(\bfriday\b)|(high priority)/gi;

function parseSegments(text: string): Segment[] {
  if (!text) return [];
  const segments: Segment[] = [];
  let lastIndex = 0;
  RECOGNITION_PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = RECOGNITION_PATTERN.exec(text))) {
    if (m.index > lastIndex) segments.push({ text: text.slice(lastIndex, m.index) });
    const matched = m[0];
    const type: MatchType = m[1] ? 'assignee' : m[2] ? 'deadline' : 'priority';
    segments.push({ text: matched, match: type });
    lastIndex = m.index + matched.length;
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex) });
  return segments;
}

function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) => (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()));
}

interface RecognizedFields {
  assignee: string | null;
  deadline: string | null;
  priority: string | null;
}

function extractFields(segments: Segment[]): RecognizedFields {
  const fields: RecognizedFields = { assignee: null, deadline: null, priority: null };
  for (const seg of segments) {
    if (seg.match === 'assignee' && !fields.assignee) fields.assignee = titleCase(seg.text);
    if (seg.match === 'deadline' && !fields.deadline) fields.deadline = titleCase(seg.text);
    if (seg.match === 'priority' && !fields.priority) fields.priority = titleCase(seg.text);
  }
  return fields;
}

const FIELD_TEXT_CLASS = 'whitespace-pre-wrap break-words font-body text-body-lg leading-relaxed';

/** Live syntax-highlight mirror sitting under a transparent-text textarea — same technique as any code-editor overlay. */
function HighlightedMirror({ segments }: { segments: Segment[] }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 p-lg text-ink ${FIELD_TEXT_CLASS}`}>
      {segments.length === 0 ? (
        <span className="opacity-0">.</span>
      ) : (
        segments.map((seg, i) =>
          seg.match ? (
            <span
              key={i}
              className="font-mono"
              style={{ color: seg.match === 'priority' ? 'var(--color-red)' : 'var(--color-ink)' }}
            >
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )
      )}
    </div>
  );
}

function ResultField({ label, value }: { label: string; value: string }) {
  const accent = label === 'Priority';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.base, ease: ease.settle }}
      className="flex items-baseline gap-xs"
    >
      <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted">{label}</dt>
      <dd className="text-mono" style={accent ? { color: 'var(--color-red)' } : undefined}>
        {value}
      </dd>
    </motion.div>
  );
}

function CopyResultButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable/blocked — fail quietly, nothing else on
      // the page depends on this succeeding.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex items-center gap-2xs self-center font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted transition-colors duration-fast hover:text-ink"
    >
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="5.5" y="5.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.1" />
        <path d="M3 10.5V2.5C3 1.94772 3.44772 1.5 4 1.5H11" stroke="currentColor" strokeWidth="1.1" />
      </svg>
      {copied ? 'Copied' : 'Copy result'}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Result copied to clipboard' : ''}
      </span>
    </button>
  );
}

type Stage = 'idle' | 'extracting' | 'done';

function GiveItTheWorkInteractive({ instant }: { instant: boolean }) {
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const segments = parseSegments(value);
  const fields = extractFields(segments);
  const hasAnyField = Boolean(fields.assignee || fields.deadline || fields.priority);
  const trimmed = value.trim();

  function handleSubmit() {
    if (!trimmed || stage === 'extracting') return;
    if (instant) {
      setStage('done');
      return;
    }
    setStage('extracting');
    window.setTimeout(() => setStage('done'), 480);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function usePrefill() {
    setValue(EXAMPLE_SENTENCE);
    textareaRef.current?.focus();
  }

  return (
    <Container width="editorial" className="flex flex-col items-center gap-lg py-section-mobile text-center lg:py-section">
      <motion.div {...fadeSettle} className="flex flex-col items-center gap-sm">
        <h2 className="text-display-lg text-ink">
          <EmphasisReveal>Give it the work.</EmphasisReveal>
        </h2>
        <p className="text-body-sm text-ink-muted">Give the coordinator something to organize.</p>
      </motion.div>

      <motion.form
        {...fadeSettle}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="w-full text-left"
      >
        <div className="relative rounded-sm border border-border-strong bg-surface transition-[border-color,box-shadow] duration-base focus-within:border-ink focus-within:shadow-[var(--shadow-glow-accent)]">
          <label htmlFor="chapter08-request" className="sr-only">
            What needs to happen
          </label>
          <HighlightedMirror segments={segments} />
          <textarea
            id="chapter08-request"
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Tell the coordinator what needs to happen."
            className={`relative w-full resize-none bg-transparent p-lg text-transparent caret-ink outline-none placeholder:text-ink-faint ${FIELD_TEXT_CLASS}`}
          />
          <div className="flex items-center justify-between gap-sm border-t border-border px-lg py-xs">
            <UnderlineButton
              type="button"
              onClick={usePrefill}
              className="text-body-sm italic text-ink-muted transition-colors duration-fast hover:text-ink"
            >
              Try: &ldquo;{EXAMPLE_SENTENCE}&rdquo;
            </UnderlineButton>
            <MagneticButton
              type="submit"
              disabled={!trimmed}
              aria-label="Extract structured work"
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-ink text-ink transition-colors duration-fast hover:bg-ink hover:text-background disabled:cursor-not-allowed disabled:border-border disabled:text-ink-faint disabled:hover:bg-transparent"
            >
              <span className="inline-block transition-transform duration-fast ease-standard group-hover:translate-x-0.5">→</span>
            </MagneticButton>
          </div>
        </div>
      </motion.form>

      {stage === 'extracting' && (
        <div className="flex items-center gap-xs text-label text-ink-muted">
          <SignalDot surface="paper" active size={6} />
          Extracting structure
        </div>
      )}

      <AnimatePresence>
        {stage === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.slow, ease: ease.settle }}
            className="flex w-full flex-col items-center gap-lg"
          >
            <div className="flex flex-col items-center gap-sm">
              <p className="text-label text-ink-muted">Your request</p>
              <p className="max-w-[40ch] text-body-sm italic text-ink-muted">&ldquo;{trimmed}&rdquo;</p>
              {hasAnyField && (
                <>
                  <TiltPanel className="mt-xs">
                    <dl
                      className="flex flex-col items-center gap-xs rounded-md border px-lg py-component"
                      style={{ borderColor: 'var(--color-border-strong)', backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}
                    >
                      {fields.assignee && <ResultField label="Assignee" value={fields.assignee} />}
                      {fields.deadline && <ResultField label="Deadline" value={fields.deadline} />}
                      {fields.priority && <ResultField label="Priority" value={fields.priority} />}
                    </dl>
                  </TiltPanel>
                  <CopyResultButton
                    text={[
                      `Task: ${trimmed}`,
                      fields.assignee ? `Assignee: ${fields.assignee}` : null,
                      fields.deadline ? `Deadline: ${fields.deadline}` : null,
                      fields.priority ? `Priority: ${fields.priority}` : null,
                    ]
                      .filter(Boolean)
                      .join('\n')}
                  />
                </>
              )}
            </div>

            <div className="w-full max-w-[420px]">
              <MiniTaskBoard
                task={{
                  title: trimmed.length > 64 ? `${trimmed.slice(0, 64).trim()}…` : trimmed,
                  assignee: fields.assignee,
                  priority: fields.priority,
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-sm">
              <p className="text-body-md italic text-ink-muted">That&rsquo;s the idea.</p>
              <MagneticButton
                as="a"
                href={getSignupUrl()}
                className="group relative inline-block overflow-hidden rounded-md px-lg py-sm text-body-md font-semibold transition-shadow duration-fast hover:shadow-[var(--shadow-glow-accent)]"
                style={{ background: 'var(--gradient-accent)', color: 'var(--color-ink-on-dark)' }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
                />
                Try the real coordinator
              </MagneticButton>
              <p className="text-label text-ink-muted">7-day free trial · $20/month per workspace</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage !== 'done' && (
        <UnderlineLink
          href={getSignupUrl()}
          className="text-label text-ink-faint transition-colors duration-fast hover:text-ink-muted"
        >
          Prefer to skip ahead? Try the real coordinator · 7-day free trial
        </UnderlineLink>
      )}
    </Container>
  );
}

// ----------------------------------------------------------------
// PRELUDE — scroll-driven "system makes space" transition (§15).
// ----------------------------------------------------------------
const RESIDUAL_START: { x: number; y: number }[] = [
  { x: 20, y: 30 },
  { x: 76, y: 24 },
  { x: 60, y: 62 },
  { x: 32, y: 70 },
  { x: 82, y: 68 },
];
const CENTER = { x: 50, y: 48 };

function ResidualSignal({ scrollYProgress, from, delay }: { scrollYProgress: MotionValue<number>; from: { x: number; y: number }; delay: number }) {
  const start = Math.min(0.05 + delay, 0.4);
  const end = Math.min(start + 0.35, 0.55);
  const left = useTransform(scrollYProgress, [start, end], [from.x, CENTER.x]);
  const top = useTransform(scrollYProgress, [start, end], [from.y, CENTER.y]);
  const leftPct = useTransform(left, (v) => `${v}%`);
  const topPct = useTransform(top, (v) => `${v}%`);
  // FIX (user-reported, step 3): these used to fade in from 0 starting
  // at scrollYProgress 0, so the very first frame of the chapter — the
  // instant it's scrolled into and pinned, before any further scroll
  // input — showed nothing at all: a flat, blank dark screen. They're
  // "the last quiet trace of Ch.07's coordinated field" (§15), so it
  // reads correctly, not just fixes the blank-frame bug, for them to
  // already be at their resting opacity the moment the chapter is
  // entered, exactly as Ch.07 left them, before converging inward.
  const opacity = useTransform(scrollYProgress, [0, 0.45, 0.58], [0.5, 0.5, 0]);

  return (
    <motion.span
      style={{ left: leftPct, top: topPct, opacity }}
      className="absolute -translate-x-1/2 -translate-y-1/2 block h-[6px] w-[6px] rounded-full"
      aria-hidden="true"
    >
      <span className="block h-full w-full rounded-full" style={{ backgroundColor: 'var(--color-ink-on-dark)' }} />
    </motion.span>
  );
}

function GiveItTheWorkPrelude() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Same "already present, not faded in from nothing" fix as
  // ResidualSignal's opacity above, for the same reason.
  const markerOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [0.6, 0.6, 0]);
  const curtainOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.72, 0.92], [0, 1]);
  const titleYRaw = useTransform(scrollYProgress, [0.72, 0.92], [10, 0]);
  // FIX (user-reported, step 3): this title, PLUS the "Give it the
  // work." heading rendered again moments later in
  // GiveItTheWorkInteractive just below it, meant the same line
  // appeared twice in quick succession. Rather than a full duplicate,
  // this is now a distinct, quieter transitional line — the curtain's
  // own closing beat, handing off to the interactive heading rather
  // than repeating it.
  //
  // It was also rendering visibly right-of-center (never actually
  // centered): combining a Tailwind `-translate-x-1/2 -translate-y-1/2`
  // class with an animated Framer Motion `y` style is the same bug
  // already fixed elsewhere (Chapter03's FieldLabel/HubLabel, step 27;
  // Chapter07's StateWord) — Framer's inline `transform` silently wins
  // over Tailwind's class, dropping the -50%/-50% centering translate
  // entirely, so the element's *left edge* sat at the 50% mark instead
  // of its center. Fixed the same way: centering expressed via Framer's
  // own x/'-50%', with the 10px→0 entrance offset folded into the same
  // y value via calc() so both survive together.
  const titleY = useTransform(titleYRaw, (v) => `calc(-50% + ${v}px)`);

  return (
    <div ref={sectionRef} className="relative w-full h-[240dvh]">
      <div className="sticky top-[var(--nav-height)] h-[calc(100dvh-var(--nav-height))] w-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-dark)' }}>
        <motion.p
          style={{ opacity: markerOpacity, color: 'var(--color-ink-muted-on-dark)' }}
          className="absolute left-gutter-mobile top-[6%] z-10 text-label sm:left-gutter-tablet lg:left-gutter-desktop"
        >
          08
        </motion.p>

        {RESIDUAL_START.map((pos, i) => (
          <ResidualSignal key={i} scrollYProgress={scrollYProgress} from={pos} delay={i * 0.02} />
        ))}

        <motion.div
          style={{ opacity: curtainOpacity, backgroundColor: 'var(--color-background)' }}
          className="absolute inset-0"
          aria-hidden="true"
        />

        <motion.p
          style={{ opacity: titleOpacity, left: '50%', top: '50%', x: '-50%', y: titleY }}
          className="absolute w-[90%] max-w-[36rem] text-center text-body-lg italic text-ink-muted"
        >
          Everything you just watched — now it&rsquo;s yours to try.
        </motion.p>
      </div>
    </div>
  );
}

export function Chapter08GiveItTheWork() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section id="chapter-08" className="relative w-full" style={{ backgroundColor: 'var(--color-background)' }} aria-label="Give it the work">
        <h3 className="sr-only">
          The system has finished demonstrating itself. This is your turn: type a real request into the field below
          and the coordinator will recognize the assignee, deadline, and priority in it, the same way Chapter one
          recognized them in its own example sentence. A link to try the real coordinator, with its 7-day free
          trial, is available at any time.
        </h3>
        <GiveItTheWorkInteractive instant />
      </section>
    );
  }

  return (
    <section id="chapter-08" className="relative w-full" aria-label="Give it the work">
      <h3 className="sr-only">
        The coordinated system from the previous chapter quiets and clears, making room for one open field. This is
        the visitor's turn to give the coordinator a real request; typing it recognizes the assignee, deadline, and
        priority in it, the same way Chapter one recognized them in its own example sentence, before offering a link
        to try the real coordinator with its 7-day free trial.
      </h3>
      <GiveItTheWorkPrelude />
      <div style={{ backgroundColor: 'var(--color-background)' }}>
        <GiveItTheWorkInteractive instant={false} />
      </div>
    </section>
  );
}
