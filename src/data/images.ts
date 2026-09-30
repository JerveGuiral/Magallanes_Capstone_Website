/**
 * Registry of the optimised images produced by `npm run images`.
 *
 * Intrinsic `width`/`height` live here rather than being typed by hand at each
 * call site, because every `<img>` on the site was previously missing them —
 * which is what made the page reflow as photographs arrived. Keeping the
 * numbers next to the widths they were generated from means the two cannot
 * drift apart.
 *
 * Regenerate with `npm run images` after changing anything in `assets-src/`.
 */

export type ImageAsset = {
  /** Intrinsic size of the largest variant — sets the aspect ratio box. */
  width: number;
  height: number;
  /** WebP variants that exist on disk. */
  widths: number[];
  /** Extension of the non-WebP fallback. */
  fallback: 'jpg' | 'png';
  /** Width of the fallback file. */
  fallbackWidth: number;
};

export const IMAGES = {
  'magallanes-aerial-hero': { width: 1365, height: 768, widths: [768, 1152, 1365], fallback: 'jpg', fallbackWidth: 1365 },
  mags: { width: 640, height: 853, widths: [320, 640], fallback: 'jpg', fallbackWidth: 640 },
  'bitaug-shore': { width: 1264, height: 848, widths: [400, 800, 1264], fallback: 'jpg', fallbackWidth: 1264 },
  'mangrove-delta': { width: 1264, height: 848, widths: [400, 800, 1264], fallback: 'jpg', fallbackWidth: 1264 },
  'fish-landing': { width: 1264, height: 848, widths: [400, 800, 1264], fallback: 'jpg', fallbackWidth: 1264 },
  seal: { width: 256, height: 256, widths: [64, 128, 256], fallback: 'png', fallbackWidth: 256 },

  /* ---- Tourism photography (Wikimedia Commons, CC BY-SA / CC0 — see TOURISM_CREDITS) ---- */
  'bay-walk-1': { width: 1600, height: 900, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'bay-walk-2': { width: 1600, height: 902, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'bay-walk-3': { width: 1600, height: 1067, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'centennial-tree-1': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'guiasan-bridge-1': { width: 1600, height: 900, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'magellan-shrine-1': { width: 500, height: 316, widths: [400], fallback: 'jpg', fallbackWidth: 400 },
  'magellan-shrine-2': { width: 1600, height: 900, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'municipal-hall-1': { width: 1600, height: 900, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'municipal-hall-2': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'parish-1': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'public-market-1': { width: 1600, height: 1067, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'public-market-2': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'river-delta-1': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'river-delta-2': { width: 1600, height: 902, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'river-delta-3': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'river-delta-4': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
  'welcome-mark-1': { width: 1600, height: 1200, widths: [400, 800, 1600], fallback: 'jpg', fallbackWidth: 1600 },
} as const satisfies Record<string, ImageAsset>;

export type ImageName = keyof typeof IMAGES;
