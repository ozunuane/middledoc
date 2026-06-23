# Accountant Hub Design — Code Examples & Migration Snippets

Quick-reference code snippets for implementing the design changes.

---

## 1. Tailwind Config Color Updates

### Add to `tailwind.config.ts` — Replace the colors section

```typescript
colors: {
  // ─────────────────────────────────────────────
  // PRIMARY BRAND — EMERALD (NEW)
  // ─────────────────────────────────────────────
  emerald: {
    // Standard Tailwind emerald (for tints, hovers)
    50:  '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBFEDC',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },

  // Brand-specific emerald (design-specified)
  'brand-emerald': {
    50:    '#F0FDF4', // Light tint
    100:   '#E8F3EE', // Badge light background
    200:   '#CFE6DB', // Input light tint
    300:   '#B7CFC6', // Lighter border
    400:   '#10A37F', // Bright emerald (hover)
    500:   '#0F7A63', // PRIMARY EMERALD (DEFAULT)
    600:   '#0B5C4A', // Dark (pressed)
    700:   '#0A3329', // Very dark
    800:   '#06281F', // Darkest (brand text)
    900:   '#052E16', // Near black
  },

  // ─────────────────────────────────────────────
  // NEUTRAL — WARM GRAYS (NEW)
  // ─────────────────────────────────────────────
  warm: {
    50:  '#FEFCF6', // Off-white
    100: '#FAF8F2', // Very light warm (card rows)
    150: '#F7F4EE', // Primary page background
    200: '#EDEAE2', // Secondary background (portal)
    250: '#E4DFD4', // Tertiary background
    300: '#E7E1D5', // Border default
    350: '#E0D9CB', // Lighter border
    400: '#D8D1C2', // Border subtle
    500: '#C9C2B4', // Disabled/muted
    600: '#9C968A', // Tertiary text (helper)
    700: '#7A7468', // Tertiary text (labels)
    800: '#5C5F66', // Secondary text
    900: '#17191C', // Primary text (ink)
    950: '#0C0E10', // Darkest (dark mode)
  },

  // ─────────────────────────────────────────────
  // STATUS COLORS (NEW)
  // ─────────────────────────────────────────────
  'status-pending': {
    DEFAULT: '#FBF1D4',
    text:    '#B5830E',
    border:  '#F0E0AE',
  },
  'status-received': {
    DEFAULT: '#E2F1EA',
    text:    '#16734F',
    border:  '#C4E3D5',
  },
  'status-overdue': {
    DEFAULT: '#F7E2DC',
    text:    '#C0492F',
    border:  '#EEC8BB',
  },
  'status-warning': {
    DEFAULT: '#FEFAEE',
    text:    '#B5830E',
    border:  '#F0E0AE',
  },

  // ─────────────────────────────────────────────
  // DANGER/ERROR (UPDATE)
  // ─────────────────────────────────────────────
  danger: {
    50:  '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#DC2626',  // Error text
    700: '#B91C1C',  // Hover
    800: '#991B1B',  // Pressed
    900: '#7F1D1D',
  },

  // ─────────────────────────────────────────────
  // SURFACE (KEEP)
  // ─────────────────────────────────────────────
  surface: {
    DEFAULT: '#FFFFFF',
    raised:  '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
}
```

### Add TextColor Overrides

```typescript
textColor: (theme) => ({
  ...theme('colors'),
  'ink': '#17191C',
  'ink-light': '#5C5F66',
  'ink-lighter': '#9C968A',
})
```

### Update Box Shadow

```typescript
boxShadow: {
  ...defaultTheme.boxShadow,
  'light':  '0 1px 3px rgba(0, 0, 0, 0.08)',
  'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
  'dark':   '0 10px 15px -3px rgba(0, 0, 0, 0.12)',
  'focus':  '0 0 0 3px rgba(15, 122, 99, 0.12)', // Emerald focus ring
  'focus-error': '0 0 0 3px rgba(220, 38, 38, 0.4)',
}
```

---

## 2. Font Configuration

### Update `app/layout.tsx`

```typescript
import { Instrument_Serif, Geist, Geist_Mono } from '@/app/fonts'

export const metadata: Metadata = {
  title: 'Accountant Hub',
  // ...
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${Instrument_Serif.variable} ${Geist.variable} ${Geist_Mono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
```

### Create `/app/fonts.ts`

```typescript
import { Instrument_Serif, Geist, Geist_Mono } from 'next/font/google'

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

export const geistSans = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
})

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})
```

### Update Tailwind fontFamily

```typescript
fontFamily: {
  serif: ['var(--font-serif)', 'Georgia', 'serif'],
  sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
}
```

