import React from 'react';
import { useInView } from 'framer-motion';
import { MessageCircleIcon } from 'lucide-react';
import { Bitoy, type BitoyMood } from '../Bitoy';
import { askBitoy } from '../../lib/askBitoy';

/* One per topic area, two in English and two in Bisaya. Each is checked to get its specific
 * answer live — keep it that way when changing these. */
const SAMPLE_QUESTIONS = [
  'How do I get a business permit?',
  'Unsaon pagparehistro sa bag-ong natawo?',
  'What is YAKAP?',
  'Kinsa ang mayor sa Magallanes?',
];

/**
 * Homepage introduction to Bitoy, the chatbot — the heart of the project, which otherwise only
 * shows as the floating button. He waves when the section scrolls into view, and each sample
 * question opens the chat already asking it.
 */
export function MeetBitoy() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [mood, setMood] = React.useState<BitoyMood>('idle');
  const timer = React.useRef<number>();

  const wave = React.useCallback(() => {
    window.clearTimeout(timer.current);
    setMood('wave');
    timer.current = window.setTimeout(() => setMood('idle'), 1600);
  }, []);

  React.useEffect(() => {
    if (inView) wave();
  }, [inView, wave]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <section className="w-full bg-white pt-16 lg:pt-section" aria-labelledby="meet-bitoy-title">
      <div className="container-page">
        <div
          ref={ref}
          className="grid items-center gap-8 rounded-2xl border border-accent-100 bg-gradient-to-br from-accent-50 via-white to-brand-50 p-6 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-14"
        >
          <div className="mx-auto lg:mx-0" onMouseEnter={wave}>
            <div className="grid h-40 w-40 place-items-center rounded-full bg-white shadow-raised ring-1 ring-accent-100 sm:h-48 sm:w-48">
              <Bitoy mood={mood} className="h-36 w-36 sm:h-44 sm:w-44" title="Bitoy, the Bitaug tree mascot" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-sans text-eyebrow uppercase text-accent-700">Virtual assistant · 24/7</p>
            <h2 id="meet-bitoy-title" className="mt-2 text-display-lg">
              Meet Bitoy
            </h2>
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
              Bitoy answers questions about permits, the civil registry, health services, officials, office hours
              and tourist spots — any time, in English or Bisaya. He is named after the 500-year-old Bitaug tree of
              Barangay Caloc-an, a Philippine Centennial Tree.
            </p>

            <p className="mt-6 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Try asking
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    type="button"
                    onClick={() => askBitoy(q)}
                    className="rounded-full border border-hairline bg-white px-4 py-2 text-left text-[0.875rem] font-medium text-brand-800 shadow-subtle transition-colors duration-150 hover:border-accent-300 hover:bg-accent-50"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" onClick={() => askBitoy()} className="btn btn-primary btn-lg mt-7">
              <MessageCircleIcon className="h-4 w-4" aria-hidden="true" />
              Chat with Bitoy
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
