import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PhoneIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { MunicipalMap } from '../components/home/MunicipalMap';
import { MotifDivider } from '../components/ui/MotifDivider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { FeaturedNews } from '../components/news/FeaturedNews';
import { MunicipalStats } from '../components/home/MunicipalStats';
import { Reveal } from '../components/Reveal';
import { Picture } from '../components/ui/Picture';
import { adminService, type NewsAnnouncement, type ServiceItem } from '../services/adminService';
import { DESTINATIONS } from '../data/tourism';
import { LGU_CONTACT } from '../data/site';

const TOURISM_TEASER = DESTINATIONS.find((d) => d.id === 'agusan-baug-delta') ?? DESTINATIONS[0];

const HELP_DESK = [
  { Icon: ClockIcon, label: 'Office hours', value: LGU_CONTACT.officeHours },
  { Icon: PhoneIcon, label: "Mayor's Office", value: `${LGU_CONTACT.phone} · Emergencies: ${LGU_CONTACT.emergency}` },
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

      {/* ---- Task menu: three doors into the site ---- */}

      {/* ---- Latest Public Notices — the one section that gets the mint tint ---- */}
      <section className="w-full bg-surface-muted py-16 lg:py-section-lg" aria-labelledby="latest-news-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 id="latest-news-title" className="text-display-lg">
              Latest Public Notices
            </h2>
            <Link to="/news" className="btn btn-secondary group bg-white">
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
      <section className="w-full py-14 lg:py-section" aria-labelledby="quick-services-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div id="quick-services-title">
              <SectionHeading
                eyebrow="Citizen services"
                title="Start a transaction"
                description="A few of the most requested frontline transactions. Browse the full directory for fees, requirements and processing time."
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

          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* ---- Tourism teaser ---- */}
      <section className="w-full bg-surface-muted py-16 lg:py-section-lg" aria-labelledby="tourism-teaser-title">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Picture
              name={TOURISM_TEASER.gallery[0].name}
              alt={TOURISM_TEASER.gallery[0].alt}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="block aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-raised"
              imgClassName="h-full w-full object-cover"
            />
          </Reveal>

          <Reveal delay={0.06}>
            <p className="flex items-center gap-2.5 font-sans text-eyebrow uppercase text-sea-700">
              <span className="h-[2px] w-7 shrink-0 rounded-full bg-sea-600" aria-hidden="true" />
              Visit Magallanes
            </p>
            <h2 id="tourism-teaser-title" className="mt-2.5 text-display-lg">
              Coastline, mangroves, and a delta that still feeds the table.
            </h2>
            <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ink-muted">
              A small coastal municipality at the mouth of the Agusan River — grey-sand shoreline under old Bitaug
              trees, guided paddle tours through the mangrove delta, and a fish landing that still runs on the tide.
            </p>
            <Link to="/tourism" className="btn btn-primary btn-lg mt-7">
              See tourist destinations
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <MotifDivider />

      <MunicipalMap />

      {/* ---- Public assistance ----
          brand-700, one step lighter than the footer's brand-900 directly
          below it — otherwise the two dark bands run together with no
          visible seam. */}
      <section className="w-full bg-brand-700 py-14 text-white lg:py-section" aria-labelledby="help-desk-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <div id="help-desk-title">
              <SectionHeading
                tone="dark"
                eyebrow="Public assistance"
                title="Reach the right office the first time."
                description="Walk-in queries are handled at the Municipal Hall in Poblacion, or ask the Municipal Assistant in English or Bisaya. For emergencies, call 911."
              />
            </div>

            <Link
              to="/contact"
              className="btn btn-lg mt-7 bg-white text-brand-800 transition-colors duration-150 hover:bg-accent-100"
            >
              Contact the Municipal Hall
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Hairline grid built from gaps — one rule between cells, none outside. */}
          <dl className="grid gap-px overflow-hidden rounded-lg bg-white/15 sm:grid-cols-3">
            {HELP_DESK.map(({ Icon, label, value }) => (
              <div key={label} className="flex flex-col bg-brand-700 p-5">
                <Icon className="h-5 w-5 text-accent-400" aria-hidden="true" />
                <dt className="mt-4 font-sans text-eyebrow uppercase text-accent-400">{label}</dt>
                <dd className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
