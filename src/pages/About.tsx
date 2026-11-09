import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LandmarkIcon, TreesIcon, ChurchIcon, ScrollTextIcon, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { BitaugMotif } from '../components/BitaugMotif';
import { Picture } from '../components/ui/Picture';
import { Reveal } from '../components/Reveal';
import { TOURISM_CREDITS } from '../data/tourism';

const PROFILE = [
  { label: 'Income class', value: '4th class municipality' },
  { label: 'Land area', value: '44.31 km²' },
  { label: 'Barangays', value: '8' },
  { label: 'Population (2020 CPH)', value: '22,293' },
  { label: 'Population (2024 est.)', value: '22,780' },
  { label: 'Founded', value: 'June 21, 1969 (R.A. 5660)' },
];

/* Every date here is already stated elsewhere on the site (this page's history, the Magellan
 * Shrine and Bitaug tree pages). The 1521 Mass is worded as the local tradition it is — the
 * claim is debated, as the Magellan Shrine page explains. */
const TIMELINE: { year: string; title: string; detail: string; Icon: LucideIcon; tone: string }[] = [
  {
    year: '1521',
    title: 'Magellan’s expedition',
    detail: 'Local tradition holds that the expedition celebrated Mass here on April 8, 1521. The town is named after Magellan.',
    Icon: ChurchIcon,
    tone: 'tone-red',
  },
  {
    year: '1872',
    title: 'The Magellan Shrine',
    detail: 'A stone marker commemorating the Mass is erected in Poblacion, near where the Agusan River meets Butuan Bay.',
    Icon: LandmarkIcon,
    tone: 'tone-gold',
  },
  {
    year: '1969',
    title: 'A municipality of its own',
    detail: 'Republic Act No. 5660 creates the Municipality of Magallanes on June 21, 1969, from part of Butuan.',
    Icon: ScrollTextIcon,
    tone: 'tone-blue',
  },
  {
    year: '1998',
    title: 'A Centennial Tree',
    detail: 'The 500-year-old Bitaug of Barangay Caloc-an is declared a Philippine Centennial Tree.',
    Icon: TreesIcon,
    tone: 'tone-green',
  },
];

/* The official statements, once the Office of the Municipal Mayor and the Sangguniang Bayan
 * confirm them. While either is null the section is not shown — a pair of "awaiting
 * confirmation" boxes read as an unfinished page to visitors from the LGU. */
const MISSION: string | null = null;
const VISION: string | null = null;

