import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES, pageNumbers } from '../../lib/pagination';

interface Props {
  page: number;
  totalPages: number;
  pageSize: number;
  firstIndex: number;
  shown: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  /** What the pages are of, for screen readers: "Chat logs" → "Chat logs pages". */
  label: string;
}

/** "Showing 1–10 of 57 · Rows per page" and Prev 1 2 3 … Next, under an admin table. */
export function TablePagination({ page, totalPages, pageSize, firstIndex, shown, total, onPage, onPageSize, label }: Props) {
  if (total === 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-hairline bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-muted">
        <span>
          Showing <span className="font-semibold text-brand-800">{firstIndex + 1}</span>–
          <span className="font-semibold text-brand-800">{firstIndex + shown}</span> of{' '}
          <span className="font-semibold text-brand-800">{total}</span>
        </span>
        <label className="flex items-center gap-1.5">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="rounded border border-hairline bg-white px-2 py-1 text-xs text-ink focus:border-brand-800"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center gap-1" aria-label={`${label} pages`}>
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 rounded border border-hairline bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {pageNumbers(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1.5 text-xs text-ink-subtle" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={`min-w-[2rem] rounded border px-2 py-1.5 text-xs font-semibold transition-colors ${
                  p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-hairline bg-white text-brand-800 hover:bg-surface'
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded border border-hairline bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </nav>
      )}
    </div>
  );
}
