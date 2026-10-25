import React from 'react';
import { IMAGES, type ImageName } from '../../data/images';

/* React 18 does not know the camelCase `fetchPriority` prop and logs a warning on every page
 * (React 19 adds it). The lowercase HTML attribute works in every browser that supports it;
 * it is spread in because React's types only list the camelCase name. */
const fetchPriorityAttr = (priority: boolean) =>
  ({ fetchpriority: priority ? 'high' : 'auto' }) as React.ImgHTMLAttributes<HTMLImageElement>;

type PictureProps = {
  name: ImageName;
  alt: string;
  /** Maps viewport width to rendered image width. Drives which variant is fetched. */
  sizes: string;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  /** Above-the-fold images only — skips lazy-loading and raises fetch priority. */
  priority?: boolean;
};

/**
 * Responsive `<picture>` for the images in `assets-src/`.
 *
 * Three things it guarantees that hand-written `<img>` tags were not doing:
 *
 *  - **WebP with a real fallback.** The hero alone drops from 1,019 KB to
 *    93 KB at phone width.
 *  - **Intrinsic width/height on every image.** The browser reserves the right
 *    box before bytes arrive, so nothing below the image jumps. None of the 18
 *    images on the site had these.
 *  - **Correct loading priority.** The hero is the LCP element and must not be
 *    lazy-loaded; everything else must be.
 *
 * `alt=""` is honoured as-is — a decorative image should stay out of the
 * accessibility tree rather than being given invented alt text.
 */
export function Picture({ name, alt, sizes, className = '', imgClassName = '', style, priority = false }: PictureProps) {
  const asset = IMAGES[name];
  const webpSrcSet = asset.widths.map((w) => `/img/${name}-${w}.webp ${w}w`).join(', ');
  const fallbackSrc = `/img/${name}-${asset.fallbackWidth}.${asset.fallback}`;

  return (
    <picture className={className}>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        width={asset.width}
        height={asset.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...fetchPriorityAttr(priority)}
        className={imgClassName}
        style={style}
      />
    </picture>
  );
}

/**
 * The municipal seal, which appears at half a dozen sizes across the chrome.
 *
 * Wrapped separately because it is always square, always decorative-or-labelled
 * the same way, and previously shipped as a 195 KB PNG for what renders at
 * 44–96px. The 128px WebP is 6 KB.
 */
export function SealImage({
  className = '',
  alt = '',
  priority = false,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <picture>
      <source type="image/webp" srcSet="/img/seal-64.webp 64w, /img/seal-128.webp 128w, /img/seal-256.webp 256w" sizes="128px" />
      <img
        src="/img/seal-256.png"
        alt={alt}
        aria-hidden={alt === '' ? true : undefined}
        width={256}
        height={256}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...fetchPriorityAttr(priority)}
        className={className}
      />
    </picture>
  );
}
