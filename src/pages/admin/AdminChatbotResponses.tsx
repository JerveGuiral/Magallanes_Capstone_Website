import React, { useEffect, useState } from 'react';
import { Bot, Search, Pencil, Plus, CheckCircle2, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService, IntentResponse } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';

export function AdminChatbotResponses() {
  const [items, setItems] = useState<IntentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntentResponse | null>(null);
  const [formData, setFormData] = useState<{
    intent_name: string;
    response_en: string;
    response_bisaya: string;
  }>({
    intent_name: '',
    response_en: '',
    response_bisaya: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getIntentResponses();
      if (error) throw error;
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as IntentResponse[]);
    } catch (e) {
      console.warn('Could not fetch intent responses:', e);
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
      intent_name: '',
      response_en: '',
      response_bisaya: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (item: IntentResponse) => {
    setEditingItem(item);
    setFormData({
      intent_name: item.intent_name,
      response_en: item.response_en,
      response_bisaya: item.response_bisaya,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateIntentResponse(editingItem.id, formData);
        setItems(
          items.map((it) =>
            it.id === editingItem.id
              ? { ...it, ...formData, updated_at: new Date().toISOString() }
              : it
          )
        );
      } else {
        const { data } = await adminService.upsertIntentResponse(formData);
        if (data) {
          setItems([...items, data]);
        } else {
          const newItem: IntentResponse = {
            id: `intent-${Date.now()}`,
            ...formData,
            updated_at: new Date().toISOString(),
          };
          setItems([...items, newItem]);
        }
      }
      setModalOpen(false);
    } catch (err: any) {
      alert(`Error saving intent response: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.intent_name.toLowerCase().includes(q) ||
      it.response_en.toLowerCase().includes(q) ||
      it.response_bisaya.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
            Chatbot Knowledge Base & Intent Responses
          </h2>
          <p className="text-xs text-ink-muted">
            Configure municipal answers in English and Bisaya. Changes update the public chatbot instantly without modifying code.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Intent Response</span>
        </button>
      </div>

      {/* Info Notice */}
      <div className="rounded border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950 flex items-start gap-3">
        <Bot className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-navy">
            Dynamic Dual-Language NLU Integration
          </p>
          <p className="text-ink-muted leading-relaxed">
            When a citizen sends an inquiry in English or Bisaya, the Dialogflow NLU matches the user's question to the corresponding <code className="font-mono text-teal-900 bg-teal-100 px-1 py-0.5 rounded">intent_name</code>. The chatbot automatically delivers your localized response below.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search responses by intent name or keyword..."
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
                <th className="py-3 px-4">Intent Identifier</th>
                <th className="py-3 px-4">English Response</th>
                <th className="py-3 px-4">Bisaya Translation Response</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading intent responses...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No intent responses found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy max-w-xs">
                      <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-1 text-navy text-[11px]">
                        {item.intent_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-ink max-w-md">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {item.response_en}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-teal-900 max-w-md">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">
                        {item.response_bisaya}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="row-action rounded text-navy hover:bg-surface transition-colors"
                        title="Edit response"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Intent Response' : 'Add Intent Response'}
        subtitle="Manage dual-language answer templates for the chatbot NLU engine"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Intent Name (Dialogflow Display Name) <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!editingItem}
              value={formData.intent_name}
              onChange={(e) => setFormData({ ...formData, intent_name: e.target.value })}
              placeholder="e.g. permit.business.new.inquire or Welcome"
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600 font-mono disabled:bg-surface-sunken disabled:text-ink-subtle"
            />
            {editingItem && (
              <p className="text-[10px] font-mono text-ink-muted mt-1">
                Intent name must match the NLU model classification key.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              English Bot Response <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.response_en}
              onChange={(e) => setFormData({ ...formData, response_en: e.target.value })}
              placeholder="Official answer displayed when language is detected as English..."
              className="w-full rounded-md border border-hairline bg-white p-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Bisaya Translation Bot Response <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.response_bisaya}
              onChange={(e) => setFormData({ ...formData, response_bisaya: e.target.value })}
              placeholder="Opisyal nga tubag nga ipakita kon ang pangutana sa Binisaya..."
              className="w-full rounded-md border border-hairline bg-white p-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
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
              {submitting ? 'Saving...' : 'Save Intent Response'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
