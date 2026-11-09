/** @type {import('tailwindcss').Config} */

/*
 * MAGALLANES DESIGN SYSTEM — "Magallanes Seal" (Nov 2026)
 * ---------------------------------------------------------------------------
 * Taken from the municipal seal: its sky-blue scalloped border (#1EC3F1), red
 * ring (#EE1B1D) and the green and gold fields at its centre. Medium shades, never navy: the darkest LARGE surface is
 * brand-600, used for at most one call-to-action band per page. Backgrounds,
 * shadows and photo scrims stay neutral; colour is for accents.
 *
 *   brand   — seal blue. Headings (800), links, icons and buttons (600),
 *             icon chips (50 bg + 600 icon). 400 is the seal's own blue —
 *             decorative only (2.1:1 on white).
 *   seal    — seal red. Highlights, the Municipal Hall map pin, one
 *             icon-tile tone. Never a button or an error colour.
 *   accent  — seal green. Eyebrow labels (700), "things to do", success /
 *             published / open states. White text on accent-500 and up.
 *   fiesta  — gold. Stat figures on the blue band, highlights.
 *             Decoration only: text ON gold is always brand-900.
 *   sky     — kept as an alias of the seal blue for older call sites.
 *   ink     — warm near-black body text (DEFAULT), muted and subtle greys.
 *   surface — white, alternating with one warm off-white band (muted).
 *   neutral — warm grey. Inactive / draft states and input borders only.
 *   alert   — red. MDRRMO advisories and genuine errors only, always with an
 *             icon and a label so it is never mistaken for the seal red.
 *
 * Every text/background pair in use is verified at WCAG 2.1 AA (4.5:1) on
 * white, the off-white band and the sunken well — see DESIGN.md.
 */

const brand = {
  /* Seal blue, built around the seal's own #1EC3F1 (400). Medium shades on purpose:
   * 600 is the lightest blue that still carries white text at AA. */
  DEFAULT: '#0B74A6',
  950: '#0B3A52', // rarely used — deepest step
  900: '#0D4F70', // text on gold
  800: '#0C5F87', // headings — 7.0:1 on white
  700: '#0A6894', // pressed / hover — 6.1:1 under white
  600: '#0B74A6', // interactive, the blue band — 5.2:1 on white, 4.6:1 on sunken
  500: '#0F9FD6',
  400: '#1EC3F1', // the seal's blue — decorative
  300: '#6FCFF3',
  200: '#ABE2F8',
  100: '#D7F1FC',
  50: '#EEF9FE',
};

const seal = {
  /* Seal red, from the ring (#EE1B1D, 500 — decorative). 600 for text and icons. */
  DEFAULT: '#D32F2F',
  800: '#9A1B1B',
  700: '#B71C1C', // 6.6:1 on white
  600: '#D32F2F', // red text and icons — 5.0:1 on white
  500: '#EE1B1D', // the seal's red — decorative
  400: '#F25557',
  200: '#FBC0C0',
  100: '#FDE2E2',
  50: '#FEF3F3',
};

const accent = {
  /* Roof green — the hall's roof, the Bitaug tree, the seal's fields. */
  DEFAULT: '#287F52',
  900: '#123A26',
  800: '#194F34',
  700: '#1F6642', // eyebrow labels, accent text on light — 6.9:1 on white
  600: '#24784D', // hover for 500 — 5.4:1 under white
  500: '#287F52', // success buttons, badges — 4.9:1 under white
  400: '#4FAE77',
  300: '#86C9A0',
  200: '#B3DFC3',
  100: '#D8EFE0',
  50: '#EEF8F1',
};

const fiesta = {
  /* Seal gold. Never carries white text. */
  DEFAULT: '#F4B400',
  700: '#8A6200', // gold text on white — 5.5:1
  600: '#C98F00',
  500: '#F4B400',
  400: '#F7C325',
  300: '#FFD45C', // figures on the brand-700 band — 5.3:1
  200: '#FFE499',
  100: '#FFF1C7',
  50: '#FFF9E8',
};

