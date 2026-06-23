import type { Config } from 'tailwindcss'

/**
 * Accountant Hub — Tailwind CSS Design Token Extension
 *
 * Extends the default Tailwind configuration with the project's
 * brand palette, typography scale, spacing grid, border radii,
 * box shadows, and breakpoints.
 *
 * Primary brand color: Indigo (#4F46E5)
 * Neutral: Gray
 * Success: Green
 * Warning: Yellow (Amber tone)
 * Error/Danger: Red
 *
 * All values are mobile-first. Dark mode is class-based so that
 * the Frontend Specialist can toggle it manually via <html class="dark">.
 */
const config: Config = {
  // Scan all source files for class usage
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],

  // Class-based dark mode — toggled via <html class="dark">
  darkMode: 'class',

  theme: {
    extend: {
      // ─────────────────────────────────────────────
      // COLOR PALETTE
      // ─────────────────────────────────────────────
      colors: {
        // Primary — Indigo
        // Usage: buttons, links, active states, focus rings, badges
        primary: {
          50:  '#EEF2FF', // very light tint — hover backgrounds, subtle fills
          100: '#E0E7FF', // light tint — selected row backgrounds
          200: '#C7D2FE', // light — progress bar tracks
          300: '#A5B4FC', // medium-light — disabled state text
          400: '#818CF8', // medium — secondary button borders
          500: '#6366F1', // mid-range — icon accents
          600: '#4F46E5', // DEFAULT — primary buttons, active nav items
          700: '#4338CA', // darker — button hover state
          800: '#3730A3', // dark — pressed states
          900: '#312E81', // very dark — text on light indigo backgrounds
          950: '#1E1B4B', // deepest — dark mode primary text
        },

        // Neutral — Gray
        // Usage: backgrounds, borders, labels, body text, table rows
        neutral: {
          50:  '#F9FAFB', // page background (matches bg-gray-50 in dashboard)
          100: '#F3F4F6', // card alternate row, skeleton loaders
          200: '#E5E7EB', // dividers, input borders (default)
          300: '#D1D5DB', // disabled input borders
          400: '#9CA3AF', // placeholder text, disabled icons
          500: '#6B7280', // helper text, secondary labels
          600: '#4B5563', // body text (matches text-gray-600 in dashboard)
          700: '#374151', // strong body text
          800: '#1F2937', // secondary headings
          900: '#111827', // primary headings (matches text-gray-900 in dashboard)
          950: '#030712', // near-black for dark mode surfaces
        },

        // Success — Green
        // Usage: received status badge, success toasts, positive metrics
        success: {
          50:  '#F0FDF4', // success message background
          100: '#DCFCE7', // badge background (received)
          200: '#BBF7D0', // badge border (received)
          300: '#86EFAC', // icon fill
          400: '#4ADE80', // progress complete
          500: '#22C55E', // success icon
          600: '#16A34A', // DEFAULT — badge text, success button (matches text-green-600 in dashboard)
          700: '#15803D', // hover state
          800: '#166534', // dark success text
          900: '#14532D', // very dark success text
        },

        // Warning — Yellow/Amber
        // Usage: pending status badge, warning toasts, overdue approaching
        warning: {
          50:  '#FEFCE8', // warning message background
          100: '#FEF9C3', // badge background (pending)
          200: '#FEF08A', // badge border (pending)
          300: '#FDE047', // icon fill
          400: '#FACC15', // progress indicator
          500: '#EAB308', // warning icon
          600: '#CA8A04', // DEFAULT — badge text, warning labels (matches text-yellow-600 in dashboard)
          700: '#A16207', // hover state
          800: '#854D0E', // dark warning text
          900: '#713F12', // very dark warning text
        },

        // Error/Danger — Red
        // Usage: overdue status badge, error messages, delete buttons, form errors
        danger: {
          50:  '#FFF1F2', // error message background, form error background
          100: '#FFE4E6', // badge background (overdue)
          200: '#FECDD3', // badge border, input error border tint
          300: '#FDA4AF', // icon fill
          400: '#FB7185', // form error icon
          500: '#F43F5E', // error icon
          600: '#DC2626', // DEFAULT — error text, delete buttons (matches bg-red-600 in dashboard)
          700: '#B91C1C', // hover state on delete buttons
          800: '#991B1B', // pressed state
          900: '#7F1D1D', // very dark error text
        },

        // Brand surface colors for white card components
        surface: {
          DEFAULT: '#FFFFFF', // card background (matches bg-white in dashboard)
          raised: '#FFFFFF',  // elevated modals
          overlay: 'rgba(0, 0, 0, 0.5)', // modal backdrop
        },
      },

      // ─────────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────────
      fontFamily: {
        // System font stack — fallback if Geist is not loaded
        sans: [
          'var(--font-geist-sans)',
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          'var(--font-geist-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },

      fontSize: {
        // Responsive typography scale — each tuple is [size, { lineHeight, letterSpacing }]
        // Page headings
        'heading-xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }], // text-3xl — main page h1
        'heading-lg': ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.015em', fontWeight: '700' }], // text-2xl — section headings
        'heading-md': ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em',  fontWeight: '600' }], // text-xl — card headings
        'heading-sm': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em', fontWeight: '600' }], // text-lg — sub-headings

        // Body text
        'body-lg': ['1rem',     { lineHeight: '1.75rem', letterSpacing: '0' }], // text-base — primary body
        'body-md': ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '0' }], // 15px — comfortable reading
        'body-sm': ['0.875rem', { lineHeight: '1.5rem',  letterSpacing: '0' }], // text-sm — secondary content

        // UI labels and captions
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em', fontWeight: '600' }], // stat card labels
        'label-sm': ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.05em',  fontWeight: '600' }], // status badges, captions
        'caption':  ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.01em' }],                     // helper text, timestamps
      },

      // ─────────────────────────────────────────────
      // SPACING — 4px grid
      // ─────────────────────────────────────────────
      // Tailwind's default scale is already 4px-based (1 unit = 4px).
      // We extend with semantic names used consistently across components.
      spacing: {
        // Touch target minimums (WCAG 2.5.5 AAA recommends 44px; AA minimum 24px)
        'touch-sm': '2.75rem', // 44px — minimum touch target height
        'touch-md': '3rem',    // 48px — comfortable touch target (buttons)
        'touch-lg': '3.5rem',  // 56px — large touch target (primary CTAs on mobile)

        // Component-specific sizing
        'sidebar-width': '16rem',  // 256px — left sidebar on lg+ screens
        'sidebar-collapsed': '4rem', // 64px — collapsed sidebar icon width
        'header-height': '4rem',   // 64px — top header bar
        'modal-padding': '1.5rem', // 24px — modal interior padding
        'card-padding': '1.5rem',  // 24px — card padding (matches Phase 1 p-6)
        'card-padding-sm': '1rem', // 16px — compact card padding on mobile
        'badge-px': '0.625rem',    // 10px — horizontal badge padding
        'badge-py': '0.125rem',    // 2px — vertical badge padding
      },

      // ─────────────────────────────────────────────
      // BORDER RADIUS
      // ─────────────────────────────────────────────
      borderRadius: {
        'subtle':   '2px',   // nearly square — table rows, dividers
        'standard': '6px',   // DEFAULT for inputs, badges, small cards
        'card':     '8px',   // cards, dropdowns
        'modal':    '12px',  // modals, larger panels
        'pill':     '9999px', // full pill — status badges
      },

      // ─────────────────────────────────────────────
      // BOX SHADOWS
      // ─────────────────────────────────────────────
      boxShadow: {
        // Light — cards at rest, subtle depth
        'light':  '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        // Medium — cards on hover, dropdowns
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        // Dark — modals, popovers, elevated panels
        'dark':   '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        // Focus ring — keyboard navigation and active inputs
        'focus':  '0 0 0 3px rgba(79, 70, 229, 0.45)',    // 3px indigo focus ring
        'focus-danger': '0 0 0 3px rgba(220, 38, 38, 0.4)', // error field focus
        // Inner shadow for pressed buttons
        'inner-sm': 'inset 0 1px 2px rgba(0, 0, 0, 0.08)',
      },

      // ─────────────────────────────────────────────
      // BREAKPOINTS
      // ─────────────────────────────────────────────
      screens: {
        // Override defaults to match the project breakpoint contract
        'sm':  '640px',   // Small — two-column begins, stacked nav unlocks
        'md':  '768px',   // Tablet — sidebars appear, two-column layouts
        'lg':  '1024px',  // Desktop — three-column layouts, detail panels
        'xl':  '1280px',  // Wide — max-w-6xl content area cap
        '2xl': '1536px',  // Ultra-wide — not typically targeted
      },

      // ─────────────────────────────────────────────
      // MAX WIDTHS — align with content area caps
      // ─────────────────────────────────────────────
      maxWidth: {
        'content': '72rem',  // 1152px — max-w-6xl equivalent (matches Phase 1)
        'modal-sm': '24rem',  // 384px — small confirmation dialogs
        'modal-md': '36rem',  // 576px — standard forms (add client, add request)
        'modal-lg': '48rem',  // 768px — large modals (details panels on mobile)
        'portal':   '32rem',  // 512px — portal upload card (max-w-lg)
      },

      // ─────────────────────────────────────────────
      // TRANSITIONS
      // ─────────────────────────────────────────────
      transitionDuration: {
        '150': '150ms', // micro-interactions (badge color swap)
        '200': '200ms', // button hover, input focus
        '300': '300ms', // modal open/close, panel slide
        '400': '400ms', // page transitions (optional)
      },

      transitionTimingFunction: {
        'ease-out-quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in-out-quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // slight overshoot for modals
      },

      // ─────────────────────────────────────────────
      // Z-INDEX SCALE
      // ─────────────────────────────────────────────
      zIndex: {
        'sidebar':  '40',  // persistent sidebar
        'header':   '50',  // top navigation header
        'dropdown': '60',  // dropdowns and popovers
        'overlay':  '70',  // modal backdrop
        'modal':    '80',  // modal panel itself
        'toast':    '90',  // toast notifications
        'tooltip':  '100', // tooltips (highest)
      },

      // ─────────────────────────────────────────────
      // ANIMATION — reduced motion safe
      // ─────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'slide-in-from-top': {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'progress-indeterminate': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },

      animation: {
        'fade-in':             'fade-in 200ms ease-out both',
        'slide-in-from-right': 'slide-in-from-right 300ms ease-out-quad both',
        'slide-in-from-top':   'slide-in-from-top 200ms ease-out-quad both',
        'scale-in':            'scale-in 200ms spring both',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
    },
  },

  plugins: [],
}

export default config
