import React, { useState, useEffect } from 'react';
import { PlusIcon, FileTextIcon, ExternalLinkIcon, ArchiveIcon, ArchiveRestoreIcon, ShieldCheckIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { FileUploadInput } from '../components/FileUploadInput';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { TransparencyDocument } from '../types';

export const TransparencyManager: React.FC = () => {
  const [items, setItems] = useState<TransparencyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<TransparencyDocument> | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getTransparency();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUpload = () => {
    setEditingItem({
      title: '',
      category: 'budget',
      file_url: '',
      fiscal_year: new Date().getFullYear().toString(),
    });
    setIsModalOpen(true);
  };

  const handleToggleArchive = async (item: TransparencyDocument) => {
    const nextState = !item.is_archived;
    const msg = nextState
      ? 'Archive this disclosure? It will remain on record but marked as archived/superseded.'
      : 'Unarchive this disclosure and restore to active view?';
    if (window.confirm(msg)) {
      await supabaseAdmin.archiveTransparency(item.id, nextState);
      loadData();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.file_url) {
      alert('Please provide Document Title and upload a valid PDF document.');
      return;
    }

    await supabaseAdmin.uploadTransparency(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const columns: Column<TransparencyDocument>[] = [
    {
      key: 'title',
      header: 'Disclosure Document Title',
      sortable: true,
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4 text-teal shrink-0" />
            <span className="font-semibold text-navy text-sm leading-snug">{item.title}</span>
          </div>
          {item.is_archived && (
            <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
              Archived Record
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
          {item.category}
        </span>
      ),
    },
    {
      key: 'fiscal_year',
      header: 'Fiscal Year',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-navy">
          {item.fiscal_year || 'FY ' + new Date().getFullYear()}
        </span>
      ),
    },
    {
      key: 'uploaded_at',
      header: 'Uploaded Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Document File & Record',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          {item.file_url && (
            <a
              href={item.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-teal hover:bg-teal-50"
            >
              <span>View PDF</span>
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          )}
          <button
            type="button"
            onClick={() => handleToggleArchive(item)}
            className={`rounded p-1.5 transition-colors ${
              item.is_archived
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            }`}
            title={item.is_archived ? 'Unarchive record' : 'Archive record'}
          >
            {item.is_archived ? <ArchiveRestoreIcon className="h-4 w-4" /> : <ArchiveIcon className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Transparency Seal Compliance</h2>
          <p className="text-sm text-slate-500">
            Publish Annual Budgets, AIPs, SALN, and procurement monitoring files for DILG Full Disclosure Policy compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenUpload}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Upload Disclosure Document
        </button>
      </div>

      <div className="rounded border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheckIcon className="h-5 w-5 text-teal shrink-0" />
        <p>
          <strong className="text-navy font-semibold">Integrity Protocol:</strong> Per Good Governance standards, published transparency disclosures are archived rather than silently modified to preserve audit trails.
        </p>
      </div>

      <DataTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="Search budget, AIP, annual audit, procurement disclosures..."
        filterSlot={
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal focus:outline-none"
          >
            <option value="all">All Disclosure Types</option>
            <option value="budget">Annual Budget & Financials</option>
            <option value="procurement">Procurement & Bid Reports</option>
            <option value="org-chart">Organizational Structure</option>
            <option value="saln">SALN Compliance</option>
            <option value="other">Other Statutory Disclosures</option>
          </select>
        }
      />

      {/* Upload Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Transparency Document"
        subtitle="Upload official PDF to Supabase Storage bucket 'public-documents'."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="e.g. Annual Budget and Statement of Receipts FY 2026"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category *
              </label>
              <select
                value={editingItem?.category || 'budget'}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    category: e.target.value as any,
                  })
                }
                className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              >
                <option value="budget">Annual Budget & Financials</option>
                <option value="procurement">Procurement Reports</option>
                <option value="org-chart">Org Chart & Staffing</option>
                <option value="saln">SALN Compliance</option>
                <option value="other">Other Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Fiscal Year *
              </label>
              <input
                type="text"
                required
                value={editingItem?.fiscal_year || ''}
                onChange={(e) => setEditingItem({ ...editingItem, fiscal_year: e.target.value })}
                placeholder="2026"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <FileUploadInput
            value={editingItem?.file_url || ''}
            onChange={(url) => setEditingItem({ ...editingItem, file_url: url })}
            folder="transparency"
            label="Upload Official PDF Document *"
          />

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-teal px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Upload & Publish
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
