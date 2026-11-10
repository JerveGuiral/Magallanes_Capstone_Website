import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ExternalLink, FileText, Building, AlertCircle } from 'lucide-react';
import { adminService, DownloadableForm } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FileUploadInput } from '../../components/admin/FileUploadInput';

const EMPTY_FORM = {
  title: '',
  title_bisaya: '',
  description: '',
  office: '',
  file_url: '',
  is_published: true,
};

export function AdminForms() {
  const [items, setItems] = useState<DownloadableForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DownloadableForm | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await adminService.getForms();
      if (error) throw error;
      setItems((data || []) as DownloadableForm[]);
    } catch (e: any) {
      console.warn('Could not fetch downloadable forms:', e);
      // The table is created by supabase/add-forms-and-log-confidence.sql; say so rather than
      // showing an empty list that looks like "no forms yet".
      setLoadError(e?.message || 'Could not load the forms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (item: DownloadableForm) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      title_bisaya: item.title_bisaya || '',
      description: item.description || '',
      office: item.office || '',
      file_url: item.file_url,
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file_url) {
      alert('Please upload the form file or enter its URL.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingItem) {
        const { data } = await adminService.updateForm(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? (data as DownloadableForm) : it)));
      } else {
        const { data } = await adminService.createForm(formData);
        setItems([...items, data as DownloadableForm].sort((a, b) => a.title.localeCompare(b.title)));
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving form: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteForm(deletingId);
    } catch (err: any) {
      // Never drop the row from the view after a failed delete — it silently
      // reappears on the next refresh with no explanation to the operator.
      alert(`Could not delete this form: ${err.message}`);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      return;
    }
    setItems(items.filter((it) => it.id !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const q = search.toLowerCase();
  const filteredItems = items.filter(
    (it) =>
      it.title.toLowerCase().includes(q) ||
      (it.title_bisaya || '').toLowerCase().includes(q) ||
      (it.office || '').toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-800">Downloadable Forms</h2>
          <p className="text-xs text-ink-muted">
            Application forms citizens can download from the website. Magi answers from this list too.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={Boolean(loadError)}
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-700 shadow-sm disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>Add Form</span>
        </button>
      </div>

      {loadError && (
        <div className="flex items-start gap-2.5 rounded border border-alert-600/25 bg-alert-50 p-3.5 text-xs text-alert-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong>The forms list could not be loaded</strong> ({loadError}). If this is a new installation, run{' '}
            <code className="font-mono">supabase/add-forms-and-log-confidence.sql</code> in the Supabase SQL Editor,
            then reload this page.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms by title or office..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Issuing Office</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-muted">
                    Loading forms...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-ink-muted">
                    {items.length === 0 ? 'No forms posted yet.' : 'No forms match your search.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-brand-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-brand-800 leading-snug">{item.title}</p>
                          {item.title_bisaya && (
                            <p className="font-mono text-[11px] text-brand-600 mt-0.5">{item.title_bisaya}</p>
                          )}
                          {item.description && (
                            <p className="text-[11px] text-ink-muted mt-1 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-ink-subtle flex-shrink-0" />
                        <span>{item.office || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={item.is_published ? 'published' : 'draft'}
                        variant={item.is_published ? 'solid' : 'subtle'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="row-actions">
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="row-action rounded text-brand-600 hover:bg-brand-50 transition-colors"
                          title="Open form"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="row-action rounded text-brand-800 hover:bg-surface transition-colors"
                          title="Edit form"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(item.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="row-action rounded text-alert hover:bg-alert-50 transition-colors"
                          title="Delete form"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Downloadable Form' : 'Add Downloadable Form'}
        subtitle="Files are uploaded to the Supabase Storage 'public-documents' bucket"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                Form Title (English) <span className="text-alert">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Business Permit Application Form"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                Form Title (Bisaya Translation)
              </label>
              <input
                type="text"
                value={formData.title_bisaya}
                onChange={(e) => setFormData({ ...formData, title_bisaya: e.target.value })}
                placeholder="e.g. Porma sa Aplikasyon sa Business Permit"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Issuing Office</label>
            <input
              type="text"
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              placeholder="e.g. Business Permits and Licensing Office"
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Short Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What the form is for, and where to submit it once filled in."
              className="w-full rounded-md border border-hairline bg-white p-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <FileUploadInput
            value={formData.file_url}
            onChange={(url) => setFormData({ ...formData, file_url: url })}
            folder="forms"
            label="Form File"
            accept=".pdf,.doc,.docx"
            helpText="PDF or Word file citizens can download and print"
            required
          />

          <label className="flex items-center gap-2 text-[0.8125rem] text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="rounded border-hairline text-brand-800"
            />
            <span>Published (visible on the website and to Magi)</span>
          </label>

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
              className="rounded-md bg-brand-600 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Form'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Form"
        message="Remove this form from the website? Citizens will no longer be able to download it, and Magi will stop offering it."
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
