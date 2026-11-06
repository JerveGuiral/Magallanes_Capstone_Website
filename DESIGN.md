---
name: Municipal Hall Rose
description: Warm rose, roof-green and fiesta-gold civic design system for the Municipality of Magallanes, Agusan del Norte
colors:
  primary: "#B83C66"
  primary-hover: "#A53560"
  heading: "#93305A"
  hall-pink: "#F0A6BC"
  accent: "#287F52"
  accent-text: "#1F6642"
  fiesta: "#F4B400"
  fiesta-text: "#8A6200"
  sky: "#1CBDF0"
  sky-text: "#09658A"
  alert: "#B3261E"
  ink: "#2A2326"
  ink-muted: "#6B5F64"
  ink-subtle: "#76696F"
  surface: "#FFFFFF"
  surface-muted: "#FFF7F8"
  surface-sunken: "#FBEAEF"
  hairline: "#F1DDE3"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontWeight: 700
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.0625rem"
    lineHeight: 1.65
  label:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.1em"
  mono:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
rounded:
  md: "8px"
  xl: "16px"
  2xl: "24px"
  3xl: "32px"
---

# Design System: Municipal Hall Rose

## Overview

The palette is taken from the town itself, not from a template:

- the **blush-pink walls of the Magallanes Municipal Hall** (the primary rose),
- its **sage-green roof** (the accent green),
- the **fiesta banderitas** strung in front of it (gold, plus the rose and green),
- the **sky blue of the municipal seal**.

The site should feel welcoming. A visitor from the LGU or a resident on a phone should see their own town hall and their own fiesta in it. There are **no navy or near-black backgrounds**: an earlier deep-navy direction was rejected as too dark and unwelcoming. The darkest *large* surface is the rose call-to-action band (`brand-600`). Photo overlays and shadows are kept light.

The source of truth for every value is `tailwind.config.js`, mirrored as CSS variables in `src/index.css` (`:root`).

## Colors

| Family | Key steps | Use |
|---|---|---|
| `brand` (hall rose) | 600 `#B83C66` · 700 `#A53560` · 800 `#93305A` · 300 `#F0A6BC` · 100 `#FDE8EE` · 50 `#FFF5F7` | 600: buttons, links, icons, the rose band. 700: hover. 800: headings (a soft rose, not maroon — the darker maroon was rejected as too heavy). 300: the hall's own pink, decorative only. 50/100: blush tints. |
| `accent` (roof green) | 500 `#287F52` · 700 `#1F6642` · 100 `#D8EFE0` | Eyebrow labels, "things to do", success / published / open states. |
| `fiesta` (banderitas gold) | 300 `#FFD45C` · 400 `#F7C325` · 700 `#8A6200` · 100 `#FFF1C7` | Bunting, stat figures on the rose band, highlight underlines, term chips. Text *on* gold is always `brand-900`. |
| `sky` (seal blue) | 400 `#1CBDF0` · 700 `#09658A` · 100 `#DDF4FD` | Bunting, upland-barangay map pins, one icon-tile tone. |
| `ink` | `#2A2326` · muted `#6B5F64` · subtle `#76696F` | Body text and metadata. Warm greys, tinted toward the rose. |
| `surface` | white · muted `#FFF7F8` · sunken `#FBEAEF` · hairline `#F1DDE3` | Page, alternating blush band, wells, borders. |
| `alert` | `#B3261E` | MDRRMO advisories and genuine errors only, always with an icon and a label so it is never mistaken for the rose. |

### Rules

- **No dark slabs.** No navy or near-black backgrounds. At most one rose band (`.band-rose`) per page. The homepage uses it for the stats; About uses it for the profile card header.
- **Verified contrast.** Every text/background pair in use clears WCAG 2.1 AA (4.5:1 text, 3:1 large text, icons and focus ring). It was last checked with a script on 6 Nov 2026 (23 pairs), for example white on `brand-600` 5.4:1, `brand-800` on blush 7.1:1, gold `#FFD45C` figures on `brand-600` 3.8:1 (large text only), `ink-muted` on `brand-50` 5.7:1. Re-check any new pair before it ships.
- **Rotate the four tones.** Icon tiles (`.icon-tile` + `.tone-rose | -green | -gold | -sky`) rotate through the four families so a grid never reads as one grey block.

## Typography

- **Display:** Playfair Display for every heading, upright, never italic for headings.
- **Body / UI:** Plus Jakarta Sans at 17px, line-height 1.65. It is friendly and rounded and sits warmly beside the rose.
- **Mono:** IBM Plex Mono only for reference numbers and IDs. Dates, fees, phone numbers and figures use the sans face with `tabular-nums`.
- **Bisaya lines** (e.g. *Unsa'y imong kinahanglan karon?*) are set in italic rose with `lang="ceb"`.

## Signature elements

- **Bunting** (`src/components/ui/Bunting.tsx`): the banderitas as a repeating SVG strip. It appears on the header's top edge, the footer's top edge, the section divider (`MotifDivider`), the Meet Bitoy card, the chat header and the admin dashboard banner. It is always decorative.
- **Bitaug tree** (`BitaugMotif`): line art in `brand-200`/`brand-400`, at most once per section.
- **Photographs:** every interior page opens on a real photograph of Magallanes (`PageHeader`'s `image` prop) under a warm rose-plum scrim. Wikimedia Commons photos must show their credit; `PageHeader` does this automatically from `TOURISM_CREDITS`.

## Layout and depth

- Page frame `.container-page`: 78rem max, 1 / 1.5 / 2rem side padding.
- Sections alternate between white and the blush band (`surface-muted`), with one rose band and photo bands for rhythm.
- Cards: white, `rounded-2xl`, hairline border, rose-tinted shadows (`shadow-card`, `shadow-raised`). Clickable cards lift 3px and glow on hover (`.card-interactive`, `shadow-glow`).
- Buttons: rose `btn-primary`, often `rounded-full`. All buttons press down 1px on click.

## Motion

- `Reveal` fades content in as it scrolls into view, but content is **visible by default**. It hides only when measured below the fold, so screenshot tools, link previews and slow phones never see a blank grid.
- `CountUp` starts at the real figure and only counts when it can animate.
- The hero photo drifts slowly (`animate-ken-burns`).
- All motion is off under `prefers-reduced-motion`.

## Do and don't

**Do:**
- Use the local photo library (`public/img`, `src/data/images.ts`) before reaching for decoration.
- Keep the chatbot one click away: hero "Ask Bitoy" box, nav button, chat launcher.

**Don't:**
- Use navy, black or grey slabs.
- Add more than one rose band to a page.
- Use a new colour outside these families.
- Show placeholder or "awaiting confirmation" content to the public. Hide the section until the real text exists (see `About.tsx`, `MISSION`/`VISION`).
