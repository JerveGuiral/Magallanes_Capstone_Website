import React from 'react';
import { useLocation } from 'react-router-dom';
import { UtilityBar } from './UtilityBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '../ChatWidget';
import { RouteTransition } from '../ui/RouteTransition';

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { pathname, hash } = useLocation();

  React.useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-surface">
      <RouteTransition />
      <a
        href="#main"
        className="sr-only rounded-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-brand-800 focus:px-4 focus:py-2.5 focus:font-display focus:text-sm focus:font-semibold focus:text-white focus:shadow-raised"
      >
        Skip to main content
      </a>
      <UtilityBar />
      <Header />
      <main id="main" className="w-full flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