### Add Typography Sizes to Tailwind Config

```typescript
fontSize: {
  // Headings (Instrument Serif)
  'h1-display': ['3.875rem', { lineHeight: '1.0', letterSpacing: '-0.015em', fontFamily: 'var(--font-serif)', fontWeight: '400' }],
  'h1': ['3.625rem', { lineHeight: '1.0', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }],
  'h2': ['2.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }],
  'h3': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontFamily: 'var(--font-serif)', fontWeight: '400' }],
  'h4': ['1.625rem', { lineHeight: '1.4', fontFamily: 'var(--font-serif)', fontWeight: '400' }],

  // Body text (Geist Sans)
  'body-lg': ['1.0625rem', { lineHeight: '1.6', letterSpacing: '0' }],
  'body-md': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '0' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }],

  // Labels & captions
  'label': ['0.8125rem', { lineHeight: '1.25', letterSpacing: '0.025em', fontWeight: '600' }],
  'caption': ['0.75rem', { lineHeight: '1', letterSpacing: '0.01em' }],
  'tiny': ['0.6875rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],

  // Data (Geist Mono)
  'mono-lg': ['1.5rem', { lineHeight: '1', letterSpacing: '0', fontFamily: 'var(--font-mono)', fontWeight: '600' }],
  'mono-md': ['1.375rem', { lineHeight: '1', fontFamily: 'var(--font-mono)', fontWeight: '600' }],
  'mono-sm': ['0.8125rem', { lineHeight: '1', fontFamily: 'var(--font-mono)', fontWeight: '500' }],

  // Keep existing Tailwind sizes
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  'text-2xl': ['1.5rem', { lineHeight: '2rem' }],
  'text-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  'text-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
}
```

---

## 3. Component Code Examples

### Button Component (Updated)

**File:** `/components/ui/Button.tsx`

```typescript
'use client'

import React from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: React.ReactNode
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'aria-label'?: string
}

const variantClasses: Record<Variant, string> = {
  // Primary: Emerald (#0F7A63)
  primary:
    'bg-brand-emerald-500 text-white border-transparent hover:bg-brand-emerald-600 active:bg-brand-emerald-700 focus-visible:ring-brand-emerald-400',
  // Secondary: White with warm border
  secondary:
    'bg-white text-ink border-warm-400 hover:bg-warm-150 active:bg-warm-200 focus-visible:ring-brand-emerald-400',
  // Danger: Red
  danger:
    'bg-danger-600 text-white border-transparent hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-600',
  // Ghost: Transparent emerald
  ghost:
    'bg-transparent text-brand-emerald-500 border-brand-emerald-200 hover:bg-brand-emerald-50 active:bg-brand-emerald-100 focus-visible:ring-brand-emerald-400',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold min-h-[2rem]',
  md: 'px-4 py-2.5 text-sm font-semibold min-h-[2.75rem]',
  lg: 'px-6 py-3 text-base font-semibold min-h-[3rem]',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-[9px] border',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="animate-spin h-4 w-4 flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
```

### StatusBadge Component (Updated)

**File:** `/components/ui/StatusBadge.tsx`

```typescript
'use client'

import React from 'react'
import type { DocumentRequest } from '@/types/index'

type RequestStatus = DocumentRequest['status']
type Size = 'sm' | 'md'

interface StatusBadgeProps {
  status: RequestStatus
  size?: Size
  showIcon?: boolean
  className?: string
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  received: 'Received',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

const statusClasses: Record<RequestStatus, string> = {
  // Pending: Amber
  pending:
    'bg-status-pending text-status-pending-text border border-status-pending-border',
  // Received: Green
  received:
    'bg-status-received text-status-received-text border border-status-received-border',
  // Overdue: Coral red
  overdue:
    'bg-status-overdue text-status-overdue-text border border-status-overdue-border',
  // Cancelled: Gray
  cancelled:
    'bg-warm-100 text-warm-700 border border-warm-300',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
  md: 'text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full',
}

const iconSize: Record<Size, string> = {
  sm: 'w-3 h-3 mr-1',
  md: 'w-3.5 h-3.5 mr-1.5',
}

function PendingIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReceivedIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function OverdueIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function CancelledIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

const StatusIcons: Record<RequestStatus, (props: { className: string }) => React.ReactElement> = {
  pending: PendingIcon,
  received: ReceivedIcon,
  overdue: OverdueIcon,
  cancelled: CancelledIcon,
}

export function StatusBadge({ status, size = 'sm', showIcon = true, className = '' }: StatusBadgeProps) {
  const Icon = StatusIcons[status]
  const label = STATUS_LABELS[status]

  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={[
        'inline-flex items-center hover:brightness-95 transition-all',
        statusClasses[status],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {showIcon && <Icon className={iconSize[size]} />}
      {label}
    </span>
  )
}
```

