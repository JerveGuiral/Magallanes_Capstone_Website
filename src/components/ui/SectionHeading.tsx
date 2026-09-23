import React from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  /** Set on dark sections so the eyebrow and body copy stay legible. */
  tone?: 'light' | 'dark';
};

/**
 * Standard section opener.
 *
 * The eyebrow is a small-caps display label led by a brass rule — this replaces
 * the previous monospace eyebrow, which had spread far enough across the site
 * that the mono face no longer signalled "data". Titles are upright rather than
 * italic; an italic serif at every section break read editorial, not municipal.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2',
  tone = 'light',
}: SectionHeadingProps) {
  const dark = tone === 'dark';
  const centered = align === 'center';

  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <p
          className={`flex items-center gap-2.5 font-sans text-eyebrow uppercase ${
            dark ? 'text-accent-400' : 'text-accent-700'
          } ${centered ? 'justify-center' : ''}`}
        >
          <span className={`h-[2px] w-7 shrink-0 rounded-full ${dark ? 'bg-accent-500' : 'bg-accent-600'}`} aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag className={`mt-2.5 text-display-md sm:text-display-lg ${dark ? 'text-white' : 'text-brand-800'}`}>{title}</Tag>
      {description && (
        <p className={`mt-3.5 text-[1.0625rem] leading-relaxed ${dark ? 'text-brand-100' : 'text-ink-muted'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
