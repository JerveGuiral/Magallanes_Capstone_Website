import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, UsersIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { BarangayItem } from '../types';

export const BarangaysManager: React.FC = () => {
  const [items, setItems] = useState<BarangayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BarangayItem> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getBarangays();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      name: '',
      captain_name: '',
      contact_number: '',
      address: '',
      population: 1500,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BarangayItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this barangay record?')) {
      await supabaseAdmin.deleteBarangay(id);
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name) {
      alert('Please provide Barangay Name.');
      return;
    }

    await supabaseAdmin.saveBarangay(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const totalPopulation = items.reduce((acc, b) => acc + (b.population || 0), 0);

  const columns: Column<BarangayItem>[] = [
    {
      key: 'name',
      header: 'Barangay Name',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-navy text-sm">Barangay {item.name}</p>
          {item.address && (
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPinIcon className="h-3 w-3 text-slate-400" />
              {item.address}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'captain_name',
      header: 'Punong Barangay (Captain)',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-slate-700 text-sm">
          {item.captain_name || '—'}
        </span>
      ),
    },
    {
      key: 'contact_number',
      header: 'Emergency / Contact No.',
      render: (item) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
          <PhoneIcon className="h-3.5 w-3.5 text-teal" />
          <span>{item.contact_number || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'population',
      header: 'Population Census',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
          <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
          <span>{item.population?.toLocaleString() || 0} residents</span>
        </div>
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
            title="Edit Barangay"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert"
            title="Delete Barangay"
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
          <h2 className="font-display text-2xl font-bold text-navy">Barangay Directory & Demographics</h2>
          <p className="text-sm text-slate-500">
            Official records for the 12 barangays of Magallanes, Agusan del Norte, including leadership and census data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Barangay
        </button>
      </div>

      {/* Summary Pill */}
      <div className="flex items-center gap-6 rounded border border-slate-200 bg-white px-5 py-3 shadow-subtle text-xs">
        <div>
          <span className="text-slate-500">Total Barangays: </span>
          <span className="font-bold text-navy">{items.length} units</span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div>
          <span className="text-slate-500">Total Registered Census Population: </span>
          <span className="font-bold text-teal">{totalPopulation.toLocaleString()} residents</span>
        </div>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search barangay, captain name, address..."
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Barangay Information' : 'Add New Barangay'}
        subtitle="Maintain official local leadership and demographic data."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Barangay Name *
              </label>
              <input
                type="text"
                required
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="e.g. Poblacion / Buhang"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Punong Barangay (Captain)
              </label>
              <input
                type="text"
                value={editingItem?.captain_name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, captain_name: e.target.value })}
                placeholder="Hon. Juan Dela Cruz"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Contact / Hotline Number
              </label>
              <input
                type="text"
                value={editingItem?.contact_number || ''}
                onChange={(e) => setEditingItem({ ...editingItem, contact_number: e.target.value })}
                placeholder="0917 000 0000"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Population Census
              </label>
              <input
                type="number"
                value={editingItem?.population || 0}
                onChange={(e) => setEditingItem({ ...editingItem, population: Number(e.target.value) })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Barangay Hall Address / Landmark
            </label>
            <input
              type="text"
              value={editingItem?.address || ''}
              onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
              placeholder="e.g. Purok 1, Riverside Delta Road"
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
              Save Barangay
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
