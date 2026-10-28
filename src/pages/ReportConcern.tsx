import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, CheckCircle2Icon, SendIcon, Loader2Icon, PhoneIcon, ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmergencyHotlines } from '../components/ui/EmergencyHotlines';
import { adminService } from '../services/adminService';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import { LGU_CONTACT } from '../data/site';

const CONCERN_TYPES = [
  'Road or bridge condition',
  'Drainage or flooding',
  'Streetlight outage',
  'Water supply',
  'Waste collection',
  'Peace and order',
  'Other',
];

const NEXT_STEPS = [
  { title: 'You get a reference number', detail: 'Shown as soon as your report is saved. Keep it for follow-up.' },
  { title: 'Staff review it', detail: 'The Public Assistance Desk reads every submission and routes it to the responsible office.' },
  { title: 'The office acts on it', detail: 'Quote your reference number if you call or visit the Municipal Hall about it.' },
];

export function ReportConcern() {
  /** Set to the reference number once the row is actually in the database. */
  const [reference, setReference] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', barangay: '', contact: '', type: '', details: '' });
  const [consent, setConsent] = React.useState(false);
  const [privacyOpen, setPrivacyOpen] = React.useState(false);

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.type || !form.details.trim()) {
      setError('Please complete your name, the type of concern, and the details before submitting.');
      setReference(null);
      return;
    }
    if (!consent) {
      setError('Please confirm you agree to the processing of your personal data before submitting.');
      setReference(null);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      /* The reference is written into the stored message, so quoting it back to
       * the Public Assistance Desk finds the actual record via inbox search. */
      const { reference: ref } = await adminService.createContactMessage({
        name: form.name,
        email: form.contact,
        message: form.details,
        barangay: form.barangay,
        concernType: form.type,
      });

      setReference(ref);
      setForm({ name: '', barangay: '', contact: '', type: '', details: '' });
      setConsent(false);
    } catch (err: any) {
      setReference(null);
      setError(
        `Your report could not be submitted: ${err?.message || 'unknown error'}. ` +
          `Please try again, or call the Mayor's Office at ${LGU_CONTACT.phone}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Public Assistance"
        title="Report a concern"
        description="Tell the Municipal Hall about a problem in your barangay — a damaged road, flooding, a streetlight outage, and more. Submissions are logged and routed within one working day."
      />

      <section className="w-full py-14 lg:py-section" aria-label="Report form">
        <div className="container-page grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          {/* ---- Report form ---- */}
          <div>
            {/* Emergency diversion sits above the form, not inside its help text —
                someone in an actual emergency should never have to read a form to
                find out this is the wrong channel. */}
            <EmergencyHotlines lead={<><strong className="font-semibold text-alert-900">For emergencies, do not use this form.</strong> Call:</>} />

            <form className="card mt-6 p-6" onSubmit={onSubmit} noValidate aria-label="Report a concern">
              <p className="mb-5 text-[0.8125rem] text-ink-muted">
                Fields marked with <span className="text-alert-600">*</span> are required.
              </p>
              {error && (
                <p
                  role="alert"
                  className="mb-6 flex items-start gap-2.5 rounded-md border-l-[3px] border-alert-600 bg-alert-50 p-3.5 text-[0.9375rem] text-alert-800"
                >
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" aria-hidden="true" />
                  {error}
                </p>
              )}

              {reference && (
                <p
                  role="status"
                  className="mb-6 flex items-start gap-2.5 rounded-md border-l-[3px] border-accent-700 bg-accent-50 p-3.5 text-[0.9375rem] text-accent-900"
                >
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" aria-hidden="true" />
                  <span>
                    Received and logged. Your reference number is{' '}
                    <span className="font-mono font-semibold">{reference}</span>. Keep it for follow-up.
                  </span>
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="name">
                    Full name <span className="text-alert-600">*</span>
                  </label>
                  <input id="name" className="field mt-1.5" value={form.name} onChange={update('name')} required />
                </div>

                <div>
                  <label className="field-label" htmlFor="barangay">
                    Barangay
                  </label>
                  <input id="barangay" className="field mt-1.5" value={form.barangay} onChange={update('barangay')} />
                </div>

                <div>
                  <label className="field-label" htmlFor="contact">
                    Mobile or email
                  </label>
                  <input
                    id="contact"
                    className="field mt-1.5 font-mono"
                    value={form.contact}
                    onChange={update('contact')}
                    placeholder="0917 000 0000"
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="type">
                    Type of concern <span className="text-alert-600">*</span>
                  </label>
                  <select id="type" className="field mt-1.5" value={form.type} onChange={update('type')} required>
                    <option value="">Select one…</option>
                    {CONCERN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="field-label" htmlFor="details">
                  Details <span className="text-alert-600">*</span>
                </label>
                <textarea
                  id="details"
                  rows={5}
                  className="field mt-1.5 resize-y"
                  value={form.details}
                  onChange={update('details')}
                  placeholder="Include the exact location or landmark, and when you first noticed the issue."
                  required
                />
                <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
                  A landmark and a date help the responding office find the problem without calling you back.
                </p>
              </div>

              <label
                className="mt-6 flex items-start gap-3 rounded-md border border-hairline bg-surface p-4 text-[0.8125rem] leading-relaxed text-ink-muted"
                htmlFor="consent"
              >
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline text-brand-600 focus:ring-brand-600"
                />
                <span>
                  I agree that my personal data will be processed under the{' '}
                  <button
                    type="button"
                    /* Inside a <label>, so the click must not bubble up and toggle
                       the checkbox on its way out. */
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPrivacyOpen(true);
                    }}
                    className="font-semibold text-brand-600 underline underline-offset-2 transition-colors duration-150 hover:text-brand-800"
                  >
                    Privacy Policy
                  </button>{' '}
                  of the Municipality of Magallanes, solely to act on this report.{' '}
                  <span className="text-alert-600">*</span>
                </span>
              </label>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-6 w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <SendIcon className="h-4 w-4" aria-hidden="true" />
                    Submit report
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ---- What happens next / other channels ---- */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-brand-800">What happens next</h2>
              <ol className="mt-5 space-y-5">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-50 font-mono text-[0.75rem] font-semibold text-brand-600 ring-1 ring-brand-100">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-sans text-[0.9375rem] font-semibold text-ink">{s.title}</p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-brand-800">Prefer to call?</h2>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">{LGU_CONTACT.phoneLabel}</p>
              <a
                href={LGU_CONTACT.phoneHref}
                className="mt-3 inline-flex items-center gap-2 font-mono text-[1rem] font-semibold text-brand-600 hover:text-brand-800"
              >
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                {LGU_CONTACT.phone}
              </a>
              <Link
                to="/offices"
                className="group mt-5 flex items-center gap-2 border-t border-hairline pt-4 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                See the municipal offices
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <PrivacyPolicyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
}
