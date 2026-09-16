import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'solid' | 'subtle';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, variant = 'subtle', size = 'sm' }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['published', 'open', 'active', 'healthy', 'awarded'].includes(norm)) {
    colorClasses = variant === 'solid'
      ? 'bg-emerald-600 text-white border-emerald-700'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['advisory', 'urgent', 'overdue', 'closed'].includes(norm)) {
    colorClasses = variant === 'solid'
      ? 'bg-alert text-white border-alert-700'
      : 'bg-red-50 text-alert border-red-200';
  } else if (['event', 'upcoming', 'pending', 'unread'].includes(norm)) {
    colorClasses = variant === 'solid'
      ? 'bg-signal-500 text-white border-signal-600'
      : 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (['draft', 'archived', 'inactive', 'read'].includes(norm)) {
    colorClasses = variant === 'solid'
      ? 'bg-slate-600 text-white border-slate-700'
      : 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (['general', 'budget', 'procurement', 'english', 'bisaya'].includes(norm)) {
    colorClasses = variant === 'solid'
      ? 'bg-teal-600 text-white border-teal-700'
      : 'bg-teal-50 text-teal-800 border-teal-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-mono uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
