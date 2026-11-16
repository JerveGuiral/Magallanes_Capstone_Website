import { useEffect, useState } from 'react';

export const PAGE_SIZES = [10, 20, 50];

/** Page numbers to show, collapsing long runs into '…': 1 … 4 5 6 … 20 */
export function pageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
}

/**
 * One page of `items`. Any change in `resetKey` (a filter, a sort, a new period) goes back to
 * the first page; a refresh that shrinks the list never leaves you past the last page.
 */
export function usePagination<T>(items: T[], { initialSize = 10, resetKey = '' }: { initialSize?: number; resetKey?: string } = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    totalPages,
    pageSize,
    setPageSize,
    firstIndex,
    pageItems: items.slice(firstIndex, firstIndex + pageSize),
    total: items.length,
    goToPage: (p: number) => setPage(Math.min(Math.max(1, p), totalPages)),
  };
}
