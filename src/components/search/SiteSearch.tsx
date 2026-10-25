import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  XIcon,
  CornerDownLeftIcon,
  FileTextIcon,
  NewspaperIcon,
  UsersIcon,
  MapPinIcon,
  BuildingIcon,
  GavelIcon,
  FolderOpenIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

/**
 * Site-wide search.
 *
 * Purely client-side: it indexes the same records the public pages already load
 * from Supabase, so it adds no endpoint and no write path. The index is built
 * once on first open and reused for the rest of the session.
 *
 * Implements the ARIA combobox pattern — the input owns `aria-activedescendant`
 * while focus stays put, so arrow keys move the highlight without stealing the
 * caret and screen readers announce each option as it becomes current.
 */

type Group = 'Page' | 'News' | 'Service' | 'Official' | 'Barangay' | 'Office' | 'Document' | 'Procurement';

type Hit = {
  id: string;
  group: Group;
  title: string;
  detail?: string;
  to: string;
  external?: boolean;
  /** Lowercased haystack — title carries more weight than detail. */
  key: string;
  tail: string;
};

const GROUP_ICON: Record<Group, React.ComponentType<{ className?: string }>> = {
  Page: FileTextIcon,
  News: NewspaperIcon,
  Service: FolderOpenIcon,
  Official: UsersIcon,
  Barangay: MapPinIcon,
  Office: BuildingIcon,
  Document: FileTextIcon,
  Procurement: GavelIcon,
};

/** Order results are grouped in — most-requested first, not alphabetical. */
const GROUP_ORDER: Group[] = ['Service', 'Page', 'News', 'Official', 'Barangay', 'Office', 'Document', 'Procurement'];

const STATIC_PAGES: { title: string; detail: string; to: string }[] = [
  { title: 'Home', detail: 'Municipal bulletin, advisories and barangay map', to: '/' },
  { title: 'About the Municipality', detail: 'Mandate, history, municipal profile and heritage', to: '/about' },
  { title: 'Citizen and business services', detail: 'Frontline transactions, requirements and responsible offices', to: '/services' },
  { title: 'Transparency Seal', detail: 'Full Disclosure Policy documents, budgets and procurement records', to: '/transparency' },
  { title: 'Municipal officials', detail: 'Executive, Sangguniang Bayan and department heads', to: '/officials' },
  { title: 'Barangays', detail: 'The 8 barangays, punong barangay and population', to: '/barangays' },
  { title: 'Visit Magallanes', detail: 'Destinations, fiestas and travel notes', to: '/tourism' },
  { title: 'News and advisories', detail: 'Official releases and MDRRMO public advisories', to: '/news' },
  { title: 'Contact the Municipal Hall', detail: 'Phone, email, address and office hours', to: '/contact' },
  { title: 'Report a concern', detail: 'Roads, flooding, streetlights and other problems in your barangay', to: '/report' },
  { title: 'Freedom of Information', detail: 'How to request records under EO No. 2, s. 2016', to: '/foi' },
  { title: 'Privacy Policy', detail: 'How the municipality processes personal data', to: '/privacy' },
  { title: 'Bids and awards', detail: 'Invitations to bid, bid results and notices of award', to: '/bids' },
  { title: 'Office directory', detail: 'Every municipal office and who heads it', to: '/offices' },
];

function norm(s: unknown): string {
  return String(s ?? '').toLowerCase();
}

/**
 * Rank a hit against the query terms. Every term must appear somewhere, so
 * "permit fee" does not match a record containing only one of the two.
 */
function score(hit: Hit, terms: string[]): number {
  let total = 0;
  for (const term of terms) {
    const inTitle = hit.key.indexOf(term);
    const inTail = hit.tail.indexOf(term);
    if (inTitle === -1 && inTail === -1) return -1;

    if (inTitle === 0) total += 120; // title starts with the term
    else if (inTitle > 0) total += hit.key[inTitle - 1] === ' ' ? 90 : 55; // word boundary beats mid-word
    else total += inTail === 0 || hit.tail[inTail - 1] === ' ' ? 30 : 15;
  }
  // Nudge shorter titles up: an exact-ish match should outrank a long paragraph.
  return total - Math.min(hit.key.length, 60) * 0.15;
}

