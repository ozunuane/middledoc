import type { Config } from 'tailwindcss'

/**
 * Accountant Hub — Tailwind CSS Design Token Extension
 *
 * Extends the default Tailwind configuration with the project's
 * brand palette, typography scale, spacing grid, border radii,
 * box shadows, and breakpoints.
 *
 * Design: Warm, editorial visual direction
 * Primary brand color: Emerald (#0F7A63)
 * Backgrounds: Warm paper (#F7F4EE, #EDEAE2, #E4DFD4)
 * Typography: Instrument Serif (headings), Geist (body), Geist Mono (data)
 * Neutral: Warm taupe grays
 * Status: Amber (pending), Green (received), Coral-red (overdue)
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
        // Primary — Emerald (Ledgerly brand)
        primary: {
          50:  '#F4F8F6', // completed checklist bg (design spec)
          100: '#E0EDE7', // completed checklist border (design spec)
          200: '#B7CFC6', // dropzone dashed border (design spec)
          300: '#A0CCBA', // medium-light
          400: '#17937F', // medium
          500: '#10A37F', // logo dot accent (design spec — NOT same as 600)
          600: '#0F7A63', // buttons, progress fills, active states
          700: '#0B5C4A', // button hover
          800: '#064936', // pressed states
          900: '#06281F', // dark mode text
          950: '#030F0A', // dark mode bg
        },

        // Neutral — Warm Taupe-Grays
        neutral: {
          50:  '#F7F4EE', // page background (warm paper)
          100: '#EDEAE2', // secondary background
          150: '#EFEAE0', // progress bar track (design spec)
          200: '#E7E1D5', // card/nav borders (design spec — primary border)
          250: '#E0D9CB', // dividers, stat separators (design spec)
          300: '#D8D1C2', // input borders
          350: '#C9C2B4', // unchecked circle borders (design spec)
          400: '#9C968A', // placeholder text, muted labels
          500: '#7A7468', // secondary labels
          600: '#5C5F66', // body text
          700: '#3A3D42', // strong body text
          800: '#1F2937', // secondary headings
          900: '#17191C', // primary headings (dark ink)
          950: '#0A0B0D', // near-black
        },

        // Design-specific surface colors
        paper: {
          DEFAULT: '#F7F4EE', // primary page bg
          warm:    '#EDEAE2', // secondary bg
          table:   '#FAF8F2', // table header bg (design spec)
          url:     '#F4F2EB', // URL box bg (design spec)
          pending: '#FEFCF6', // pending row bg (design spec)
          rowline: '#F2EEE5', // table row divider (design spec)
        },

        // Success — Green (Received status)
        // Usage: received status badge, success toasts, positive metrics
        success: {
          50:  '#E2F1EA', // badge background (received) — DESIGN SPEC
          100: '#C4E3D5', // badge border (received) — DESIGN SPEC
          200: '#A8D5C2', // lighter fill
          300: '#8CC7AF', // medium fill
          400: '#4AAE90', // medium-strong
          500: '#1E9570', // strong
          600: '#16734F', // DEFAULT — badge text (received) — DESIGN SPEC
          700: '#0F5C43', // hover state
          800: '#0A4434', // dark
          900: '#063329', // very dark
        },

        // Warning — Amber (Pending status)
        warning: {
          50:  '#FEFAEE', // very light background
          100: '#FBF1D4', // badge background (pending)
          200: '#F0E0AE', // badge border (pending)
          300: '#E5D08F', // light fill
          400: '#E6A23C', // outstanding stat color (design spec)
          500: '#C9A24A', // unchecked circle in email
          600: '#B5830E', // badge text (pending)
          700: '#8A6608', // portal status text (design spec)
          800: '#704E06', // dark
          900: '#4A3303', // very dark
        },

        // Danger — Warm Coral-Red (Overdue status)
        danger: {
          50:  '#FDF6F3', // attention card bg (design spec)
          100: '#F7E2DC', // badge background (overdue)
          200: '#EEC8BB', // badge border (overdue)
          300: '#E5AE9A', // light fill
          400: '#DB947A', // medium fill
          500: '#C97A5B', // strong
          600: '#C0492F', // DEFAULT — badge text (overdue) — DESIGN SPEC
          700: '#A83624', // hover state
          800: '#8A2A1B', // dark
          900: '#5F1C11', // very dark
        },

        // Brand surface colors for white card components
        surface: {
          DEFAULT: '#FFFFFF', // card background (white)
          raised: '#FFFFFF',  // elevated modals
          overlay: 'rgba(23, 25, 28, 0.42)', // modal backdrop (from design)
        },
      },

      // ─────────────────────────────────────────────
      // TYPOGRAPHY
      // ─────────────────────────────────────────────
      fontFamily: {
        // Instrument Serif — Editorial headings (NEW)
        serif: [
          'var(--font-serif)',
          '"Instrument Serif"',
          'Georgia',
          'serif',
        ],
        // Geist Sans — Body text and UI
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
        // Geist Mono — Data display and statistics
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
        // SERIF HEADINGS (Instrument Serif, weight 400)
        // Used for page titles, section headers — editorial tone
        'h1-display': ['3.875rem', { lineHeight: '1.0', letterSpacing: '-0.015em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 62px — marketing hero
        'h1': ['3.625rem', { lineHeight: '1.0', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 58px — page hero
        'h2': ['2.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 34px — section headers
        'h3': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 30px — subsection
        'h4': ['1.625rem', { lineHeight: '1.4', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 26px — card titles

        // BODY TEXT (Geist Sans, weight 400)
        'body-lg': ['1.0625rem', { lineHeight: '1.6', letterSpacing: '0' }], // 17px — primary body copy
        'body-md': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '0' }], // 15px — comfortable reading
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }], // 14px — secondary content

        // UI LABELS & CAPTIONS (Geist Sans, weight 600)
        'label': ['0.8125rem', { lineHeight: '1.25', letterSpacing: '0', fontWeight: '600' }], // 13px — form labels
        'caption': ['0.75rem', { lineHeight: '1.0', letterSpacing: '0.01em', fontWeight: '400' }], // 12px — helper text
        'tiny': ['0.6875rem', { lineHeight: '1.0', letterSpacing: '0', fontWeight: '600' }], // 11px — status badges

        // DATA DISPLAY (Geist Mono, weight 600)
        'mono-lg': ['1.5rem', { lineHeight: '1.0', fontFamily: 'var(--font-mono)', fontWeight: '600' }], // 24px — stats cards
        'mono-md': ['1.375rem', { lineHeight: '1.0', fontFamily: 'var(--font-mono)', fontWeight: '600' }], // 22px
        'mono-sm': ['0.8125rem', { lineHeight: '1.0', fontFamily: 'var(--font-mono)', fontWeight: '500' }], // 13px — badge counts

        // Keep legacy heading classes for backward compatibility
        'heading-xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em', fontWeight: '700' }],
        'heading-md': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em', fontWeight: '600' }],
        'label-lg': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em', fontWeight: '600' }],
        'label-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '600' }],
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
        'button':   '9px',   // buttons (design spec)
        'input':    '9px',   // input fields (design spec)
        'standard': '10px',  // small interactive elements
        'card':     '14px',  // cards, table containers (design spec)
        'modal':    '16px',  // modals, larger panels (design spec)
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
        // Deep shadow for hero cards (from design: 0 18px 40px -12px)
        'hero':   '0 18px 40px -12px rgba(23, 25, 28, 0.18)',
        // Focus ring — keyboard navigation and active inputs (emerald)
        'focus':  '0 0 0 3px rgba(15, 122, 99, 0.12)',    // 3px emerald focus ring
        'focus-danger': '0 0 0 3px rgba(192, 73, 47, 0.12)', // error field focus (coral-red)
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
        'slide-in': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
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
        'slide-in':            'slide-in 300ms ease-out-quad both',
        'scale-in':            'scale-in 200ms spring both',
        'progress-indeterminate': 'progress-indeterminate 1.5s ease-in-out infinite',
      },
    },
  },

  plugins: [],
}

export default config
