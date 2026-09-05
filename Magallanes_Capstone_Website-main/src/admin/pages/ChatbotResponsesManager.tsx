import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, BotIcon, GlobeIcon, SparklesIcon, CheckCircle2Icon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { AdminModal } from '../components/AdminModal';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { IntentResponse } from '../types';

export const ChatbotResponsesManager: React.FC = () => {
  const [items, setItems] = useState<IntentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<IntentResponse> | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await supabaseAdmin.getIntentResponses();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      intent_name: '',
      response_en: '',
      response_bisaya: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IntentResponse) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.intent_name || !editingItem?.response_en || !editingItem?.response_bisaya) {
      alert('Please fill out Intent Name, English Response, and Bisaya Response.');
      return;
    }

    await supabaseAdmin.saveIntentResponse(editingItem);
    setIsModalOpen(false);
    setEditingItem(null);
    loadData();
  };

  const columns: Column<IntentResponse>[] = [
    {
      key: 'intent_name',
      header: 'Dialogflow Intent Key',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-bold text-navy bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {item.intent_name}
          </span>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Mapped NLU Intent</p>
        </div>
      ),
    },
    {
      key: 'response_en',
      header: 'English Localized Response',
      render: (item) => (
        <div className="max-w-xs text-xs text-slate-700">
          <p className="line-clamp-2 leading-relaxed">{item.response_en}</p>
        </div>
      ),
    },
    {
      key: 'response_bisaya',
      header: 'Bisaya Localized Response',
      render: (item) => (
        <div className="max-w-xs text-xs text-teal-900 bg-teal-50/50 p-2 rounded border border-teal-100">
          <p className="line-clamp-2 leading-relaxed">{item.response_bisaya}</p>
        </div>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last Modified',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <button
          type="button"
          onClick={() => handleOpenEdit(item)}
          className="inline-flex items-center gap-1 rounded bg-teal px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
        >
          <EditIcon className="h-3 w-3" />
          <span>Edit</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Chatbot Knowledge & Intent Responses</h2>
          <p className="text-sm text-slate-500">
            Configure how the AI assistant answers citizen inquiries. Staff can update English and Bisaya replies directly without modifying server code.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-all self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add Intent Mapping
        </button>
      </div>

      <div className="rounded border border-teal-200 bg-teal-50/40 p-4 text-xs text-teal-950 flex items-center gap-3">
        <BotIcon className="h-5 w-5 text-teal shrink-0" />
        <p>
          <strong>Dynamic Backend Hook:</strong> When the backend server receives a query, it pulls localized replies directly from the <code className="font-mono bg-teal-100 px-1 py-0.5 rounded text-teal-900">intent_responses</code> table, providing instant Bisaya/English language adaptation without redeploying.
        </p>
      </div>

      <DataTable
        data={items}
        columns={columns}
        searchPlaceholder="Search intent name, English keywords, Bisaya phrases..."
      />

      {/* Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? 'Edit Intent Response' : 'Add New Intent Response'}
        subtitle="Ensure the Intent Name matches the Dialogflow Display Name exactly."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Dialogflow Intent Name *
            </label>
            <input
              type="text"
              required
              value={editingItem?.intent_name || ''}
              onChange={(e) => setEditingItem({ ...editingItem, intent_name: e.target.value })}
              placeholder="e.g. Permit Inquiry / Office Hours"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              English Response *
            </label>
            <textarea
              required
              rows={4}
              value={editingItem?.response_en || ''}
              onChange={(e) => setEditingItem({ ...editingItem, response_en: e.target.value })}
              placeholder="Provide full instructions in formal English..."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-teal-900">
              Bisaya / Sinugbuanon Localized Response *
            </label>
            <textarea
              required
              rows={4}
              value={editingItem?.response_bisaya || ''}
              onChange={(e) => setEditingItem({ ...editingItem, response_bisaya: e.target.value })}
              placeholder="Ibutang ang eksaktong tubag sa pinulongang Bisaya..."
              className="mt-1 w-full rounded border border-teal-300 bg-teal-50/20 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
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
              Save Intent Response
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