### Input Component (Updated)

**File:** `/components/ui/Input.tsx`

```typescript
'use client'

import React from 'react'

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'search'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: boolean
  disabled?: boolean
  id?: string
  name?: string
  required?: boolean
  autoComplete?: string
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  disabled = false,
  id,
  name,
  required,
  autoComplete,
  className = '',
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
}: InputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid ?? error}
      aria-required={ariaRequired ?? required}
      className={[
        'w-full px-3 py-2.5 text-sm text-ink',
        'bg-white border rounded-[9px] placeholder:text-warm-700',
        'transition-colors duration-200',
        // Emerald focus ring (#0F7A63)
        'focus:outline-none focus:border-brand-emerald-500 focus:ring-2 focus:ring-brand-emerald-500/30',
        'disabled:bg-warm-150 disabled:text-warm-600 disabled:cursor-not-allowed',
        'dark:bg-warm-950 dark:border-warm-800 dark:text-warm-150 dark:placeholder:text-warm-700',
        'dark:focus:border-brand-emerald-400 dark:focus:ring-brand-emerald-400/30',
        error
          ? 'border-danger-600 bg-status-overdue/20 focus:border-danger-600 focus:ring-danger-600/30 dark:border-danger-400 dark:bg-danger-900/20'
          : 'border-warm-400',
        className,
      ].join(' ')}
    />
  )
}
```

### StatCard Component (New)

**File:** `/components/ui/StatCard.tsx`

```typescript
'use client'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  variant?: 'default' | 'dark' | 'accent' | 'success'
  className?: string
}

const variantClasses = {
  default: 'bg-white border-warm-300 text-ink',
  dark: 'bg-warm-950 border-warm-700 text-warm-150',
  accent: 'bg-brand-emerald-500 border-brand-emerald-600 text-white',
  success: 'bg-status-received border-status-received-border text-status-received-text',
}

export function StatCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={[
        'border rounded-[18px] p-5 flex flex-col justify-between',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="text-tiny uppercase tracking-wider opacity-70">{label}</div>
        {icon && <div className="ml-auto">{icon}</div>}
      </div>
      <div className="text-mono-md mt-2">{value}</div>
    </div>
  )
}
```

### DocumentChecklist Component (New)

**File:** `/components/ui/DocumentChecklist.tsx`

```typescript
'use client'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  details?: string
}

interface DocumentChecklistProps {
  items: ChecklistItem[]
  title?: string
  showProgress?: boolean
}

export function DocumentChecklist({
  items,
  title = 'Documents',
  showProgress = true,
}: DocumentChecklistProps) {
  const completed = items.filter((i) => i.completed).length
  const total = items.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white border border-warm-300 rounded-[14px] overflow-hidden">
      <div className="p-[18px] border-b border-warm-250">
        <div className="flex justify-between items-center mb-2.5">
          <h3 className="text-body-md font-semibold text-ink">{title}</h3>
          {showProgress && <span className="font-mono text-sm text-ink-light">{completed} / {total} received</span>}
        </div>
        {showProgress && (
          <div className="h-1.5 bg-warm-250 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-emerald-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="divide-y divide-warm-250">
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              'flex items-start gap-3 p-[15px]',
              item.completed ? 'bg-white' : 'bg-warm-50',
            ].join(' ')}
          >
            <div
              className={[
                'w-5.5 h-5.5 rounded-full flex-shrink-0 flex items-center justify-center text-xs',
                item.completed
                  ? 'bg-brand-emerald-500 text-white'
                  : 'border-1.5 border-warm-500',
              ].join(' ')}
            >
              {item.completed && '✓'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-md text-ink font-medium">{item.title}</div>
              {item.details && (
                <div className="text-caption text-warm-600 mt-0.5">{item.details}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### ProgressBar Component (New)

**File:** `/components/ui/ProgressBar.tsx`

```typescript
'use client'

interface ProgressBarProps {
  value: number // 0–100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
}

