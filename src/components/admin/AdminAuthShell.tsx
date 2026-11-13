import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Picture, SealImage } from '../ui/Picture';

/**
 * The frame of the admin sign-in pages (sign in, forgot password, set a new password): the
 * Municipal Hall photo on the left on desktop, the seal above the card on phones, and the card
 * itself in the middle.
 */
export function AdminAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] w-full bg-surface-muted lg:grid-cols-[1.05fr_1fr]">
      {/* ---- Left: the Municipal Hall (desktop). Pinned to the screen height, so its text
              is never pushed below the fold by a tall form. ---- */}
      <aside className="relative hidden overflow-hidden bg-brand-800 lg:sticky lg:top-0 lg:block lg:h-[100dvh]">
        <Picture
          name="municipal-hall-1"
          alt=""
          sizes="55vw"
          priority
          className="absolute inset-0 block h-full w-full"
          imgClassName="h-full w-full object-cover"
          style={{ objectPosition: 'center 45%' }}
        />
        {/* Darker only where the text sits: top for the identity, bottom for the message. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card">
              <SealImage className="h-10 w-10 object-contain" />
            </span>
            <span className="leading-tight text-white">
              <span className="block font-display text-lg font-bold">Municipality of Magallanes</span>
              <span className="text-[0.8125rem] text-white/85">Province of Agusan del Norte</span>
            </span>
          </div>

          <div className="max-w-lg">
            <p className="font-sans text-eyebrow uppercase text-fiesta-300">Admin portal</p>
            <p className="mt-3 font-display text-[2.25rem] font-bold leading-tight text-white">
              Keep the people of Magallanes informed.
            </p>
            <p className="mt-3 text-[1rem] leading-relaxed text-white/90">
              Publish news and advisories, update services and officials, and see what residents ask Magi.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[26rem]">
          {/* Phones: identity above the card (the photo panel is desktop-only). */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <SealImage alt="Municipal seal of Magallanes" priority className="h-12 w-12 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-brand-800">Municipality of Magallanes</span>
              <span className="text-[0.8125rem] text-ink-muted">Admin portal</span>
            </span>
          </div>

          <div className="rounded-3xl border border-hairline bg-white p-7 shadow-raised sm:p-9">{children}</div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5" aria-hidden="true" />
              Return to public website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

/** An error box inside the card. */
export function AuthAlert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-xl border border-alert-600/25 bg-alert-50 p-3.5 text-[0.875rem] text-alert-800">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Error">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

/** A neutral or success notice inside the card. */
export function AuthNotice({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div role="status" className="mt-6 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[0.875rem] text-brand-800">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}
