import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'solid' | 'subtle';
  size?: 'sm' | 'md';
}

/**
 * Status pill.
 *
 * Five semantic buckets, each mapped onto the design system rather than ad-hoc
 * Tailwind palettes: positive → accent (green), attention → alert (red),
 * pending → brand (blue), inactive → neutral (grey), and plain category tags
 * → an outlined neutral pill. The dot carries the same colour as
 * the label, so state survives a greyscale print of an admin screen.
 */
const BUCKETS: { match: string[]; solid: string; subtle: string }[] = [
  {
    match: ['published', 'open', 'active', 'healthy', 'awarded', 'resolved'],
    solid: 'bg-accent-700 text-white border-accent-800',
    subtle: 'bg-accent-50 text-accent-800 border-accent-200',
  },
  {
    match: ['advisory', 'urgent', 'overdue', 'closed', 'failed'],
    solid: 'bg-alert-600 text-white border-alert-700',
    subtle: 'bg-alert-50 text-alert-800 border-alert-600/25',
  },
  {
    match: ['event', 'upcoming', 'pending', 'unread', 'review'],
    solid: 'bg-brand-600 text-white border-brand-700',
    subtle: 'bg-brand-100 text-brand-800 border-brand-300',
  },
  {
    match: ['draft', 'archived', 'inactive', 'read'],
    solid: 'bg-neutral-600 text-white border-neutral-700',
    subtle: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  {
    match: ['general', 'budget', 'procurement', 'english', 'bisaya'],
    solid: 'bg-brand-800 text-white border-brand-900',
    subtle: 'bg-white text-ink-muted border-hairline',
  },
];

export function StatusBadge({ status, variant = 'subtle', size = 'sm' }: StatusBadgeProps) {
  const norm = status.toLowerCase();
  const bucket = BUCKETS.find((b) => b.match.includes(norm));
  const colorClasses = bucket
    ? bucket[variant]
    : variant === 'solid'
      ? 'bg-neutral-600 text-white border-neutral-700'
      : 'bg-neutral-100 text-neutral-600 border-neutral-200';

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[0.6875rem]' : 'px-2.5 py-1 text-[0.75rem]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-display font-bold uppercase tracking-[0.06em] ${sizeClasses} ${colorClasses}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" aria-hidden="true" />
      {status}
    </span>
  );
}
