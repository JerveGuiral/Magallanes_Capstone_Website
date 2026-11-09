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
 * A static preview of a conversation, so a visitor sees what Bitoy does before opening him.
 * The facts in the reply (office, hours, requirement) match the service directory and the
 * office hours in site.ts — keep them in step if either changes.
 */
function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm rounded-3xl bg-white p-4 shadow-raised ring-1 ring-brand-100" aria-hidden="true">
      <div className="flex items-center gap-2.5 border-b border-hairline pb-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-50">
          <Bitoy className="h-8 w-8" />
        </span>
        <span className="leading-tight">
          <span className="block text-[0.875rem] font-bold text-brand-800">Bitoy</span>
          <span className="flex items-center gap-1.5 text-[0.6875rem] text-accent-700">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            Online · English &amp; Bisaya
          </span>
        </span>
      </div>
      <div className="mt-3.5 space-y-2.5 text-[0.875rem] leading-snug">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-white">
          Asa ko makakuha og cedula?
        </p>
        <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-brand-50 px-3.5 py-2 text-ink">
          Sa Municipal Treasurer&apos;s Office sa Munisipyo, Lunes hangtod Biyernes, 8:00 AM – 5:00 PM. Dad-a lang ang
          imong valid ID. 😊
        </p>
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2 text-white">
          Salamat, Bitoy!
        </p>
      </div>
    </div>
  );
}

/**
 * Homepage introduction to Bitoy, the chatbot — the heart of the project. He waves when the
 * section scrolls into view, and each sample question opens the chat already asking it.
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
          className="relative overflow-hidden rounded-[2rem] bg-surface-muted ring-1 ring-hairline"
        >
          <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:p-12">
            <div className="min-w-0">
              <div className="flex items-center gap-5">
                <div className="shrink-0" onMouseEnter={wave}>
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-raised ring-4 ring-brand-100 sm:h-28 sm:w-28">
                    <Bitoy mood={mood} detailed className="h-20 w-20 sm:h-24 sm:w-24" title="Bitoy, the Bitaug tree mascot" />
                  </div>
                </div>
                <div>
                  <p className="font-sans text-eyebrow uppercase text-accent-700">Virtual assistant · 24/7</p>
                  <h2 id="meet-bitoy-title" className="mt-1.5 text-display-lg">
                    Meet Bitoy
                  </h2>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">
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
                      className="rounded-full border border-brand-200 bg-white px-4 py-2 text-left text-[0.875rem] font-medium text-brand-700 shadow-subtle transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>

              <button type="button" onClick={() => askBitoy()} className="btn btn-primary btn-lg mt-7 rounded-full">
                <MessageCircleIcon className="h-4 w-4" aria-hidden="true" />
                Chat with Bitoy
              </button>
            </div>

            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
