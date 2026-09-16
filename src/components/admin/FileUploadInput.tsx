import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react';
import { uploadPublicDocument } from '../../services/adminService';

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
  helpText?: string;
  required?: boolean;
}

export function FileUploadInput({
  value,
  onChange,
  folder = 'transparency',
  label = 'Document / Attachment',
  accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  helpText = 'Upload PDF or enter direct URL. Stored in public-documents bucket.',
  required = false,
}: FileUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useManualUrl, setUseManualUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const { url, error: uploadErr } = await uploadPublicDocument(file, folder);

    setUploading(false);

    if (uploadErr) {
      setError(uploadErr);
      // Offer switching to manual URL if storage fails
      setUseManualUrl(true);
    } else if (url) {
      onChange(url);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-navy">
          {label} {required && <span className="text-alert">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setUseManualUrl(!useManualUrl)}
          className="text-[11px] font-mono text-teal hover:underline"
        >
          {useManualUrl ? 'Switch to File Upload' : 'Enter URL Manually'}
        </button>
      </div>

      {useManualUrl ? (
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            required={required}
            className="w-full rounded border border-hairline px-3 py-2 text-xs font-mono text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
          />
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2.5 top-2.5 text-teal hover:text-teal-700"
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {value ? (
            <div className="flex items-center justify-between rounded border border-hairline bg-surface p-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="h-4 w-4 text-teal flex-shrink-0" />
                <span className="truncate font-mono text-ink-light max-w-xs">{value}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-teal hover:text-teal-700"
                  title="Preview document"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1 text-ink-muted hover:text-alert"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded border-2 border-dashed border-hairline p-5 text-center cursor-pointer transition-colors ${
                uploading ? 'bg-surface opacity-60' : 'bg-surface hover:border-teal hover:bg-teal-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-navy">
                {uploading ? 'Uploading to Supabase Storage...' : 'Click to select file to upload'}
              </p>
              <p className="text-[11px] text-ink-muted mt-0.5">PDF, DOCX, or Image</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-alert mt-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helpText && <p className="text-[11px] text-ink-muted">{helpText}</p>}
    </div>
  );
}
