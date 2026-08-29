import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import { NAV_LINKS, type NavItem } from '../../data/site';

function isGroupActive(item: NavItem, pathname: string) {
  return Boolean(item.children?.some((child) => pathname === child.to.split('#')[0]));
}

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const groupRef = React.useRef<HTMLLIElement>(null);
  const { pathname } = useLocation();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setOpenGroup(null);
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openGroup]);

  const topLinkClass = (isActive: boolean) =>
    `relative block px-3 py-2 text-sm font-semibold transition-colors duration-150 ${isActive ? 'text-navy' : 'text-ink-muted hover:text-navy'} after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:transition-colors after:duration-150 ${isActive ? 'after:bg-gold' : 'after:bg-transparent'}`;


  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-hairline bg-white/95 backdrop-blur transition-all duration-200 ease-gov ${scrolled ? 'shadow-card' : ''}`
      }>

      <div
        className={`mx-auto flex max-w-content items-center justify-between gap-6 px-4 transition-all duration-200 ease-gov sm:px-6 lg:px-8 ${scrolled ? 'py-2' : 'py-4'}`
        }>

        <NavLink to="/" className="flex items-center gap-3" aria-label="Municipality of Magallanes — home">
          <span
            className={`grid shrink-0 place-items-center rounded-full border-2 border-navy bg-navy-50 font-display font-bold text-navy transition-all duration-200 ease-gov ${scrolled ? 'h-9 w-9 text-[10px]' : 'h-12 w-12 text-xs'}`
            }
            role="img"
            aria-label="Municipal seal of Magallanes, Agusan del Norte">

            SEAL
          </span>
          <span className="leading-tight">
            <span
              className={`block font-display font-bold text-navy transition-all duration-200 ease-gov ${scrolled ? 'text-base' : 'text-lg sm:text-xl'}`
              }>

              Municipality of Magallanes
            </span>
            <span
              className={`block font-mono uppercase tracking-[0.12em] text-ink-muted transition-all duration-200 ease-gov ${scrolled ? 'text-[9px]' : 'text-[10px]'}`
              }>

              Province of Agusan del Norte
            </span>
          </span>
        </NavLink>

        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((item) => {
              if (!item.children) {
                return (
                  <li key={item.label}>
                    <NavLink to={item.to as string} end={item.to === '/'} className={({ isActive }) => topLinkClass(isActive)}>
                      {item.label}
                    </NavLink>
                  </li>);

              }

              const expanded = openGroup === item.label;
              const active = isGroupActive(item, pathname);

              return (
                <li key={item.label} className="relative" ref={groupRef}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(expanded ? null : item.label)}
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    className={`${topLinkClass(active || expanded)} inline-flex items-center gap-1.5`}>

                    {item.label}
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform duration-150 ease-gov ${expanded ? 'rotate-180' : ''}`
                      }
                      aria-hidden="true" />

                  </button>

                  {expanded &&
                    <ul className="absolute right-0 top-full z-50 mt-1 w-72 animate-reveal-up border border-hairline bg-white py-1 shadow-raised">
                      {item.children.map((child) =>
                        <li key={child.label}>
                          <Link
                            to={child.to}
                            onClick={() => setOpenGroup(null)}
                            className="block border-l-[3px] border-transparent px-4 py-2.5 transition-colors duration-150 hover:border-gold hover:bg-navy-50">

                            <span className="block text-sm font-semibold text-navy">{child.label}</span>
                            {child.description &&
                              <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                                {child.description}
                              </span>
                            }
                          </Link>
                        </li>
                      )}
                    </ul>
                  }
                </li>);

            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center border border-hairline text-navy transition-colors duration-150 hover:bg-navy-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}>

          {open ? <XIcon className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open &&
        <nav id="mobile-nav" className="border-t border-hairline bg-white lg:hidden" aria-label="Primary, mobile">
          <ul className="mx-auto max-w-content divide-y divide-hairline px-4 sm:px-6">
            {NAV_LINKS.map((item) =>
              item.children ?
                <li key={item.label} className="py-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">{item.label}</p>
                  <ul className="mt-2 space-y-1">
                    {item.children.map((child) =>
                      <li key={child.label}>
                        <Link
                          to={child.to}
                          onClick={() => setOpen(false)}
                          className="block border-l-[3px] border-hairline py-2 pl-3 text-sm font-semibold text-navy transition-colors duration-150 hover:border-gold">

                          {child.label}
                        </Link>
                      </li>
                    )}
                  </ul>
                </li> :

                <li key={item.label}>
                  <NavLink
                    to={item.to as string}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block border-l-[3px] py-3 pl-3 text-sm font-semibold transition-colors duration-150 ${isActive ? 'border-gold text-navy' : 'border-transparent text-ink-muted hover:text-navy'}`

                    }>

                    {item.label}
                  </NavLink>
                </li>

            )}
          </ul>
        </nav>
      }
    </header>);

}