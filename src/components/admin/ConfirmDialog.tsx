import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AdminModal } from './AdminModal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AdminModal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3.5">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              isDanger ? 'bg-alert-100 text-alert-600' : 'bg-brand-50 text-brand-700'
            }`}
            aria-hidden="true"
          >
            <AlertCircle className="h-5 w-5" />
          </span>
          <p className="pt-1.5 text-[0.9375rem] leading-relaxed text-ink-light">{message}</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-hairline pt-5">
          <button type="button" disabled={isLoading} onClick={onCancel} className="btn btn-secondary btn-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {isLoading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
