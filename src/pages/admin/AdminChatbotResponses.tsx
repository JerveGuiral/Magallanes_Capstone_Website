import React, { useEffect, useState } from 'react';
import { Bot, Search, Pencil, Plus, CheckCircle2, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService, IntentResponse } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';

const DEFAULT_INTENT_DATA: Array<Omit<IntentResponse, 'id'>> = [
  {
    intent_name: 'Welcome',
    response_en: 'Maayong adlaw! Welcome to Magallanes, Agusan del Norte Public Assistance Desk. How can I help you today? You can ask about business permits, clearances, civil registry, health services, or office hours.',
    response_bisaya: 'Maayong adlaw! Maayong pag-abot sa Magallanes, Agusan del Norte Public Assistance Desk. Unsa may akong ikatabang nimo karon? Makapangutana ka bahin sa business permit, barangay clearance, health services, o oras sa opisina.',
  },
  {
    intent_name: 'permit.business.new.inquire',
    response_en: "For a new business permit, you'll generally need: (1) DTI or SEC registration, (2) Barangay Clearance, (3) a valid government ID, (4) Locational/Zoning Clearance, (5) Fire Safety Inspection Certificate, (6) Sanitary Permit, and (7) Proof of address or lease contract. You can ask about the fees, processing time, or where to apply next.",
    response_bisaya: 'Para sa bag-ong business permit, kinahanglan nimo: (1) DTI o SEC registration, (2) Barangay Clearance, (3) valid ID, (4) Locational/Zoning Clearance, (5) Fire Safety Inspection Certificate, (6) Sanitary Permit, ug (7) proof sa address o lease contract. Makapangutana ka bahin sa bayronon, kadugayon sa proseso, o asa mag-apply.',
  },
  {
    intent_name: 'permit.business.fees.inquire',
    response_en: 'Fees are based on your business type, capital investment, or gross receipts — the Business Permits and Licensing Office (BPLO) at the Municipal Hall will provide the exact assessment.',
    response_bisaya: 'Ang bayad depende sa klase sa negosyo, kapital, o gross receipts — ang Business Permits and Licensing Office (BPLO) sa Munisipyo ang maghatag sa eksaktong assessment.',
  },
  {
    intent_name: 'permit.business.process.inquire',
    response_en: 'Processing a business permit typically takes 1 to 3 working days once all required documents, inspections, and clearances are submitted.',
    response_bisaya: 'Ang pagproseso sa business permit kasagarang molungtad og 1 hangtod 3 ka adlaw kung kompleto na ang tanang gikinahanglan nga dokumento ug clearance.',
  },
  {
    intent_name: 'permit.business.location.inquire',
    response_en: 'You can submit your application at the Business Permits and Licensing Office (BPLO) located on the Ground Floor of the Magallanes Municipal Hall, open Monday to Friday, 8:00 AM to 5:00 PM.',
    response_bisaya: 'Mahimo nimong isumite ang imong aplikasyon sa Business Permits and Licensing Office (BPLO) sa Ground Floor sa Magallanes Municipal Hall, Lunes hangtod Biyernes, 8:00 AM hangtod 5:00 PM.',
  },
  {
    intent_name: 'permit.business.renew.inquire',
    response_en: 'For business permit renewal, please prepare: (1) Previous Year Business Permit & Official Receipts, (2) Barangay Clearance for Renewal, (3) Income Tax Return (ITR) or Financial Statements, and (4) Updated Sanitary & Fire Inspection Clearances.',
    response_bisaya: 'Para sa renewal sa business permit, andama palihug: (1) Daang Business Permit ug resibo, (2) Barangay Clearance for Renewal, (3) ITR o Financial Statement, ug (4) Updated Sanitary ug Fire Inspection Clearance.',
  },
  {
    intent_name: 'clearance.barangay.inquire',
    response_en: 'To get a Barangay Clearance, visit the Barangay Hall where your residence or business is located. Bring a valid ID and community tax certificate (Cedula).',
    response_bisaya: 'Para makakuha og Barangay Clearance, adto sa Barangay Hall kung asa nahimutang ang imong balay o negosyo. Pagdala og valid ID ug Cedula (Community Tax Certificate).',
  },
  {
    intent_name: 'civil.registry.inquire',
    response_en: 'For Civil Registry services (Birth Certificate, Marriage Certificate, Death Certificate), visit the Local Civil Registrar (LCR) office at the Municipal Hall with your supporting documents.',
    response_bisaya: 'Para sa mga serbisyo sa Civil Registry (Birth Certificate, Marriage Certificate, Death Certificate), bisitaha ang opisina sa Local Civil Registrar (LCR) sa Munisipyo uban sa imong mga dokumento.',
  },
  {
    intent_name: 'Default Fallback Intent',
    response_en: "I'm sorry, I didn't quite catch that. Could you please rephrase your question about our municipal services?",
    response_bisaya: 'Pasensya, wala kaayo nako nakuha. Palihug usba o klaroha ang imong pangutana bahin sa mga serbisyo sa atong munisipyo.',
  },
];

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
      if (!error && data && data.length > 0) {
        setItems(data as IntentResponse[]);
      } else {
        // Fallback seed with full initial responses
        const seed: IntentResponse[] = DEFAULT_INTENT_DATA.map((d, i) => ({
          id: `intent-${i + 1}`,
          ...d,
          updated_at: new Date().toISOString(),
        }));
        setItems(seed);
      }
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
          className="flex items-center gap-1.5 rounded bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-800 transition-colors shadow-sm"
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
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search responses by intent name or keyword..."
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
                        className="rounded p-1.5 text-navy hover:bg-surface transition-colors"
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
            <label className="block text-xs font-semibold text-navy mb-1">
              Intent Name (Dialogflow Display Name) <span className="text-alert">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!editingItem}
              value={formData.intent_name}
              onChange={(e) => setFormData({ ...formData, intent_name: e.target.value })}
              placeholder="e.g. permit.business.new.inquire or Welcome"
              className="w-full rounded border border-hairline px-3 py-2 text-xs font-mono text-ink focus:border-navy focus:outline-none disabled:bg-surface disabled:text-ink-muted"
            />
            {editingItem && (
              <p className="text-[10px] font-mono text-ink-muted mt-1">
                Intent name must match the NLU model classification key.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              English Bot Response <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.response_en}
              onChange={(e) => setFormData({ ...formData, response_en: e.target.value })}
              placeholder="Official answer displayed when language is detected as English..."
              className="w-full rounded border border-hairline p-3 text-xs text-ink focus:border-navy focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">
              Bisaya Translation Bot Response <span className="text-alert">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.response_bisaya}
              onChange={(e) => setFormData({ ...formData, response_bisaya: e.target.value })}
              placeholder="Opisyal nga tubag nga ipakita kon ang pangutana sa Binisaya..."
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
              {submitting ? 'Saving...' : 'Save Intent Response'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
