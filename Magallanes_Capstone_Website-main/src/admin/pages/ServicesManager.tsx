import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, ClockIcon, CoinsIcon, BuildingIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { ServiceItem, OfficeItem } from '../types';

export const ServicesManager: React.FC = () => {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ServiceItem> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [servicesData, officesData] = await Promise.all([
      supabaseAdmin.getServices(),
      supabaseAdmin.getOffices(),
    ]);
    setItems(servicesData);
    setOffices(officesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      name: '',
      name_bisaya: '',
      category: 'Business & Trade',
      requirements: '',
      requirements_bisaya: '',
      fee: 'Free',
      processing_time: '1 to 2 business days',
      office: offices[0]?.name || 'Business Permits and Licensing Office (BPLO)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ServiceItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service from the Citizen’s Charter?')) {
      await supabaseAdmin.deleteService(id);
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.requirements) {
      alert('Please provide Service Name and Requirements.');
      return;
    }

    await supabaseAdmin.saveService(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const columns: Column<ServiceItem>[] = [
    {
      key: 'name',
      header: 'Service Name',
      sortable: true,
      render: (item) => (
        <div className="max-w-sm">
          <p className="font-semibold text-navy leading-snug">{item.name}</p>
          {item.name_bisaya && (
            <p className="text-xs text-slate-500 italic mt-0.5">{item.name_bisaya}</p>
          )}
          <span className="inline-block mt-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
            {item.category}
          </span>
        </div>
      ),
    },
    {
      key: 'requirements',
      header: 'Requirements & Guidelines',
      render: (item) => (
        <div className="max-w-xs text-xs text-slate-600">
          <p className="line-clamp-2 leading-relaxed">{item.requirements}</p>
        </div>
      ),
    },
    {
      key: 'fee',
      header: 'Fee & Cost',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <CoinsIcon className="h-3.5 w-3.5 text-teal shrink-0" />
          <span>{item.fee || 'None'}</span>
        </div>
      ),
    },
    {
      key: 'processing_time',
      header: 'Processing Time',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <ClockIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{item.processing_time || '1 day'}</span>
        </div>
      ),
    },
    {
      key: 'office',
      header: 'Responsible Office',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <BuildingIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[160px]">{item.office || 'Municipal Hall'}</span>
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
            title="Edit Service"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert"
            title="Delete Service"
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
          <h2 className="font-display text-2xl font-bold text-navy">Services (Citizen’s Charter)</h2>
          <p className="text-sm text-slate-500">
            Define requirements, processing steps, fees, and responsible offices for public frontline transactions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Service
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search services, requirements, fees, offices..."
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Citizen Service' : 'Add New Citizen Service'}
        subtitle="Ensure compliance with Republic Act No. 11032 (Ease of Doing Business Act)."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Name (English) *
              </label>
              <input
                type="text"
                required
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="e.g. Application for Business Permit"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Service Name (Bisaya Translation)
              </label>
              <input
                type="text"
                value={editingItem?.name_bisaya || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name_bisaya: e.target.value })}
                placeholder="e.g. Pag-apply og Business Permit"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <input
                type="text"
                value={editingItem?.category || ''}
                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                placeholder="e.g. Civil Registry, Business"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Fee / Schedule of Cost
              </label>
              <input
                type="text"
                value={editingItem?.fee || ''}
                onChange={(e) => setEditingItem({ ...editingItem, fee: e.target.value })}
                placeholder="e.g. ₱100.00 / Free"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Processing Time
              </label>
              <input
                type="text"
                value={editingItem?.processing_time || ''}
                onChange={(e) => setEditingItem({ ...editingItem, processing_time: e.target.value })}
                placeholder="e.g. 1 business day"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Responsible Office
            </label>
            <select
              value={editingItem?.office || ''}
              onChange={(e) => setEditingItem({ ...editingItem, office: e.target.value })}
              className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            >
              <option value="">Select responsible municipal office...</option>
              {offices.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
              <option value="Municipal Health Office (MHO)">Municipal Health Office (MHO)</option>
              <option value="Local Civil Registry Office (LCRO)">Local Civil Registry Office (LCRO)</option>
              <option value="Municipal Treasury Office">Municipal Treasury Office</option>
              <option value="Municipal Social Welfare & Development Office (MSWDO)">MSWDO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Checklist of Requirements (English) *
            </label>
            <textarea
              required
              rows={3}
              value={editingItem?.requirements || ''}
              onChange={(e) => setEditingItem({ ...editingItem, requirements: e.target.value })}
              placeholder="1. Valid Government ID, 2. Barangay Clearance, 3. DTI Registration..."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Checklist of Requirements (Bisaya Translation)
            </label>
            <textarea
              rows={2}
              value={editingItem?.requirements_bisaya || ''}
              onChange={(e) => setEditingItem({ ...editingItem, requirements_bisaya: e.target.value })}
              placeholder="1. Balidong ID, 2. Barangay Clearance..."
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
              Save Service
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
