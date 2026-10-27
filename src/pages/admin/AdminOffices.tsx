import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Building2, User, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { adminService, OfficeItem } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export function AdminOffices() {
  const [items, setItems] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfficeItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    head_name: string;
    location: string;
    contact_number: string;
    email: string;
    office_hours: string;
  }>({
    name: '',
    head_name: '',
    location: '',
    contact_number: '',
    email: '',
    office_hours: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getOffices();
      if (error) throw error;
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as OfficeItem[]);
    } catch (e) {
      console.warn('Could not fetch offices:', e);
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
      head_name: '',
      // Blank, not guessed: the old pre-filled phone number was invented and got saved
      // whenever staff didn't overwrite it. Placeholders show the format instead.
      location: '',
      contact_number: '',
      email: '',
      office_hours: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: OfficeItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      head_name: item.head_name || '',
      location: item.location || '',
      contact_number: item.contact_number || '',
      email: item.email || '',
      office_hours: item.office_hours || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        const { data } = await adminService.updateOffice(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? (data as OfficeItem) : it)));
      } else {
        const { data } = await adminService.createOffice(formData);
        if (data) {
          setItems([...items, data]);
        } else {
          const newItem: OfficeItem = {
            id: `office-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setItems([...items, newItem]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving office: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteOffice(deletingId);
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

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.name.toLowerCase().includes(q) ||
      (it.head_name && it.head_name.toLowerCase().includes(q)) ||
      (it.location && it.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-800">
            Offices & Department Directory
          </h2>
          <p className="text-xs text-ink-muted">
            Maintain municipal departments, department heads, room locations, and public citizen desk lines.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Office</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offices by title, department head, or room..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Office & Department</th>
                <th className="py-3 px-4">Department Head</th>
                <th className="py-3 px-4">Hall Location</th>
                <th className="py-3 px-4">Direct Contacts</th>
                <th className="py-3 px-4">Office Hours</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading office directory...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No offices matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-800 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                        <span className="leading-snug">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-ink-subtle flex-shrink-0" />
                        <span>{item.head_name || 'Designated Officer'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-ink-subtle flex-shrink-0" />
                        <span>{item.location || 'Municipal Hall'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      <div>
                        {item.contact_number && (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-ink-subtle" />
                            <span>{item.contact_number}</span>
                          </p>
                        )}
                        {item.email && (
                          <p className="flex items-center gap-1 text-[11px] text-brand-600">
                            <Mail className="h-3 w-3" />
                            <span>{item.email}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-ink-subtle flex-shrink-0" />
                        <span>{item.office_hours || 'Mon-Fri 8am-5pm'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="row-action rounded text-brand-800 hover:bg-surface transition-colors"
                          title="Edit office"
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
                          title="Delete office"
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

      {/* Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Office Details' : 'Register Municipal Office'}
        subtitle="Manage public location and citizen contact endpoints"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Office / Department Name <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Business Permits and Licensing Office"
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Department Head</label>
              <input
                type="text"
                value={formData.head_name}
                onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
                placeholder="Full name & title"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Room / Floor Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Ground Floor, Room 3"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Contact Phone / Local</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="(085) 343-XXXX"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="office@magallanes.gov.ph"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Public Office Hours</label>
            <input
              type="text"
              value={formData.office_hours}
              onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
              placeholder="e.g. Monday – Friday, 8:00 AM – 5:00 PM"
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
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
              className="rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Office' : 'Save Office'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Office Directory Entry"
        message="Are you sure you want to delete this office listing?"
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
