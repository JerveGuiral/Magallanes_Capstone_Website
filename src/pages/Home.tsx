import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PhoneIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { LazyMunicipalMap as MunicipalMap } from '../components/home/LazyMunicipalMap';
import { MotifDivider } from '../components/ui/MotifDivider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { FeaturedNews } from '../components/news/FeaturedNews';
import { MunicipalStats } from '../components/home/MunicipalStats';
import { MeetBitoy } from '../components/home/MeetBitoy';
import { usePageTitle } from '../lib/usePageTitle';
import { Reveal } from '../components/Reveal';
import { Picture } from '../components/ui/Picture';
import { adminService, type NewsAnnouncement, type ServiceItem } from '../services/adminService';
import { DESTINATIONS, TOURISM_CREDITS } from '../data/tourism';
import { LGU_CONTACT, EMERGENCY_HOTLINES } from '../data/site';

/* Destination id → which of its gallery photos to show. The lead gets the big tile. */
const LIFE_STRIP = (
  [
    ['bay-walk', 'bay-walk-2'],
    ['magellan-shrine', 'magellan-shrine-1'],
    ['centennial-bitaug-tree', 'centennial-tree-1'],
    ['poblacion-town-centre', 'public-market-1'],
    ['rosario-parish', 'parish-1'],
  ] as const
).flatMap(([id, photo]) => {
  const place = DESTINATIONS.find((d) => d.id === id);
  const image = place?.gallery.find((g) => g.name === photo);
  return place && image ? [{ place, image }] : [];
});

const HELP_DESK = [
  { Icon: ClockIcon, label: 'Office hours', value: LGU_CONTACT.officeHours },
  { Icon: PhoneIcon, label: "Mayor's Office", value: `${LGU_CONTACT.phone} · Emergency (MERT): ${EMERGENCY_HOTLINES[0].number}` },
  { Icon: MapPinIcon, label: 'Municipal Hall', value: 'Barangay Poblacion, Magallanes, Agusan del Norte' },
];

/* Cap the homepage teaser so it reads as a shortcut, not a duplicate of the
 * full directory on /services. */
const SERVICE_TEASER_COUNT = 6;

function ServiceTileSkeleton() {
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <div className="skeleton h-10 w-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton mt-2 h-3 w-1/2" />
      </div>
    </div>
  );
}

