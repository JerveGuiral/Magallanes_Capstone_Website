import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PhoneIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { MunicipalMap } from '../components/home/MunicipalMap';
import { MotifDivider } from '../components/ui/MotifDivider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { NewsCard } from '../components/news/NewsCard';
import { Reveal } from '../components/Reveal';
import { adminService, type NewsAnnouncement } from '../services/adminService';

const HELP_DESK = [
  { Icon: ClockIcon, label: 'Office hours', value: 'Monday to Friday, 8:00 AM – 5:00 PM' },
  { Icon: PhoneIcon, label: 'Hotline (MDRRMO)', value: '(085) 000-0000 · 0917 000 0000' },
  { Icon: MapPinIcon, label: 'Municipal Hall', value: 'Barangay Poblacion, Magallanes, Agusan del Norte' },
];

function NewsSkeleton() {
  return (
    <div className="card overflow-hidden p-5">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton mt-3 h-5 w-full" />
      <div className="skeleton mt-2 h-5 w-4/5" />
      <div className="skeleton mt-4 h-3 w-full" />
      <div className="skeleton mt-1.5 h-3 w-11/12" />
      <div className="skeleton mt-4 h-3 w-36" />
    </div>
  );
}

export function Home() {
  const [news, setNews] = React.useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = React.useState(true);

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

  return (
    <>
      <Hero />

      {/* ---- Municipal bulletin ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="latest-news-title">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div id="latest-news-title">
              <SectionHeading
                eyebrow="Municipal bulletin"
                title="Latest news & notices"
                description="Ordinances, project updates and public notices, newest first."
              />
            </div>
            <Link to="/news" className="btn btn-secondary group">
              View all releases
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {loading ? (
              <>
                <NewsSkeleton />
                <NewsSkeleton />
              </>
            ) : news.length === 0 ? (
              <p className="rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted lg:col-span-2">
                No releases posted yet.
              </p>
            ) : (
              news.slice(0, 4).map((item, i) => (
                <Reveal key={item.id} delay={i * 0.04}>
                  <NewsCard item={item} />
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      <MotifDivider />

      <MunicipalMap />

      {/* ---- Public assistance ---- */}
      <section className="w-full bg-brand-800 py-14 text-white lg:py-section" aria-labelledby="help-desk-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <div>
            <div id="help-desk-title">
              <SectionHeading
                tone="dark"
                eyebrow="Public assistance"
                title="Reach the right office the first time."
                description="Walk-in queries are handled at the Public Assistance Desk on the ground floor of the Municipal Hall. For disaster-related concerns, contact the MDRRMO hotline, which operates 24/7."
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
              <div key={label} className="flex flex-col bg-brand-800 p-5">
                <Icon className="h-5 w-5 text-accent-400" aria-hidden="true" />
                <dt className="mt-4 font-display text-eyebrow uppercase text-accent-400">{label}</dt>
                <dd className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
