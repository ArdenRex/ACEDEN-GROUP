import type { ElementType, ReactNode } from 'react';
import clsx from 'clsx';

type Width = 'narrow' | 'editorial' | 'wide' | 'max';

const widthClass: Record<Width, string> = {
  narrow: 'max-w-narrow',
  editorial: 'max-w-editorial',
  wide: 'max-w-wide',
  max: 'max-w-content-max',
};

interface ContainerProps {
  children: ReactNode;
  /** Content width. Default 'wide' — most chapters run wide, narrow prose opts in. */
  width?: Width;
  as?: ElementType;
  className?: string;
}

/**
 * Centered content column at one of the site's fixed widths, with
 * responsive gutters baked in. This is the one place gutter values
 * live — chapters compose with this rather than adding their own
 * left/right padding.
 */
export function Container({ children, width = 'wide', as: Tag = 'div', className }: ContainerProps) {
  return (
    <Tag
      className={clsx(
        'mx-auto w-full px-gutter-mobile sm:px-gutter-tablet lg:px-gutter-desktop',
        widthClass[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface SectionProps {
  children: ReactNode;
  /**
   * 'section' = spacing between sections within a chapter.
   * 'chapter' = the larger gap between chapters — used sparingly.
   */
  spacing?: 'section' | 'chapter';
  as?: ElementType;
  className?: string;
  id?: string;
}

/**
 * Full-width band that owns its own vertical rhythm. Chapters are
 * built by stacking Sections, not by each chapter inventing its own
 * padding — this is what lets the sparse -> dense -> resolved
 * emotional arc stay consistent across the whole page.
 */
export function Section({ children, spacing = 'section', as: Tag = 'section', className, id }: SectionProps) {
  const padding =
    spacing === 'chapter' ? 'py-chapter-mobile lg:py-chapter' : 'py-section-mobile lg:py-section';

  return (
    <Tag id={id} className={clsx('w-full', padding, className)}>
      {children}
    </Tag>
  );
}
