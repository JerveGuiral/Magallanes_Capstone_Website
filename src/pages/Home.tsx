import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PhoneIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { Hero } from '../components/home/Hero';
import { MunicipalMap } from '../components/home/MunicipalMap';
import { MotifDivider } from '../components/ui/MotifDivider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { NewsCard } from '../components/news/NewsCard';
import { Reveal } from '../components/Reveal';
import { NEWS } from '../data/site';

const HELP_DESK = [
  { Icon: ClockIcon, label: 'Office hours', value: 'Monday to Friday, 8:00 AM – 5:00 PM' },
  { Icon: PhoneIcon, label: 'Hotline (MDRRMO)', value: '(085) 000-0000 · 0917 000 0000' },
  { Icon: MapPinIcon, label: 'Municipal Hall', value: 'Barangay Poblacion, Magallanes, Agusan del Norte' }];


export function Home() {
  return (
    <>
      <Hero />

      <section className="w-full py-14" aria-labelledby="latest-news-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div id="latest-news-title">
              <SectionHeading
                eyebrow="Municipal bulletin"
                title="Latest news & notices"
                description="Ordinances, project updates and public notices, newest first." />

            </div>
            <Link
              to="/news"
              className="inline-flex items-center gap-1.5 border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy transition-colors duration-150 hover:border-teal hover:text-teal">

              View all releases
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {NEWS.slice(0, 4).map((item, i) =>
              <Reveal key={item.id} delay={i * 0.04}>
                <NewsCard item={item} />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <MotifDivider />

      <MunicipalMap />

      <section className="w-full bg-teal py-14 text-white" aria-labelledby="help-desk-title">
        <div className="mx-auto grid max-w-content gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal-200">Public assistance</p>
            <h2 id="help-desk-title" className="mt-2 font-display text-display-md font-bold">
              Reach the right office the first time.
            </h2>
            <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-teal-50">
              Walk-in queries are handled at the Public Assistance Desk on the ground floor of the Municipal Hall.
              For disaster-related concerns, contact the MDRRMO hotline, which operates 24/7.
            </p>
          </div>

          <dl className="grid gap-px bg-white/20 sm:grid-cols-3">
            {HELP_DESK.map(({ Icon, label, value }) =>
              <div key={label} className="bg-teal p-5">
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                <dt className="mt-3 font-mono text-[11px] uppercase tracking-wider text-teal-200">{label}</dt>
                <dd className="mt-1.5 text-sm font-semibold leading-relaxed text-white">{value}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
    </>);

}