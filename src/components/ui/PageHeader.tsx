import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { Picture } from './Picture';
import { usePageTitle } from '../../lib/usePageTitle';
import { TOURISM_CREDITS } from '../../data/tourism';
import type { ImageName } from '../../data/images';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional trailing slot — a count, a download, a filter. Sits on the photograph, so give it its own surface. */
  aside?: React.ReactNode;
  /** The local photograph behind the title. Each section of the site has its own. */
  image?: ImageName;
  /** CSS object-position for the photograph, to keep its subject in frame. */
  imagePosition?: string;
};

/**
 * Page entry band: a photograph of Magallanes behind the title.
 *
 * Every interior page carries one, so the photographs do the work a plain tinted band
 * could not — each page opens on a real place in the town. A warm rose-plum scrim keeps
 * the white title legible (never navy: the site is meant to feel welcoming). Photos from
 * Wikimedia Commons carry their licence credit, which CC BY-SA requires.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  image = 'municipal-hall-1',
  imagePosition = 'center 45%',
}: PageHeaderProps) {
  // Every interior page renders one of these, so its title names the browser tab too.
  usePageTitle(title);
  const credit = TOURISM_CREDITS[image];

  return (
    <div className="relative isolate overflow-hidden bg-brand-800">
      <Picture
        name={image}
        alt=""
        sizes="100vw"
        priority
        className="absolute inset-0 -z-10 block h-full w-full"
        imgClassName="h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
      {/* Left-weighted scrim: strong behind the text, light over the rest of the photo. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/70 via-brand-900/40 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-brand-950/35 to-transparent" aria-hidden="true" />

      <div className="container-page relative pb-12 pt-12 lg:pb-16 lg:pt-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-micro uppercase text-white/80">
            <li>
              <Link
                to="/"
                className="-my-2.5 inline-block py-2.5 transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-2"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3 w-3 text-white/60" />
            </li>
            <li className="font-semibold text-fiesta-300" aria-current="page">
              {eyebrow}
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="max-w-3xl text-display-lg text-white [text-shadow:0_2px_18px_rgba(94,28,55,0.45)] sm:text-display-xl">
              {title}
            </h1>
            <span className="mt-4 block h-1 w-16 rounded-full bg-fiesta-400" aria-hidden="true" />
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgba(94,28,55,0.5)]">
              {description}
            </p>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </div>

      {credit && (
        <p className="absolute bottom-1.5 right-3 max-w-[60%] truncate text-[0.625rem] text-white/70">
          Photo:{' '}
          <a href={credit.source} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
            {credit.author}
          </a>{' '}
          · {credit.license}
        </p>
      )}
    </div>
  );
}
