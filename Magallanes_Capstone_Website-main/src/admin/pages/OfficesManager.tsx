import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, Building2Icon, MapPinIcon, PhoneIcon, MailIcon, ClockIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { OfficeItem } from '../types';

export const OfficesManager: React.FC = () => {
  const [items, setItems] = useState<OfficeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<OfficeItem> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getOffices();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      name: '',
      head_name: '',
      location: 'Ground Floor, Municipal Hall',
      contact_number: '(085) 343-2000',
      email: 'info@magallanes.gov.ph',
      office_hours: '8:00 AM – 5:00 PM (Monday to Friday)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: OfficeItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this municipal office record?')) {
      await supabaseAdmin.deleteOffice(id);
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name) {
      alert('Please provide Office Name.');
      return;
    }

    await supabaseAdmin.saveOffice(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const columns: Column<OfficeItem>[] = [
    {
      key: 'name',
      header: 'Office Name',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-semibold text-navy text-sm">{item.name}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPinIcon className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{item.location || 'Municipal Hall'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'head_name',
      header: 'Department / Office Head',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-slate-700 text-sm">
          {item.head_name || '—'}
        </span>
      ),
    },
    {
      key: 'contact_number',
      header: 'Contact Line & Email',
      render: (item) => (
        <div className="space-y-0.5 text-xs text-slate-600 font-mono">
          {item.contact_number && (
            <div className="flex items-center gap-1.5">
              <PhoneIcon className="h-3 w-3 text-teal" />
              <span>{item.contact_number}</span>
            </div>
          )}
          {item.email && (
            <div className="flex items-center gap-1.5 font-sans text-slate-500">
              <MailIcon className="h-3 w-3 text-slate-400" />
              <span>{item.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'office_hours',
      header: 'Public Hours',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <ClockIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>{item.office_hours || '8:00 AM – 5:00 PM'}</span>
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
            title="Edit Office"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert"
            title="Delete Office"
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
          <h2 className="font-display text-2xl font-bold text-navy">Municipal Offices Directory</h2>
          <p className="text-sm text-slate-500">
            Frontline departments, heads of office, room locations, and direct contact lines for citizen assistance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Office
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search office name, department head, room location..."
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Municipal Office' : 'Add New Municipal Office'}
        subtitle="Citizen transactions reference these office locations."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Office / Department Name *
              </label>
              <input
                type="text"
                required
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="e.g. Business Permits and Licensing Office"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Head of Office
              </label>
              <input
                type="text"
                value={editingItem?.head_name || ''}
                onChange={(e) => setEditingItem({ ...editingItem, head_name: e.target.value })}
                placeholder="e.g. Atty. Rolando P. Sarmiento"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Room / Physical Location
              </label>
              <input
                type="text"
                value={editingItem?.location || ''}
                onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                placeholder="e.g. Ground Floor, Room 102"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={editingItem?.contact_number || ''}
                onChange={(e) => setEditingItem({ ...editingItem, contact_number: e.target.value })}
                placeholder="(085) 343-2000"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Official Email Address
              </label>
              <input
                type="email"
                value={editingItem?.email || ''}
                onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                placeholder="bplo@magallanes.gov.ph"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Operating Hours
              </label>
              <input
                type="text"
                value={editingItem?.office_hours || ''}
                onChange={(e) => setEditingItem({ ...editingItem, office_hours: e.target.value })}
                placeholder="8:00 AM – 5:00 PM (Monday to Friday)"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
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
              Save Office
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
