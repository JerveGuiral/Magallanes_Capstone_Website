import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, MapPin, Users, Phone } from 'lucide-react';
import { adminService, BarangayItem } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { BARANGAYS } from '../../data/site';

export function AdminBarangays() {
  const [items, setItems] = useState<BarangayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarangayItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    captain_name: string;
    contact_number: string;
    address: string;
    population: number;
  }>({
    name: '',
    captain_name: '',
    contact_number: '',
    address: 'Barangay Hall, Magallanes, Agusan del Norte',
    population: 500,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getBarangays();
      if (!error && data && data.length > 0) {
        setItems(data as BarangayItem[]);
      } else {
        // Seed from the 12 official barangays of Magallanes
        const seed: BarangayItem[] = BARANGAYS.map((b) => ({
          id: `seed-${b.name.toLowerCase()}`,
          name: b.name,
          captain_name: b.captain,
          contact_number: '+63 912 345 6789',
          address: `Barangay Hall, ${b.name}, Magallanes`,
          population: b.households * 4,
          created_at: new Date().toISOString(),
        }));
        setItems(seed);
      }
    } catch (e) {
      console.warn('Could not fetch barangays from Supabase:', e);
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
      name: '',
      captain_name: '',
      contact_number: '+63 ',
      address: 'Barangay Hall, Magallanes, Agusan del Norte',
      population: 500,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: BarangayItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      captain_name: item.captain_name || '',
      contact_number: item.contact_number || '',
      address: item.address || '',
      population: item.population || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateBarangay(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it)));
      } else {
        const { data } = await adminService.createBarangay(formData);
        if (data) {
          setItems([...items, data]);
        } else {
          const newItem: BarangayItem = {
            id: `brgy-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setItems([...items, newItem]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving barangay: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteBarangay(deletingId);
    } catch (e) {
      console.warn('Delete in Supabase failed:', e);
    }
    setItems(items.filter((it) => it.id !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      (it.captain_name && it.captain_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            12 Barangays of Magallanes
          </h2>
          <p className="text-xs text-ink-muted">
            Manage local barangay leadership, headquarters address, emergency contacts, and demographic population.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Barangay Record</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Barangay name or Barangay Captain..."
            className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4">Barangay Name</th>
                <th className="py-3 px-4">Barangay Captain (Punong Barangay)</th>
                <th className="py-3 px-4">Contact Number</th>
                <th className="py-3 px-4">Hall Address</th>
                <th className="py-3 px-4">Est. Population</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading barangay records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No barangay records found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink">
                      {item.captain_name || 'Hon. Punong Barangay'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span>{item.contact_number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted truncate max-w-xs">
                      {item.address || 'Magallanes, Agusan del Norte'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-navy">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.population?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
                          title="Edit barangay"
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
                          title="Delete barangay"
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
        title={editingItem ? 'Edit Barangay Record' : 'Register New Barangay'}
        subtitle="Manage official barangay profile and contact information"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Barangay Name <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Poblacion, Caloc-an, Guiapo..."
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Punong Barangay (Captain Name)
            </label>
            <input
              type="text"
              value={formData.captain_name}
              onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
              placeholder="e.g. Hon. Ramon L. Dizon"
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Population</label>
              <input
                type="number"
                value={formData.population}
                onChange={(e) => setFormData({ ...formData, population: parseInt(e.target.value) || 0 })}
                placeholder="Total residents"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Barangay Hall Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street / Purok location"
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
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
              {submitting ? 'Saving...' : editingItem ? 'Update Barangay' : 'Save Barangay'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Barangay Record"
        message="Are you sure you want to delete this barangay record? This will remove its public listing."
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