const sky = {
  /* The municipal seal's blue. */
  DEFAULT: '#1CBDF0',
  700: '#09658A', // text — 6.5:1 on white
  600: '#0B7FA8',
  500: '#0EA0D2',
  400: '#1CBDF0', // the seal's blue — decorative
  300: '#7FD8F6',
  200: '#B5E8FA',
  100: '#DDF4FD',
  50: '#EFFAFE',
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
  /* Warm grey — tinted toward the rose so it never reads cold beside it. */
  DEFAULT: '#6B5F64',
  900: '#2A2326',
  800: '#352C30',
  700: '#43393D',
  600: '#554A4F',
  500: '#6B5F64',
  400: '#8F8489',
  300: '#BFB5B9',
  200: '#E4DEE0',
  100: '#F2EEEF',
  50: '#FAF8F8',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand,
        accent,
        fiesta,
        seal,
        sky,
        alert,
        neutral,

        /* Body copy: a warm near-black, kept distinct from the brand-800
         * heading colour so paragraphs don't compete with headings. */
        ink: {
          DEFAULT: '#2A2326',
          light: '#43393D',
          muted: '#6B5F64', // metadata, captions — 6.1:1 on white, 5.3:1 on sunken
          subtle: '#76696F', // lightest legible text — 5.2:1 on white, 4.5:1 on sunken
        },

        /* White base, one blush band (muted), one deeper blush well (sunken). */
        surface: {
          DEFAULT: '#FFFFFF', // page + default sections
          raised: '#FFFFFF', // cards
          muted: '#FAF8F7', // the alternating band — warm off-white (blush read too pink)
          sunken: '#F3F0EF', // wells, disabled fields, image placeholders
          border: '#ECE7E6',
        },

        hairline: '#ECE7E6',
      },

      fontFamily: {
        /* Playfair Display: a warm transitional serif with real character in
         * headlines ("Welcome to Magallanes") — matched to the approved
         * reference design, which leads with serif display type rather than
         * the previous all-sans "Coastal Authority" system. */
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        /* Plus Jakarta Sans: a friendly, rounded, highly legible UI sans for
         * body copy, nav and form controls — warm beside the rose, and it
         * recedes behind the serif instead of competing. */
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
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

      /* Neutral warm-grey shadows, kept light. (Rose-tinted shadows were tried and read as a pink haze around every card.) rather than neutral
       * grey — a grey shadow beside blush reads as grime, a rose one as warmth.
       * `glow` is the hover lift for interactive cards. */
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(42, 35, 38, 0.03), 0 1px 3px -1px rgba(42, 35, 38, 0.02)',
        card: '0 1px 3px -1px rgba(42, 35, 38, 0.035), 0 6px 16px -6px rgba(42, 35, 38, 0.05)',
        raised: '0 4px 8px -3px rgba(42, 35, 38, 0.045), 0 18px 36px -12px rgba(42, 35, 38, 0.09)',
        glow: '0 6px 14px -6px rgba(42, 35, 38, 0.10), 0 18px 36px -16px rgba(42, 35, 38, 0.12)',
        overlay: '0 24px 48px -14px rgba(42, 35, 38, 0.16)',
        header: '0 1px 0 0 #ECE7E6',
        'header-float': '0 1px 0 0 #ECE7E6, 0 6px 18px -10px rgba(42, 35, 38, 0.10)',
        'inset-line': 'inset 0 -1px 0 0 #ECE7E6',
      },

      transitionTimingFunction: {
        gov: 'cubic-bezier(0.16, 1, 0.3, 1)', // decelerating — settles, never bounces
        entrance: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      keyframes: {
        /* Hero photograph: a slow drift in, so the town feels alive without anything
         * moving fast enough to pull the eye off the headline. Off under reduced motion. */
        'ken-burns': {
          from: { transform: 'scale(1)' },
          to: { transform: 'scale(1.08) translate3d(-1%, -1%, 0)' },
        },
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
        /* Seal loader: a green accent arc sweeps around the municipal seal while the
         * seal itself breathes. Two separate rhythms so it reads as a crafted
         * mark rather than a generic spinner. */
        orbit: {
          to: { transform: 'rotate(360deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.94)', opacity: '0.82' },
        },
        halo: {
          '0%': { transform: 'scale(0.9)', opacity: '0.5' },
          '70%, 100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Chat launcher: arrives just after the page settles, then — once per visit — a
        // small double hop with an expanding ring so first-time visitors notice it.
        'chat-pop': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.9)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'chat-nudge': {
          '0%, 100%': { transform: 'translateY(0)' },
          '18%': { transform: 'translateY(-7px)' },
          '36%': { transform: 'translateY(0)' },
          '52%': { transform: 'translateY(-3px)' },
          '68%': { transform: 'translateY(0)' },
        },
        'chat-ring': {
          from: { transform: 'scale(1)', opacity: '0.5' },
          to: { transform: 'scale(1.55)', opacity: '0' },
        },
        /* The "alive" idle loop for the assistant launcher: a slow bob, a soft
         * breathing halo, and the face's eyes blinking now and then. */
        'chat-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'chat-breathe': {
          '0%': { transform: 'scale(1)', opacity: '0.35' },
          '70%, 100%': { transform: 'scale(1.35)', opacity: '0' },
        },
        'chat-blink': {
          '0%, 90%, 96%, 100%': { transform: 'scaleY(1)' },
          '93%': { transform: 'scaleY(0.1)' },
        },
        /* Bitoy, the Bitaug-tree mascot (src/components/Bitoy.tsx): the canopy sways in the
         * breeze, a twig waves hello, leaves bob while he thinks, a little hop when he answers. */
        'bitoy-sway': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        /* The crown's far side sways less and its front leaves a little more, so the layers
         * shift against each other and the tree reads in depth. */
        'bitoy-sway-back': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        },
        'bitoy-rustle': {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'bitoy-wave': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%, 45%': { transform: 'rotate(-30deg)' },
          '30%, 60%': { transform: 'rotate(8deg)' },
          '75%': { transform: 'rotate(-20deg)' },
        },
        'bitoy-hop': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(0)' },
          '70%': { transform: 'translateY(-2px)' },
        },
        'bitoy-think': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.5' },
          '50%': { transform: 'translateY(-2px)', opacity: '1' },
        },
      },

      animation: {
        'ken-burns': 'ken-burns 24s ease-out both',
        'reveal-up': 'reveal-up 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        'scale-in': 'scale-in 160ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite',
        'draw-current': 'draw-current 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        orbit: 'orbit 1.5s linear infinite',
        'orbit-slow': 'orbit 3.2s linear infinite reverse',
        breathe: 'breathe 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        halo: 'halo 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'rise-in': 'rise-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both',
        // `backwards`, not `both`: holding the end frame would pin `transform` and block hover scaling.
        'chat-pop': 'chat-pop 420ms cubic-bezier(0.16, 1, 0.3, 1) 500ms backwards',
        'chat-nudge': 'chat-nudge 900ms cubic-bezier(0.16, 1, 0.3, 1)',
        'chat-ring': 'chat-ring 1.1s cubic-bezier(0.16, 1, 0.3, 1) 2 both',
        'chat-float': 'chat-float 3.2s ease-in-out infinite',
        'chat-breathe': 'chat-breathe 2.8s ease-out infinite',
        'chat-blink': 'chat-blink 4.5s ease-in-out infinite',
        'bitoy-sway': 'bitoy-sway 4s ease-in-out infinite',
        'bitoy-sway-back': 'bitoy-sway-back 4s ease-in-out 0.3s infinite',
        'bitoy-rustle': 'bitoy-rustle 3.2s ease-in-out 0.6s infinite',
        'bitoy-wave': 'bitoy-wave 1.4s ease-in-out',
        'bitoy-hop': 'bitoy-hop 800ms cubic-bezier(0.16, 1, 0.3, 1)',
        'bitoy-think': 'bitoy-think 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
