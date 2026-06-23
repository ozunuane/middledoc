/**
 * Accountant Hub — Design Tokens
 *
 * This file is the single source of truth for all design decisions.
 * It is consumed by:
 *   - tailwind.config.ts (Tailwind theme extension)
 *   - Component files (via className strings and inline styles where needed)
 *   - Documentation (COMPONENTS.md, LAYOUTS.md)
 *
 * All hex values are exact — copy them directly into any design tool.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Primary — Indigo
  primary: {
    50:  '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5', // DEFAULT — primary buttons, active nav
    700: '#4338CA', // button hover
    800: '#3730A3', // pressed
    900: '#312E81',
    950: '#1E1B4B',
  },

  // Neutral — Gray
  neutral: {
    50:  '#F9FAFB', // page background
    100: '#F3F4F6', // alternate table rows, skeletons
    200: '#E5E7EB', // dividers, default input borders
    300: '#D1D5DB', // disabled input borders
    400: '#9CA3AF', // placeholder text
    500: '#6B7280', // helper text
    600: '#4B5563', // body text
    700: '#374151', // strong body text
    800: '#1F2937', // secondary headings
    900: '#111827', // primary headings
    950: '#030712', // near-black
  },

  // Success — Green
  success: {
    50:  '#F0FDF4',
    100: '#DCFCE7', // badge background
    200: '#BBF7D0', // badge border
    600: '#16A34A', // DEFAULT — badge text, stat values
    700: '#15803D', // hover
    800: '#166534',
  },

  // Warning — Yellow/Amber
  warning: {
    50:  '#FEFCE8',
    100: '#FEF9C3', // badge background
    200: '#FEF08A', // badge border
    600: '#CA8A04', // DEFAULT — badge text, pending indicators
    700: '#A16207', // hover
    800: '#854D0E',
  },

  // Danger — Red
  danger: {
    50:  '#FFF1F2',
    100: '#FFE4E6', // badge background, error input tint
    200: '#FECDD3', // badge border
    600: '#DC2626', // DEFAULT — delete buttons, error text, overdue badge
    700: '#B91C1C', // hover
    800: '#991B1B',
  },

  // Surface
  surface: {
    white: '#FFFFFF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// SEMANTIC COLOR MAP
// Maps UI intent to palette values. Reference this in component specs.
// ─────────────────────────────────────────────────────────────────────────────

export const semantic = {
  // Page structure
  pageBg:          colors.neutral[50],   // #F9FAFB
  cardBg:          colors.surface.white, // #FFFFFF
  headerBg:        colors.surface.white, // #FFFFFF
  sidebarBg:       colors.surface.white, // #FFFFFF
  borderDefault:   colors.neutral[200],  // #E5E7EB
  borderFocus:     colors.primary[600],  // #4F46E5

  // Text
  textHeading:     colors.neutral[900],  // #111827
  textBody:        colors.neutral[600],  // #4B5563
  textMuted:       colors.neutral[500],  // #6B7280
  textPlaceholder: colors.neutral[400],  // #9CA3AF
  textOnPrimary:   '#FFFFFF',
  textLink:        colors.primary[600],  // #4F46E5
  textLinkHover:   colors.primary[700],  // #4338CA

  // Interactive
  buttonPrimary:       colors.primary[600],  // #4F46E5
  buttonPrimaryHover:  colors.primary[700],  // #4338CA
  buttonDanger:        colors.danger[600],   // #DC2626
  buttonDangerHover:   colors.danger[700],   // #B91C1C
  buttonSecondaryBorder: colors.neutral[300], // #D1D5DB

  // Status badges
  statusPending: {
    bg:     colors.warning[100],  // #FEF9C3
    border: colors.warning[200],  // #FEF08A
    text:   colors.warning[600],  // #CA8A04
  },
  statusReceived: {
    bg:     colors.success[100],  // #DCFCE7
    border: colors.success[200],  // #BBF7D0
    text:   colors.success[600],  // #16A34A
  },
  statusOverdue: {
    bg:     colors.danger[100],   // #FFE4E6
    border: colors.danger[200],   // #FECDD3
    text:   colors.danger[600],   // #DC2626
  },
  statusComplete: {
    bg:     colors.neutral[100],  // #F3F4F6
    border: colors.neutral[200],  // #E5E7EB
    text:   colors.neutral[600],  // #4B5563
  },

  // Form states
  inputBorderDefault: colors.neutral[300],  // #D1D5DB
  inputBorderFocus:   colors.primary[600],  // #4F46E5
  inputBorderError:   colors.danger[600],   // #DC2626
  inputBgError:       colors.danger[50],    // #FFF1F2

  // File upload zone
  uploadIdleBorder:    colors.neutral[300],  // #D1D5DB — dashed
  uploadDragBorder:    colors.primary[600],  // #4F46E5
  uploadDragBg:        colors.primary[50],   // #EEF2FF

  // Focus ring
  focusRing:       `0 0 0 3px rgba(79, 70, 229, 0.45)`,
  focusRingDanger: `0 0 0 3px rgba(220, 38, 38, 0.40)`,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  // Fonts
  fontSans: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, sans-serif',
  fontMono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace',

  // Scale — [fontSize, lineHeight]
  scale: {
    'heading-xl': ['1.875rem', '2.25rem'],  // 30px/36px — page h1
    'heading-lg': ['1.5rem',   '2rem'],     // 24px/32px — section h2
    'heading-md': ['1.25rem',  '1.75rem'],  // 20px/28px — card title
    'heading-sm': ['1.125rem', '1.75rem'],  // 18px/28px — sub-heading
    'body-lg':    ['1rem',     '1.75rem'],  // 16px/28px — primary body
    'body-sm':    ['0.875rem', '1.5rem'],   // 14px/24px — secondary content
    'label':      ['0.875rem', '1.25rem'],  // 14px/20px — stat card labels (font-semibold)
    'caption':    ['0.75rem',  '1rem'],     // 12px/16px — badges, timestamps
  },

  // Tailwind class shorthands for each role (what the Frontend Specialist should use)
  roles: {
    pageHeading:    'text-3xl font-bold text-gray-900',                   // matches Phase 1 h1
    sectionHeading: 'text-2xl font-bold text-gray-900',
    cardHeading:    'text-xl font-semibold text-gray-900',
    subHeading:     'text-lg font-semibold text-gray-900',
    statLabel:      'text-sm font-semibold text-gray-500 uppercase tracking-wide', // matches Phase 1
    statValue:      'text-4xl font-bold',                                  // matches Phase 1
    bodyText:       'text-base text-gray-600',                             // matches Phase 1
    secondaryText:  'text-sm text-gray-500',
    helperText:     'text-sm text-gray-500',
    errorText:      'text-sm text-red-600 font-medium',
    badge:          'text-xs font-semibold uppercase tracking-wide',
    tableHeader:    'text-xs font-semibold text-gray-500 uppercase tracking-wider',
    tableCell:      'text-sm text-gray-900',
    tableCellMuted: 'text-sm text-gray-500',
    buttonLabel:    'text-sm font-semibold',
    navItem:        'text-sm font-medium',
    linkText:       'text-sm font-medium text-indigo-600 hover:text-indigo-700',
    placeholderText:'text-gray-400',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
// SPACING
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  // 4px base unit
  unit: 4,

  // Named semantic values (in px)
  touchTargetMin:  44,  // WCAG 2.5.5 — minimum accessible touch target
  touchTargetMd:   48,  // comfortable button height
  touchTargetLg:   56,  // primary CTA height on mobile

  sidebarWidth:    256, // 16rem
  headerHeight:    64,  // 4rem
  cardPadding:     24,  // 1.5rem — matches Phase 1 p-6
  modalPadding:    24,  // 1.5rem
  sectionGap:      32,  // 2rem — between page sections
  cardGap:         24,  // 1.5rem — between cards in grid
} as const

// ─────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS
// ─────────────────────────────────────────────────────────────────────────────

export const radii = {
  subtle:   '2px',     // table cells, tag outlines
  standard: '6px',     // inputs, buttons, small cards
  card:     '8px',     // stat cards, panels
  modal:    '12px',    // modals, drawers
  pill:     '9999px',  // status badges
} as const

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  light:  '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
  medium: '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
  dark:   '0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)',
  focus:  '0 0 0 3px rgba(79,70,229,0.45)',
  focusDanger: '0 0 0 3px rgba(220,38,38,0.40)',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// BREAKPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  640,   // px — small tablet, two-column starts
  md:  768,   // px — tablet, sidebar patterns begin
  lg:  1024,  // px — desktop, full layouts
  xl:  1280,  // px — wide desktop, max content width
  '2xl': 1536, // px — ultra-wide (not typically targeted)
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Z-INDEX SCALE
// ─────────────────────────────────────────────────────────────────────────────

export const zIndex = {
  base:     0,
  raised:   10,
  dropdown: 60,
  overlay:  70,
  modal:    80,
  toast:    90,
  tooltip:  100,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION DURATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const animation = {
  micro:    150, // ms — badge hover, icon swap
  fast:     200, // ms — button hover, input focus ring
  standard: 300, // ms — modal open/close, panel slide
  slow:     400, // ms — page transitions (optional)
} as const