export function About() {
  const treeCredit = TOURISM_CREDITS['centennial-tree-1'];

  return (
    <>
      <PageHeader
        image="river-delta-1"
        eyebrow="About"
        title="The Municipality of Magallanes"
        description="Learn about the Municipality of Magallanes, Agusan del Norte — its history, its role as a local government unit, and its heritage."
      />

      {/* ---- Mandate ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="mandate-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div>
            <div id="mandate-title">
              <SectionHeading eyebrow="Local government unit" title="Role of the municipality" />
            </div>

            {/* Only what the Local Government Code establishes; priorities and a motto that appeared
                here earlier had no source and were removed until the LGU provides official text. */}
            <div className="prose-gov mt-7">
              <p>
                As a local government unit under the Local Government Code of 1991 (Republic Act No. 7160), the
                Municipality of Magallanes delivers basic services to its residents, including health, agriculture,
                social welfare, environmental management, and local infrastructure.
              </p>
              <p>
                The municipality is led by the Municipal Mayor, with the Sangguniang Bayan, presided over by the Vice
                Mayor, as its legislative body. Its eight barangays are Buhang, Caloc-an, Guiasan, Marcos, Poblacion,
                Santo Niño, Santo Rosario, and Taod-oy.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/officials" className="btn btn-primary rounded-full">
                Meet the officials
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/barangays" className="btn btn-secondary rounded-full">
                The 8 barangays
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="profile-title">
            <div className="card overflow-hidden shadow-card">
              <h2 id="profile-title" className="band-brand px-6 py-4 font-display text-lg font-bold text-white">
                Municipal profile
              </h2>
              <dl className="divide-y divide-hairline px-6">
                {PROFILE.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[0.875rem] text-ink-muted">{row.label}</dt>
                    <dd className="text-right text-[0.9375rem] font-semibold tabular-nums text-brand-800">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <MotifDivider />

      {/* ---- History: the story, then the four dates that shaped the town ---- */}
      <section className="w-full bg-white py-14 lg:py-section" aria-labelledby="history-title">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <div id="history-title">
              <SectionHeading eyebrow="Our story" title="History of Magallanes" />
            </div>
            <div className="prose-gov mt-7">
              <p>
                Magallanes was created as a municipality on June 21, 1969 through Republic Act No. 5660. It was formerly
                part of the Municipality of Butuan (now Butuan City). The town is named after Ferdinand Magellan
                (Magallanes in Spanish), whose expedition is locally believed to have celebrated Mass here on April 8,
                1521 — the event marked by the Magellan Shrine in Poblacion.
              </p>
              <p>
                The municipality lies at the mouth of the Agusan and Baug Rivers. Much of the town centre is low-lying
                delta land protected by dikes, and fishing has long been one of the main sources of livelihood.
              </p>
            </div>
            <div className="relative mt-8 overflow-hidden rounded-2xl shadow-raised">
              <Picture
                name="magellan-shrine-2"
                alt="The Magellan Shrine in Poblacion, Magallanes"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="block aspect-[16/9] w-full"
                imgClassName="h-full w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 font-display text-lg font-bold text-white">
                The Magellan Shrine, Poblacion
              </span>
            </div>
            {TOURISM_CREDITS['magellan-shrine-2'] && (
              <p className="mt-1.5 text-[0.6875rem] text-ink-subtle">
                Photo:{' '}
                <a href={TOURISM_CREDITS['magellan-shrine-2'].source} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {TOURISM_CREDITS['magellan-shrine-2'].author}
                </a>{' '}
                · {TOURISM_CREDITS['magellan-shrine-2'].license}
              </p>
            )}
          </div>

          <ol className="relative space-y-6 lg:pt-14" aria-label="Milestones in the history of Magallanes">
            <span className="absolute bottom-6 left-6 top-6 w-0.5 rounded-full bg-gradient-to-b from-sky-200 via-brand-200 to-accent-200 lg:top-20" aria-hidden="true" />
            {TIMELINE.map(({ year, title, detail, Icon, tone }, i) => (
              <Reveal as="li" key={year} delay={i * 0.06} className="relative flex gap-5">
                <span className={`icon-tile ${tone} relative z-10 ring-4 ring-white`} aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="card flex-1 p-5">
                  <p className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] text-brand-600">{year}</p>
                  <h3 className="mt-2 font-sans text-[1rem] font-bold text-brand-800">{title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{detail}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Mission & Vision — only once the official text exists ---- */}
      {MISSION && VISION && (
        <section className="w-full py-14 lg:py-section" aria-labelledby="mission-vision-title">
          <div className="container-page">
            <div id="mission-vision-title">
              <SectionHeading title="Mission & Vision" />
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Mission', text: MISSION },
                { label: 'Vision', text: VISION },
              ].map(({ label, text }) => (
                <div key={label} className="card p-6">
                  <p className="font-sans text-eyebrow uppercase text-accent-700">{label}</p>
                  <p className="mt-3 font-display text-lg leading-relaxed text-brand-800">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Heritage: the Bitaug tree ---- */}
      <section className="relative w-full overflow-hidden bg-surface-muted py-14 lg:py-section" aria-labelledby="heritage-title">
        <BitaugMotif className="pointer-events-none absolute -right-8 top-4 hidden h-56 w-72 text-brand-200 md:block" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <figure>
            <div className="relative">
              <span className="absolute -bottom-4 -right-4 h-full w-full rounded-3xl bg-accent-100" aria-hidden="true" />
              <Picture
                name="centennial-tree-1"
                alt="The Philippine Centennial Bitaug tree in Barangay Caloc-an"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-raised ring-4 ring-white"
                imgClassName="h-full w-full object-cover"
              />
            </div>
            {treeCredit && (
              <figcaption className="mt-6 text-[0.6875rem] text-ink-subtle">
                Photo:{' '}
                <a href={treeCredit.source} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {treeCredit.author}
                </a>{' '}
                · {treeCredit.license}
              </figcaption>
            )}
          </figure>
          <div id="heritage-title">
            <SectionHeading
              eyebrow="Our heritage"
              title="The Bitaug tree"
              description="The Bitaug (Calophyllum inophyllum) is a coastal tree common along the Magallanes shoreline. A Bitaug in Barangay Caloc-an, estimated to be about 500 years old, was declared a Philippine Centennial Tree in 1998. Its outline is used as a design motif on this website — and Bitoy, the Municipal Assistant, is named after it."
            />
            <Link
              to="/tourism/centennial-bitaug-tree"
              className="group mt-6 inline-flex items-center gap-2 font-sans text-[0.9375rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              Visit the Centennial Tree
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
