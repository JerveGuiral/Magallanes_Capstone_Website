import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info, Loader2, Search, Sparkles } from 'lucide-react';
import { AdminModal } from './AdminModal';
import {
  adminService,
  TrainingRequestError,
  type TrainingOptions,
  type TrainingResult,
  type TrainingTopic,
} from '../../services/adminService';

/**
 * "Train" on a question from the Chatbot Reports page: staff pick the topic that should answer it
 * and the chat server adds the question to that topic — as a Dialogflow training phrase (the
 * agent then retrains), or as a sample question of an admin topic. See server/services/training.js.
 */

const MAX_PHRASE = 256;
const keyOf = (t: { name: string; kind: string }) => `${t.kind}:${t.name}`;

interface Props {
  /** The question as residents typed it; null closes the dialog. */
  question: { text: string; count: number; english: number; bisaya: number } | null;
  onClose: () => void;
  onTrained: (result: TrainingResult, sourceQuestion: string) => void;
}

function KindBadge({ kind }: { kind: TrainingTopic['kind'] }) {
  return kind === 'dialogflow' ? (
    <span className="rounded bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-700">Dialogflow</span>
  ) : (
    <span className="rounded bg-accent-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-700">Admin topic</span>
  );
}

// The suggestions and the full list are separate radio groups: a suggested topic appears in both, and
// in one group the browser would let only one of its two copies show as checked.
function TopicOption({ group, topic, checked, onSelect }: { group: string; topic: TrainingTopic; checked: boolean; onSelect: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-colors duration-150 ${
        checked ? 'border-brand-600 bg-brand-50/60' : 'border-hairline bg-white hover:border-neutral-300'
      }`}
    >
      <input type="radio" name={group} checked={checked} onChange={onSelect} className="mt-0.5 text-brand-600" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11.5px] font-semibold text-brand-800 [overflow-wrap:anywhere]">{topic.name}</span>
          <KindBadge kind={topic.kind} />
        </span>
        {topic.preview && <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-muted line-clamp-2">{topic.preview}</span>}
      </span>
    </label>
  );
}

export function TrainQuestionModal({ question, onClose, onTrained }: Props) {
  const [phrase, setPhrase] = useState('');
  const [options, setOptions] = useState<TrainingOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<TrainingRequestError | null>(null);

  useEffect(() => {
    if (!question) return;
    let cancelled = false;
    setPhrase(question.text);
    setOptions(null);
    setLoadError(null);
    setSelected(null);
    setFilter('');
    setSaveError(null);
    adminService
      .getTrainingOptions(question.text)
      .then((o) => !cancelled && setOptions(o))
      .catch((e: Error) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [question]);

  const topics = useMemo(() => options?.topics ?? [], [options]);
  const suggested = useMemo(
    () => (options?.suggested ?? []).map((name) => topics.find((t) => t.name === name)).filter((t): t is TrainingTopic => !!t),
    [options, topics]
  );
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q));
  }, [filter, topics]);
  const chosen = topics.find((t) => keyOf(t) === selected) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !chosen) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = await adminService.addTrainingPhrase({
        phrase,
        topic: { name: chosen.name, kind: chosen.kind },
        sourceQuestion: question.text,
      });
      onTrained(result, question.text);
    } catch (err) {
      setSaveError(err instanceof TrainingRequestError ? err : new TrainingRequestError(String((err as Error)?.message || err), 'SERVER_ERROR'));
    } finally {
      setSaving(false);
    }
  };

  const language = options?.language;

  return (
    <AdminModal
      isOpen={!!question}
      onClose={onClose}
      title="Train Magi on this question"
      subtitle="Add it to the topic that should answer it, so Magi recognises it next time."
      maxWidth="2xl"
    >
      {question && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* What residents asked */}
          <div className="rounded-md border border-hairline bg-surface-raised px-4 py-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">Residents asked</p>
            <p className="mt-1 text-sm font-semibold text-brand-800 [overflow-wrap:anywhere]">“{question.text}”</p>
            <p className="mt-1 text-[11px] text-ink-muted">
              {question.count} time{question.count === 1 ? '' : 's'} · EN {question.english} · CEB {question.bisaya}
              {language && <> · reads as <strong className="font-semibold">{language === 'bisaya' ? 'Bisaya' : 'English'}</strong></>}
            </p>
          </div>

          {/* The phrase */}
          <div>
            <label htmlFor="train-phrase" className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
              Training phrase
            </label>
            <textarea
              id="train-phrase"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              maxLength={MAX_PHRASE}
              rows={2}
              required
              className="w-full rounded-md border border-hairline bg-white px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
            />
            <p className="mt-1 flex justify-between gap-3 text-[11px] text-ink-muted">
              <span>
                Keep the resident’s own wording — Bisaya, Bislish and common misspellings teach Magi how people really ask.
                Change it only to remove personal details such as names or phone numbers.
              </span>
              <span className="shrink-0 font-mono tabular-nums">
                {phrase.length}/{MAX_PHRASE}
              </span>
            </p>
          </div>

          {/* The topic */}
          <fieldset className="space-y-3">
            <legend className="mb-1.5 font-display text-[0.8125rem] font-semibold text-brand-800">Which answer should this question get?</legend>

            {loadError && (
              <div className="flex items-start gap-2 rounded-md border border-alert-600/25 bg-alert-50 p-3 text-xs text-alert-800" role="alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p>{loadError}</p>
              </div>
            )}

            {!options && !loadError && (
              <p className="flex items-center gap-2 py-4 text-xs text-ink-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading Magi’s topics…
              </p>
            )}

            {options?.dialogflowError && (
              <div className="flex items-start gap-2 rounded-md border border-fiesta-600/30 bg-fiesta-50 p-3 text-xs text-fiesta-700" role="status">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Dialogflow topics are not available yet.</p>
                  <p className="mt-0.5">{options.dialogflowError.message}</p>
                </div>
              </div>
            )}

            {options && suggested.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-700">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Closest matches
                </p>
                <div className="space-y-1.5">
                  {suggested.map((t) => (
                    <TopicOption key={keyOf(t)} group="train-topic-suggested" topic={t} checked={selected === keyOf(t)} onSelect={() => setSelected(keyOf(t))} />
                  ))}
                </div>
              </div>
            )}

            {options && (
              <div>
                <label htmlFor="train-filter" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  {suggested.length ? 'Or search all topics' : 'Search all topics'} ({topics.length})
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                  <input
                    id="train-filter"
                    type="search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="e.g. permit, cedula, senior, birth"
                    className="w-full rounded-md border border-hairline bg-white py-2 pl-8 pr-3 text-[0.8125rem] text-ink hover:border-neutral-300 focus:border-brand-600"
                  />
                </div>
                <div className="admin-scroll mt-2 max-h-60 space-y-1.5 overflow-y-auto pr-1">
                  {filtered.length === 0 ? (
                    <p className="py-3 text-center text-xs text-ink-muted">
                      {topics.length === 0 ? 'No topics can be trained right now.' : 'No topic matches that search.'}
                    </p>
                  ) : (
                    filtered.map((t) => (
                      <TopicOption key={keyOf(t)} group="train-topic-all" topic={t} checked={selected === keyOf(t)} onSelect={() => setSelected(keyOf(t))} />
                    ))
                  )}
                </div>
                <p className="mt-2 text-[11px] text-ink-muted">
                  No topic fits? Create one in <strong className="font-semibold">Chatbot Responses</strong> with this question as a sample question.
                </p>
              </div>
            )}
          </fieldset>

          {chosen && (
            <div className="flex items-start gap-2 rounded-md border border-hairline bg-surface-raised p-3 text-xs text-ink-light">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <p>
                {chosen.kind === 'dialogflow'
                  ? 'Dialogflow retrains after the change, so Magi starts recognising this question — and wordings close to it — in about a minute.'
                  : 'Magi matches admin topics by their words; this question works within 30 seconds, but other wordings need their own sample questions.'}
              </p>
            </div>
          )}

          {saveError && (
            <div className="flex items-start gap-2 rounded-md border border-alert-600/25 bg-alert-50 p-3 text-xs text-alert-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{saveError.message}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-hairline pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hairline bg-white px-4 py-2 text-[0.8125rem] font-semibold text-brand-800 hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!chosen || saving || phrase.trim().length < 2}
              className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-[0.8125rem] font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {saving ? 'Adding…' : 'Add to training'}
            </button>
          </div>
        </form>
      )}
    </AdminModal>
  );
}
