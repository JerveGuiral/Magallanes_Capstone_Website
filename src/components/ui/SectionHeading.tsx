import React from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Tag = 'h2'
}: SectionHeadingProps) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow &&
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">{eyebrow}</p>
      }
      <Tag className="mt-2 font-display text-display-md font-bold text-navy sm:text-display-lg">{title}</Tag>
      <span
        className={`mt-3 block h-[3px] w-12 bg-gold ${align === 'center' ? 'mx-auto' : ''}`}
        aria-hidden="true" />

      {description && <p className="mt-4 text-base leading-relaxed text-ink-muted">{description}</p>}
    </div>);

}