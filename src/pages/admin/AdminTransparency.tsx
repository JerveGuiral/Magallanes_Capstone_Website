import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, ExternalLink, Archive, AlertCircle, ShieldCheck } from 'lucide-react';
import { adminService, TransparencyDoc } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FileUploadInput } from '../../components/admin/FileUploadInput';

export function AdminTransparency() {
  const [items, setItems] = useState<TransparencyDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    category: 'budget' | 'procurement' | 'org-chart' | 'saln' | 'other';
    file_url: string;
    fiscal_year: string;
  }>({
    title: '',
    category: 'budget',
    file_url: '',
    fiscal_year: new Date().getFullYear().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Archive Confirm State
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getTransparencyDocs();
      if (!error && data && data.length > 0) {
        setItems(data as TransparencyDoc[]);
      } else {
        // Seed default transparency disclosures
        const seed: TransparencyDoc[] = [
          {
            id: 'td-1',
            title: 'Annual Budget & Expenditure Program FY 2026',
            category: 'budget',
            file_url: 'https://example.com/documents/budget-2026.pdf',
            fiscal_year: '2026',
            uploaded_at: new Date(2026, 0, 15).toISOString(),
            is_archived: false,
          },
          {
            id: 'td-2',
            title: 'Annual Procurement Plan (APP) FY 2026',
            category: 'procurement',
            file_url: 'https://example.com/documents/app-2026.pdf',
            fiscal_year: '2026',
            uploaded_at: new Date(2026, 0, 10).toISOString(),
            is_archived: false,
          },
          {
            id: 'td-3',
            title: 'LGU Organizational Structure & Staffing Pattern',
            category: 'org-chart',
            file_url: 'https://example.com/documents/org-chart.pdf',
            fiscal_year: '2025-2026',
            uploaded_at: new Date(2025, 11, 20).toISOString(),
            is_archived: false,
          },
          {
            id: 'td-4',
            title: 'Summary of SALN Compliance 2025',
            category: 'saln',
            file_url: 'https://example.com/documents/saln-compliance-2025.pdf',
            fiscal_year: '2025',
            uploaded_at: new Date(2025, 4, 30).toISOString(),
            is_archived: false,
          },
        ];
        setItems(seed);
      }
    } catch (e) {
      console.warn('Could not fetch transparency docs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: '',
      category: 'budget',
      file_url: '',
      fiscal_year: new Date().getFullYear().toString(),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file_url) {
      alert('Please upload a document file or enter a document URL.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await adminService.createTransparencyDoc(formData);
      if (data) {
        setItems([data, ...items]);
      } else {
        const newItem: TransparencyDoc = {
          id: `trans-${Date.now()}`,
          ...formData,
          uploaded_at: new Date().toISOString(),
          is_archived: false,
        };
        setItems([newItem, ...items]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving document: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (!targetId) return;
    try {
      await adminService.archiveTransparencyDoc(targetId, true);
    } catch (e) {
      console.warn('Archive in Supabase failed:', e);
    }
    setItems(items.map((it) => (it.id === targetId ? { ...it, is_archived: true } : it)));
    setArchiveConfirmOpen(false);
    setTargetId(null);
  };

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      (it.fiscal_year && it.fiscal_year.includes(search));
    const matchCat = categoryFilter === 'all' || it.category === categoryFilter;
    const matchArchived = includeArchived ? true : !it.is_archived;
    return matchSearch && matchCat && matchArchived;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Transparency Seal Disclosures
          </h2>
          <p className="text-xs text-ink-muted">
            National DILG Full Disclosure Policy (FDP) & Freedom of Information compliance records.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Transparency Document</span>
        </button>
      </div>

      {/* Record Integrity Alert */}
      <div className="rounded border border-hairline bg-surface-raised p-3.5 text-xs text-ink-light flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-teal flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-navy">Document Integrity Policy:</strong> Transparency documents cannot be silently modified in place to preserve civic audit integrity. To update a record, upload a new version and archive the older edition.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title or fiscal year..."
            className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="budget">Annual Budget & Financials</option>
            <option value="procurement">Procurement & APP</option>
            <option value="org-chart">Organizational Structure</option>
            <option value="saln">SALN Compliance</option>
            <option value="other">Other Official Reports</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded border-hairline text-navy"
            />
            <span>Show Archived</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Fiscal Year</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading transparency documents...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No transparency documents found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy max-w-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal flex-shrink-0" />
                        <span className="leading-snug">{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono uppercase text-ink-muted">
                      <StatusBadge status={item.category} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-navy">
                      {item.fiscal_year || 'Current'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      {item.uploaded_at
                        ? new Date(item.uploaded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={item.is_archived ? 'archived' : 'published'}
                        variant={item.is_archived ? 'subtle' : 'solid'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.file_url && (
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-hairline px-2 py-1 text-[11px] text-teal hover:bg-teal-50 transition-colors"
                            title="Open document"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View</span>
                          </a>
                        )}
                        {!item.is_archived && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetId(item.id);
                              setArchiveConfirmOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-hairline px-2 py-1 text-[11px] text-ink-muted hover:text-alert hover:bg-red-50 transition-colors"
                            title="Archive document"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Transparency Document"
        subtitle="Files are uploaded directly to the Supabase Storage 'public-documents' bucket"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Document Title <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Budget and Financial Plan FY 2026"
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Document Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              >
                <option value="budget">Annual Budget</option>
                <option value="procurement">Procurement (APP / BAC)</option>
                <option value="org-chart">Organizational Structure</option>
                <option value="saln">SALN Compliance</option>
                <option value="other">Other Transparency Seal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Fiscal Year</label>
              <input
                type="text"
                required
                value={formData.fiscal_year}
                onChange={(e) => setFormData({ ...formData, fiscal_year: e.target.value })}
                placeholder="e.g. 2026"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none font-mono"
              />
            </div>
          </div>

          <FileUploadInput
            value={formData.file_url}
            onChange={(url) => setFormData({ ...formData, file_url: url })}
            folder="transparency"
            label="Upload PDF Document"
            accept=".pdf"
            helpText="PDF document for public citizen review and download"
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded border border-hairline px-4 py-2 text-xs font-semibold text-ink-muted hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Publish to Transparency Seal'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveConfirmOpen}
        title="Archive Transparency Document"
        message="Archiving will retain this document for audit history while removing it from the primary active transparency list. Proceed?"
        confirmLabel="Archive Document"
        onConfirm={handleArchive}
        onCancel={() => setArchiveConfirmOpen(false)}
      />
    </div>
  );
}
