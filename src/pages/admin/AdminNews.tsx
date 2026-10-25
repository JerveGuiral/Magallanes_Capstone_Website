import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, AlertCircle, ChevronDown, Languages } from 'lucide-react';
import { adminService, NewsAnnouncement } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FileUploadInput } from '../../components/admin/FileUploadInput';

export function AdminNews() {
  const [items, setItems] = useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsAnnouncement | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    body: string;
    title_bisaya: string;
    body_bisaya: string;
    category: 'advisory' | 'event' | 'general';
    image_url: string;
    is_published: boolean;
  }>({
    title: '',
    body: '',
    title_bisaya: '',
    body_bisaya: '',
    category: 'general',
    image_url: '',
    is_published: true,
  });
  // The Bisaya version is optional and collapsed by default, so posting stays a one-language
  // task; it opens on its own when editing a post that already has one.
  const [showBisaya, setShowBisaya] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await adminService.getNews();
      if (error) {
        throw error;
      }
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as NewsAnnouncement[]);
    } catch (err: any) {
      console.warn('Failed to load from Supabase:', err.message);
      // There is no local cache to fall back to — say what actually happened.
      setErrorMessage(`Could not load announcements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      body: '',
      title_bisaya: '',
      body_bisaya: '',
      category: 'general',
      image_url: '',
      is_published: true,
    });
    setShowBisaya(false);
    setModalOpen(true);
  };

  const openEditModal = (item: NewsAnnouncement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      body: item.body,
      title_bisaya: item.title_bisaya || '',
      body_bisaya: item.body_bisaya || '',
      category: item.category || 'general',
      image_url: item.image_url || '',
      is_published: item.is_published,
    });
    setShowBisaya(Boolean(item.title_bisaya || item.body_bisaya));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Blank Bisaya fields are stored as null, not '', so the chatbot falls back to the main text.
    const payload = {
      ...formData,
      title_bisaya: formData.title_bisaya.trim() || null,
      body_bisaya: formData.body_bisaya.trim() || null,
    };
    try {
      if (editingItem) {
        await adminService.updateNews(editingItem.id, payload);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...payload } : it)));
      } else {
        const { data } = await adminService.createNews(payload);
        if (data) {
          setItems([data, ...items]);
        } else {
          // Local state update fallback
          const newItem: NewsAnnouncement = {
            id: `news-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
          };
          setItems([newItem, ...items]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving announcement: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteNews(deletingId);
    } catch (err: any) {
      // Never drop the row from the view after a failed delete — it silently
      // reappears on the next refresh with no explanation to the operator.
      alert(`Could not delete this record: ${err.message}`);
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      return;
    }
    setItems(items.filter((it) => it.id !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const togglePublish = async (item: NewsAnnouncement) => {
    const updatedStatus = !item.is_published;
    try {
      await adminService.updateNews(item.id, { is_published: updatedStatus });
    } catch (e) {
      console.warn('Update in Supabase failed:', e);
    }
    setItems(items.map((it) => (it.id === item.id ? { ...it, is_published: updatedStatus } : it)));
  };

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.body.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || it.category === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' ? it.is_published : !it.is_published);
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            News & Public Announcements
          </h2>
          <p className="text-xs text-ink-muted">
            Manage municipal releases, MDRRMO disaster advisories, and official events.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded border border-accent-200 bg-accent-50 p-3 text-xs text-accent-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by title or content..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white"
          >
            <option value="all">All Categories</option>
            <option value="advisory">Advisories (MDRRMO)</option>
            <option value="event">Events</option>
            <option value="general">General Updates</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Title & Language</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading announcements from Supabase...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No announcements found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt=""
                          className="h-12 w-16 rounded object-cover border border-hairline"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded border border-dashed border-hairline bg-surface" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-bold text-navy leading-snug">{item.title}</p>
                      <p className="text-[11px] text-ink-muted truncate mt-1 line-clamp-1">
                        {item.body}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.category || 'general'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => togglePublish(item)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        <StatusBadge
                          status={item.is_published ? 'published' : 'draft'}
                          variant={item.is_published ? 'subtle' : 'solid'}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="row-action rounded text-navy hover:bg-surface transition-colors"
                          title="Edit announcement"
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
                          title="Delete announcement"
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

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit News Announcement' : 'Create News Announcement'}
        subtitle="Specify the official details for this release"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Title <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Free anti-rabies vaccination..."
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              >
                <option value="general">General Update</option>
                <option value="advisory">MDRRMO / Public Advisory</option>
                <option value="event">Official Event / Program</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Publish Status</label>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.is_published}
                    onChange={() => setFormData({ ...formData, is_published: true })}
                    className="text-navy"
                  />
                  <span>Published (Public)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.is_published}
                    onChange={() => setFormData({ ...formData, is_published: false })}
                    className="text-navy"
                  />
                  <span>Draft</span>
                </label>
              </div>
            </div>
          </div>

          <FileUploadInput
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            folder="news"
            label="Photo"
            accept="image/*"
            helpText="Optional. Shown at the top of the news card on the public site."
          />

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Body Content <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Full text of the announcement..."
              className="w-full rounded-md border border-hairline bg-white p-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
            <p className="mt-1 text-[11px] text-ink-muted">Write in whichever language you normally use.</p>
          </div>

          {/* Optional Bisaya version — collapsed so a normal post needs no extra work. */}
          <div className="rounded-md border border-hairline">
            <button
              type="button"
              onClick={() => setShowBisaya((v) => !v)}
              aria-expanded={showBisaya}
              aria-controls="news-bisaya-fields"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[0.8125rem] font-semibold text-brand-700 hover:bg-surface"
            >
              <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">
                {showBisaya ? 'Bisaya version' : '+ Add Bisaya version'}{' '}
                <span className="font-normal text-ink-muted">(optional)</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150 ${showBisaya ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {showBisaya && (
              <div id="news-bisaya-fields" className="space-y-3 border-t border-hairline p-3">
                <p className="text-[11px] leading-relaxed text-ink-muted">
                  The chatbot shows this version when someone asks in Bisaya. Leave it blank and it shows the main text
                  instead — useful for important posts like typhoon advisories.
                </p>
                <div>
                  <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800" htmlFor="news-title-bisaya">
                    Title (Bisaya)
                  </label>
                  <input
                    id="news-title-bisaya"
                    type="text"
                    value={formData.title_bisaya}
                    onChange={(e) => setFormData({ ...formData, title_bisaya: e.target.value })}
                    placeholder="e.g. Libre nga bakuna kontra rabies..."
                    className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800" htmlFor="news-body-bisaya">
                    Body (Bisaya)
                  </label>
                  <textarea
                    id="news-body-bisaya"
                    rows={4}
                    value={formData.body_bisaya}
                    onChange={(e) => setFormData({ ...formData, body_bisaya: e.target.value })}
                    placeholder="Ang tibuok anunsyo sa Bisaya..."
                    className="w-full rounded-md border border-hairline bg-white p-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
                  />
                </div>
              </div>
            )}
          </div>

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
              className="rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement? This action cannot be undone."
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
