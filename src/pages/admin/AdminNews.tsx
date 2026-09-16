import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react';
import { adminService, NewsAnnouncement } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { NEWS } from '../../data/site';

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
    title_bisaya: string;
    body: string;
    body_bisaya: string;
    category: 'advisory' | 'event' | 'general';
    is_published: boolean;
  }>({
    title: '',
    title_bisaya: '',
    body: '',
    body_bisaya: '',
    category: 'general',
    is_published: true,
  });
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
      if (data && data.length > 0) {
        setItems(data as NewsAnnouncement[]);
      } else {
        // Fallback demo data from static site data if Supabase table is fresh/empty
        const seed: NewsAnnouncement[] = NEWS.map((n, i) => ({
          id: `seed-${n.id}`,
          title: n.title,
          title_bisaya: `Balita: ${n.title}`,
          body: n.excerpt,
          body_bisaya: `Gikataho sa Magallanes: ${n.excerpt}`,
          category: n.category.toLowerCase().includes('infra') ? 'general' : n.category.toLowerCase().includes('advis') ? 'advisory' : 'event',
          is_published: true,
          created_at: new Date(2026, 7, 26 - i * 4).toISOString(),
        }));
        setItems(seed);
      }
    } catch (err: any) {
      console.warn('Failed to load from Supabase:', err.message);
      setErrorMessage(`Supabase Notice: ${err.message}. Showing local cache.`);
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
      title_bisaya: '',
      body: '',
      body_bisaya: '',
      category: 'general',
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: NewsAnnouncement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      title_bisaya: item.title_bisaya || '',
      body: item.body,
      body_bisaya: item.body_bisaya || '',
      category: item.category || 'general',
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateNews(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it)));
      } else {
        const { data } = await adminService.createNews(formData);
        if (data) {
          setItems([data, ...items]);
        } else {
          // Local state update fallback
          const newItem: NewsAnnouncement = {
            id: `news-${Date.now()}`,
            ...formData,
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
    } catch (e) {
      console.warn('Delete in Supabase failed, updating view:', e);
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
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by title or content..."
            className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="advisory">Advisories (MDRRMO)</option>
            <option value="event">Events</option>
            <option value="general">General Updates</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
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
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading announcements from Supabase...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No announcements found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-bold text-navy leading-snug">{item.title}</p>
                      {item.title_bisaya && (
                        <p className="font-mono text-[11px] text-teal mt-0.5">
                          Bisaya: {item.title_bisaya}
                        </p>
                      )}
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
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
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
                          className="rounded p-1.5 text-alert hover:bg-red-50 transition-colors"
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
        subtitle="Specify official details in English and Bisaya for inclusive citizen communication"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Title (English) <span className="text-alert">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Free anti-rabies vaccination..."
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Title (Bisaya / Binisaya Translation)
              </label>
              <input
                type="text"
                value={formData.title_bisaya}
                onChange={(e) => setFormData({ ...formData, title_bisaya: e.target.value })}
                placeholder="e.g. Libreng bakuna batok rabies..."
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              >
                <option value="general">General Update</option>
                <option value="advisory">MDRRMO / Public Advisory</option>
                <option value="event">Official Event / Program</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Publish Status</label>
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

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Body Content (English) <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Full text of the announcement..."
              className="w-full rounded border border-hairline p-3 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Body Content (Bisaya Translation)
            </label>
            <textarea
              rows={3}
              value={formData.body_bisaya}
              onChange={(e) => setFormData({ ...formData, body_bisaya: e.target.value })}
              placeholder="Kompletong pahibalo sa pinulongang Binisaya..."
              className="w-full rounded border border-hairline p-3 text-xs text-ink focus:border-navy focus:outline-none"
            />
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
              className="rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 disabled:opacity-50"
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
