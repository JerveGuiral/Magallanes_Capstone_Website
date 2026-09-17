import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import { NAV_LINKS, type NavItem } from '../../data/site';
import { SiteSearch } from '../search/SiteSearch';

/**
 * Two-tier government masthead.
 *
 *   1. Masthead — seal, wordmark and search. Scrolls away; it is identity, not
 *      navigation, and does not need to follow the reader down the page.
 *   2. Navigation — a deep navy bar that sticks. Keeping only this pinned buys
 *      back ~90px of vertical space on phones versus pinning the whole header,
 *      which matters on the small screens most of this traffic arrives on.
 *
 * The active item is marked by a brass underline rather than a filled pill, so
 * the bar stays quiet and the seal remains the loudest element on the page.
 */

function isGroupActive(item: NavItem, pathname: string) {
  return Boolean(item.children?.some((child) => pathname === child.to.split('#')[0]));
}

export function Header() {
  const [open, setOpen] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  /* One ref per group, keyed by label. The previous single-ref implementation
   * only worked because exactly one group existed; adding a second would have
   * made outside-click close the wrong menu. */
  const groupRefs = React.useRef<Record<string, HTMLLIElement | null>>({});
  const { pathname } = useLocation();

  React.useEffect(() => {
    setOpenGroup(null);
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!openGroup) return;
    const onPointerDown = (e: MouseEvent) => {
      const el = groupRefs.current[openGroup];
      if (el && !el.contains(e.target as Node)) setOpenGroup(null);
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

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const topLinkClass = (active: boolean) =>
    `relative flex items-center gap-1.5 px-3.5 py-3.5 font-display text-[0.9375rem] font-semibold transition-colors duration-150 ${
      active ? 'text-white' : 'text-brand-200 hover:text-white'
    } after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-sm after:transition-colors after:duration-150 ${
      active ? 'after:bg-accent-500' : 'after:bg-transparent'
    }`;

  return (
    <header className="w-full">
      {/* ---- Masthead: identity + search ---- */}
      <div className="w-full border-b border-hairline bg-white">
        <div className="container-page flex items-center justify-between gap-6 py-4">
          <NavLink to="/" className="flex items-center gap-3.5" aria-label="Municipality of Magallanes — home">
            <img
              src="/seal-removebg-preview.png"
              alt="Municipal seal of Magallanes, Agusan del Norte"
              className="h-14 w-14 shrink-0 object-contain sm:h-[3.75rem] sm:w-[3.75rem]"
            />
            <span className="leading-tight">
              <span className="block font-display text-[1.0625rem] font-extrabold tracking-[-0.015em] text-brand-800 sm:text-xl">
                Municipality of Magallanes
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted sm:text-[0.8125rem]">
                Province of Agusan del Norte
                <span className="hidden h-3 w-px bg-hairline sm:block" aria-hidden="true" />
                <span className="hidden font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-accent-700 sm:block">
                  Republic of the Philippines
                </span>
              </span>
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            <SiteSearch />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-hairline text-brand-800 transition-colors duration-150 hover:border-brand-400 hover:bg-brand-50 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <XIcon className="h-5 w-5" aria-hidden="true" /> : <MenuIcon className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* ---- Primary navigation: the only pinned tier ---- */}
      <div className="sticky top-0 z-40 hidden w-full bg-brand-800 shadow-card lg:block">
        <nav className="container-page" aria-label="Primary">
          <ul className="flex items-center">
            {NAV_LINKS.map((item) => {
              if (!item.children) {
                return (
                  <li key={item.label}>
                    <NavLink to={item.to as string} end={item.to === '/'} className={({ isActive }) => topLinkClass(isActive)}>
                      {item.label}
                    </NavLink>
                  </li>
                );
              }

              const expanded = openGroup === item.label;
              const active = isGroupActive(item, pathname);

              return (
                <li
                  key={item.label}
                  className="relative"
                  ref={(el) => {
                    groupRefs.current[item.label] = el;
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenGroup(expanded ? null : item.label)}
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    className={topLinkClass(active || expanded)}
                  >
                    {item.label}
                    <ChevronDownIcon
                      className={`h-3.5 w-3.5 transition-transform duration-150 ease-gov ${expanded ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {expanded && (
                    <ul className="absolute left-0 top-full z-50 w-80 animate-scale-in overflow-hidden rounded-b-lg border border-t-0 border-hairline bg-white py-1.5 shadow-raised">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            to={child.to}
                            onClick={() => setOpenGroup(null)}
                            className="group block border-l-[3px] border-transparent px-4 py-2.5 transition-colors duration-150 hover:border-accent-500 hover:bg-brand-50"
                          >
                            <span className="block font-display text-sm font-semibold text-brand-800">{child.label}</span>
                            {child.description && (
                              <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ---- Mobile navigation ---- */}
      {open && (
        <nav
          id="mobile-nav"
          className="max-h-[calc(100vh-6rem)] overflow-y-auto border-b border-hairline bg-white lg:hidden"
          aria-label="Primary, mobile"
        >
          <ul className="container-page divide-y divide-hairline py-1">
            {NAV_LINKS.map((item) =>
              item.children ? (
                <li key={item.label} className="py-3">
                  <p className="font-display text-eyebrow uppercase text-ink-muted">{item.label}</p>
                  <ul className="mt-2 space-y-0.5">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          to={child.to}
                          onClick={() => setOpen(false)}
                          className="block rounded-md border-l-[3px] border-hairline py-2.5 pl-3 font-display text-[0.9375rem] font-semibold text-brand-800 transition-colors duration-150 hover:border-accent-500 hover:bg-brand-50"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.label}>
                  <NavLink
                    to={item.to as string}
                    end={item.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block border-l-[3px] py-3.5 pl-3 font-display text-[0.9375rem] font-semibold transition-colors duration-150 ${
                        isActive ? 'border-accent-500 text-brand-800' : 'border-transparent text-ink-muted hover:text-brand-800'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
