import React from 'react';
import { SirenIcon } from 'lucide-react';
import { EMERGENCY_HOTLINES, LGU_CONTACT } from '../../data/site';

/**
 * Emergency numbers, shown wherever someone might look for help first (Contact, Report a
 * Concern). Every number is a tap-to-call link — on a phone, in an emergency, that is the point.
 */
export function EmergencyHotlines({ lead }: { lead: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-alert-600/25 bg-alert-50 p-4 text-[0.9375rem] leading-relaxed text-alert-800">
      <SirenIcon className="mt-0.5 h-5 w-5 shrink-0 text-alert-600" aria-hidden="true" />
      <div className="min-w-0">
        <p>{lead}</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {EMERGENCY_HOTLINES.map((h) => (
            <li key={h.label}>
              <span className="font-semibold text-alert-900">{h.label}</span>{' '}
              <span className="text-[0.8125rem]">({h.detail})</span>:{' '}
              <a href={h.href} className="whitespace-nowrap font-mono font-semibold underline underline-offset-2">
                {h.number}
              </a>
            </li>
          ))}
          <li>
            <span className="font-semibold text-alert-900">National hotline</span>:{' '}
            <a href={`tel:${LGU_CONTACT.emergency}`} className="font-mono font-semibold underline underline-offset-2">
              {LGU_CONTACT.emergency}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