/** Split a label around the matched run so it can be marked without dangerouslySetInnerHTML. */
function highlight(text: string, terms: string[]): React.ReactNode {
  const lower = text.toLowerCase();
  let found: { start: number; end: number } | null = null;
  for (const term of terms) {
    const i = lower.indexOf(term);
    if (i !== -1 && (!found || i < found.start)) found = { start: i, end: i + term.length };
  }
  if (!found) return text;
  return (
    <>
      {text.slice(0, found.start)}
      <mark className="rounded-sm bg-accent-200 px-0.5 text-ink">{text.slice(found.start, found.end)}</mark>
      {text.slice(found.end)}
    </>
  );
}

function buildHit(group: Group, id: string, title: string, detail: string, to: string, external = false): Hit {
  return { id: `${group}:${id}`, group, title, detail, to, external, key: norm(title), tail: norm(detail) };
}

export function SiteSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState<Hit[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  /* ---- Global shortcut: Ctrl/Cmd+K, and "/" when not already typing ---- */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === '/' && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* ---- Build the index once, on first open ---- */
  React.useEffect(() => {
    if (!open || index !== null) return;
    let mounted = true;
    setLoading(true);

    Promise.all([
      adminService.getNews(),
      adminService.getServices(),
      adminService.getOfficials(),
      adminService.getBarangays(),
      adminService.getOffices(),
      adminService.getTransparencyDocs(),
      adminService.getBidsAwards(),
    ])
      .then(([news, services, officials, barangays, offices, docs, bids]) => {
        if (!mounted) return;
        const hits: Hit[] = STATIC_PAGES.map((p) => buildHit('Page', p.to, p.title, p.detail, p.to));

        for (const n of news.data || []) {
          if (!n.is_published) continue;
          hits.push(buildHit('News', n.id, n.title, n.body.slice(0, 180), `/news/${n.id}`));
        }
        for (const s of services.data || []) {
          const detail = [s.office, s.fee, s.processing_time, s.requirements].filter(Boolean).join(' · ');
          hits.push(buildHit('Service', s.id, s.name, detail, '/services'));
        }
        for (const o of officials.data || []) {
          if (!o.is_current) continue;
          hits.push(buildHit('Official', o.id, o.full_name, o.position, '/officials'));
        }
        for (const b of barangays.data || []) {
          const detail = [b.captain_name, b.contact_number].filter(Boolean).join(' · ');
          hits.push(buildHit('Barangay', b.id, `Barangay ${b.name}`, detail, '/barangays'));
        }
        for (const o of offices.data || []) {
          const detail = [o.head_name, o.contact_number, o.email].filter(Boolean).join(' · ');
          hits.push(buildHit('Office', o.id, o.name, detail, '/offices'));
        }
        for (const d of docs.data || []) {
          if (d.is_archived) continue;
          hits.push(buildHit('Document', d.id, d.title, [d.fiscal_year, d.category].filter(Boolean).join(' · '), d.file_url, true));
        }
        for (const b of bids.data || []) {
          hits.push(buildHit('Procurement', b.id, b.title, [b.reference_number, b.status].filter(Boolean).join(' · '), '/bids'));
        }

        setIndex(hits);
      })
      .catch(() => mounted && setIndex([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open, index]);

  /* ---- Focus in on open, restore to the trigger on close ----
   * Only restore after a real close: this effect also runs on first render (open = false),
   * and focusing the trigger then stole focus on every page load — lighting up the
   * keyboard focus ring on the search box before anyone had touched the page. */
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = prevOverflow;
      };
    }
    setQuery('');
    setCursor(0);
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  const terms = React.useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );

  const results = React.useMemo(() => {
    if (!index || terms.length === 0) return [];
    return index
      .map((hit) => ({ hit, s: score(hit, terms) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s || GROUP_ORDER.indexOf(a.hit.group) - GROUP_ORDER.indexOf(b.hit.group))
      .slice(0, 24)
      .map((r) => r.hit);
  }, [index, terms]);

  /* Grouped for display, but `results` stays the flat list the cursor indexes into. */
  const grouped = React.useMemo(() => {
    const map = new Map<Group, Hit[]>();
    for (const hit of results) {
      const list = map.get(hit.group);
      if (list) list.push(hit);
      else map.set(hit.group, [hit]);
    }
    return [...map.entries()].sort((a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]));
  }, [results]);

  /* Flat order must match the rendered order, or arrow keys desync from the list. */
  const flat = React.useMemo(() => grouped.flatMap(([, hits]) => hits), [grouped]);

  React.useEffect(() => setCursor(0), [query]);

  React.useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor, flat.length]);

  const go = React.useCallback(
    (hit: Hit) => {
      setOpen(false);
      if (hit.external) window.open(hit.to, '_blank', 'noopener,noreferrer');
      else navigate(hit.to);
    },
    [navigate]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (flat.length ? (c + 1) % flat.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (flat.length ? (c - 1 + flat.length) % flat.length : 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCursor(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCursor(Math.max(0, flat.length - 1));
    } else if (e.key === 'Enter' && flat[cursor]) {
      e.preventDefault();
      go(flat[cursor]);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-md border border-hairline bg-white py-2 pl-3 pr-2 text-sm text-ink-muted shadow-subtle transition-colors duration-150 hover:border-brand-400 hover:text-brand-600 lg:w-60"
        aria-label="Search this website"
      >
        <SearchIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden flex-1 text-left lg:block">Search…</span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-hairline bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-subtle lg:block">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
          <div
            className="absolute inset-0 animate-fade-in bg-brand-950/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search this website"
            className="relative flex max-h-[70vh] w-full max-w-2xl animate-scale-in flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-overlay"
          >
            <div className="input-row flex shrink-0 items-center gap-3 border-b border-hairline px-4">
              <SearchIcon className="h-5 w-5 shrink-0 text-ink-subtle" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={flat.length > 0}
                aria-controls="site-search-results"
                aria-autocomplete="list"
                aria-activedescendant={flat[cursor] ? `search-opt-${flat[cursor].id}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search services, news, officials, barangays…"
                className="input-bare flex-1 border-0 bg-transparent py-4 text-base text-ink placeholder:text-ink-subtle"
              />
              {loading && <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-ink-subtle" aria-hidden="true" />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                aria-label="Close search"
              >
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div ref={listRef} id="site-search-results" role="listbox" aria-label="Search results" className="admin-scroll flex-1 overflow-y-auto overscroll-contain">
              {terms.length === 0 ? (
                <div className="px-5 py-8">
                  <p className="text-sm text-ink-muted">
                    Search across municipal services, news releases, officials, barangays, offices and transparency
                    documents.
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {['business permit', 'civil registry', 'advisory', 'barangay', 'budget'].map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          onClick={() => setQuery(s)}
                          className="rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-150 hover:border-brand-400 hover:text-brand-600"
                        >
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : flat.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-ink-muted">
                  {loading ? 'Building the index…' : <>No results for &ldquo;{query}&rdquo;.</>}
                </p>
              ) : (
                grouped.map(([group, hits]) => {
                  const Icon = GROUP_ICON[group];
                  return (
                    <section
                      key={group}
                      role="group"
                      aria-label={group}
                      className="border-b border-hairline last:border-b-0"
                    >
                      {/* Labelling is carried by aria-label on the group; the visible
                          heading is hidden from the tree so the listbox contains
                          nothing but groups and options. */}
                      <h2
                        aria-hidden="true"
                        className="sticky top-0 z-10 bg-surface px-5 py-2 font-sans text-eyebrow uppercase text-ink-muted"
                      >
                        {group}
                      </h2>
                      <ul role="presentation">
                        {hits.map((hit) => {
                          const i = flat.indexOf(hit);
                          const active = i === cursor;
                          return (
                            <li key={hit.id} role="presentation">
                              <button
                                id={`search-opt-${hit.id}`}
                                role="option"
                                aria-selected={active}
                                data-active={active}
                                type="button"
                                onClick={() => go(hit)}
                                onMouseMove={() => setCursor(i)}
                                className={`flex w-full items-start gap-3 px-5 py-3 text-left transition-colors duration-100 ${
                                  active ? 'bg-brand-50' : 'bg-white'
                                }`}
                              >
                                <Icon
                                  className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-brand-600' : 'text-ink-subtle'}`}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-display text-sm font-semibold text-brand-800">
                                    {highlight(hit.title, terms)}
                                  </span>
                                  {hit.detail && (
                                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                                      {highlight(hit.detail, terms)}
                                    </span>
                                  )}
                                </span>
                                {active && (
                                  <CornerDownLeftIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-hairline bg-surface px-5 py-2.5 text-[11px] text-ink-muted">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />
                  <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeftIcon className="h-3 w-3" aria-hidden="true" />
                  open
                </span>
                <span>esc to close</span>
              </span>
              {flat.length > 0 && (
                <span className="font-mono">
                  {flat.length} result{flat.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
