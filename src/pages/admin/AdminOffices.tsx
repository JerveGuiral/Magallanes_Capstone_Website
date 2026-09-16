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
    location: 'Ground Floor, Municipal Hall',
    contact_number: '(085) 343-0123',
    email: 'office@magallanes.gov.ph',
    office_hours: 'Monday – Friday, 8:00 AM – 5:00 PM',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getOffices();
      if (!error && data && data.length > 0) {
        setItems(data as OfficeItem[]);
      } else {
        // Seed default municipal offices
        const seed: OfficeItem[] = [
          {
            id: 'off-1',
            name: 'Office of the Municipal Mayor',
            head_name: 'Hon. Cesar C. Cumba Jr.',
            location: '2nd Floor, Executive Wing, Municipal Hall',
            contact_number: '(085) 343-0123 loc 101',
            email: 'mayor@magallanes.gov.ph',
            office_hours: 'Mon-Fri, 8:00 AM – 5:00 PM',
            created_at: new Date().toISOString(),
          },
          {
            id: 'off-2',
            name: 'Business Permits & Licensing Office (BPLO)',
            head_name: 'Engr. Roberto M. Salcedo',
            location: 'Ground Floor, Lobby (Business One-Stop Shop)',
            contact_number: '(085) 343-0123 loc 104',
            email: 'bplo@magallanes.gov.ph',
            office_hours: 'Mon-Fri, 8:00 AM – 5:00 PM',
            created_at: new Date().toISOString(),
          },
          {
            id: 'off-3',
            name: 'Municipal Civil Registrar (MCR)',
            head_name: 'Atty. Maria Carmela S. Gomez',
            location: 'Ground Floor, Right Wing',
            contact_number: '(085) 343-0123 loc 105',
            email: 'civilregistry@magallanes.gov.ph',
            office_hours: 'Mon-Fri, 8:00 AM – 5:00 PM',
            created_at: new Date().toISOString(),
          },
          {
            id: 'off-4',
            name: 'Municipal Disaster Risk Reduction & Management Office (MDRRMO)',
            head_name: 'Mr. Alexandro P. Tan',
            location: 'MDRRMO Command Center, Poblacion',
            contact_number: 'Emergency: 911 / (085) 816-0911',
            email: 'mdrrmo@magallanes.gov.ph',
            office_hours: '24/7 Operations',
            created_at: new Date().toISOString(),
          },
        ];
        setItems(seed);
      }
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
      location: 'Ground Floor, Municipal Hall',
      contact_number: '(085) 343-0123',
      email: '',
      office_hours: 'Monday – Friday, 8:00 AM – 5:00 PM',
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
      office_hours: item.office_hours || 'Mon-Fri, 8am-5pm',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateOffice(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it)));
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
      (it.head_name && it.head_name.toLowerCase().includes(q)) ||
      (it.location && it.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Offices & Department Directory
          </h2>
          <p className="text-xs text-ink-muted">
            Maintain municipal departments, department heads, room locations, and public citizen desk lines.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Office</span>
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
            placeholder="Search offices by title, department head, or room..."
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
                    <td className="py-3.5 px-4 font-bold text-navy max-w-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal flex-shrink-0" />
                        <span className="leading-snug">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{item.head_name || 'Designated Officer'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{item.location || 'Municipal Hall'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-muted">
                      <div>
                        {item.contact_number && (
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{item.contact_number}</span>
                          </p>
                        )}
                        {item.email && (
                          <p className="flex items-center gap-1 text-[11px] text-teal">
                            <Mail className="h-3 w-3" />
                            <span>{item.email}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span>{item.office_hours || 'Mon-Fri 8am-5pm'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
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
                          className="rounded p-1.5 text-alert hover:bg-red-50 transition-colors"
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
            <label className="block text-xs font-semibold text-navy mb-1">
              Office / Department Name <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Business Permits and Licensing Office"
              className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Department Head</label>
              <input
                type="text"
                value={formData.head_name}
                onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
                placeholder="Full name & title"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Room / Floor Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Ground Floor, Room 3"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Contact Phone / Local</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                placeholder="(085) 343-XXXX"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="office@magallanes.gov.ph"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Public Office Hours</label>
            <input
              type="text"
              value={formData.office_hours}
              onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
              placeholder="e.g. Monday – Friday, 8:00 AM – 5:00 PM"
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
