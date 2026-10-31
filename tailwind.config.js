/** @type {import('tailwindcss').Config} */

/*
 * MAGALLANES DESIGN SYSTEM — "Bay & Delta" (Oct 2026)
 * ---------------------------------------------------------------------------
 * Drawn from the municipal seal (sky blue, red, white, green fields) and the
 * town itself (bay, river delta, mangroves). Cool and coastal throughout.
 * These are the ONLY colour families — public site and admin alike.
 *
 *   brand   — bay blue. Headings (800), links and icons (600), buttons (800),
 *             icon chips (50 bg + 600 icon), pending/info states.
 *             Page chrome (utility bar, nav, footer, admin sidebar) is LIGHT.
 *   accent  — mangrove green. Eyebrow labels (700), underline bars, the "Ask"
 *             button, focus ring, AND success / published / open states.
 *             White text on accent-500.
 *   ink     — body text (DEFAULT), secondary text (muted), metadata and
 *             input icons (subtle).
 *   surface — white, alternating with one pale "bay mist" tint (muted).
 *             Borders are always "hairline".
 *   neutral — grey. Inactive / draft states and input hover borders only.
 *   alert   — red. Public site: MDRRMO advisories only. Admin: errors and
 *             urgent notices.
 *
 * Every foreground/background pair used in the UI is verified at WCAG 2.1 AA
 * or better against both white and the mist band.
 */

const brand = {
  /* Bay blue — the seal's sky blue (#1CBDF0, kept as 400) deepened for text.
   * Every step used under white text clears WCAG AA; 600 clears it on the mist band. */
  DEFAULT: '#0A5F86',
  950: '#0A3A52', // deepest — headings, hero scrim
  900: '#0B4966', // pressed states, admin sidebar — 9.7:1 under white
  800: '#0A5F86', // primary button, headings — 7.0:1 under white
  700: '#0B6A94', // 6.0:1 under white
  600: '#0C72A0', // interactive — links, active nav, icons — 5.0:1 on the mist band
  500: '#1694C9',
  400: '#1CBDF0', // the seal's blue — decorative / on dark only
  300: '#8AD6F4',
  200: '#C4EAF9',
  100: '#E3F4FC',
  50: '#F1F9FD',
};

const accent = {
  /* Mangrove green — the delta's mangroves, the Bitaug tree, the seal's fields.
   * 500 carries WHITE text (4.6:1); 700 is the eyebrow/label colour (6.1:1 on mist). */
  DEFAULT: '#1F8556',
  900: '#0F3D2B',
  800: '#155A3D',
  700: '#186B46', // eyebrow labels, accent text on light
  600: '#1A7A4E', // underline bars, hover for 500
  500: '#1F8556', // the "Ask" button, event badges, focus ring — white text
  400: '#4DB582',
  300: '#93D3B2', // accent text on photos / dark
  200: '#C6EAD6',
  100: '#E3F5EA',
  50: '#F1FAF4',
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
  200: '#DDE4E9',
  100: '#EDF1F4',
  50: '#F7F9FA',
};

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand,
        accent,
        alert,
        neutral,

        /* Body copy. A near-black neutral, kept distinct from the brand-950
         * heading colour so paragraphs don't compete with headings. */
        ink: {
          DEFAULT: '#202B32',
          light: '#3A4750',
          muted: '#5B6570', // metadata, captions — 5.7:1 on white, 5.3:1 on the mist band
          subtle: '#656F7A', // lightest legible text — 5.11:1 on white, 4.70:1 on the muted band
        },

        /* TWO surfaces, not four. The previous set (white / ivory / mint /
         * sunken) spanned only 0.136 in relative luminance, so alternating
         * bands were mathematically invisible and the page read as one slab.
         * White is the base; `muted` is the single alternating tint, far
         * enough away (Δ0.07) to actually register. Cool-toned throughout —
         * the old warm ivory muddied everything sitting on it. */
        surface: {
          DEFAULT: '#FFFFFF', // page + default sections
          raised: '#FFFFFF', // cards (separated by border, not fill)
          muted: '#F2F8FB', // the one alternating band tint — pale bay mist
          sunken: '#E6F0F5', // wells, disabled fields, image placeholders
          border: '#E2E9ED',
        },

        hairline: '#E2E9ED',
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
      /* Depth comes from the hairline border, not the blur. These carry roughly
       * 40% less ink than before — heavy drop shadows over a warm ivory page
       * read as grime rather than elevation. */
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(10, 58, 82, 0.03), 0 1px 3px -1px rgba(10, 58, 82, 0.025)',
        card: '0 1px 3px -1px rgba(10, 58, 82, 0.035), 0 4px 12px -3px rgba(10, 58, 82, 0.045)',
        raised: '0 3px 6px -2px rgba(10, 58, 82, 0.05), 0 14px 28px -10px rgba(10, 58, 82, 0.09)',
        overlay: '0 20px 44px -14px rgba(10, 58, 82, 0.18)',
        header: '0 1px 0 0 #E2E9ED',
        'header-float': '0 1px 0 0 #E2E9ED, 0 4px 14px -8px rgba(10, 58, 82, 0.10)',
        'inset-line': 'inset 0 -1px 0 0 #E2E9ED',
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
