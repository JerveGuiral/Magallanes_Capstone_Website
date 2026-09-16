import React from 'react';
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';

const OFFICES = [
  { name: 'Office of the Municipal Mayor', local: 'Local 101', email: 'mayor@magallanes-adn.gov.ph' },
  { name: 'Business Permits & Licensing', local: 'Local 108', email: 'bplo@magallanes-adn.gov.ph' },
  { name: 'Municipal Civil Registrar', local: 'Local 112', email: 'mcr@magallanes-adn.gov.ph' },
  { name: 'MDRRMO (24/7 hotline)', local: '0917 000 0000', email: 'mdrrmo@magallanes-adn.gov.ph' }];


const CONCERN_TYPES = [
  'Road or bridge condition',
  'Drainage or flooding',
  'Streetlight outage',
  'Water supply',
  'Waste collection',
  'Peace and order',
  'Other'];


export function Contact() {
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: '', barangay: '', contact: '', type: '', details: '' });

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.type || !form.details.trim()) {
      setError('Please complete your name, the type of concern, and the details before submitting.');
      setSubmitted(false);
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  const fieldClass =
    'mt-1.5 w-full border border-hairline bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted';
  const labelClass = 'block text-sm font-semibold text-navy';

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact the Municipal Hall"
        description="Report a concern, request assistance, or reach a specific office directly. Submissions are logged and routed within one working day." />


      <section className="w-full py-12" aria-labelledby="contact-form-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div>
            <div id="contact-form-title">
              <SectionHeading
                eyebrow="Public assistance"
                title="Report a concern"
                description="Fields marked with an asterisk are required. For emergencies, call the MDRRMO hotline instead of using this form." />

            </div>

            <form className="mt-8 border border-hairline bg-white p-6" onSubmit={onSubmit} noValidate>
              {error &&
                <p
                  role="alert"
                  className="mb-5 flex items-start gap-2 border-l-2 border-alert bg-alert-50 p-3 text-sm text-alert">

                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              }
              {submitted &&
                <p
                  role="status"
                  className="mb-5 flex items-start gap-2 border-l-2 border-teal bg-teal-50 p-3 text-sm text-teal-900">

                  <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Received. Your reference number is{' '}
                  <span className="font-mono font-semibold">PAD-2026-0418</span>. Keep it for follow-up.
                </p>
              }

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="name">
                    Full name *
                  </label>
                  <input id="name" className={fieldClass} value={form.name} onChange={update('name')} required />
                </div>
                <div>
                  <label className={labelClass} htmlFor="barangay">
                    Barangay
                  </label>
                  <input id="barangay" className={fieldClass} value={form.barangay} onChange={update('barangay')} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="contact">
                    Mobile or email
                  </label>
                  <input
                    id="contact"
                    className={`${fieldClass} font-mono`}
                    value={form.contact}
                    onChange={update('contact')}
                    placeholder="0917 000 0000" />

                </div>
                <div>
                  <label className={labelClass} htmlFor="type">
                    Type of concern *
                  </label>
                  <select id="type" className={fieldClass} value={form.type} onChange={update('type')} required>
                    <option value="">Select one…</option>
                    {CONCERN_TYPES.map((t) =>
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className={labelClass} htmlFor="details">
                  Details *
                </label>
                <textarea
                  id="details"
                  rows={5}
                  className={fieldClass}
                  value={form.details}
                  onChange={update('details')}
                  placeholder="Include the exact location or landmark, and when you first noticed the issue."
                  required />

              </div>

              <button
                type="submit"
                className="mt-6 bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-900">

                Submit report
              </button>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                Personal data is processed under the Data Privacy Act of 2012 and used solely to act on your report.
              </p>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="border border-hairline bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">Municipal Hall</h2>
              <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span className="leading-relaxed text-ink">
                    Barangay Poblacion, Magallanes, Agusan del Norte 8604
                  </span>
                </li>
                <li className="flex gap-3">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span className="font-mono text-ink">(085) 000-0000</span>
                </li>
                <li className="flex gap-3">
                  <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span className="font-mono text-ink">info@magallanes-adn.gov.ph</span>
                </li>
                <li className="flex gap-3">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  <span className="leading-relaxed text-ink">Monday to Friday, 8:00 AM – 5:00 PM</span>
                </li>
              </ul>
            </div>

            <div id="offices" className="scroll-mt-28 border border-hairline bg-white">
              <h2 className="border-b border-hairline px-6 py-4 font-display text-lg font-bold text-navy">
                Office directory
              </h2>
              <ul className="divide-y divide-hairline">
                {OFFICES.map((o) =>
                  <li key={o.name} className="px-6 py-4">
                    <p className="text-sm font-semibold text-navy">{o.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-muted">
                      {o.local} · {o.email}
                    </p>
                  </li>
                )}
              </ul>
            </div>

            <div
              className="border border-hairline bg-surface-sunken p-6"
              role="img"
              aria-label="Map placeholder showing the location of the Magallanes Municipal Hall">

              <p className="text-center font-mono text-xs uppercase tracking-wider text-ink-muted">
                Map placeholder — Municipal Hall
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>);

}