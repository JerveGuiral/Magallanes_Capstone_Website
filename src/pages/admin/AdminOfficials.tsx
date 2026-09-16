import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users, Calendar, Image as ImageIcon } from 'lucide-react';
import { adminService, OfficialItem } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FileUploadInput } from '../../components/admin/FileUploadInput';

export function AdminOfficials() {
  const [items, setItems] = useState<OfficialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCurrent, setFilterCurrent] = useState<'all' | 'current' | 'former'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfficialItem | null>(null);
  const [formData, setFormData] = useState<{
    full_name: string;
    position: string;
    photo_url: string;
    term_start: string;
    term_end: string;
    is_current: boolean;
    display_order: number;
  }>({
    full_name: '',
    position: 'Municipal Mayor',
    photo_url: '',
    term_start: '2025-06-30',
    term_end: '2028-06-30',
    is_current: true,
    display_order: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getOfficials();
      if (!error && data && data.length > 0) {
        setItems(data as OfficialItem[]);
      } else {
        // Seed default municipal leadership
        const seed: OfficialItem[] = [
          {
            id: 'off-1',
            full_name: 'Hon. Cesar C. Cumba Jr.',
            position: 'Municipal Mayor',
            photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
            term_start: '2025-06-30',
            term_end: '2028-06-30',
            is_current: true,
            display_order: 1,
          },
          {
            id: 'off-2',
            full_name: 'Hon. Demosthenes H. Aragon',
            position: 'Municipal Vice Mayor',
            photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            term_start: '2025-06-30',
            term_end: '2028-06-30',
            is_current: true,
            display_order: 2,
          },
          {
            id: 'off-3',
            full_name: 'Hon. Reynaldo B. Perez',
            position: 'Sangguniang Bayan Member',
            photo_url: '',
            term_start: '2025-06-30',
            term_end: '2028-06-30',
            is_current: true,
            display_order: 3,
          },
          {
            id: 'off-4',
            full_name: 'Hon. Maria Elena S. Torralba',
            position: 'Sangguniang Bayan Member',
            photo_url: '',
            term_start: '2025-06-30',
            term_end: '2028-06-30',
            is_current: true,
            display_order: 4,
          },
        ];
        setItems(seed);
      }
    } catch (e) {
      console.warn('Could not fetch officials:', e);
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
      full_name: '',
      position: 'Sangguniang Bayan Member',
      photo_url: '',
      term_start: '2025-06-30',
      term_end: '2028-06-30',
      is_current: true,
      display_order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: OfficialItem) => {
    setEditingItem(item);
    setFormData({
      full_name: item.full_name,
      position: item.position,
      photo_url: item.photo_url || '',
      term_start: item.term_start || '',
      term_end: item.term_end || '',
      is_current: item.is_current,
      display_order: item.display_order || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateOfficial(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it)));
      } else {
        const { data } = await adminService.createOfficial(formData);
        if (data) {
          setItems([...items, data]);
        } else {
          const newItem: OfficialItem = {
            id: `official-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setItems([...items, newItem]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving official: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteOfficial(deletingId);
    } catch (e) {
      console.warn('Delete failed in Supabase:', e);
    }
    setItems(items.filter((it) => it.id !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const filteredItems = items
    .filter((it) => {
      const q = search.toLowerCase();
      const matchSearch =
        it.full_name.toLowerCase().includes(q) ||
        it.position.toLowerCase().includes(q);
      const matchStatus =
        filterCurrent === 'all'
          ? true
          : filterCurrent === 'current'
          ? it.is_current
          : !it.is_current;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Municipal Officials Directory
          </h2>
          <p className="text-xs text-ink-muted">
            Manage elected executive and legislative officials, official portraits, and historical terms of office.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Official</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officials by name or position..."
            className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>

        <select
          value={filterCurrent}
          onChange={(e) => setFilterCurrent(e.target.value as any)}
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none"
        >
          <option value="all">All Officials</option>
          <option value="current">Current Term Only</option>
          <option value="former">Former Officials (Historical)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Official</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Term Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading officials directory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No officials found matching query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      #{item.display_order || 0}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy">
                      <div className="flex items-center gap-3">
                        {item.photo_url ? (
                          <img
                            src={item.photo_url}
                            alt={item.full_name}
                            className="h-9 w-9 rounded-full object-cover border border-hairline"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-hairline text-slate-400">
                            <Users className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="leading-snug">{item.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal">
                      {item.position}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {item.term_start || 'Start'} to {item.term_end || 'End'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={item.is_current ? 'current' : 'archived'}
                        variant={item.is_current ? 'solid' : 'subtle'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
                          title="Edit official"
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
                          title="Delete record"
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
        title={editingItem ? 'Edit Municipal Official' : 'Add Municipal Official'}
        subtitle="Manage official identity, position order, and term validity"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy mb-1">
                Full Name <span className="text-alert">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Hon. Cesar C. Cumba Jr."
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Position / Title <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g. Municipal Mayor, Municipal Vice Mayor, SB Member"
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <FileUploadInput
            value={formData.photo_url}
            onChange={(url) => setFormData({ ...formData, photo_url: url })}
            folder="officials"
            label="Official Portrait Photo"
            accept="image/*"
            helpText="Upload image or provide direct photo URL"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Term Start Date</label>
              <input
                type="date"
                value={formData.term_start}
                onChange={(e) => setFormData({ ...formData, term_start: e.target.value })}
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Term End Date</label>
              <input
                type="date"
                value={formData.term_end}
                onChange={(e) => setFormData({ ...formData, term_end: e.target.value })}
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-navy font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                className="rounded border-hairline text-navy"
              />
              <span>Currently in Office (Publicly Listed on Front Page)</span>
            </label>
            <p className="text-[11px] text-ink-muted mt-1 ml-5">
              Unchecking keeps the official in records for historical transparency without displaying on the active roster.
            </p>
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
              {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Official'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Official Record"
        message="Are you sure you want to delete this official? For past leaders, consider unchecking 'Currently in Office' instead to preserve records."
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