export function ProgressBar({
  value,
  label,
  size = 'md',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100)

  return (
    <div className={className}>
      {showLabel && label && (
        <div className="flex justify-between mb-1">
          <span className="text-caption font-semibold text-ink">{label}</span>
          <span className="text-caption text-warm-600">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-warm-300 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className="h-full bg-brand-emerald-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 4. Migration Checklist

### Phase 1: Tokens (Day 1–2)
- [ ] Update `tailwind.config.ts` colors
- [ ] Add Instrument Serif font
- [ ] Update fontSize in Tailwind
- [ ] Test color palette (check design file vs. CSS)
- [ ] Update focus ring defaults

### Phase 2: Base Components (Day 3–5)
- [ ] Update `Button.tsx` — emerald, border-radius 9px
- [ ] Update `Input.tsx` — focus ring, borders
- [ ] Update `StatusBadge.tsx` — pill shape, new colors
- [ ] Update `Modal.tsx` — background, shadows
- [ ] Create `ProgressBar.tsx`
- [ ] Create `StatCard.tsx`
- [ ] Test in Storybook (if available)

### Phase 3: Layout Components (Day 6–10)
- [ ] Create `DocumentChecklist.tsx`
- [ ] Create `Avatar.tsx` (initials)
- [ ] Create `BentoGrid.tsx`
- [ ] Update `DataTable.tsx`
- [ ] Refactor `Sidebar.tsx`
- [ ] Create layout variants

### Phase 4: Pages (Day 11–15)
- [ ] Update dashboard page
- [ ] Update clients page
- [ ] Update requests page
- [ ] Add request detail page components

### Phase 5: Testing & Polish (Day 16–20)
- [ ] Visual regression testing
- [ ] Accessibility audit
- [ ] Mobile responsiveness
- [ ] Dark mode (command center)
- [ ] Documentation

---

## 5. CSS Custom Properties

### Optional: Create `/styles/design.css`

```css
:root {
  /* Brand colors */
  --color-emerald-primary: #0F7A63;
  --color-emerald-dark: #0B5C4A;
  --color-emerald-bright: #10A37F;
  --color-emerald-darkest: #06281F;

  /* Neutral warm grays */
  --color-warm-light: #F7F4EE;
  --color-warm-medium: #EDEAE2;
  --color-warm-dark: #E4DFD4;
  --color-ink: #17191C;

  /* Status colors */
  --color-status-pending-bg: #FBF1D4;
  --color-status-pending-text: #B5830E;
  --color-status-received-bg: #E2F1EA;
  --color-status-received-text: #16734F;
  --color-status-overdue-bg: #F7E2DC;
  --color-status-overdue-text: #C0492F;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 9px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.12);
}

/* Focus ring utility */
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 3px rgba(15, 122, 99, 0.12);
}
```

---

## 6. Quick Reference: Class Names

### Status Badge Classes

```typescript
// Pending
'bg-status-pending text-status-pending-text border border-status-pending-border'

// Received
'bg-status-received text-status-received-text border border-status-received-border'

// Overdue
'bg-status-overdue text-status-overdue-text border border-status-overdue-border'
```

### Button Classes

```typescript
// Primary (Emerald)
'bg-brand-emerald-500 hover:bg-brand-emerald-600 active:bg-brand-emerald-700 text-white'

// Secondary (White)
'bg-white hover:bg-warm-150 text-ink border border-warm-400'

// Danger (Red)
'bg-danger-600 hover:bg-danger-700 text-white'
```

### Typography Classes

```typescript
// Headings
'font-serif text-h1' // 58px, weight 400
'font-serif text-h2' // 34px, weight 400
'font-serif text-h3' // 26px, weight 400

// Body
'text-body-lg' // 17px
'text-body-md' // 15px
'text-body-sm' // 14px

// Data
'font-mono text-mono-lg' // 24px
'font-mono text-mono-md' // 22px
```

### Common Container Classes

```typescript
// Page background
'bg-warm-150' // #F7F4EE

// Card
'bg-white border border-warm-300 rounded-[14px] shadow-light'

// Dark card
'bg-warm-950 border border-warm-700 rounded-[14px] text-warm-150'

// Input
'bg-white border border-warm-400 rounded-[9px] px-3 py-2.5'
```

---

## Troubleshooting

### Issue: Colors aren't updating
**Solution:** Clear Next.js cache:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: Instrument Serif not loading
**Solution:** Check font import in `app/layout.tsx` and verify CSS variables are set.

### Issue: Focus ring not showing
**Solution:** Ensure Tailwind is processing focus states:
```typescript
// In tailwind.config.ts
theme: {
  extend: {
    // ... colors, etc
  }
}
```

---

## Resources

- Design File: `/ui/Accountant Hub UI.dc.html`
- Main Guide: `/DESIGN_IMPLEMENTATION_GUIDE.md`
- Tailwind Docs: https://tailwindcss.com
- Font: https://fonts.google.com/specimen/Instrument+Serif

