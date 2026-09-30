import React from 'react';
import { XIcon } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
};

const WIDTHS = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

/**
 * Public-side dialog.
 *
 * Deliberately separate from AdminModal: that one is styled for the console and
 * auto-focuses the first input, which is wrong for a read-only notice.
 *
 * `onClose` is held in a ref rather than listed as an effect dependency. Callers
 * pass inline arrows, so a new identity arrives on every parent render — with it
 * in the dependency list the effect re-runs constantly and its focus call steals
 * the caret. (That exact bug shipped in AdminModal and made every admin form
 * untypeable.)
 */
export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '2xl' }: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const onCloseRef = React.useRef(onClose);

  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    /* Focus the panel, not a control inside it — this is something to read, and
     * landing on the close button invites dismissing it by reflex. */
    const t = window.setTimeout(() => panelRef.current?.focus(), 20);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(t);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-brand-950/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-modal-title"
        className={`relative z-10 my-auto flex max-h-[88vh] w-full ${WIDTHS[maxWidth]} animate-scale-in flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-overlay outline-none`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline bg-surface-muted px-6 py-4">
          <div className="min-w-0">
            <h2 id="public-modal-title" className="font-display text-lg font-bold text-brand-800">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-brand-800"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="admin-scroll flex-1 overflow-y-auto px-6 py-5 text-ink">{children}</div>
      </div>
    </div>
  );
}
