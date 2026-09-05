/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Indigo: #1E2A4A (primary — header, nav, primary buttons; institutional weight)
        indigo: {
          DEFAULT: '#1E2A4A',
          900: '#131B31',
          800: '#1E2A4A',
          700: '#2A3B66',
          600: '#384E82',
          200: '#C5CFE3',
          100: '#E4E8F1',
          50: '#F0F3F8',
        },
        // River Teal: #17A398 (secondary actions, active states, current line motif)
        teal: {
          DEFAULT: '#17A398',
          900: '#0C4B46',
          800: '#0F625B',
          700: '#117E75',
          600: '#17A398',
          400: '#34D3C5',
          200: '#A3E5DE',
          100: '#D5F3F0',
          50: '#ECFAF8',
        },
        // Warm Signal: #F0A202 (used sparingly — one accent per view max)
        signal: {
          DEFAULT: '#F0A202',
          700: '#9E6900',
          600: '#C78500',
          500: '#F0A202',
          400: '#F5B833',
          100: '#FDF3DC',
          50: '#FEF9ED',
        },
        // Backward compatibility for existing 'gold' token
        gold: {
          DEFAULT: '#F0A202',
          600: '#C78500',
          400: '#F5B833',
          100: '#FDF3DC',
        },
        // Backward compatibility for existing 'navy' token
        navy: {
          DEFAULT: '#1E2A4A',
          900: '#131B31',
          700: '#2A3B66',
          500: '#384E82',
          200: '#C5CFE3',
          50: '#F0F3F8',
        },
        // Cool Neutral BG and surfaces: #F5F7FA
        surface: {
          DEFAULT: '#F5F7FA',
          raised: '#FFFFFF',
          sunken: '#E9EEF4',
          border: '#E2E8F0',
        },
        // Ink: #14213D (body text)
        ink: {
          DEFAULT: '#14213D',
          light: '#243456',
          muted: '#64748B',
        },
        // Slate: #64748B (secondary text, metadata, captions)
        slate: {
          DEFAULT: '#64748B',
          800: '#334155',
          700: '#475569',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        // Alert Red: #C0392B (strictly emergency / weather advisories)
        alert: {
          DEFAULT: '#C0392B',
          900: '#781E15',
          700: '#962B20',
          600: '#C0392B',
          100: '#FADBD8',
          50: '#FDEDEC',
        },
        hairline: '#E2E8F0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['2.75rem', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'display-lg': ['2.125rem', { lineHeight: '1.16', letterSpacing: '-0.015em' }],
        'display-md': ['1.5rem', { lineHeight: '1.24', letterSpacing: '-0.01em' }],
      },
      maxWidth: {
        content: '76rem',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(20, 33, 61, 0.04), 0 1px 2px -1px rgba(20, 33, 61, 0.02)',
        card: '0 2px 6px -1px rgba(20, 33, 61, 0.06), 0 1px 4px -1px rgba(20, 33, 61, 0.04)',
        raised: '0 10px 25px -5px rgba(30, 42, 74, 0.12), 0 8px 10px -6px rgba(30, 42, 74, 0.06)',
        header: '0 1px 0 #E2E8F0',
      },
      transitionTimingFunction: {
        gov: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'draw-current': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'reveal-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'draw-current': 'draw-current 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal-up': 'reveal-up 240ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
