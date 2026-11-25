import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { LGU_CONTACT } from '../data/site';

/*
 * Accessibility statement. Government websites, LGUs included, are covered by the Philippine
 * Web Accessibility Policy, which adopts the W3C Web Content Accessibility Guidelines (WCAG) 2.0
 * (ISO/IEC 40500:2012) as the national standard. Every feature listed here exists on the site;
 * the known gaps are listed too, so nobody is promised what the site does not do.
 */
const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Skip to main content',
    body: 'Press Tab once when a page opens: a "Skip to main content" link appears, so keyboard and screen reader users do not have to pass through the menu on every page.',
  },
  {
    title: 'Larger or smaller text',
    body: 'Use the A− and A+ buttons in the strip at the very top of every page. The size you choose is remembered on your device. Your browser zoom (Ctrl and +) also works, up to 200%, without the page breaking.',
  },
  {
    title: 'Keyboard use',
    body: 'Every menu, the site search, forms, and the Magi chat can be used with the keyboard alone. Tab moves forward, Shift+Tab moves back, Enter opens a link or button, and Esc closes menus, the search, and the chat window.',
  },
  {
    title: 'Visible focus',
    body: 'The link or button you are on is always outlined, so you can see where you are when using the keyboard.',
  },
  {
    title: 'Text for images',
    body: 'Photos and the municipal seal have text descriptions that screen readers read aloud. Purely decorative images are hidden from screen readers so they do not get in the way.',
  },
  {
    title: 'Readable colours',
    body: 'Text and button colours were chosen to meet the WCAG contrast ratio for normal text against their backgrounds.',
  },
  {
    title: 'Less motion',
    body: 'If your device is set to reduce motion, the site turns off its animations and page transitions.',
  },
  {
    title: 'Phones and tablets',
    body: 'Every page adjusts to the size of your screen. Nothing needs to be installed.',
  },
  {
    title: 'Ask Magi in your own words',
    body: 'Magi, the chat assistant at the lower right, answers in English or Bisaya, whichever you type in, so you do not have to find the right page yourself.',
  },
];

const KNOWN_GAPS: string[] = [
  'Documents posted as PDF files, especially scanned ones, may not be readable by screen readers. Ask the office concerned for an accessible copy.',
  'Videos posted by the LGU may not have captions yet.',
  'The site is in English, with Bisaya titles on forms and Bisaya answers from Magi. Other languages are not yet available.',
];

export function Accessibility() {
  return (
    <>
      <PageHeader
        image="welcome-mark-1"
        eyebrow="Accessibility"
        title="Accessibility statement"
        description="The Municipality of Magallanes wants every resident, including persons with disabilities and senior citizens, to be able to use this website."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="accessibility-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="accessibility-title">
              <SectionHeading
                title="What this website does to help"
                description="Built to the Philippine Web Accessibility Policy, which adopts the Web Content Accessibility Guidelines (WCAG) 2.0."
              />
            </div>

            <div className="mt-8 space-y-7">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <h2 className="font-display text-lg font-bold text-brand-800">{f.title}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{f.body}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 font-display text-xl font-bold text-brand-800">What is not yet accessible</h2>
            <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[0.9375rem] leading-relaxed text-ink">
              {KNOWN_GAPS.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>

          <aside className="card p-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="a11y-help-title">
            <h2 id="a11y-help-title" className="font-display text-lg font-bold text-brand-800">
              Having trouble using the site?
            </h2>
            <span className="mt-3 block h-[3px] w-12 rounded-full bg-brand-400" aria-hidden="true" />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink">
              Tell us which page and what went wrong, and we will fix it or give you the information another way.
            </p>
            <dl className="mt-5 divide-y divide-hairline">
              <div className="py-3">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Phone</dt>
                <dd className="mt-1 text-[0.9375rem] text-ink">
                  <a href={LGU_CONTACT.phoneHref} className="font-semibold tabular-nums hover:text-brand-700">
                    {LGU_CONTACT.phone}
                  </a>
                </dd>
              </div>
              <div className="py-3">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Email</dt>
                <dd className="mt-1 break-all font-mono text-[0.875rem] text-ink">
                  <a href={`mailto:${LGU_CONTACT.email}`} className="hover:text-brand-700">
                    {LGU_CONTACT.email}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-hairline pt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              You can also use the <Link to="/report" className="font-semibold text-brand-700 hover:underline">Report a concern</Link> form,
              or visit the Municipal Hall in person.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
