import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon, ShieldCheckIcon } from 'lucide-react';
import { Modal } from './ui/Modal';
import { PRIVACY_SECTIONS, DATA_PROTECTION_OFFICER, NPC_NOTE, PRIVACY_SUMMARY } from '../data/privacy';

/**
 * The privacy notice, shown in place without leaving a half-filled form.
 *
 * Reads from the same source as /privacy, so the consent text a citizen agrees
 * to can never drift from the published policy.
 */
export function PrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy" subtitle={PRIVACY_SUMMARY}>
      <div className="space-y-6">
        {PRIVACY_SECTIONS.map((s) => (
          <section key={s.title}>
            <h3 className="font-display text-[1.0625rem] font-bold text-brand-800">{s.title}</h3>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink">{s.body}</p>
          </section>
        ))}

        <section className="rounded-lg border border-hairline bg-surface-muted p-5">
          <h3 className="flex items-center gap-2 font-display text-[1.0625rem] font-bold text-brand-800">
            <ShieldCheckIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            Data Protection Officer
          </h3>
          <dl className="mt-4 divide-y divide-hairline border-y border-hairline">
            {DATA_PROTECTION_OFFICER.map((row) => (
              <div key={row.label} className="py-2.5">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                  {row.label}
                </dt>
                <dd className={`mt-0.5 text-ink ${row.mono ? 'break-all font-mono text-[0.875rem]' : 'text-[0.9375rem]'}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-muted">{NPC_NOTE}</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
          {/* An escape hatch to the full page — closing first so the reader does
              not return to a modal stacked over a form they have left. */}
          <Link
            to="/privacy"
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
          >
            Open the full policy page
            <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
