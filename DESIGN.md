---
name: Magallanes Coastal Ivory
description: Warm ivory-and-teal civic design system for the Municipality of Magallanes, Agusan del Norte
colors:
  primary: "#096478"
  primary-deep: "#103A49"
  primary-bright: "#0B6EA6"
  accent: "#DDB049"
  accent-text: "#8B6A1C"
  sea: "#0F6B44"
  alert: "#B3261E"
  ink: "#202B32"
  ink-muted: "#5B6570"
  surface: "#FCFAF4"
  surface-raised: "#FFFFFF"
  surface-sunken: "#F3EFE4"
  hairline: "#E7E2D2"
typography:
  display:
    fontFamily: "'Playfair Display', Georgia, serif"
    fontSize: "clamp(2rem, 1.4rem + 2.2vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.1em"
  mono:
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "24px"
spacing:
  section: "4.5rem"
  section-lg: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary-deep}"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "11px 18px"
  field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.xl}"
---

# Design System: Magallanes Coastal Ivory

## Overview

**Creative North Star: "Coastal Ivory"**

Coastal Ivory is a warm, friendly successor to an earlier "Coastal Authority" system — a cooler, blue-grey, more institutional treatment that the client moved away from in favor of a cream/ivory surface, a deep teal-blue primary (in place of navy), a warm gold call-to-action, and a soft mint green reserved for "things to do." The result reads as a municipality that wants to be approachable and legible rather than severe: warm and approachable in its components, but still carrying real civic authority through a serif display face, verified contrast, and a disciplined, mostly-monochrome palette that spends color only where it means something.

Every foreground/background pairing in the system is verified at WCAG 2.1 AA or better against both the white card surface and the cream page surface — not just checked once and assumed to hold. Depth comes from hairline borders and brand-tinted (not neutral-grey) shadows carrying roughly 40% less ink than the system's own previous iteration; a plain grey shadow over warm ivory reads as grime, not elevation. The system explicitly rejects: cool blue-grey neutrals (superseded "Coastal Authority" territory), heavy drop shadows, and an italic serif at section breaks (tested and read as "editorial," not municipal).

**Key Characteristics:**
- Warm ivory page surface, deep teal-blue civic authority, one reserved gold accent, one reserved mint-green "things to do" hue
- Playfair Display serif headlines over a receding Inter body/UI face — display leads, UI recedes
- Flat-by-default with hairline borders; shadows are soft, brand-tinted, and used sparingly for genuine elevation
- A single signature motif (the Bitaug tree) used sparingly — at most once per page — so it stays a mark, not wallpaper
- Every color pairing verified against WCAG AA on both of the system's two background tones, never assumed

## Colors

The palette is disciplined: one civic-authority hue, one warm accent, one reserved "things to do" green, one reserved emergency red, and a warm-neutral scale underneath. Nothing outside this list carries meaning — a new color introduced ad hoc breaks the system's one rule that color is spent deliberately, never decoratively.

### Primary
- **Deep Tidal Teal** (`#096478` / brand-800): the civic-authority color. Headings key off one shade darker (`#103A49`); the primary button, sticky nav bar, and admin sidebar key off this shade directly, so headlines read near-black against the same-family button and nav rather than competing with them.
- **Tidal Teal Deep** (`#103A49` / brand-950): utility bar, hero scrim/overlay, all heading text color — reserved as the darkest, most authoritative step.
- **Channel Blue** (`#0B6EA6` / brand-600): the interactive shade — links, active nav state, icons, primary-button hover. This is the "something is clickable" signal throughout the site.

