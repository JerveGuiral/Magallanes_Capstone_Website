import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Gavel, Calendar, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { adminService, bidUrgency, BidAwardItem } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { FileUploadInput } from '../../components/admin/FileUploadInput';

export function AdminBidsAwards() {
  const [items, setItems] = useState<BidAwardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BidAwardItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    reference_number: string;
    status: 'open' | 'closed' | 'awarded';
    posting_date: string;
    bid_opening_date: string;
    award_date: string;
    awarded_to: string;
    document_url: string;
  }>({
    title: '',
    reference_number: '',
    status: 'open',
    posting_date: new Date().toISOString().split('T')[0],
    bid_opening_date: '',
    award_date: '',
    awarded_to: '',
    document_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getBidsAwards();
      if (error) throw error;
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as BidAwardItem[]);
    } catch (e) {
      console.warn('Could not fetch bids from Supabase:', e);
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
      title: '',
      // Blank: a randomly generated BAC number looked official and was saved as the real one.
      reference_number: '',
      status: 'open',
      posting_date: new Date().toISOString().split('T')[0],
      bid_opening_date: '',
      award_date: '',
      awarded_to: '',
      document_url: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: BidAwardItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      reference_number: item.reference_number || '',
      status: item.status,
      posting_date: item.posting_date || '',
      bid_opening_date: item.bid_opening_date || '',
      award_date: item.award_date || '',
      awarded_to: item.awarded_to || '',
      document_url: item.document_url || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        const { data } = await adminService.updateBidAward(editingItem.id, formData);
        setItems(items.map((it) => (it.id === editingItem.id ? (data as BidAwardItem) : it)));
      } else {
        const { data } = await adminService.createBidAward(formData);
        if (data) {
          setItems([data, ...items]);
        } else {
          const newItem: BidAwardItem = {
            id: `bid-${Date.now()}`,
            ...formData,
            created_at: new Date().toISOString(),
          };
          setItems([newItem, ...items]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving procurement notice: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminService.deleteBidAward(deletingId);
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

  // Same rule the dashboard uses, so the two never disagree.
  const formUrgency = bidUrgency(formData);

  const filteredItems = items.filter((it) => {
    const matchSearch =
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      (it.reference_number && it.reference_number.toLowerCase().includes(search.toLowerCase())) ||
      (it.awarded_to && it.awarded_to.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || it.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-800">
            Bids & Awards Committee (BAC)
          </h2>
          <p className="text-xs text-ink-muted">
            Republic Act 9184 Government Procurement Reform Act notices, invitations to bid, and awardees.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Post Invitation to Bid</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project title, reference number, or awarded bidder..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-brand-800 focus:bg-white"
        >
          <option value="all">All Procurement Statuses</option>
          <option value="open">Open for Bidding</option>
          <option value="closed">Under Evaluation / Closed</option>
          <option value="awarded">Awarded to Bidder</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Project Title & Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Posting Date</th>
                <th className="py-3 px-4">Bid Opening Date</th>
                <th className="py-3 px-4">Award Details</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    Loading procurement records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No procurement records matching query.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const urgency = bidUrgency(item);
                  return (
                    <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-start gap-2">
                          <Gavel className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-brand-800 leading-snug">{item.title}</p>
                            <p className="font-mono text-[11px] text-brand-600 mt-0.5">
                              Ref: {item.reference_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={item.status} />
                          {urgency && (
                            <div
                              className={`flex items-center gap-1 text-[10px] font-mono font-bold ${
                                urgency.type === 'overdue' ? 'text-alert' : 'text-brand-700'
                              }`}
                              title={urgency.type === 'overdue' ? 'If the bids were already opened, edit this notice and set the status to Closed.' : undefined}
                            >
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              <span>{urgency.type === 'overdue' ? 'Opening date passed — set to Closed' : urgency.label}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-ink-muted">
                        {item.posting_date}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-ink">
                        {item.bid_opening_date ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-ink-subtle" />
                            <span>{item.bid_opening_date}</span>
                          </div>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-ink-light">
                        {item.status === 'awarded' && item.awarded_to ? (
                          <div>
                            <p className="font-semibold text-brand-800 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-accent-600" />
                              <span>{item.awarded_to}</span>
                            </p>
                            {item.award_date && (
                              <p className="text-[10px] font-mono text-ink-muted">
                                Date: {item.award_date}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted font-mono text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="row-actions">
                          {item.document_url && (
                            <a
                              href={item.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="row-action rounded text-brand-600 hover:bg-brand-50 transition-colors"
                              title="View Document"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="row-action rounded text-brand-800 hover:bg-surface transition-colors"
                            title="Edit notice"
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
                            title="Delete notice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Procurement Notice' : 'Post Invitation to Bid'}
        subtitle="Specify reference number, milestones, status, and PDF terms of reference"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Procurement / Project Title <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Concreting of Caloc-an Farm-to-Market Road"
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                BAC Reference Number <span className="text-alert">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="BAC-2026-XXX-XXX"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600 font-mono"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Procurement Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              >
                <option value="open">Open for Bidding</option>
                <option value="closed">Closed / Post-Qualification</option>
                <option value="awarded">Awarded to Bidder</option>
              </select>
            </div>
          </div>

          <p className="rounded-md border border-brand-100 bg-brand-50 p-3 text-[0.75rem] leading-relaxed text-ink">
            <strong className="text-brand-800">How the status moves:</strong> <strong>Open</strong> while bidders can submit →{' '}
            <strong>Closed</strong> once the bids are opened on the opening date → <strong>Awarded</strong> when the winner is
            chosen (add the award date and the winning bidder). An Open notice is flagged on the dashboard from 3 days before
            its opening date until you move it to Closed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Posting Date</label>
              <input
                type="date"
                required
                value={formData.posting_date}
                onChange={(e) => setFormData({ ...formData, posting_date: e.target.value })}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600 font-mono"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Bid Opening Date</label>
              <input
                type="date"
                value={formData.bid_opening_date}
                onChange={(e) => setFormData({ ...formData, bid_opening_date: e.target.value })}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600 font-mono"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">Notice of Award Date</label>
              <input
                type="date"
                value={formData.award_date}
                onChange={(e) => setFormData({ ...formData, award_date: e.target.value })}
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600 font-mono"
              />
            </div>
          </div>

          {formUrgency?.type === 'overdue' && (
            <div className="flex items-start gap-2 rounded-md border border-alert-600/25 bg-alert-50 p-3 text-[0.75rem] leading-relaxed text-alert-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This opening date is already in the past, but the status is still <strong>Open</strong>, so the notice will
                stay flagged on the dashboard. If the bids were opened,{' '}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 'closed' })}
                  className="font-semibold underline underline-offset-2"
                >
                  set the status to Closed
                </button>
                . If the date is a typo, check the year.
              </span>
            </div>
          )}
          {formData.bid_opening_date && formData.posting_date && formData.bid_opening_date < formData.posting_date && (
            <p className="text-[0.75rem] font-semibold text-alert-700">
              The bid opening date is earlier than the posting date — please check both dates.
            </p>
          )}

          {formData.status === 'awarded' && (
            <div>
              <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                Winning Bidder / Awarded Entity
              </label>
              <input
                type="text"
                value={formData.awarded_to}
                onChange={(e) => setFormData({ ...formData, awarded_to: e.target.value })}
                placeholder="Company / Contractor name"
                className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
              />
            </div>
          )}

          <FileUploadInput
            value={formData.document_url}
            onChange={(url) => setFormData({ ...formData, document_url: url })}
            folder="bids"
            label="Bidding Documents / Notice of Award (PDF)"
            accept=".pdf"
            helpText="Upload ITB / Terms of Reference PDF document"
          />

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
              {submitting ? 'Saving...' : editingItem ? 'Update Procurement Notice' : 'Post Bidding Opportunity'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Procurement Notice"
        message="Are you sure you want to delete this procurement record?"
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
