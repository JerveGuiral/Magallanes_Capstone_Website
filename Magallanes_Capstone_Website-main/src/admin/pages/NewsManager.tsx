import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { NewsAnnouncement } from '../types';

export const NewsManager: React.FC = () => {
  const [items, setItems] = useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<NewsAnnouncement> | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const loadNews = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getNews();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      title_bisaya: '',
      body: '',
      body_bisaya: '',
      category: 'general',
      is_published: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NewsAnnouncement) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bulletin notice?')) {
      await supabaseAdmin.deleteNews(id);
      loadNews();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.body) {
      alert('Please fill in both the Title and Body.');
      return;
    }

    await supabaseAdmin.saveNews(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadNews();
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  const columns: Column<NewsAnnouncement>[] = [
    {
      key: 'title',
      header: 'Title & Summary',
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <p className="font-semibold text-navy leading-snug">{item.title}</p>
          {item.title_bisaya && (
            <p className="text-xs text-slate-500 italic mt-0.5">{item.title_bisaya}</p>
          )}
          <p className="line-clamp-1 text-xs text-slate-400 mt-1">{item.body}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
            item.category === 'advisory'
              ? 'bg-alert-100 text-alert-900'
              : item.category === 'event'
              ? 'bg-teal-100 text-teal-900'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.category}
        </span>
      ),
    },
    {
      key: 'is_published',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            item.is_published ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          {item.is_published ? (
            <>
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" /> Published
            </>
          ) : (
            <>
              <XCircleIcon className="h-3.5 w-3.5 text-slate-400" /> Draft
            </>
          )}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Posted Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.created_at).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(item)}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy transition-colors"
            title="Edit Article"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert transition-colors"
            title="Delete Article"
          >
            <Trash2Icon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">News & Public Announcements</h2>
          <p className="text-sm text-slate-500">
            Publish municipal advisories, notices, and events with bilingual English & Bisaya support.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      <DataTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="Search news titles, bodies, categories..."
        filterSlot={
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="general">General Updates</option>
            <option value="advisory">Official Advisories</option>
            <option value="event">Community Events</option>
          </select>
        }
      />

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Announcement' : 'Post New Announcement'}
        subtitle="Manage public bulletin visibility on the municipal home and news feeds."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={editingItem?.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="e.g. MDRRMO Weather Advisory #4"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Title (Bisaya / Sinugbuanon)
              </label>
              <input
                type="text"
                value={editingItem?.title_bisaya || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title_bisaya: e.target.value })}
                placeholder="e.g. Pahimangno sa Panahon gikan sa MDRRMO"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category *
              </label>
              <select
                value={editingItem?.category || 'general'}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    category: e.target.value as 'advisory' | 'event' | 'general',
                  })
                }
                className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              >
                <option value="general">General</option>
                <option value="advisory">Advisory (High Priority)</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Publishing Status
              </label>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingItem?.is_published ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
                  />
                  <span>Published immediately</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Content Body (English) *
            </label>
            <textarea
              required
              rows={4}
              value={editingItem?.body || ''}
              onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
              placeholder="Provide complete public details, office notices, or directives..."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Content Body (Bisaya Translation)
            </label>
            <textarea
              rows={3}
              value={editingItem?.body_bisaya || ''}
              onChange={(e) => setEditingItem({ ...editingItem, body_bisaya: e.target.value })}
              placeholder="Ibutang diri ang kompletong impormasyon sa pinulongang Bisaya..."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

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
              Save Announcement
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
