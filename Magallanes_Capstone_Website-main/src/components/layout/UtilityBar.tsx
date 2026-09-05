import React from 'react';
import { FacebookIcon, YoutubeIcon } from 'lucide-react';

export function UtilityBar() {
  return (
    <div className="w-full bg-navy-900 text-navy-200">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <p className="text-[11px] uppercase tracking-[0.14em]">
          Official website of the Municipality of Magallanes, Agusan del Norte
        </p>

        <div className="flex items-center gap-3">
          <a
            href="#facebook"
            className="text-navy-200 transition-colors duration-150 hover:text-white"
            aria-label="Magallanes LGU on Facebook">

            <FacebookIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href="#youtube"
            className="text-navy-200 transition-colors duration-150 hover:text-white"
            aria-label="Magallanes LGU on YouTube">

            <YoutubeIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <span className="text-white/20">|</span>
          <a
            href="/admin"
            className="text-[11px] font-semibold text-gold transition-colors duration-150 hover:text-white"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </div>);

}