/** @type {import('tailwindcss').Config} */

/*
 * MAGALLANES DESIGN SYSTEM — "Coastal Authority"
 * ---------------------------------------------------------------------------
 * Magallanes sits at the mouth of the Agusan and Baug rivers; twelve barangays
 * on a delta, most of them within two kilometres of water. The palette is built
 * from that fact rather than from generic government blue:
 *
 *   brand   — deep delta navy. Chrome, headings, primary actions. Reads as an
 *             institution first; the depth (800/900) keeps it from looking like
 *             a consumer SaaS blue.
 *   accent  — brass/gold, taken from the municipal seal's medallion. Used for
 *             rules, eyebrows, the focus ring and one emphasis per view.
 *   sea     — a muted teal reserved for geography: coastal barangays on the map,
 *             tourism, environment. Never used for generic UI state.
 *   alert   — advisory red. MDRRMO and emergency use ONLY. Never decorative.
 *
 * Every foreground/background pair used in the UI is verified at WCAG 2.1 AA or
 * better. The focus ring (accent-600 #B8822A) is the one colour that clears 3:1
 * against white, surface, brand-800 AND brand-950, so a single ring definition
 * works on light panels and dark chrome alike.
 *
 * Legacy token names (navy / indigo / teal / gold / signal) are kept as aliases
 * so no view breaks mid-migration — they now resolve into this system.
 */

const brand = {
  DEFAULT: '#0E2A47',
  950: '#061524', // deepest — utility bar, overlays
  900: '#09203A', // footer
  800: '#0E2A47', // header, headings, primary button
  700: '#14395E',
  600: '#1B4F7E', // interactive — links, active nav, icons
  500: '#236A9E',
  400: '#4A8CC0',
  300: '#8FBBDC',
  200: '#C4DCEE',
  100: '#E2EEF7',
  50: '#F0F7FC',
};

const accent = {
  DEFAULT: '#B8822A',
  900: '#5E4010',
  800: '#7D5617',
  700: '#9A6B1E', // accent text on light (4.67:1)
  600: '#B8822A', // focus ring — passes 3:1 on light AND dark
  500: '#CE9B3D', // rules, seal marks, badges on dark
  400: '#DFB55F', // eyebrows on dark chrome
  300: '#EBCE92',
  200: '#F4E3C2',
  100: '#FAF1DF',
  50: '#FDF9F0',
};

const sea = {
  DEFAULT: '#0F766E',
  900: '#08332F',
  800: '#0C4F48',
  700: '#0F766E',
  600: '#139387',
  500: '#1FAE9F',
  200: '#A7E3DC',
  100: '#D6F3EF',
  50: '#EFFBF9',
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
  DEFAULT: '#54677A',
  900: '#16202B',
  800: '#22303F',
  700: '#2B3A4A',
  600: '#3F5164',
  500: '#54677A',
  400: '#7C8FA3',
  300: '#A9B9C7',
  200: '#D6E0E9',
  100: '#EAF0F5',
  50: '#F6F8FA',
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

        /* Body copy. Warm-neutral rather than pure black so long passages of
         * ordinance text stay comfortable on cheap LCD panels. */
        ink: {
          DEFAULT: '#16202B',
          light: '#2B3A4A',
          muted: '#54677A', // metadata, captions — 5.84:1 on white
          subtle: '#5F7285', // lightest legible text — placeholders, de-emphasised labels (4.96:1 on white)
        },

        surface: {
          DEFAULT: '#F6F8FA',
          raised: '#FFFFFF',
          sunken: '#EAF0F5',
          border: '#D6E0E9',
        },

        hairline: '#D6E0E9',

        /* ---- Legacy aliases — resolve into the system above ---- */
        navy: brand,
        indigo: brand,
        teal: { ...brand, DEFAULT: brand[600] }, // "teal" meant interactive, not the hue
        gold: accent,
        signal: accent,
        slate: neutral,
      },

      fontFamily: {
        /* Libre Franklin: a contemporary Franklin Gothic. Civic typography
         * practice (USWDS, and Public Sans which derives from Franklin) settled
         * on this genre because it stays legible at small sizes on low-end
         * mobile hardware — the majority of traffic in rural Agusan del Norte. */
        display: ['"Libre Franklin"', 'system-ui', 'sans-serif'],
        /* Source Sans 3: designed for UI and long-form reading; recedes behind
         * the display face instead of competing with it. */
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        /* Restricted to data: reference numbers, IDs, timestamps, figures.
         * Never labels or eyebrows — that is what made it meaningless before. */
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

      borderRadius: {
        DEFAULT: '6px',
        sm: '3px',
        md: '6px',
        lg: '10px',
        xl: '14px',
        '2xl': '20px',
      },

      /* Navy-tinted shadows — a neutral grey shadow over a blue surface reads
       * muddy. Kept shallow; depth comes from the border, not the blur. */
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(14, 42, 71, 0.05), 0 1px 3px -1px rgba(14, 42, 71, 0.04)',
        card: '0 2px 4px -1px rgba(14, 42, 71, 0.06), 0 4px 12px -2px rgba(14, 42, 71, 0.07)',
        raised: '0 4px 8px -2px rgba(14, 42, 71, 0.08), 0 16px 32px -8px rgba(14, 42, 71, 0.14)',
        overlay: '0 24px 48px -12px rgba(6, 21, 36, 0.28)',
        header: '0 1px 0 0 #D6E0E9',
        'header-float': '0 1px 0 0 #D6E0E9, 0 4px 16px -6px rgba(14, 42, 71, 0.14)',
        'inset-line': 'inset 0 -1px 0 0 #D6E0E9',
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
