import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, Trash2Icon, AlertTriangleIcon, CheckCircleIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { FileUploadInput } from '../components/FileUploadInput';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { BidAward } from '../types';

export const BidsAwardsManager: React.FC = () => {
  const [items, setItems] = useState<BidAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<BidAward> | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getBids();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      reference_number: `ITB-${new Date().getFullYear()}-00${items.length + 1}`,
      status: 'open',
      posting_date: new Date().toISOString().split('T')[0],
      bid_opening_date: '',
      award_date: '',
      awarded_to: '',
      document_url: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BidAward) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this procurement bidding notice?')) {
      await supabaseAdmin.deleteBid(id);
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.posting_date) {
      alert('Please provide Title and Posting Date.');
      return;
    }

    await supabaseAdmin.saveBid(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  // Helper to determine if bid is upcoming (within 3 days) or overdue
  const getBidUrgency = (item: BidAward) => {
    if (item.status !== 'open' || !item.bid_opening_date) return null;
    const now = new Date();
    const opening = new Date(item.bid_opening_date);
    const diffMs = opening.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { type: 'overdue', label: `Overdue by ${Math.abs(diffDays)}d (Open past opening date)` };
    }
    if (diffDays <= 3) {
      return { type: 'upcoming', label: `Opening soon in ${diffDays}d` };
    }
    return null;
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const columns: Column<BidAward>[] = [
    {
      key: 'title',
      header: 'Procurement Title & Reference',
      sortable: true,
      render: (item) => {
        const urgency = getBidUrgency(item);
        return (
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {item.reference_number || 'ITB-TBD'}
              </span>
              {urgency && (
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold animate-pulse ${
                    urgency.type === 'overdue'
                      ? 'bg-alert-100 text-alert-900 border border-alert-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <AlertTriangleIcon className="h-3 w-3" />
                  {urgency.label}
                </span>
              )}
            </div>
            <p className="font-semibold text-navy text-sm mt-1 leading-snug">{item.title}</p>
            {item.awarded_to && (
              <p className="text-xs text-slate-500 mt-0.5">
                Awarded to: <span className="font-medium text-slate-700">{item.awarded_to}</span>
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Bidding Status',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
            item.status === 'open'
              ? 'bg-emerald-100 text-emerald-800'
              : item.status === 'awarded'
              ? 'bg-teal-100 text-teal-900'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'posting_date',
      header: 'Posting Date',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-slate-500">{item.posting_date}</span>,
    },
    {
      key: 'bid_opening_date',
      header: 'Bid Opening Date',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-700 font-medium">
          {item.bid_opening_date || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Document & Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.document_url && (
            <a
              href={item.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-teal hover:bg-teal-50"
              title="View Bid Document"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => handleOpenEdit(item)}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-navy"
            title="Edit Bid"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            className="rounded p-1.5 text-slate-400 hover:bg-alert-50 hover:text-alert"
            title="Delete Bid"
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
          <h2 className="font-display text-2xl font-bold text-navy">Bids & Awards (RA 9184)</h2>
          <p className="text-sm text-slate-500">
            PhilGEPS / LGU Invitation to Bid, notices of award, and procurement schedule compliance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Post Invitation to Bid
        </button>
      </div>

      <DataTable
        data={filteredItems}
        columns={columns}
        searchPlaceholder="Search procurement title, reference number, contractor..."
        rowHighlight={(item) => {
          const urgency = getBidUrgency(item);
          if (urgency?.type === 'overdue') return 'bg-alert-50/40';
          if (urgency?.type === 'upcoming') return 'bg-amber-50/40';
          return undefined;
        }}
        filterSlot={
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal focus:outline-none"
          >
            <option value="all">All Bidding Status</option>
            <option value="open">Open Opportunities</option>
            <option value="closed">Closed / Under Evaluation</option>
            <option value="awarded">Awarded Contracts</option>
          </select>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Bidding Notice' : 'Post Invitation to Bid'}
        subtitle="Flagged automatically if bid opening is within 3 days or open past opening date."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Project Title / Invitation to Bid Name *
            </label>
            <input
              type="text"
              required
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              placeholder="e.g. Construction of Flood Control Dike Along Lower Baug River"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Reference Number (ITB / PR Number)
              </label>
              <input
                type="text"
                value={editingItem?.reference_number || ''}
                onChange={(e) => setEditingItem({ ...editingItem, reference_number: e.target.value })}
                placeholder="ITB-2026-009"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Bidding Status *
              </label>
              <select
                value={editingItem?.status || 'open'}
                onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              >
                <option value="open">Open (Accepting Bids)</option>
                <option value="closed">Closed / Under Evaluation</option>
                <option value="awarded">Awarded</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Posting Date *
              </label>
              <input
                type="date"
                required
                value={editingItem?.posting_date || ''}
                onChange={(e) => setEditingItem({ ...editingItem, posting_date: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Bid Opening Date
              </label>
              <input
                type="date"
                value={editingItem?.bid_opening_date || ''}
                onChange={(e) => setEditingItem({ ...editingItem, bid_opening_date: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Notice of Award Date
              </label>
              <input
                type="date"
                value={editingItem?.award_date || ''}
                onChange={(e) => setEditingItem({ ...editingItem, award_date: e.target.value })}
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Awarded Contractor / Supplier (if awarded)
            </label>
            <input
              type="text"
              value={editingItem?.awarded_to || ''}
              onChange={(e) => setEditingItem({ ...editingItem, awarded_to: e.target.value })}
              placeholder="e.g. Caraga Construction and Supply Corp."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <FileUploadInput
            value={editingItem?.document_url || ''}
            onChange={(url) => setEditingItem({ ...editingItem, document_url: url })}
            folder="bids"
            label="Upload Bidding Document / Notice of Award (PDF)"
          />

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
              Save Procurement Record
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
