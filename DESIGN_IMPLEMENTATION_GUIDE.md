# Accountant Hub UI — Design Implementation Guide

**Document Date:** June 23, 2026
**Design Source:** `/ui/Accountant Hub UI.dc.html` (516 lines)
**Current Stack:** Next.js 14+, React, TypeScript, Tailwind CSS
**Tailwind Config:** `/tailwind.config.ts` (already extended with design tokens)

---

## Executive Summary

The design file (`Accountant Hub UI.dc.html`) presents a **warm, editorial visual direction** with three distinct dashboard layouts, comprehensive form components, a client-facing portal, and automated reminder emails. The current Tailwind configuration has **generic indigo/gray tokens** that need to be **completely replaced** with the new brand palette—specifically:

1. **Primary emerald accent** (#0F7A63, #10A37F) replacing indigo
2. **Warm paper canvas backgrounds** (#F7F4EE, #EDEAE2, #E4DFD4)
3. **Serif typography** (Instrument Serif) for headings, supporting the editorial tone
4. **Status colors** aligned with design (pending: amber, received: green, overdue: coral/red)
5. **Three dashboard layout options** (sidebar, bento, command center)

### Key Findings

- **Design is more advanced** than current implementation
- **Color palette** is significantly different (emerald vs. indigo)
- **Typography** introduces serif headings and Geist Mono for data display
- **Component styles** are more refined (better spacing, shadows, border radii)
- **Multiple UI patterns** shown that aren't yet in the codebase

---

## 1. Complete Color Palette

### Primary Brand Colors

| Usage | Hex | RGB | Current | Update? |
|-------|-----|-----|---------|---------|
| Primary CTA, checked states, accent | #0F7A63 | 15, 122, 99 | - | **NEW** |
| Brighter emerald (hover/secondary) | #10A37F | 16, 163, 127 | - | **NEW** |
| Dark emerald (pressed/darken) | #0B5C4A | 11, 92, 74 | - | **NEW** |
| Darkest emerald (brand text) | #06281F | 6, 40, 31 | - | **NEW** |

### Background & Surface Colors

| Usage | Hex | Current Tailwind | Notes |
|-------|-----|------------------|-------|
| **Primary page background** | #F7F4EE | `bg-gray-50` | Warm paper cream (main dashboard) |
| **Secondary background** | #EDEAE2 | `bg-gray-100` | Slightly darker paper (portal, emails) |
| **Tertiary background** | #E4DFD4 | `bg-gray-100` | Darkest warm (landing page) |
| White (cards, inputs) | #FFFFFF | `bg-white` | Unchanged |
| Dark mode base | #121417 | `bg-gray-900` | Ink-dark (command center) |
| Dark overlay | #1A1D21 | `bg-gray-800` | Darker slate-gray |

### Status Colors

| Status | Hex (Bg) | Hex (Text) | Hex (Border) | Current | Design Intent |
|--------|----------|-----------|--------------|---------|-----------------|
| **Pending** | #FBF1D4 | #B5830E | #F0E0AE | Yellow-100 | Warm amber for "wait" |
| **Received** | #E2F1EA | #16734F | #C4E3D5 | Green-100 | Fresh green (darker green) |
| **Overdue** | #F7E2DC | #C0492F | #EEC8BB | Red-100 | Warm coral-red (not harsh) |
| **In Progress** | #E8F3EE | #0F7A63 | #CFE6DB | Green-100 | Emerald tint |

### Neutral/Text Colors

| Usage | Hex | Current Tailwind | Notes |
|-------|-----|------------------|-------|
| Primary text | #17191C | `text-gray-900` | Very dark ink |
| Secondary text | #5C5F66 | `text-gray-600` | Medium gray |
| Tertiary text | #7A7468 | `text-gray-500` | Warm taupe-gray |
| Quaternary (helper) | #9C968A | `text-gray-400` | Light taupe |
| Disabled/muted | #C9C2B4 | `text-gray-300` | Very light warm |
| Border (default) | #D8D1C2 | `border-gray-200` | Light warm border |
| Border (subtle) | #E7E1D5 | `border-gray-100` | Very subtle |
| Dark mode text | #F7F4EE | `text-gray-50` | Warm white |

### Accent/Semantic Colors (Secondary)

| Usage | Hex | Purpose |
|-------|-----|---------|
| Warning accent | #E6A23C | Data highlight (pending requests) |
| Error highlight | #E5705B | Overdue emphasis |
| Success text | #16734F | Completion, success messages |

---

## 2. Typography System

### Font Families

```typescript
// Current config uses 'Geist' fallback
// Design requires:
fontFamily: {
  serif: ["'Instrument Serif'", 'serif'],  // NEW: Headlines only
  sans: ['var(--font-geist-sans)', '...'], // Keep: Body & UI
  mono: ['var(--font-geist-mono)', '...'], // Keep: Data display
}
```

**Instrument Serif** must be loaded in layout (Google Fonts or Vercel Fonts).

### Font Sizes & Styles

#### Headings (All use Instrument Serif, weight: 400)

| Class | Size | Line Height | Letter Spacing | Usage |
|-------|------|------------|----------------|-------|
| `h1-display` | 62px | 1.0 | -0.015em | Marketing hero (landing) |
| `h1` | 58px | 1.0 | -0.01em | Page hero (dashboard top) |
| `h2` | 34px | 1.4 | -0.01em | Section headers |
| `h3` | 30px | 1.4 | -0.005em | Subsection headers |
| `h4` | 26px | 1.4 | 0 | Card/modal titles |

#### Body Text (Geist Sans)

| Class | Size | Line Height | Weight | Usage |
|-------|------|-----------|--------|-------|
| `body-lg` | 17px | 1.6 | 400 | Primary body copy |
| `body-md` | 15px | 1.5 | 400 | Comfortable reading (cards) |
| `body-sm` | 14px | 1.5 | 400 | Secondary content |
| `label` | 13px | 1.25 | 600 | Form labels, captions |
| `caption` | 12px | 1.0 | 400 | Helper text, timestamps |
| `tiny` | 11px | 1.0 | 600 | Status badges, metadata |

#### Data Display (Geist Mono)

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `mono-lg` | 24px | 600 | Stats cards (112, 69) |
| `mono-md` | 22px | 600 | Smaller stats |
| `mono-sm` | 13px | 500 | Request counts (3/5) |

### Typography in Tailwind Config

**Update `tailwind.config.ts` fontSize section:**

```typescript
fontSize: {
  // Page headings (Instrument Serif)
  'h1-display': ['3.875rem', { lineHeight: '1.0', letterSpacing: '-0.015em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 62px
  'h1': ['3.625rem', { lineHeight: '1.0', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 58px
  'h2': ['2.125rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 34px
  'h3': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 30px
  'h4': ['1.625rem', { lineHeight: '1.4', fontFamily: 'var(--font-serif)', fontWeight: '400' }], // 26px

  // Body text
  'body-lg': ['1.0625rem', { lineHeight: '1.6' }], // 17px
  'body-md': ['0.9375rem', { lineHeight: '1.5' }], // 15px
  'body-sm': ['0.875rem', { lineHeight: '1.5' }], // 14px
  'label': ['0.8125rem', { lineHeight: '1.25', fontWeight: '600' }], // 13px
  'caption': ['0.75rem', { lineHeight: '1.0' }], // 12px
  'tiny': ['0.6875rem', { lineHeight: '1.0', fontWeight: '600' }], // 11px

  // Data display (Geist Mono)
  'mono-lg': ['1.5rem', { lineHeight: '1.0', fontWeight: '600', fontFamily: 'var(--font-mono)' }], // 24px
  'mono-md': ['1.375rem', { lineHeight: '1.0', fontWeight: '600', fontFamily: 'var(--font-mono)' }], // 22px
  'mono-sm': ['0.8125rem', { lineHeight: '1.0', fontWeight: '500', fontFamily: 'var(--font-mono)' }], // 13px
}
```

---

## 3. Component Styles Reference

### Buttons

All buttons use `border-radius: 9px` unless otherwise noted.

#### Primary Button (Emerald CTA)
- **Background:** #0F7A63
- **Text:** White
- **Padding:** 10px 16px (small) to 14px 26px (large)
- **Font:** 13px–15px, weight 600
- **Border:** None
- **Hover:** #0B5C4A (darker emerald)
- **Focus ring:** 0 0 0 3px rgba(15, 122, 99, 0.12)

#### Secondary Button (White outline)
- **Background:** White
- **Text:** #17191C (text-ink)
- **Border:** 1px #D8D1C2
- **Padding:** 10px 16px
- **Hover:** #FAF8F2 (very light warm)
- **Focus ring:** Same emerald

#### Ghost Button (Text-only emerald)
- **Background:** Transparent
- **Text:** #0F7A63
- **Border:** None
- **Hover:** Underline or slight highlight

#### Disabled State
- **Opacity:** 0.5
- **Cursor:** not-allowed

### Form Inputs

All inputs use `border-radius: 9px`.

#### Text/Email/Password Inputs
- **Background:** #FFFFFF
- **Border:** 1px #D8D1C2 (default)
- **Border:** 1.5px #0F7A63 + focus ring when focused
- **Focus ring:** 0 0 0 3px rgba(15, 122, 99, 0.12)
- **Padding:** 12px–13px horizontal, 11px–13px vertical
- **Font:** 14px–14.5px
- **Text color:** #17191C
- **Placeholder:** #9C968A
- **Error state:**
  - Border: 1px #C0492F
  - Background tint: #F7E2DC
  - Ring: 0 0 0 3px rgba(192, 73, 47, 0.12)

#### Disabled Input
- **Background:** #FAF8F2
- **Text color:** #C9C2B4
- **Cursor:** not-allowed
- **Border:** 1px #D8D1C2

### Checkboxes & Radios

#### Checked State
- **Background:** #0F7A63
- **Icon:** White checkmark
- **Size:** 20px × 20px typical
- **Border-radius:** 50% (radios) or 6px (checkboxes)

#### Unchecked State
- **Background:** White
- **Border:** 1.5px #C9C2B4
- **Cursor:** pointer

### Status Badges

All badges use `border-radius: 999px` (pill shape).

#### Pending
- **Background:** #FBF1D4
- **Text:** #B5830E
- **Border:** 1px #F0E0AE
- **Font:** 11px, weight 600, uppercase

#### Received
- **Background:** #E2F1EA
- **Text:** #16734F (or #0F7A63)
- **Border:** 1px #C4E3D5
- **Font:** 11px, weight 600, uppercase

#### Overdue
- **Background:** #F7E2DC
- **Text:** #C0492F
- **Border:** 1px #EEC8BB
- **Font:** 11px, weight 600, uppercase

#### Data Badge (Non-status)
- **Background:** #FEFAEE
- **Text:** #B5830E
- **Border:** 1px #F0E0AE
- **Font:** 11px, weight 600, uppercase

### Cards & Containers

#### Standard Card (White)
- **Background:** #FFFFFF
- **Border:** 1px #E7E1D5
- **Border-radius:** 14px (table headers use 14px, inline items use 10–11px)
- **Padding:** 18–24px
- **Box-shadow:** 0 1px 3px rgba(0, 0, 0, 0.1)

#### Dark Card (Dashboard C - ink mode)
- **Background:** #1A1D21
- **Border:** 1px #2A2D32
- **Border-radius:** 14px–16px
- **Padding:** 18px
- **Text:** #F7F4EE

#### Stat Card (Bento grid)
- **Background:** White or themed (#17191C, #F7E2DC, etc.)
- **Border:** 1px solid (matching theme color or #E7E1D5)
- **Border-radius:** 18px
- **Padding:** 20px
- **Title:** Tiny uppercase text (#9C968A or theme-adjusted)
- **Value:** Large mono font, appropriate color

### Progress Bars

- **Track:** #EFEAE0 (light warm)
- **Fill:** #0F7A63 (emerald)
- **Height:** 6px
- **Border-radius:** 999px

### Modals & Overlays

#### Modal Container
- **Background:** #F7F4EE (warm paper)
- **Border-radius:** 16px
- **Box-shadow:** 0 24px 60px -16px rgba(0, 0, 0, 0.4)
- **Padding:** 24px–28px
- **Max-width:** 560px (for standard forms)

#### Modal Overlay
- **Background:** rgba(23, 25, 28, 0.42)
- **Backdrop-filter:** Optional blur

#### Modal Header
- **Border-bottom:** 1px #E7E1D5
- **Padding-bottom:** 24px

### Data Table

#### Header Row
- **Background:** #FAF8F2
- **Border-bottom:** 1px #EFEAE0
- **Font:** 11px, uppercase, letter-spacing: 0.06em
- **Color:** #9C968A
- **Padding:** 13px 22px

#### Data Row
- **Background:** #FFFFFF (alternating rows possible)
- **Border-bottom:** 1px #F2EEE5
- **Padding:** 14px 22px
- **Grid columns:** Design shows flexible 2.2fr 1.4fr 1fr 0.8fr 0.5fr (5 columns)

### Dividers & Separators

- **Color:** #E7E1D5 (default), #D8D1C2 (subtle), #E0EDE7 (in emerald contexts)
- **Height:** 1px, sometimes 1.5px
- **Use:** Separate sections, row boundaries

---

## 4. Layout Patterns

### Spacing & Gaps

| Purpose | Value (px) |
|---------|-----------|
| Page padding (top/bottom) | 32px |
| Page padding (left/right) | 36px |
| Card internal padding | 18px–24px |
| Gap between elements | 16px–24px |
| Form field gap | 18px |
| List item gap | 14px–16px |
| Group gap (buttons, pills) | 8px–10px |

### Border Radius Scale

| Use Case | Value |
|----------|-------|
| Pill/badge | 999px |
| Rounded corners (cards, modals) | 14px–18px |
| Button corner | 9px |
| Input corner | 9px |
| Small container | 8px–10px |
| Subtle | 6px–7px |
| Nearly square | 2px–4px |

### Box Shadows

| Context | Shadow |
|---------|--------|
| Cards at rest | 0 1px 3px rgba(0, 0, 0, 0.1) |
| Modals | 0 24px 60px -16px rgba(0, 0, 0, 0.4) |
| Light elevation | 0 1px 3px rgba(0, 0, 0, 0.08) |
| Focus ring | 0 0 0 3px rgba(15, 122, 99, 0.12) |

### Grid Layouts

#### Bento Dashboard (Dashboard B)
- **Grid:** `grid-template-columns: repeat(4, 1fr)`
- **Gap:** 18px
- **Hero card:** `grid-column: span 2; grid-row: span 2`
- **Stat cards:** `span 1`
- **List row:** `grid-column: span 4`
- **Auto rows:** 148px (for consistent card height)

#### Clients Table
- **Grid:** 5-column layout: `2.2fr 1.4fr 1fr 0.8fr 0.5fr`
- **Gap:** 16px
- **Alignment:** center (rows)

#### Stat Grid (Dashboard C)
- **Grid:** `grid-template-columns: repeat(4, 1fr)`
- **Gap:** 16px

### Responsive Breakpoints

Current Tailwind breakpoints (maintain):
- **sm:** 640px (stacked mobile nav)
- **md:** 768px (sidebars appear)
- **lg:** 1024px (three-column layouts)
- **xl:** 1280px (max content width)

---

## 5. Page Layouts Shown in Design

### A. Landing Page (Marketing)
- **Background:** #E4DFD4
- **Navbar:** White header, emerald button (+ New request)
- **Hero:** Large serif H1, subheading, emerald CTA + secondary "See how it works"
- **Features:** Three stat cards (5 hrs saved, 94%, 2 min)
- **Document request card:** Showing status badge, checklist preview
- **Social proof:** Client testimonials (serif names)

### B. Dashboard — Sidebar Workspace (Option A)
- **Layout:** Vertical sidebar on left, main content right
- **Sidebar width:** 256px (standard)
- **Topbar:** White, 18px padding, emerald accent buttons
- **Main content:** Large serif H2 page header, content below
- **Components:** Standard cards, tables, lists

### C. Dashboard — Bento Grid + Top Nav (Option B)
- **Layout:** Top navigation bar (white), main content below
- **Bento grid:** 4-column grid with hero card spanning 2×2
- **Hero card:** Dark background (#17191C), white text, donut progress chart
- **Stat cards:** Various themed backgrounds (white, colored, dark)
- **Alert/action row:** Highlighted cards showing urgent items
- **List row:** Full-width "Needs your attention" section

### D. Dashboard — Ink Command Center (Option C)
- **Background:** Dark ink (#121417)
- **Sidebar:** Icon-only left navigation (#0C0E10), 72px wide
- **Main:** Dark (#1A1D21 cards), emerald text accents, white text
- **Header:** Serif H2, search + CTA button
- **Stats:** 4-column grid with dark cards + one emerald highlight
- **Feed:** List of requests with status dots and inline metadata

### E. Clients Management Page
- **Header:** "Clients" (serif H2) + subtitle "42 active · 3 archived"
- **Actions:** "Import CSV" + "Add Client" (primary CTA)
- **Search/filter:** White input + dropdown
- **Table:** 5-column grid with alternating row backgrounds
- **Columns:** Client name (with avatar), email, open requests, last activity, menu

### F. Requests List + Modal
- **Background:** #F7F4EE
- **Header:** "Requests" (serif H2)
- **Filters:** Pill-shaped filter tags (All, Pending, Received, Overdue)
- **List:** Card-based rows showing request title, client, status badge
- **Modal:** "New document request" overlay with:
  - Client dropdown
  - Request title (focused input with ring)
  - Due date + Template dropdowns (side-by-side)
  - Checklist items (tags with delete)
  - Footer: email confirmation + Cancel/Create buttons

### G. Request Detail Page
- **Layout:** 2-column: Checklist (left ~1.6fr) + Sidebar (right 1fr)
- **Checklist:** Card showing progress bar, item rows with checkmarks, files
- **Sidebar:**
  - Share link card (copyable, preview button)
  - Activity timeline (dots, timestamps)
- **Top:** Back link, request title + badge, client info, action buttons

### H. Client Portal (No Login)
- **Background:** #EDEAE2 (darker warm paper)
- **Container:** White card with shadow, 28px–30px padding
- **Header:** Logo, request info, deadline warning banner (amber)
- **Checklist:** Completed items (checked, emerald), pending items (unchecked)
- **Dropzone:** Dashed border (#B7CFC6), emerald icon, text prompt
- **Security note:** Small gray text

### I. Reminder Emails
- **Email 1 (7 days before):** Friendly tone, emerald CTA button
  - Background: #EDEAE2
  - Email container: White card, emerald top bar (5px)
  - Body text: #3A3D42, serif heading, sans body
  - CTA: Emerald button

- **Email 2 (3 days before):** Concrete nudge
  - Top bar: Amber (#E6A23C) instead of emerald
  - Lists items in amber background box

- **Email 3 (Deadline/overdue):** Calm, not scolding
  - Top bar: Coral (#C0492F)

---

## 6. Current vs. Required Components

### Existing Components (in `/components/ui/`)

| Component | Current | Design Status | Action |
|-----------|---------|----------------|--------|
| **Button** | Yes (generic indigo) | Needs update | Replace color tokens, update border-radius to 9px |
| **Input** | Yes | Needs update | Update focus ring color, padding, borders to match design |
| **StatusBadge** | Yes | Needs major update | New pill-shaped badges with updated colors (amber/green/coral) |
| **FormField** | Yes | Needs update | Update label styling, helper text colors |
| **Modal** | Yes | Needs update | Update background (#F7F4EE), shadows, padding, serif titles |
| **Select** | Yes | Needs update | Update border/focus ring/dropdown styling |
| **FileUploadArea** | Yes | Needs update | Match dashed border style, emerald icon, text colors |
| **DataTable** | Yes | Needs refactor | Add grid-based rows, update header/body styling |
| **LoadingSpinner** | Yes | Unchanged | ✓ OK |
| **Navbar** | Yes | Needs update | Update to match design (logo + nav items + CTA) |
| **Sidebar** | Yes | Needs refactor | Needs three variants (sidebar, top-nav, icon-only dark) |

### Missing Components (Need to Create)

| Component | Used In | Priority |
|-----------|---------|----------|
| **BentoGrid** | Dashboard B | High |
| **StatCard** | Dashboard B, C | High |
| **ProgressRing** (donut chart) | Dashboard B hero card | High |
| **DocumentChecklist** | Request detail, portal | High |
| **ShareLinkCard** | Request detail sidebar | High |
| **ActivityTimeline** | Request detail sidebar | Medium |
| **EmptyState** | Various pages | Medium |
| **ConfirmDialog** | Modals (delete, etc.) | Medium |
| **Toast** / **Alert** | Feedback (errors, success) | Medium |
| **Dropdown** / **Menu** | Inline actions, filters | Medium |
| **Avatar** (initials) | Clients list, topbar | Low |
| **ProgressBar** | Request checklist | Low |

---

## 7. Color Token Migration Plan

### Tailwind Config Changes Required

**Replace existing color definitions in `tailwind.config.ts`:**

```typescript
colors: {
  // PRIMARY — Emerald (replaces indigo)
  emerald: {
    50:  '#F0FDF4',  // Keep for light tints
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
    // BRAND: #0F7A63, #10A37F, #0B5C4A, #06281F
    brand: {
      darkest: '#06281F',   // Darkest emerald
      dark:    '#0B5C4A',   // Dark emerald (pressed)
      DEFAULT: '#0F7A63',   // Primary emerald (buttons, accents)
      bright:  '#10A37F',   // Bright emerald (hover, secondary)
      light:   '#B7CFC6',   // Light tint for inputs
      lighter: '#CFE6DB',   // Lighter tint
      surface: '#E2F1EA',   // Very light for badge bg
    },
  },

  // NEUTRAL — Warm Grays (replace cool grays)
  neutral: {
    50:  '#FAF8F2',  // Very light warm (card rows)
    100: '#F7F4EE',  // Primary page background
    150: '#EDEAE2',  // Secondary background
    200: '#E4DFD4',  // Tertiary background
    300: '#E7E1D5',  // Border (default)
    400: '#D8D1C2',  // Border (subtle)
    500: '#C9C2B4',  // Disabled/muted
    600: '#9C968A',  // Helper text
    700: '#7A7468',  // Tertiary text
    800: '#5C5F66',  // Secondary text
    900: '#17191C',  // Primary text (ink)
    950: '#0C0E10',  // Dark ink
    // Dark mode
    dark: {
      50:  '#F7F4EE',  // Light (dark mode text)
      900: '#1A1D21',  // Cards (dark)
      950: '#121417',  // Surface (dark)
    },
  },

  // STATUS — Pending (Amber/Yellow)
  status: {
    pending: {
      bg:     '#FBF1D4',
      text:   '#B5830E',
      border: '#F0E0AE',
    },
    received: {
      bg:     '#E2F1EA',
      text:   '#16734F',
      border: '#C4E3D5',
    },
    overdue: {
      bg:     '#F7E2DC',
      text:   '#C0492F',
      border: '#EEC8BB',
    },
    warning: {
      bg:     '#FEFAEE',
      text:   '#B5830E',
      border: '#F0E0AE',
    },
  },

  // Keep red/danger, but adjust
  danger: {
    50:  '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#DC2626',  // ERROR text
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Surface
  surface: {
    DEFAULT: '#FFFFFF',
    raised:  '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
}
```

### CSS Variables for Fonts

**Add to `app/layout.tsx` or create `/styles/fonts.css`:**

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

:root {
  --font-serif: 'Instrument Serif', serif;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

---

## 8. Implementation Roadmap

### Phase 1: Design Tokens & Typography (Week 1)

1. **Update `tailwind.config.ts`**
   - Replace color palette with emerald + warm neutrals
   - Add Instrument Serif font sizes
   - Add new spacing/shadow values

2. **Load Instrument Serif font**
   - Add to `app/layout.tsx` via Google Fonts or Vercel

3. **Create design token helper** (optional)
   - `/styles/tokens.ts` — export color constants for JS usage

4. **Update global styles**
   - Reset link colors to emerald
   - Update focus ring defaults

### Phase 2: Base Components (Week 2)

1. **Update existing UI components:**
   - `Button.tsx` — Replace indigo with emerald, adjust border-radius
   - `Input.tsx` — Update focus ring, borders, padding
   - `StatusBadge.tsx` — Redesign with pill shape, new colors
   - `Modal.tsx` — Update background, shadows, padding

2. **Create missing base components:**
   - `ProgressBar.tsx` — Track + fill styling
   - `ProgressRing.tsx` — Donut chart for stats
   - `Avatar.tsx` — Initials in circle

### Phase 3: Layout Components (Week 3)

1. **Create dashboard layout variants:**
   - `SidebarLayout.tsx` — Left sidebar version
   - `TopNavLayout.tsx` — Top nav version
   - `CommandLayout.tsx` — Dark ink mode

2. **Create content components:**
   - `StatCard.tsx` — Themed stat display
   - `BentoGrid.tsx` — 4-column grid system
   - `DataTable.tsx` — Refactor to grid-based rows
   - `DocumentChecklist.tsx` — Checklist with progress

3. **Create page-specific components:**
   - `ShareLinkCard.tsx` — Request detail sidebar
   - `ActivityTimeline.tsx` — Activity feed
   - `RequestListItem.tsx` — Refactored list item

### Phase 4: Page Implementations (Week 4)

1. **Update existing pages:**
   - `app/dashboard/page.tsx` — Switch to new dashboard variant
   - `app/dashboard/clients/page.tsx` — Update table styling
   - `app/dashboard/requests/page.tsx` — Update list + modal

2. **Create new pages/components:**
   - Request detail page improvements
   - Portal page styling
   - Email templates (for preview)

### Phase 5: Dark Mode & Refinement (Week 5)

1. **Test dark mode variants**
   - Command center (dark ink) mode
   - Adjust contrast ratios

2. **Polish & accessibility**
   - Verify focus states
   - Test keyboard navigation
   - Check WCAG AA compliance

3. **Documentation**
   - Update component storybook/docs
   - Create design system reference

---

## 9. Specific Component Updates

### Button Component Update

```typescript
// OLD: 'bg-indigo-600 hover:bg-indigo-700'
// NEW: 'bg-emerald-600 hover:bg-emerald-700' (using #0F7A63, #0B5C4A)

const variantClasses: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white border-transparent hover:bg-emerald-dark active:bg-emerald-darker focus-visible:ring-emerald-brand',
  secondary: 'bg-white text-neutral-900 border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100',
  danger: 'bg-red-600 text-white border-transparent hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-emerald-brand border-emerald-light hover:bg-emerald-50',
};

// Border radius: Change from 'rounded-standard' (6px) to 'rounded-[9px]'
// Padding: Adjust for better touch targets
const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs min-h-[2rem]',
  md: 'px-4 py-2.5 text-sm min-h-[2.75rem]', // Keep
  lg: 'px-6 py-3 text-base min-h-[3rem]',
};
```

### StatusBadge Component Update

```typescript
// NEW: Pill shape (border-radius: 999px)

const statusClasses: Record<RequestStatus, string> = {
  pending: 'bg-status-pending-bg text-status-pending-text border-status-pending-border',
  received: 'bg-status-received-bg text-status-received-text border-status-received-border',
  overdue: 'bg-status-overdue-bg text-status-overdue-text border-status-overdue-border',
  cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full',
  md: 'text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full',
};
```

### Input Component Update

```typescript
// Focus ring: #0F7A63 (emerald brand)
// Disabled background: #FAF8F2 (very light warm)

className={[
  'w-full px-3 py-2.5 text-sm text-neutral-900',
  'bg-white border rounded-[9px] placeholder:text-neutral-600',
  'transition-colors duration-200',
  'focus:outline-none focus:border-emerald-brand focus:ring-2 focus:ring-emerald-brand/30',
  'disabled:bg-neutral-50 disabled:text-neutral-600 disabled:cursor-not-allowed',
  error
    ? 'border-red-600 bg-status-overdue-bg/20 focus:border-red-600 focus:ring-red-600/30'
    : 'border-neutral-400',
  className,
].join(' ')}
```

---

## 10. Design System Reference

### Color Usage Quick Reference

| Component | Background | Text | Border | Hover/Focus |
|-----------|-----------|------|--------|-------------|
| Primary Button | #0F7A63 | White | None | #0B5C4A |
| Secondary Button | White | #17191C | #D8D1C2 | #FAF8F2 |
| Input (normal) | White | #17191C | #D8D1C2 | #0F7A63 (ring) |
| Input (error) | #F7E2DC | #17191C | #C0492F | #C0492F (ring) |
| Status Badge (pending) | #FBF1D4 | #B5830E | #F0E0AE | — |
| Status Badge (received) | #E2F1EA | #16734F | #C4E3D5 | — |
| Status Badge (overdue) | #F7E2DC | #C0492F | #EEC8BB | — |
| Card | White | #17191C | #E7E1D5 | — |
| Dark Card | #1A1D21 | #F7F4EE | #2A2D32 | — |
| Page Background | #F7F4EE | — | — | — |

### Typography Quick Reference

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| H1 (page) | Instrument Serif | 58px | 400 | #17191C |
| H2 (section) | Instrument Serif | 34px | 400 | #17191C |
| H3 (card title) | Instrument Serif | 26px | 400 | #17191C |
| Body (primary) | Geist Sans | 17px | 400 | #3A3D42 |
| Body (secondary) | Geist Sans | 15px | 400 | #5C5F66 |
| Label | Geist Sans | 13px | 600 | #3A3D42 |
| Helper text | Geist Sans | 12px | 400 | #9C968A |
| Status badge | Geist Sans | 11px | 600 | (status color) |
| Data display | Geist Mono | 22–24px | 600 | #17191C |

---

## 11. Testing Checklist

### Visual Testing
- [ ] Buttons appear in emerald, correct border-radius (9px)
- [ ] Input focus rings are emerald
- [ ] Status badges are pill-shaped with correct colors
- [ ] Page backgrounds are warm paper (#F7F4EE)
- [ ] Serif headings load correctly (Instrument Serif)
- [ ] Dark mode (command center) uses #121417 background

### Functional Testing
- [ ] Button hover/pressed states work
- [ ] Input validation shows error state correctly
- [ ] Modal focuses properly, can be dismissed
- [ ] Keyboard navigation works (tab, enter, escape)
- [ ] Focus rings visible (WCAG AAA)

### Responsive Testing
- [ ] Mobile: Stacked layout, buttons full-width
- [ ] Tablet: Two-column, sidebars appear
- [ ] Desktop: Three-column, full layout

### Accessibility Testing
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Focus indicators visible
- [ ] Icons have aria-labels
- [ ] Form inputs have associated labels
- [ ] Status badges have role="status"

---

## 12. File Locations & References

### Key Files to Update
- `/tailwind.config.ts` — Colors, typography, spacing
- `/components/ui/Button.tsx` — Emerald, border-radius
- `/components/ui/Input.tsx` — Focus ring, padding
- `/components/ui/StatusBadge.tsx` — Pill shape, colors
- `/components/ui/Modal.tsx` — Background, padding, serif titles
- `/app/layout.tsx` — Add Instrument Serif font
- `/styles/tokens.ts` — Optional: design token constants

### Files to Create
- `/components/ui/StatCard.tsx` — Stat display component
- `/components/ui/ProgressBar.tsx` — Progress indicator
- `/components/ui/ProgressRing.tsx` — Donut chart
- `/components/ui/Avatar.tsx` — Initials avatar
- `/components/ui/BentoGrid.tsx` — Grid layout
- `/components/ui/DocumentChecklist.tsx` — Checklist component
- `/components/ui/ShareLinkCard.tsx` — Request share card
- `/components/ui/ActivityTimeline.tsx` — Activity feed
- `/components/layouts/DashboardLayout.tsx` — Layout wrapper
- `/components/layouts/SidebarLayout.tsx` — Sidebar variant
- `/components/layouts/CommandLayout.tsx` — Dark mode variant

### Design File
- `/ui/Accountant Hub UI.dc.html` — Source design (516 lines)

---

## 13. Summary of Changes by Priority

### Critical (Must Have)
1. Replace indigo with emerald (#0F7A63)
2. Replace cool grays with warm neutrals (#F7F4EE, etc.)
3. Add Instrument Serif for headings
4. Update StatusBadge colors (pending/received/overdue)
5. Update focus ring colors (emerald)
6. Update button border-radius to 9px
7. Update input padding/borders

### High (Should Have)
1. Create StatCard component
2. Create BentoGrid layout
3. Create DocumentChecklist component
4. Update Modal styling
5. Create three dashboard layout variants
6. Add ProgressBar component

### Medium (Nice to Have)
1. Dark mode (command center)
2. Activity timeline
3. Share link card
4. Empty states
5. Toast/alert components

### Low (Future)
1. Email template previews
2. Advanced animations
3. Responsive refinements
4. Dark mode dark mode variant

---

## Conclusion

The design file represents a **significant visual upgrade** from the current indigo/gray system to a **warmer, more editorial aesthetic** with emerald accents and serif typography. The primary changes are:

1. **Color system:** Emerald + warm paper instead of indigo + cool gray
2. **Typography:** Instrument Serif for impact, Geist for body/data
3. **Components:** Refined with better spacing, shadows, and border radii
4. **Layouts:** Three dashboard options for different user preferences
5. **Polish:** Consistent use of status colors, progress indicators, and empty states

Following this guide, the migration can be completed in **4–5 weeks** with proper component updates and testing. Start with Phase 1 (tokens) to unlock quick wins, then build out components in phases 2–3.

