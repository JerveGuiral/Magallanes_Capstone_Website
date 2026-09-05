import React, { useState, useRef } from 'react';
import { UploadCloudIcon, CheckCircle2Icon, Loader2Icon, FileTextIcon, XIcon } from 'lucide-react';
import { supabaseAdmin } from '../services/supabaseAdminService';

interface FileUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  accept?: string;
  label?: string;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  value,
  onChange,
  folder = 'documents',
  accept = '.pdf,.doc,.docx,.png,.jpg',
  label = 'Upload Document (PDF / Image)',
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15MB.');
      return;
    }

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      const publicUrl = await supabaseAdmin.uploadFileToStorage(file, folder);
      onChange(publicUrl);
    } catch (err: any) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between rounded border border-emerald-200 bg-emerald-50/60 px-3.5 py-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-medium truncate">
            <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="truncate">{fileName || value.split('/').pop() || 'Uploaded Document'}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-teal hover:underline"
            >
              Preview
            </a>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-alert"
              title="Remove file"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-5 text-center transition-colors hover:border-teal hover:bg-teal-50/30"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2Icon className="h-6 w-6 animate-spin text-teal" />
              <p className="text-xs font-medium text-slate-600">Uploading to Supabase Storage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <UploadCloudIcon className="h-6 w-6 text-slate-400 group-hover:text-teal transition-colors" />
              <p className="text-xs font-medium text-slate-700">
                <span className="font-semibold text-teal">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-400">PDF, DOC, DOCX or PNG (up to 15MB)</p>
            </div>
          )}
        </div>
      )}

      {/* Or manual URL input fallback */}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[10px] uppercase text-slate-400 font-mono">or paste URL:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://your-project.supabase.co/storage/..."
          className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-teal focus:outline-none"
        />
      </div>

      {error && <p className="text-xs text-alert">{error}</p>}
    </div>
  );
};
