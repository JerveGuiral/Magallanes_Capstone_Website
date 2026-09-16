import React from 'react';
import { AlertCircle } from 'lucide-react';
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
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-full p-2 flex-shrink-0 ${
              isDanger ? 'bg-red-100 text-alert' : 'bg-amber-100 text-amber-700'
            }`}
          >
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm text-ink-light leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded border border-hairline bg-white px-4 py-2 text-xs font-semibold text-ink-light hover:bg-surface transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded px-4 py-2 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 ${
              isDanger
                ? 'bg-alert hover:bg-red-700 disabled:opacity-50'
                : 'bg-navy hover:bg-indigo-700 disabled:opacity-50'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
