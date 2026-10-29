import React from 'react';
import { SITE } from '../data/site';

/**
 * Sets the browser tab title to "<page> · Municipality of Magallanes" (just the site name when no
 * page title is given), so tabs, bookmarks and history entries say which page they are.
 */
export function usePageTitle(title?: string) {
  React.useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : SITE.name;
  }, [title]);
}