### Secondary
- **Weathered Gold** (`#DDB049` / accent-500): the one warm call-to-action color ("Explore Tourism," the focus ring's outer core). Text sitting on this gold is always the deep teal (`#103A49`), never white — gold this light needs dark text to clear AA. Used for at most one CTA per view; it is not a secondary UI chrome color.

### Tertiary
- **Mangrove Green** (`#0F6B44` / sea-700): reserved exclusively for "things to do" — the task-menu icon badges, the homepage notices-band tint, and coastal/tourism markers on the municipal map. **The Reserved Green Rule.** This hue never appears as generic UI chrome, a status color outside its five semantic buckets, or decoration; if a new element needs green, that's a sign it belongs in the "things to do" family or it shouldn't be green at all.

### Neutral
- **Ink** (`#202B32`): body copy, kept visually distinct from the brand-950 heading color so paragraphs never compete with headlines for authority.
- **Ink Muted** (`#5B6570`): metadata, captions, secondary copy — verified 5.7:1 on white, 5.5:1 on the cream page surface.
- **Warm Ivory** (`#FCFAF4` / surface): the page background — intentionally warmer than a cool white or grey.
- **Card White** (`#FFFFFF` / surface-raised): cards, fields, and any raised surface sitting on the ivory page.
- **Sunken Well** (`#F3EFE4` / surface-sunken): disabled fields and other tinted, recessed wells.
- **Hairline** (`#E7E2D2`): the border/divider color that carries most of the system's depth signal — see Elevation & Depth.

### Named Rules
**The Advisory Red Rule.** Alert red (`#B3261E` / alert-600) is reserved for MDRRMO advisories and genuine emergency/error states only. It is never decorative, never a generic "important" highlight, and never used for a merely-urgent-but-not-emergency notice.

**The Verified Contrast Rule.** Every foreground/background pair in active use is checked at AA or better against *both* the white card surface and the cream page surface before it ships — a color that clears contrast on white but not on ivory (or vice versa) is treated as a defect, not a rounding error.

## Typography

**Display Font:** Playfair Display (with Georgia, serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)
**Label/Mono Font:** IBM Plex Mono — restricted to reference numbers, IDs, timestamps, and figures; never labels or eyebrows.

**Character:** A warm transitional serif carries every headline with real character ("Welcome to Magallanes" reads as a place, not a form), while Inter recedes behind it for body copy, navigation, and form controls — the display face leads, the UI face never competes with it.

### Hierarchy
- **Display** (700, `clamp(2rem, 1.4rem + 2.2vw, 3rem)` up to `clamp(2.5rem, 1.6rem + 3.4vw, 4rem)` at the largest step, 1.1 line-height, tightening tracking as size grows): hero and top-of-page headlines only.
- **Headline / Title** (700, `display-lg`/`display-md` steps, 1.15–1.22 line-height): section headers, page titles, card titles — always upright, never italic (an italic serif at every section break read editorial, not municipal, and was rejected).
- **Body** (400, 1.0625rem/17px, 1.65 line-height): a notch above the typical 16px default — "this site is read, not skimmed." Long-form copy (`.prose-gov`) widens the line-height further to 1.75 and caps measure at 44rem (~72ch).
- **Label** (700, 0.75rem/12px, 1.4 line-height, 0.1em tracking, uppercase): the small-caps eyebrow, led by a short brass-colored rule rather than carried by the mono face — an earlier mono eyebrow had spread far enough across the site that the mono face stopped signaling "data" and this replaced it.

### Named Rules
**The Tabular Numerals Rule.** Any place numbers are compared down a column (data tables, reference figures) gets `font-variant-numeric: tabular-nums`, applied automatically to `.font-mono` and every table cell — never left to the browser default, which lets digit widths drift and misaligns columns.

## Layout

The page frame (`.container-page`) caps at 78rem (1248px) with responsive inline padding: 1rem on mobile, 1.5rem from 640px, 2rem from 1024px. Long-form reading content additionally caps at 44rem (~72ch) via `.prose-gov`.

Vertical rhythm between major sections runs on two fixed steps — 4.5rem (`section`) as the standard gap, 6rem (`section-lg`) for a more generous break — rather than ad hoc spacing per page.

**Responsive navigation strategy:** a two-tier masthead. The identity tier (seal, wordmark, search) scrolls away with the page; only the navigation tier stays sticky, which buys back roughly 90px of vertical space on the phone screens most traffic arrives on. Mobile collapses to a hamburger-triggered off-canvas panel with the page scroll locked behind it; desktop (`lg:` and up) shows the full horizontal nav with hover/click dropdown groups.

**Admin layout:** a fixed 72-unit (18rem) sidebar on desktop, collapsing to an off-canvas toggle below `lg`; content area caps at a 7xl (80rem) max-width and scales its own padding (1rem → 1.5rem → 2rem) independently of the public site's container.

**Data tables** (admin CRUD screens) always wrap in `overflow-x-auto` rather than trying to reflow columns responsively — the table stays a table at every width, and the container handles overflow instead.

## Elevation & Depth

Depth comes from the hairline border, not the blur. Shadows are used sparingly and are tinted with the deepest brand color rather than neutral grey — a plain grey shadow over warm ivory reads as grime, not elevation — and this iteration deliberately carries roughly 40% less shadow "ink" than the system's own previous pass.

### Shadow Vocabulary
- **subtle** (`0 1px 2px 0 rgba(16,58,73,0.03), 0 1px 3px -1px rgba(16,58,73,0.025)`): resting cards, buttons at rest — barely perceptible, mostly a hairline job.
- **card** (`0 1px 3px -1px rgba(16,58,73,0.035), 0 4px 12px -3px rgba(16,58,73,0.045)`): standard raised surfaces.
- **raised** (`0 3px 6px -2px rgba(16,58,73,0.05), 0 14px 28px -10px rgba(16,58,73,0.09)`): hover-lifted interactive cards, floating panels (chat widget, dropdown menus).
- **overlay** (`0 20px 44px -14px rgba(16,58,73,0.18)`): modals and the chat panel — the deepest step, reserved for content that sits above everything else.
- **header** / **header-float** (`0 1px 0 0 #E7E2D2` [+ a soft float blur on scroll]): the sticky nav's separation from content — a hairline first, a very soft shadow only once the page has scrolled.

### Named Rules
**The Hairline-First Rule.** Every elevated surface gets a 1px hairline border before it gets a shadow. The border does the separation; the shadow (when present) only adds a soft sense of lift on top of it.

## Shapes

Rounder than the system's own predecessor: buttons and fields use an 8px radius, cards step up to 16px, and the largest surfaces (modals, hero panels) reach 24px. Corners scale with the size and importance of the surface — small controls stay tight, large containers get noticeably softer.

- **sm** (4px): the smallest chips/skeleton corners.
- **md** (8px) — default: buttons, fields, standard controls.
- **lg** (12px): document/notice list rows.
- **xl** (16px): cards.
- **2xl** (24px): the largest surfaces — modal panels, hero-scale containers.

## Components

The overall feel across buttons, cards, and fields is **warm and approachable**: soft rounded corners, restrained shadows, a cream-and-teal palette that reads friendly rather than cold, while still carrying enough weight (the serif headlines, the verified contrast, the reserved-color discipline) to read as a legitimate civic system rather than a consumer app.

### Buttons
- **Shape:** 8px radius (`rounded-md`), `sm`/`lg` size variants adjust padding only, never the radius.
- **Primary** (`.btn-primary`): deep teal background (`#096478`), white text, hovers one step brighter (`#0B6EA6`), active state drops one step darker (`#103A49`) and loses its shadow — a pressed-in read, not just a color swap.
- **Accent** (`.btn-accent`): the one warm gold CTA. Text is always deep teal, never white — verified for AA legibility on the lighter gold.
- **Secondary** (`.btn-secondary`): white background, hairline border, teal text; hover swaps the border to teal-600 and tints the background brand-50.
- **Ghost** (`.btn-ghost`): transparent, teal text, brand-50 background only on hover — the lowest-emphasis action.
- **Danger** (`.btn-danger`): reserved for destructive admin actions (delete confirmations) — a distinct red family, never reused for the public site's advisory red.
- **Disabled:** every variant drops to 50% opacity and `cursor: not-allowed`, never a separate disabled color family.

### Cards
- **Corner Style:** 16px radius.
- **Background:** white, always — cards never inherit the page's ivory tint.
- **Border:** 1px hairline (`#E7E2D2`).
- **Shadow Strategy:** `subtle` at rest; interactive cards (`.card-interactive`) lift to `raised` on hover with a 2px upward translate, both suppressed under `prefers-reduced-motion`.

### Inputs / Fields
- **Style:** white background, 1px hairline border, 8px radius, 0.9375rem text.
- **Focus:** the border recolors to `brand-600` and gains a soft 3px `rgba(11,110,166,0.18)` halo — deliberately lighter-weight than the site-wide two-tone focus ring, since a field already draws its own border and stacking the full ring on top read as a slab.
- **Disabled:** sunken background tint, muted neutral text (explicitly exempt from the body-text contrast floor, since it signals "not interactive" rather than "read me").

### Focus Ring (site-wide, non-field)
Every other focusable element gets a two-tone ring: a gold core wrapped in a deep navy edge. No single color can clear WCAG 1.4.11 (3:1) against both a white card and the mid-tone teal nav bar at once, so the ring is layered — whichever surface it lands on, one of the two rings carries the contrast. Elements on dark chrome (`.bg-brand-700` and darker) get a plain white outline instead of the two-tone ring.

### Navigation
Two-tier masthead (see Layout). Active top-level links are marked by a 3px brass (accent-500) underline rather than a filled pill, so the bar stays quiet and the seal remains the visually loudest element in the header. Dropdown groups use `aria-haspopup`/`aria-expanded`, close on outside-click and Escape, and lock body scroll on mobile while open.

### Status Badges
Five semantic buckets, each mapped onto the system's existing color roles rather than an ad hoc badge palette: positive → sea (mangrove green), attention → alert (advisory red), pending → accent (gold), neutral → the warm-neutral scale, informational → brand (teal). Each badge's leading dot always matches the label's own color, so state survives a greyscale print of an admin screen — a real constraint for a government office that still prints things.

### Signature Motif: the Bitaug Tree
A single-stroke, no-fill line-art rendering of the Bitaug tree — the heritage marker of Magallanes — used as a watermark behind page headers and as the centerpiece of a section divider. **The One Motif Rule.** Use it at most once per page, at the single most meaningful break. It previously appeared between nearly every section and turned the municipality's one piece of signature iconography into wallpaper; restraint is what keeps it a mark rather than decoration.

## Do's and Don'ts

### Do:
- **Do** verify every new foreground/background pairing at WCAG AA against *both* the white card surface and the cream page surface — not just one.
- **Do** reserve mangrove green (`sea`) exclusively for "things to do" content; it is not a spare UI accent.
- **Do** tint shadows from the deepest brand color, never neutral grey, and keep them soft — depth comes from the hairline border first.
- **Do** use the Bitaug motif at most once per page.
- **Do** keep the mono face (IBM Plex Mono) restricted to data — reference numbers, IDs, timestamps, figures — never labels or eyebrows.
- **Do** set text on the gold accent to deep teal, never white.

### Don't:
- **Don't** use advisory red for anything but MDRRMO advisories and genuine error/emergency states.
- **Don't** use an italic serif at section breaks — tested, and it reads editorial rather than municipal.
- **Don't** pin the full masthead on scroll; only the navigation tier stays sticky.
- **Don't** reach for a heavy neutral-grey drop shadow — it reads as grime on the warm ivory surface, not elevation.
- **Don't** let the Bitaug motif repeat across every section; restraint is the point of a signature mark.
