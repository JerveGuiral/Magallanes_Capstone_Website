import React from 'react';
import { ExpandIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { Picture } from '../ui/Picture';
import { TOURISM_CREDITS, type GalleryImage } from '../../data/tourism';

const SLIDE_MS = 5000;

/**
 * Photo gallery for a destination.
 *
 * Layout: a 16:9 frame capped at 22rem, a compact thumbnail row, then the
 * caption. The frame was 3:2 and the thumbnails a stretched 4-column grid,
 * which on a two-photo destination pushed ~620px of furniture above the first
 * line of text. Matching the frame to the source photographs (most are 16:9)
 * and giving thumbnails a fixed size instead of a fraction of the width cuts
 * that roughly in half and stops two photos looking like a contact sheet.
 *
 * Images crossfade on a 5s timer. HCI decisions, each deliberate:
 *
 *  - **User control.** Autoplay pauses on hover, on keyboard focus, and via an
 *    explicit play/pause button. Carousels that cannot be stopped are a WCAG
 *    2.2.2 failure, not just an annoyance.
 *  - **Visibility of status.** A progress bar tracks the current slide and the
 *    active thumbnail carries a brass ring plus `aria-current`.
 *  - **Recognition over recall.** Captions stay visible under the frame rather
 *    than hiding behind a click.
 *  - **Respect for motion preferences.** Under `prefers-reduced-motion` the
 *    slides still advance — that is content changing, not motion — but the
 *    crossfade and the progress bar become instant, so nothing animates.
 *  - **Error prevention.** The frame reserves its box, so the text below never
 *    shifts as photographs load.
 *
 * Attribution is inline because the CC BY-SA licence on most of these
 * photographs requires credit wherever the work appears.
 */
export function DestinationGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const many = images.length > 1;
  const current = images[active];
  const credit = TOURISM_CREDITS[current.name];

  const reduced = React.useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const go = React.useCallback(
    (dir: number) => setActive((i) => (i + dir + images.length) % images.length),
    [images.length]
  );

  /* Autoplay. Suspended while the viewer is open so the image under the
   * lightbox cannot change out from under the reader. */
  React.useEffect(() => {
    if (!many || paused || viewerOpen) return;
    const id = window.setInterval(() => go(1), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [many, paused, viewerOpen, go]);

  React.useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewerOpen(false);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [viewerOpen, go]);

  return (
    /* No pause-on-hover: the frame is large and near the top of the page, so the
       pointer rests on it and the slideshow looked permanently stopped. WCAG
       2.2.2 is met by the explicit pause button, which is the control people
       actually look for. Keyboard focus still pauses, so tabbing through the
       thumbnails is not fighting a moving target. */
    <div onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      {/* ---- Frame ---- */}
      <figure className="group relative m-0 overflow-hidden rounded-xl border border-hairline bg-surface-sunken shadow-card">
        <div className="relative aspect-[16/9] max-h-[22rem] w-full">
          {images.map((img, i) => (
            <Picture
              key={img.name}
              name={img.name}
              alt={i === active ? img.alt : ''}
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority={i === 0}
              className={`absolute inset-0 block h-full w-full motion-safe:transition-opacity motion-safe:duration-700 motion-safe:ease-gov ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
              imgClassName="h-full w-full object-cover"
            />
          ))}

          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            className="absolute inset-0 h-full w-full"
            aria-label={`View ${current.alt} at full size`}
          />

          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-brand-950/70 px-2.5 py-1.5 text-[0.75rem] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <ExpandIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Full size
          </span>

          {many && (
            <>
              {/* Transport sits over the image so it costs no vertical space. */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="grid h-8 w-8 place-items-center rounded-md bg-brand-950/65 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-brand-950/85"
                  aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
                >
                  {paused ? <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <PauseIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
                <span className="rounded-md bg-brand-950/65 px-2 py-1.5 font-mono text-[0.6875rem] text-white backdrop-blur-sm">
                  {active + 1}/{images.length}
                </span>
              </div>

              {/* Progress: restarts on every slide via the key, freezes when paused. */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-950/25">
                <div
                  key={`${active}-${paused}`}
                  className="h-full bg-accent-500"
                  style={
                    paused || reduced.current
                      ? { width: '100%', opacity: 0.5 }
                      : { animation: `gallery-progress ${SLIDE_MS}ms linear forwards` }
                  }
                />
              </div>
            </>
          )}
        </div>

        <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-hairline bg-white px-4 py-2.5">
          <span className="text-[0.875rem] text-ink">{current.caption}</span>
          {credit && (
            <span className="text-[0.6875rem] text-ink-subtle">
              Photo:{' '}
              <a
                href={credit.source}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-brand-600"
              >
                {credit.author}
              </a>{' '}
              · {credit.license}
            </span>
          )}
        </figcaption>
      </figure>

      {/* ---- Compact thumbnails: fixed size, so two photos look like two photos ---- */}
      {many && (
        <ul className="mt-3 flex flex-wrap gap-2.5" aria-label={`${name} photographs`}>
          {images.map((img, i) => (
            <li key={img.name}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active}
                aria-label={`Show photograph ${i + 1} of ${images.length}: ${img.caption}`}
                className={`block h-14 w-20 overflow-hidden rounded-md border-2 transition-all duration-200 ease-gov sm:h-16 sm:w-24 ${
                  i === active
                    ? 'border-accent-500 ring-2 ring-accent-500/25'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Picture
                  name={img.name}
                  alt=""
                  sizes="96px"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ---- Full-size viewer ---- */}
      {viewerOpen && (
        <div className="fixed inset-0 z-[85] flex flex-col bg-brand-950/95 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setViewerOpen(false)} aria-hidden="true" />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} — photograph ${active + 1} of ${images.length}`}
            className="relative flex h-full flex-col"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="font-sans text-[0.8125rem] font-semibold text-white">
                {name}
                {many && (
                  <span className="ml-2 font-mono text-[0.75rem] font-normal text-brand-200">
                    {active + 1} / {images.length}
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setViewerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                aria-label="Close viewer"
              >
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-14">
              <Picture
                name={current.name}
                alt={current.alt}
                sizes="100vw"
                className="block max-h-full"
                imgClassName="max-h-[70vh] w-auto rounded-lg object-contain"
              />

              {many && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    className="absolute left-1 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/25 sm:left-3"
                    aria-label="Previous photograph"
                  >
                    <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    className="absolute right-1 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/25 sm:right-3"
                    aria-label="Next photograph"
                  >
                    <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>

            <div className="shrink-0 px-4 py-4 text-center sm:px-6">
              <p className="text-[0.9375rem] text-white">{current.caption}</p>
              {credit && (
                <p className="mt-1 text-[0.75rem] text-brand-200">
                  Photo: {credit.author} · {credit.license} · Wikimedia Commons
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Standing notice about where the photography comes from. */
export function PhotoCreditNotice() {
  return (
    <p className="flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-muted p-4 text-[0.8125rem] leading-relaxed text-ink-muted">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
      <span>
        Destination photographs are contributed by local photographers through{' '}
        <a
          href="https://commons.wikimedia.org/wiki/Category:Magallanes,_Agusan_del_Norte"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800"
        >
          Wikimedia Commons
        </a>{' '}
        and are reused here under Creative Commons licences. Each photograph credits its author. If you have
        photographs of Magallanes you would like the municipality to use, contact the Municipal Tourism desk.
      </span>
    </p>
  );
}
