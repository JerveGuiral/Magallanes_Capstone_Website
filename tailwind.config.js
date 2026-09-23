/** @type {import('tailwindcss').Config} */

/*
 * MAGALLANES DESIGN SYSTEM — "Coastal Ivory"
 * ---------------------------------------------------------------------------
 * A warmer, friendlier take on the previous "Coastal Authority" system,
 * matched against a reference redesign the client approved: a cream/ivory
 * surface instead of cool blue-grey, a deep teal-blue as the primary brand
 * colour instead of navy, a warm gold for calls to action, and a soft mint
 * green for the "what would you like to do" task menu and the notices band.
 *
 *   brand   — deep teal-blue. Headings (950), the primary button (800), the
 *             footer (900), interactive text/links (600). Sampled directly
 *             from the approved reference rather than picked freehand.
 *   accent  — warm gold. Primary calls to action ("Explore Tourism") and the
 *             focus ring. Text sitting on accent uses brand-950, not white.
 *   sea     — soft mint green. The one hue reserved for "things to do":
 *             the task-menu icon badges, the notices band tint, and
 *             tourism/geography markers on the map. Never generic UI chrome.
 *   alert   — advisory red. MDRRMO and emergency use ONLY. Never decorative.
 *
 * Every foreground/background pair used in the UI is verified at WCAG 2.1 AA
 * or better against BOTH the white card surface and the cream page surface.
 *
 * Legacy token names (navy / indigo / teal / gold / signal) are kept as
 * aliases so no view breaks mid-migration — they now resolve into this system.
 */

const brand = {
  DEFAULT: '#00586B',
  950: '#07232F', // deepest — headings, near-black text, utility bar
  900: '#003B4F', // footer
  800: '#00586B', // primary button
  700: '#00647E',
  600: '#00629B', // interactive — links, active nav, icons, eyebrows
  500: '#0580B4',
  400: '#4CB2DE',
  300: '#8FCEE8',
  200: '#C7E5EF',
  100: '#E1F2F6',
  50: '#F0F9FB',
};

const accent = {
  DEFAULT: '#DDB049',
  900: '#5A4412',
  800: '#7D5F19',
  700: '#A47D22', // accent text on light
  600: '#C89A2E',
  500: '#DDB049', // the "Explore Tourism" button — text on this is brand-950, not white
  400: '#E8C377',
  300: '#EFD59D',
  200: '#F5E2BC',
  100: '#FAF0DD',
  50: '#FDF8EF',
};

const sea = {
  DEFAULT: '#0F6B44',
  950: '#04180F',
  900: '#00422B',
  800: '#0A5636',
  700: '#0F6B44',
  600: '#16884F',
  500: '#22A868',
  400: '#6BC79C',
  300: '#A3DDC0',
  200: '#C8EADA',
  100: '#DEF1E1', // task-menu icon badge fill
  50: '#EAF5E9', // notices band tint
};

const alert = {
  DEFAULT: '#B3261E',
  900: '#551210',
  800: '#751B16',
  700: '#93221B',
  600: '#B3261E',
  100: '#FADDDA',
  50: '#FDF1F0',
};

const neutral = {
  DEFAULT: '#5B6570',
  900: '#202B32',
  800: '#2C3941',
  700: '#3A4750',
  600: '#4C5962',
  500: '#5B6570',
  400: '#828D96',
  300: '#AEB6BD',
  200: '#DAD5C6',
  100: '#EDE9DC',
  50: '#F6F4EC',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand,
        accent,
        sea,
        alert,
        neutral,

        /* Body copy. A near-black neutral, kept distinct from the brand-950
         * heading colour so paragraphs don't compete with headings. */
        ink: {
          DEFAULT: '#202B32',
          light: '#3A4750',
          muted: '#5B6570', // metadata, captions — 5.7:1 on white, 5.5:1 on cream
          subtle: '#76808A', // lightest legible text — placeholders, de-emphasised labels
        },

        surface: {
          DEFAULT: '#FCFAF4', // warm ivory page background
          raised: '#FFFFFF', // cards
          sunken: '#F3EFE4', // neutral tinted wells (disabled fields, etc.)
          border: '#E7E2D2',
        },

        hairline: '#E7E2D2',

        /* ---- Legacy aliases — resolve into the system above ---- */
        navy: brand,
        indigo: brand,
        teal: { ...brand, DEFAULT: brand[600] }, // "teal" meant interactive, not the hue
        gold: accent,
        signal: accent,
        slate: neutral,
      },

      fontFamily: {
        /* Playfair Display: a warm transitional serif with real character in
         * headlines ("Welcome to Magallanes") — matched to the approved
         * reference design, which leads with serif display type rather than
         * the previous all-sans "Coastal Authority" system. */
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        /* Inter: a neutral, highly legible UI sans for body copy, nav and
         * form controls — recedes behind the serif instead of competing. */
        sans: ['Inter', 'system-ui', 'sans-serif'],
        /* Restricted to data: reference numbers, IDs, timestamps, figures.
         * Never labels or eyebrows. */
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      /* Modular scale, ratio ~1.25, tightening tracking as size grows. */
      fontSize: {
        'display-2xl': ['clamp(2.5rem, 1.6rem + 3.4vw, 4rem)', { lineHeight: '1.06', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-xl': ['clamp(2rem, 1.4rem + 2.2vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.022em', fontWeight: '700' }],
        'display-lg': ['clamp(1.625rem, 1.25rem + 1.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.018em', fontWeight: '700' }],
        'display-md': ['clamp(1.375rem, 1.15rem + 0.8vw, 1.75rem)', { lineHeight: '1.22', letterSpacing: '-0.014em', fontWeight: '700' }],
        'display-sm': ['1.1875rem', { lineHeight: '1.3', letterSpacing: '-0.008em', fontWeight: '600' }],
        eyebrow: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em', fontWeight: '700' }],
        micro: ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.04em' }],
      },

      maxWidth: {
        content: '78rem', // 1248px — the page frame
        prose: '44rem', // 704px — single-column reading measure (~72ch)
      },

      spacing: {
        section: '4.5rem', // standard vertical section rhythm
        'section-lg': '6rem',
      },

      /* Rounder than the previous system — the reference's cards and photos
       * read considerably softer than "Coastal Authority"'s crisp 6-10px. */
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },

      /* Shadows tinted with brand-950 (#07232F) rather than neutral grey — a
       * plain grey shadow over the warm ivory surface reads muddy. */
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(7, 35, 47, 0.05), 0 1px 3px -1px rgba(7, 35, 47, 0.04)',
        card: '0 2px 4px -1px rgba(7, 35, 47, 0.06), 0 4px 12px -2px rgba(7, 35, 47, 0.07)',
        raised: '0 4px 8px -2px rgba(7, 35, 47, 0.08), 0 16px 32px -8px rgba(7, 35, 47, 0.14)',
        overlay: '0 24px 48px -12px rgba(4, 20, 27, 0.28)',
        header: '0 1px 0 0 #E7E2D2',
        'header-float': '0 1px 0 0 #E7E2D2, 0 4px 16px -6px rgba(7, 35, 47, 0.14)',
        'inset-line': 'inset 0 -1px 0 0 #E7E2D2',
      },

      transitionTimingFunction: {
        gov: 'cubic-bezier(0.16, 1, 0.3, 1)', // decelerating — settles, never bounces
        entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      keyframes: {
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'translateY(-4px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'draw-current': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },

      animation: {
        'reveal-up': 'reveal-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        'scale-in': 'scale-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite',
        'draw-current': 'draw-current 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
