import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, UserCheckIcon, UserXIcon, ArrowUpDownIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { FileUploadInput } from '../components/FileUploadInput';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { OfficialItem } from '../types';

export const OfficialsManager: React.FC = () => {
  const [items, setItems] = useState<OfficialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<OfficialItem> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getOfficials();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      full_name: '',
      position: 'SB Member',
      photo_url: '',
      term_start: '2025-06-30',
      term_end: '2028-06-30',
      is_current: true,
      display_order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: OfficialItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this official record?')) {
      await supabaseAdmin.deleteOfficial(id);
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.full_name || !editingItem?.position) {
      alert('Please provide Full Name and Position.');
      return;
    }

    await supabaseAdmin.saveOfficial(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const columns: Column<OfficialItem>[] = [
    {
      key: 'display_order',
      header: 'Order',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 rounded px-2 py-1">
          #{item.display_order}
        </span>
      ),
    },
    {
      key: 'full_name',
      header: 'Official Name & Photo',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-navy/10 overflow-hidden flex items-center justify-center text-navy font-bold text-xs ring-1 ring-slate-200 shrink-0">
            {item.photo_url ? (
              <img src={item.photo_url} alt={item.full_name} className="h-full w-full object-cover" />
            ) : (
              item.full_name.charAt(item.full_name.startsWith('Hon.') ? 5 : 0)
            )}
          </div>
          <div>
            <p className="font-semibold text-navy text-sm">{item.full_name}</p>
            <p className="text-xs text-teal font-medium">{item.position}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'term_start',
      header: 'Term Period',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.term_start && item.term_end ? `${item.term_start.split('-')[0]} – ${item.term_end.split('-')[0]}` : 'Incumbent'}
        </span>
      ),
    },
    {
      key: 'is_current',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            item.is_current ? 'text-emerald-700' : 'text-slate-400'
          }`}
        >
          {item.is_current ? (
            <>
              <UserCheckIcon className="h-3.5 w-3.5 text-emerald-600" /> Active Incumbent
            </>
          ) : (
            <>
              <UserXIcon className="h-3.5 w-3.5 text-slate-400" /> Past Term
            </>
          )}
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
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy"
            title="Edit Official"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert"
            title="Delete Official"
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
          <h2 className="font-display text-2xl font-bold text-navy">Municipal Officials Roster</h2>
          <p className="text-sm text-slate-500">
            Manage the Mayor, Vice Mayor, Sangguniang Bayan members, and department heads with display hierarchy.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Official
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search officials by name, position, term..."
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Official Profile' : 'Add New Municipal Official'}
        subtitle="Historical records are preserved by setting 'Active Incumbent' status."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Full Name (with Title) *
              </label>
              <input
                type="text"
                required
                value={editingItem?.full_name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, full_name: e.target.value })}
                placeholder="Hon. Isidro C. Villanueva"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Position / Designation *
              </label>
              <input
                type="text"
                required
                value={editingItem?.position || ''}
                onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
                placeholder="Municipal Mayor / SB Member"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Display Order
              </label>
              <input
                type="number"
                value={editingItem?.display_order || 1}
                onChange={(e) => setEditingItem({ ...editingItem, display_order: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">1 = Mayor, 2 = Vice Mayor, etc.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Term Start Date
              </label>
              <input
                type="date"
                value={editingItem?.term_start || ''}
                onChange={(e) => setEditingItem({ ...editingItem, term_start: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Term End Date
              </label>
              <input
                type="date"
                value={editingItem?.term_end || ''}
                onChange={(e) => setEditingItem({ ...editingItem, term_end: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <FileUploadInput
            value={editingItem?.photo_url || ''}
            onChange={(url) => setEditingItem({ ...editingItem, photo_url: url })}
            folder="officials"
            label="Official Portrait Photo"
          />

          <div className="rounded border border-slate-100 bg-slate-50 p-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={editingItem?.is_current ?? true}
                onChange={(e) => setEditingItem({ ...editingItem, is_current: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal focus:ring-teal"
              />
              <span>Is currently active incumbent (display publicly)</span>
            </label>
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
              Save Official
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