export function Home() {
  usePageTitle();
  const [news, setNews] = React.useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getNews().then(({ data }) => {
      if (mounted) {
        setNews((data || []).filter((n) => n.is_published));
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    adminService.getServices().then(({ data }) => {
      if (mounted) {
        setServices(data || []);
        setServicesLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Hero />

      {/* Facts strip — gives the page a second focal moment right after the
          photograph, before the reader has to start reading prose. */}
      <MunicipalStats />

      {/* The chatbot is the project's heart; introduce it before the notices. */}
      <MeetBitoy />

      {/* ---- Latest Public Notices ---- */}
      <section className="w-full bg-white py-16 lg:py-section-lg" aria-labelledby="latest-news-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 id="latest-news-title" className="text-display-lg">
              Latest Public Notices
            </h2>
            <Link to="/news" className="btn btn-secondary group">
              View all
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-9">
            {loading ? (
              <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8">
                <div className="skeleton aspect-[16/9] w-full rounded-xl" />
                <div className="flex flex-col gap-4">
                  <div className="skeleton h-28 flex-1 rounded-xl" />
                  <div className="skeleton h-28 flex-1 rounded-xl" />
                  <div className="skeleton h-28 flex-1 rounded-xl" />
                </div>
              </div>
            ) : news.length === 0 ? (
              <div className="rounded-xl border border-dashed border-hairline bg-white p-12 text-center">
                <p className="text-[0.9375rem] text-ink-muted">No releases posted yet.</p>
              </div>
            ) : (
              <FeaturedNews items={news.slice(0, 4)} />
            )}
          </div>
        </div>
      </section>

      {/* ---- Frontline services ---- */}
      <section className="w-full bg-surface-muted py-14 lg:py-section" aria-labelledby="quick-services-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div id="quick-services-title">
              <SectionHeading
                eyebrow="Citizen services"
                title="Frontline services"
                description="Commonly requested services. See the full list for requirements, fees, and processing time."
              />
            </div>
            <Link to="/services" className="btn btn-secondary group">
              View all services
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <ul className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {servicesLoading ? (
              Array.from({ length: SERVICE_TEASER_COUNT }).map((_, i) => (
                <li key={i}>
                  <ServiceTileSkeleton />
                </li>
              ))
            ) : services.length === 0 ? (
              <li className="sm:col-span-2 lg:col-span-3">
                <p className="rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
                  No services posted yet.
                </p>
              </li>
            ) : (
              services.slice(0, SERVICE_TEASER_COUNT).map((service, i) => (
                <Reveal as="li" key={service.id} delay={i * 0.03}>
                  <Link
                    to="/services"
                    className="card card-interactive group flex h-full items-center gap-3.5 p-4"
                  >
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-100"
                      aria-hidden="true"
                    >
                      <ServiceIcon category={service.category} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sans text-[0.9375rem] font-bold text-brand-800">
                        {service.name}
                      </span>
                      {service.office && (
                        <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-muted">{service.office}</span>
                      )}
                    </span>
                    <ArrowRightIcon
                      className="h-4 w-4 shrink-0 text-ink-subtle transition-all duration-150 ease-gov group-hover:translate-x-0.5 group-hover:text-brand-600"
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* ---- Life in Magallanes: real local photos, each linking to its place ---- */}
      <section
        className="w-full bg-white py-16 lg:py-section-lg"
        aria-labelledby="life-title"
      >
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 id="life-title" className="text-display-lg text-brand-800">
                Life in Magallanes
              </h2>
              <p className="mt-2 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
                The bay, the shrine, the old Bitaug tree, the market and the parish — places our people know by heart.
                Join the town fiesta every October.
              </p>
            </div>
            <Link to="/tourism" className="btn btn-secondary group bg-white">
              All tourist spots
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            {LIFE_STRIP.map(({ place, image }, i) => {
              const credit = TOURISM_CREDITS[image.name];
              const lead = i === 0;
              return (
                <Reveal as="li" key={place.id} delay={i * 0.05} className={lead ? 'sm:col-span-2 lg:row-span-2' : ''}>
                  <figure className="flex h-full flex-col">
                    <Link
                      to={`/tourism/${place.id}`}
                      className={`group relative block overflow-hidden rounded-2xl shadow-raised ${
                        lead ? 'aspect-[4/3] lg:aspect-auto lg:min-h-0 lg:flex-1' : 'aspect-[4/3]'
                      }`}
                    >
                      <Picture
                        name={image.name}
                        alt={image.alt}
                        sizes={lead ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'}
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-500 ease-gov group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <span className={`block font-display font-bold text-white ${lead ? 'text-xl sm:text-2xl' : 'text-base'}`}>
                          {place.name}
                        </span>
                        <span className="mt-0.5 block text-[0.8125rem] text-accent-200">
                          {place.barangay.startsWith('Across') ? place.barangay : `Barangay ${place.barangay}`}
                        </span>
                      </span>
                    </Link>
                    {credit && (
                      <figcaption className="mt-1.5 truncate text-[0.6875rem] text-ink-subtle">
                        Photo:{' '}
                        <a href={credit.source} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {credit.author}
                        </a>{' '}
                        · {credit.license}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <MotifDivider />

      <MunicipalMap />

      {/* ---- Public assistance ----
          A light band so the page doesn't end in two dark slabs
          (this and the footer). */}
      <section className="w-full bg-surface-muted py-14 lg:py-section" aria-labelledby="help-desk-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <div id="help-desk-title">
              <SectionHeading
                eyebrow="Public assistance"
                title="Need help?"
                description="Walk-in queries are handled at the Municipal Hall in Poblacion, or ask Bitoy, the Municipal Assistant, in English or Bisaya. For emergencies, call MERT at 0938 759 1508, BFP at 0931 721 8881, PNP at 0947 994 4405, or 911."
              />
            </div>

            <Link
              to="/contact"
              className="btn btn-primary btn-lg mt-7"
            >
              Contact the Municipal Hall
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {HELP_DESK.map(({ Icon, label, value }) => (
              <div key={label} className="flex flex-col rounded-xl border border-hairline bg-white p-5 shadow-subtle">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <dt className="mt-4 font-sans text-eyebrow uppercase text-accent-700">{label}</dt>
                <dd className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
