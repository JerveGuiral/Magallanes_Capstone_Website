import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export function AdminModal({ isOpen, onClose, title, subtitle, children, maxWidth = 'xl' }: AdminModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      /* Move focus into the dialog so the next Tab lands inside it rather than
       * continuing through the page still rendered behind the backdrop. */
      const t = window.setTimeout(() => panelRef.current?.focus(), 20);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        window.clearTimeout(t);
      };
    }
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-brand-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative z-10 my-8 flex max-h-[90vh] w-full ${WIDTHS[maxWidth]} animate-scale-in flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-overlay outline-none`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline bg-surface px-6 py-4">
          <div className="min-w-0">
            <h2 id="admin-modal-title" className="font-display text-lg font-bold text-brand-800">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-brand-800"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="admin-scroll flex-1 overflow-y-auto p-6 text-ink">{children}</div>
      </div>
    </div>
  );
}
