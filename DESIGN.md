---
name: Magallanes Seal
description: Seal-blue, seal-red, green and gold civic design system for the Municipality of Magallanes, Agusan del Norte
colors:
  primary: "#0B74A6"
  primary-hover: "#0A6894"
  heading: "#0C5F87"
  seal-blue: "#1EC3F1"
  seal-red: "#EE1B1D"
  red-text: "#D32F2F"
  accent: "#287F52"
  accent-text: "#1F6642"
  fiesta: "#F4B400"
  fiesta-text: "#8A6200"
  alert: "#B3261E"
  ink: "#2A2326"
  ink-muted: "#6B5F64"
  ink-subtle: "#76696F"
  surface: "#FFFFFF"
  surface-muted: "#FAF8F7"
  surface-sunken: "#F3F0EF"
  hairline: "#ECE7E6"
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

# Design System: Magallanes Seal

## Overview

The palette is taken from the **municipal seal of Magallanes**, with colours sampled from the seal image itself:

- its **sky-blue scalloped border** (`#1EC3F1`): the primary colour, in medium shades;
- its **red ring** (`#EE1B1D`): a highlight colour;
- the **green and gold** of the fields at its centre: the accent and fiesta colours;

Shades are chosen to be "just right": the seal's own bright blue and red are used only for decoration, and the text and button shades are the lightest that still pass the accessibility contrast standard. There are **no navy or near-black backgrounds**: an earlier deep-navy direction was rejected as too dark and unwelcoming. The darkest *large* surface is the blue call-to-action band (`brand-600`). Backgrounds, shadows and photo overlays stay neutral; colour is for accents.

History: in Nov 2026 the site briefly used a "Municipal Hall Rose" pink palette, replaced by the seal palette at the user's request. Pink backgrounds and pink-tinted shadows had already been rejected as tiring to the eyes, which is why surfaces stay neutral.

The source of truth for every value is `tailwind.config.js`, mirrored as CSS variables in `src/index.css` (`:root`).

## Colors

| Family | Key steps | Use |
|---|---|---|
| `brand` (seal blue) | 600 `#0B74A6` · 700 `#0A6894` · 800 `#0C5F87` · 400 `#1EC3F1` · 100 `#D7F1FC` · 50 `#EEF9FE` | 600: buttons, links, icons, the blue band. 700: hover. 800: headings (a medium blue, not navy). 400: the seal's own blue, decorative only. 50/100: light tints for chips and icon tiles. |
| `seal` (seal red) | 600 `#D32F2F` · 700 `#B71C1C` · 500 `#EE1B1D` · 100 `#FDE2E2` · 50 `#FEF3F3` | Highlights, the Municipal Hall map pin, one icon-tile tone. Never a button colour and never an error colour. 500 is the seal's own red, decorative only. |
| `accent` (seal green) | 500 `#287F52` · 700 `#1F6642` · 100 `#D8EFE0` | Eyebrow labels, "things to do", success / published / open states. |
| `fiesta` (seal gold) | 300 `#FFD45C` · 400 `#F7C325` · 700 `#8A6200` · 100 `#FFF1C7` | Stat figures on the blue band, highlight underlines, term chips. Text *on* gold is always `brand-900`. |
| `sky` | (unchanged) | Kept for a few older call sites; new code uses `brand`. |
| `ink` | `#2A2326` · muted `#6B5F64` · subtle `#76696F` | Body text and metadata. Warm greys. |
| `surface` | white · muted `#FAF8F7` · sunken `#F3F0EF` · hairline `#ECE7E6` | Page, alternating off-white band, wells, borders. Always neutral. |
| `alert` | `#B3261E` | MDRRMO advisories and genuine errors only, always with an icon and a label so it is never mistaken for the seal red. |

### Rules

- **No dark slabs.** No navy or near-black backgrounds. At most one blue band (`.band-brand`) per page. The homepage uses it for the stats; About uses it for the profile card header.
- **Verified contrast.** Every text/background pair in use clears WCAG 2.1 AA (4.5:1 text, 3:1 large text, icons and focus ring). Last checked with a script on 10 Nov 2026 (18 pairs), for example white on `brand-600` 5.2:1, `brand-800` on the off-white band 6.6:1, `brand-600` on the sunken well 4.6:1, `seal-600` red text on white 5.0:1, gold `#FFD45C` figures on `brand-600` 3.7:1 (large text only), `brand-50` on `brand-600` 4.8:1. Re-check any new pair before it ships.
- **Rotate the four tones.** Icon tiles (`.icon-tile` + `.tone-blue | -green | -gold | -red`) rotate through the seal's four colours so a grid never reads as one grey block.

## Typography

- **Display:** Playfair Display for every heading, upright, never italic for headings.
- **Body / UI:** Plus Jakarta Sans at 17px, line-height 1.65. It is friendly and rounded.
- **Mono:** IBM Plex Mono only for reference numbers and IDs. Dates, fees, phone numbers and figures use the sans face with `tabular-nums`.
- **Bisaya lines** (e.g. *Unsa'y imong kinahanglan karon?*) are set in italic seal blue with `lang="ceb"`.

## Signature elements

- **No bunting.** A fiesta-flag strip was tried along the header, footer and dividers and removed (Nov 2026) as unprofessional for a government site. Section breaks use a plain hairline with the Bitaug mark (`MotifDivider`).
- **Bitaug tree** (`ShrineMotif`): line art in `brand-200`/`brand-400`, at most once per section.
- **Photographs:** every interior page opens on a real photograph of Magallanes (`PageHeader`'s `image` prop) under a light neutral dark scrim placed only where the text sits — never a pink or plum wash, so the photographs keep their real colours. Wikimedia Commons photos must show their credit; `PageHeader` does this automatically from `TOURISM_CREDITS`.

## Layout and depth

- Page frame `.container-page`: 78rem max, 1 / 1.5 / 2rem side padding.
- Sections alternate between white and the off-white band (`surface-muted`), with one blue band and photo bands for rhythm.
- Cards: white, `rounded-2xl`, hairline border, soft neutral warm-grey shadows (`shadow-card`, `shadow-raised`). Clickable cards lift 3px and glow on hover (`.card-interactive`, `shadow-glow`).
- Buttons: seal-blue `btn-primary`, often `rounded-full`. All buttons press down 1px on click.

## Motion

- `Reveal` fades content in as it scrolls into view, but content is **visible by default**. It hides only when measured below the fold, so screenshot tools, link previews and slow phones never see a blank grid.
- `CountUp` starts at the real figure and only counts when it can animate.
- The hero photo drifts slowly (`animate-ken-burns`).
- All motion is off under `prefers-reduced-motion`.

## Do and don't

**Do:**
- Use the local photo library (`public/img`, `src/data/images.ts`) before reaching for decoration.
- Keep the chatbot one click away: hero "Ask Magi" box, nav button, chat launcher.

**Don't:**
- Use navy, black or grey slabs.
- Add more than one blue band to a page.
- Use a new colour outside these families.
- Show placeholder or "awaiting confirmation" content to the public. Hide the section until the real text exists (see `About.tsx`, `MISSION`/`VISION`).
