import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Clock, Banknote, Building, AlertCircle } from 'lucide-react';
import { adminService, ServiceItem } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { SERVICES } from '../../data/site';

export function AdminServices() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    name_bisaya: string;
    category: string;
    requirements: string;
    requirements_bisaya: string;
    fee: string;
    processing_time: string;
    office: string;
  }>({
    name: '',
    name_bisaya: '',
    category: 'business-permit',
    requirements: '',
    requirements_bisaya: '',
    fee: 'Free of Charge',
    processing_time: '1-3 Business Days',
    office: 'Business Permits & Licensing Office',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getServices();
      if (!error && data && data.length > 0) {
        setItems(data as ServiceItem[]);
      } else {
        // Seed from static site services
        const seed: ServiceItem[] = SERVICES.map((s) => ({
          id: `seed-${s.id}`,
          name: s.label,
          name_bisaya: `Serbisyo: ${s.label}`,
          category: s.icon,
          requirements: 'Barangay Clearance, Valid Government ID, Duly accomplished application form.',
          requirements_bisaya: 'Barangay Clearance, Balido nga ID sa gobyerno, Gipuno nga porma.',
          fee: s.id === 'svc-permit' ? 'Based on Gross Capital' : 'Free / Minimal Fee',
          processing_time: '1 to 2 Working Days',
          office: s.office,
          created_at: new Date().toISOString(),
        }));
        setItems(seed);
      }
    } catch (e) {
      console.warn('Could not fetch services from Supabase:', e);
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
      name_bisaya: '',
      category: 'business-permit',
      requirements: '',
      requirements_bisaya: '',
      fee: 'Free of Charge',
      processing_time: '1-3 Business Days',
      office: 'Business Permits & Licensing Office',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      name_bisaya: item.name_bisaya || '',
      category: item.category || 'general',
      requirements: item.requirements,
      requirements_bisaya: item.requirements_bisaya || '',
      fee: item.fee || 'Free of Charge',
      processing_time: item.processing_time || '1-3 Days',
      office: item.office || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateService(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...formData } : it)));
      } else {
        const { data } = await adminService.createService(formData);
        if (data) {
          setItems([...items, data]);
        } else {
          const newItem: ServiceItem = {
            id: `service-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setItems([...items, newItem]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving service: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteService(deletingId);
    } catch (e) {
      console.warn('Delete in Supabase failed:', e);
    }
    setItems(items.filter((it) => it.id !== deletingId));
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.office && it.office.toLowerCase().includes(search.toLowerCase())) ||
      it.requirements.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || it.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Citizen's Charter & Municipal Services
          </h2>
          <p className="text-xs text-ink-muted">
            Manage frontline government processes, citizen requirements, processing timelines, and official fees.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services by name, requirements, or office..."
            className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy"
          />
        </div>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-mono text-[11px] uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Office In-Charge</th>
                <th className="py-3 px-4">Standard Fee</th>
                <th className="py-3 px-4">Processing Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading citizen charter services...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No services found matching your search.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-navy leading-snug">{item.name}</p>
                      {item.name_bisaya && (
                        <p className="font-mono text-[11px] text-teal mt-0.5">{item.name_bisaya}</p>
                      )}
                      <p className="text-[11px] text-ink-muted mt-1 line-clamp-1">
                        Req: {item.requirements}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{item.office || 'Municipal Hall'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <Banknote className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{item.fee || 'Free'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-ink-light">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-teal flex-shrink-0" />
                        <span>{item.processing_time || '1-2 Days'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
                          title="Edit service"
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
                          title="Delete service"
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
        title={editingItem ? "Edit Citizen's Service" : 'Add New Municipal Service'}
        subtitle="Citizen Charter parameters compliant with Anti-Red Tape Authority (ARTA)"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Service Name (English) <span className="text-alert">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Business Permit Application"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">
                Service Name (Bisaya Translation)
              </label>
              <input
                type="text"
                value={formData.name_bisaya}
                onChange={(e) => setFormData({ ...formData, name_bisaya: e.target.value })}
                placeholder="e.g. Pagproseso sa Mayor's Permit"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Office In-Charge</label>
              <input
                type="text"
                required
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                placeholder="e.g. BPLO / MCR / MTO"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Fee / Assessment</label>
              <input
                type="text"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="e.g. Free or ₱150.00"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Processing Time</label>
              <input
                type="text"
                value={formData.processing_time}
                onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                placeholder="e.g. 1 to 2 working days"
                className="w-full rounded border border-hairline px-3 py-2 text-xs text-ink focus:border-navy focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Required Documents (English) <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List required IDs, certifications, clearances..."
              className="w-full rounded border border-hairline p-3 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Required Documents (Bisaya Translation)
            </label>
            <textarea
              rows={3}
              value={formData.requirements_bisaya}
              onChange={(e) => setFormData({ ...formData, requirements_bisaya: e.target.value })}
              placeholder="Mga gikinahanglan nga dokumento o ID..."
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
              {submitting ? 'Saving...' : editingItem ? 'Save Service Changes' : 'Register Service'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Citizen Service"
        message="Are you sure you want to remove this service from the Citizen's Charter? This removes it from the website directory."
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
