import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  SendIcon,
  SirenIcon,
  Loader2Icon,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { adminService, type OfficeItem } from '../services/adminService';

const CONCERN_TYPES = [
  'Road or bridge condition',
  'Drainage or flooding',
  'Streetlight outage',
  'Water supply',
  'Waste collection',
  'Peace and order',
  'Other',
];

const HALL_DETAILS = [
  { Icon: MapPinIcon, label: 'Address', value: 'Barangay Poblacion, Magallanes, Agusan del Norte 8604' },
  { Icon: PhoneIcon, label: 'Telephone', value: '(085) 000-0000', mono: true },
  { Icon: MailIcon, label: 'Email', value: 'info@magallanes-adn.gov.ph', mono: true },
  { Icon: ClockIcon, label: 'Office hours', value: 'Monday to Friday, 8:00 AM – 5:00 PM' },
];

export function Contact() {
  /** Set to the reference number once the row is actually in the database. */
  const [reference, setReference] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', barangay: '', contact: '', type: '', details: '' });
  const [consent, setConsent] = React.useState(false);
  const [offices, setOffices] = React.useState<OfficeItem[]>([]);

  React.useEffect(() => {
    let mounted = true;
    adminService.getOffices().then(({ data }) => {
      if (mounted) setOffices(data || []);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
          'Please try again, or call the Municipal Hall at (085) 000-0000.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact the Municipal Hall"
        description="Report a concern, request assistance, or reach a specific office directly. Submissions are logged and routed within one working day."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="contact-form-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          {/* ---- Report form ---- */}
          <div>
            <div id="contact-form-title">
              <SectionHeading
                eyebrow="Public assistance"
                title="Report a concern"
                description="Fields marked with an asterisk are required."
              />
            </div>

            {/* Emergency diversion sits above the form, not inside its help text —
                someone in an actual emergency should never have to read a form to
                find out this is the wrong channel. */}
            <p className="mt-6 flex gap-3 rounded-lg border border-alert-600/25 bg-alert-50 p-4 text-[0.9375rem] leading-relaxed text-alert-800">
              <SirenIcon className="mt-0.5 h-5 w-5 shrink-0 text-alert-600" aria-hidden="true" />
              <span>
                <strong className="font-semibold text-alert-900">For emergencies, do not use this form.</strong> Call
                the MDRRMO hotline at <span className="whitespace-nowrap font-mono">(085) 000-0000</span>, which
                operates 24/7.
              </span>
            </p>

            <form className="card mt-6 p-6" onSubmit={onSubmit} noValidate>
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
                  className="mb-6 flex items-start gap-2.5 rounded-md border-l-[3px] border-sea-700 bg-sea-50 p-3.5 text-[0.9375rem] text-sea-900"
                >
                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-sea-700" aria-hidden="true" />
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
                  <Link to="/privacy" className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800">
                    Privacy Policy
                  </Link>{' '}
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

          {/* ---- Directory ---- */}
          <aside className="space-y-6">
            <div className="card overflow-hidden">
              <h2 className="border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800">
                Municipal Hall
              </h2>
              <dl className="divide-y divide-hairline px-6">
                {HALL_DETAILS.map(({ Icon, label, value, mono }) => (
                  <div key={label} className="flex gap-3.5 py-4">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                        {label}
                      </dt>
                      <dd className={`mt-0.5 leading-relaxed text-ink ${mono ? 'break-all font-mono text-[0.875rem]' : 'text-[0.9375rem]'}`}>
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div id="offices" className="card scroll-mt-20 overflow-hidden">
              <h2 className="border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800">
                Office directory
              </h2>
              {offices.length === 0 ? (
                <p className="px-6 py-5 text-sm text-ink-muted">No office directory posted yet.</p>
              ) : (
                <ul className="divide-y divide-hairline">
                  {offices.map((o) => (
                    <li key={o.id} className="px-6 py-4 transition-colors duration-150 hover:bg-brand-50">
                      <p className="font-sans text-[0.9375rem] font-semibold text-brand-800">{o.name}</p>
                      {o.head_name && <p className="mt-0.5 text-[0.8125rem] text-ink-muted">{o.head_name}</p>}
                      <p className="mt-1 break-all font-mono text-[0.75rem] text-ink-muted">
                        {[o.contact_number, o.email].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
