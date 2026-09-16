import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Shared "underline draw" micro-interaction — Step 2 (beauty pass) of
 * the site-wide interaction language, alongside MagneticButton.
 *
 * Used for plain-text links and text-styled buttons (nav "Login",
 * chapter-08's "Try: <example>" and "Prefer to skip ahead?") — the
 * elements that read as inline text, not a button shape (those use
 * MagneticButton instead). Pure CSS transform, no framer-motion: a
 * hairline underneath the text scales in from the left on hover/focus
 * and eases back out, using the same duration/ease tokens as every
 * other hover state on the site (`duration-base ease-settle`, defined
 * in tokens.css). Respects `prefers-reduced-motion` for free via the
 * `motion-reduce:transition-none` utility — no JS branch needed since
 * this never animates position, only a transform the OS setting is
 * already allowed to suppress.
 *
 * PRESS FEEDBACK (beauty pass, step 11): `active:scale-[0.98]` gives
 * a click a felt response, same tactile intent as MagneticButton's
 * `whileTap` — kept as a plain CSS transition here rather than
 * bringing framer-motion into a component that's deliberately CSS-
 * only, so the two "press" languages stay implemented consistently
 * with how each component already does everything else.
 */
type UnderlineLinkProps = {
  className?: string;
  underlineClassName?: string;
  children: ReactNode;
};

export const UnderlineLink = forwardRef<HTMLAnchorElement, UnderlineLinkProps & AnchorHTMLAttributes<HTMLAnchorElement>>(
  function UnderlineLink({ className, underlineClassName, children, ...rest }, ref) {
    return (
      <a
        ref={ref}
        className={clsx(
          'group relative inline-block w-fit transition-transform duration-fast ease-standard active:scale-[0.98] motion-reduce:transition-none',
          className,
        )}
        {...rest}
      >
        {children}
        <Underline className={underlineClassName} />
      </a>
    );
  },
);

export const UnderlineButton = forwardRef<
  HTMLButtonElement,
  UnderlineLinkProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function UnderlineButton({ className, underlineClassName, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      className={clsx(
        'group relative inline-block w-fit transition-transform duration-fast ease-standard active:scale-[0.98] motion-reduce:transition-none',
        className,
      )}
      {...rest}
    >
      {children}
      <Underline className={underlineClassName} />
    </button>
  );
});

function Underline({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'pointer-events-none absolute inset-x-0 -bottom-[1px] h-px origin-left scale-x-0 bg-current',
        'transition-transform duration-base ease-settle motion-reduce:transition-none',
        'group-hover:scale-x-100 group-focus-visible:scale-x-100',
        'group-disabled:opacity-0',
        className,
      )}
    />
  );
}
