import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Search, Pencil, Plus, Trash2, MessageSquarePlus, Replace } from 'lucide-react';
import { adminService, IntentResponse } from '../../services/adminService';
import { AdminModal } from '../../components/admin/AdminModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

/*
 * Two kinds of row live in `intent_responses`:
 *   - New topic: has sample questions. The chat server matches citizens' messages against them
 *     itself (server/services/liveContent.js), so staff can add questions Dialogflow was never
 *     trained on.
 *   - Changed answer: no sample questions; replaces the reply of one of the bot's built-in intents.
 */
type Mode = 'new' | 'override';

const isNewTopic = (it: IntentResponse) => (it.training_phrases?.length ?? 0) > 0;

/** "How do I get a senior citizen ID?" → "custom.how-do-i-get-a-senior-citizen-id" */
function intentNameFor(question: string, taken: Set<string>) {
  const slug = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'topic';
  let name = `custom.${slug}`;
  for (let n = 2; taken.has(name); n++) name = `custom.${slug}-${n}`;
  return name;
}

const EMPTY_FORM = { intent_name: '', questions: '', response_en: '', response_bisaya: '' };

const inputClass =
  'w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600';
const labelClass = 'mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800';

export function AdminChatbotResponses() {
  const [items, setItems] = useState<IntentResponse[]>([]);
  const [builtIn, setBuiltIn] = useState<{ name: string; preview: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('new');
  const [editingItem, setEditingItem] = useState<IntentResponse | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState<IntentResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ data, error }, intents] = await Promise.all([adminService.getIntentResponses(), adminService.getBuiltInIntents()]);
      if (error) throw error;
      setItems((data || []) as IntentResponse[]);
      setBuiltIn(intents);
    } catch (e: any) {
      setLoadError(`Could not load chatbot responses: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setMode('new');
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openOverride = () => {
    setMode('override');
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item: IntentResponse) => {
    setMode(isNewTopic(item) ? 'new' : 'override');
    setEditingItem(item);
    setForm({
      intent_name: item.intent_name,
      questions: (item.training_phrases || []).join('\n'),
      response_en: item.response_en,
      response_bisaya: item.response_bisaya || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const questionList = form.questions
    .split('\n')
    .map((q) => q.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'new' && questionList.length === 0) {
      setFormError('Add at least one sample question.');
      return;
    }
    if (mode === 'override' && !form.intent_name) {
      setFormError('Choose which answer to change.');
      return;
    }

    const taken = new Set(items.map((it) => it.intent_name));
    const record = {
      intent_name:
        editingItem?.intent_name ?? (mode === 'new' ? intentNameFor(questionList[0], taken) : form.intent_name),
      response_en: form.response_en.trim(),
      response_bisaya: form.response_bisaya.trim(),
      training_phrases: mode === 'new' ? questionList : [],
    };

    setSubmitting(true);
    try {
      if (editingItem) {
        await adminService.updateIntentResponse(editingItem.id, record);
        setItems(items.map((it) => (it.id === editingItem.id ? { ...it, ...record, updated_at: new Date().toISOString() } : it)));
      } else {
        const { data } = await adminService.upsertIntentResponse(record);
        // Upsert on intent_name: changing an answer twice updates the same row.
        setItems([...items.filter((it) => it.intent_name !== record.intent_name), data as IntentResponse]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(`Could not save: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminService.deleteIntentResponse(deleting.id);
      setItems(items.filter((it) => it.id !== deleting.id));
    } catch (err: any) {
      alert(`Could not delete: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.intent_name.toLowerCase().includes(q) ||
      it.response_en.toLowerCase().includes(q) ||
      (it.response_bisaya || '').toLowerCase().includes(q) ||
      (it.training_phrases || []).some((p) => p.toLowerCase().includes(q))
    );
  });

  const changedNames = useMemo(() => new Set(items.filter((it) => !isNewTopic(it)).map((it) => it.intent_name)), [items]);
  const selectedBuiltIn = builtIn.find((b) => b.name === form.intent_name);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Chatbot Responses</h2>
          <p className="text-xs text-ink-muted">
            Teach the chatbot new questions, or change one of its existing answers. Changes reach the chatbot within 30
            seconds.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openOverride}
            className="flex items-center gap-1.5 rounded-md border border-hairline bg-white px-4 py-2 text-[0.8125rem] font-semibold text-navy shadow-sm transition-colors duration-150 hover:bg-surface"
          >
            <Replace className="h-4 w-4" />
            <span>Change an existing answer</span>
          </button>
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-1.5 rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add new question</span>
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="flex items-start gap-3 rounded border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-950">
        <Bot className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal" />
        <div className="space-y-1.5 leading-relaxed text-ink-muted">
          <p>
            <span className="font-semibold text-navy">Add new question</span> — for a topic the chatbot can't answer yet.
            Write a few ways people might ask it (in English and Bisaya) and the answer; the chatbot matches similar
            questions to it.
          </p>
          <p>
            <span className="font-semibold text-navy">Change an existing answer</span> — pick one of the chatbot's
            built-in topics and replace its reply.
          </p>
        </div>
      </div>

      {loadError && <p className="rounded border border-accent-200 bg-accent-50 p-3 text-xs text-accent-800">{loadError}</p>}

      {/* Search */}
      <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by question, answer or topic..."
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">English answer</th>
                <th className="px-4 py-3">Bisaya answer</th>
                <th className="px-4 py-3">Last updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading chatbot responses...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    {items.length === 0 ? 'No questions or changed answers yet.' : 'Nothing matches your search.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const samples = item.training_phrases || [];
                  return (
                  <tr key={item.id} className="transition-colors hover:bg-surface/60">
                    <td className="max-w-xs px-4 py-3.5">
                      {samples.length > 0 ? (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-sea-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sea-800">
                            <MessageSquarePlus className="h-3 w-3" /> New question
                          </span>
                          <p className="mt-1.5 font-semibold leading-snug text-navy">{samples[0]}</p>
                          <p className="mt-0.5 text-[11px] text-ink-muted">
                            {samples.length} sample question{samples.length === 1 ? '' : 's'}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                            <Replace className="h-3 w-3" /> Changed answer
                          </span>
                          <p className="mt-1.5 font-mono text-[11px] text-navy">{item.intent_name}</p>
                        </>
                      )}
                    </td>
                    <td className="max-w-md px-4 py-3.5 text-ink">
                      <p className="line-clamp-2 text-[11px] leading-relaxed">{item.response_en}</p>
                    </td>
                    <td className="max-w-md px-4 py-3.5 text-teal-900">
                      <p className="line-clamp-2 text-[11px] leading-relaxed">
                        {item.response_bisaya || <span className="italic text-ink-subtle">Uses the English answer</span>}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-ink-muted">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recent'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right">
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="row-action rounded text-navy transition-colors hover:bg-surface"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(item)}
                          className="row-action rounded text-alert transition-colors hover:bg-alert-50"
                          title="Delete"
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

      {/* Add / edit modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          mode === 'new'
            ? editingItem
              ? 'Edit question'
              : 'Add new question'
            : editingItem
              ? 'Edit changed answer'
              : 'Change an existing answer'
        }
        subtitle={
          mode === 'new'
            ? 'The chatbot answers any question similar to your samples.'
            : "Replace the reply of one of the chatbot's built-in topics."
        }
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p role="alert" className="rounded border border-alert-600/25 bg-alert-50 p-3 text-xs text-alert-800">
              {formError}
            </p>
          )}

          {mode === 'new' ? (
            <div>
              <label className={labelClass} htmlFor="cr-questions">
                Sample questions <span className="text-alert">*</span>
              </label>
              <textarea
                id="cr-questions"
                rows={5}
                value={form.questions}
                onChange={(e) => setForm({ ...form, questions: e.target.value })}
                placeholder={'How do I get a senior citizen ID?\nSenior citizen ID requirements\nUnsaon pagkuha og senior citizen ID?'}
                className={`${inputClass} font-normal`}
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                One per line. Add at least 3 different ways people might ask, in English and Bisaya.
                {questionList.length > 0 && questionList.length < 3 && (
                  <span className="font-semibold text-accent-800"> {questionList.length} so far — more samples help the chatbot recognise the question.</span>
                )}
              </p>
            </div>
          ) : (
            <div>
              <label className={labelClass} htmlFor="cr-intent">
                Which answer to change <span className="text-alert">*</span>
              </label>
              <select
                id="cr-intent"
                value={form.intent_name}
                disabled={!!editingItem}
                onChange={(e) => setForm({ ...form, intent_name: e.target.value })}
                className={`${inputClass} font-mono disabled:bg-surface-sunken disabled:text-ink-subtle`}
              >
                <option value="">Select a topic…</option>
                {builtIn.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name}
                    {changedNames.has(b.name) && b.name !== editingItem?.intent_name ? '  (already changed)' : ''}
                  </option>
                ))}
              </select>
              {builtIn.length === 0 && (
                <p className="mt-1 text-[11px] text-accent-800">
                  The topic list comes from the chat server — make sure it is running.
                </p>
              )}
              {selectedBuiltIn && (
                <p className="mt-2 rounded border border-hairline bg-surface p-2.5 text-[11px] leading-relaxed text-ink-muted">
                  <span className="font-semibold text-navy">Current answer:</span> {selectedBuiltIn.preview}
                  {selectedBuiltIn.preview.length >= 160 ? '…' : ''}
                </p>
              )}
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="cr-en">
              English answer <span className="text-alert">*</span>
            </label>
            <textarea
              id="cr-en"
              required
              rows={4}
              value={form.response_en}
              onChange={(e) => setForm({ ...form, response_en: e.target.value })}
              placeholder="The answer the chatbot gives when someone asks in English..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="cr-ceb">
              Bisaya answer <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="cr-ceb"
              rows={4}
              value={form.response_bisaya}
              onChange={(e) => setForm({ ...form, response_bisaya: e.target.value })}
              placeholder="Ang tubag kung mangutana sa Bisaya... (kung blangko, ang English nga tubag ang ipakita)"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-hairline pt-4">
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
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleting}
        title={deleting && isNewTopic(deleting) ? 'Delete question' : 'Remove changed answer'}
        message={
          deleting && isNewTopic(deleting)
            ? 'The chatbot will stop answering this question. This cannot be undone.'
            : 'The chatbot will go back to its original answer for this topic.'
        }
        isDanger
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
