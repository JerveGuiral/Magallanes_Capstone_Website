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

  /* Every caller passes `onClose={() => setModalOpen(false)}` — a fresh function
   * identity on each render. Keeping it in a ref keeps it OUT of the effect's
   * dependency list below. With it in the list, typing a single character
   * re-rendered the parent, gave onClose a new identity, re-ran the effect, and
   * its focus() call snatched the caret out of the field and onto the dialog —
   * on every keystroke. */
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  /* Keyed on isOpen alone, so this runs exactly twice per open/close cycle. */
  useEffect(() => {
    if (!isOpen) return;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      /* Trap Tab inside the panel — without this, Tab/Shift+Tab walks off the
       * dialog onto sidebar or page content sitting behind the backdrop, and
       * the keyboard user loses their place with no visual cue they left. */
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector));
        if (focusable.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const withinPanel = active && panel.contains(active);

        if (e.shiftKey) {
          if (!withinPanel || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!withinPanel || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Land on the first editable field so typing can start straight away; fall
     * back to the panel so Tab still enters the dialog when there is nothing to
     * fill in (a confirm dialog, for instance). */
    const focusTimer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      (first ?? panelRef.current)?.focus();
    }, 20);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-brand-950/45 backdrop-blur-sm"
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
