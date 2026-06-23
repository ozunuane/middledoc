# Responsive Design Specifications — Accountant Hub Phase 2

**Authored by:** UI/UX Designer Agent
**Date:** 2026-06-23
**Status:** Binding contract for Frontend Specialist (Wave 2)

Design philosophy: **mobile-first**. All base styles target the smallest viewport. Breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`) progressively enhance the layout.

---

## Breakpoint Reference

| Name    | Min Width | Tailwind Prefix | Primary Use                            |
|---------|-----------|-----------------|----------------------------------------|
| Mobile  | (default) | (none)          | Single column, stacked, touch-friendly |
| Small   | `640px`   | `sm:`           | Tablet portrait, 2-column grids begin  |
| Medium  | `768px`   | `md:`           | Sidebar navigation unlocks             |
| Large   | `1024px`  | `lg:`           | Full multi-column, detail panels       |
| XLarge  | `1280px`  | `xl:`           | Content area cap at `max-w-content`    |
| 2XLarge | `1536px`  | `2xl:`          | Not actively targeted in Phase 2       |

---

## 1. Mobile (Default / < 640px)

Target devices: iPhone SE (375px), iPhone 14 (390px), Android average (360-412px).

### Navigation

```
MOBILE HEADER (h-16 fixed top-0)
┌───────────────────────────────────────┐
│ [≡]  Accountant Hub           [user] │
└───────────────────────────────────────┘

Sidebar: Hidden by default.
Accessed via hamburger (≡) button — opens a full-height drawer
that overlays the page.

Hamburger button:
  p-2 rounded-md text-gray-600
  min-w-[44px] min-h-[44px]  ← 44px touch target minimum
  (top-left corner of header)

Nav drawer (when open):
  fixed inset-y-0 left-0 z-sidebar
  w-72 bg-white shadow-dark
  flex flex-col
  transform transition-transform duration-300
  (translate-x-0 when open, -translate-x-full when closed)

Backdrop (when drawer open):
  fixed inset-0 z-overlay bg-black/50
  (tap backdrop to close)
```

### Page Layout

```
Body padding-top: pt-16 (clears fixed header)
Page content: px-4 py-4
No max-width constraint at this breakpoint
```

### Grid Behavior

```
Stats grid:     grid-cols-1           → single column
Quick actions:  flex-col w-full       → stacked, full-width buttons
Content areas:  single column always
Table:          overflow-x-auto with min-w-[640px] inner table
Form modals:    fixed inset-x-0 bottom-0 or full screen (inset-0)
```

### Touch Targets

All interactive elements must meet 44px minimum in both dimensions:

```
Buttons:       min-h-[44px] px-4 (at minimum 44px tap height)
Nav items:     py-3 (at min 48px with text and padding)
Table rows:    min-h-[52px] (comfortable tapping in lists)
Form inputs:   h-11 (44px, matches iOS default)
Icon buttons:  w-11 h-11 (44px × 44px minimum)
Close (×):     p-2.5 w-11 h-11
Upload zone:   min-h-[160px] (large drag-and-drop area)
Checkbox/Radio:w-5 h-5 with p-3 wrapper → 44px total
```

### Typography Adjustments

```
Page h1:       text-2xl (24px) instead of text-3xl on desktop
Card values:   text-3xl font-bold (reduced from text-4xl)
Table text:    text-sm (14px) — unchanged
Helper text:   text-xs (12px) — unchanged
Badge text:    text-xs font-semibold — unchanged
```

### Component Behavior on Mobile

**Modal:**
- Small/medium modals: slide up from bottom (`fixed bottom-0 left-0 right-0`)
- Rounded only at top: `rounded-t-modal`
- Max height: `max-h-[90vh]` with internal scroll
- Large modal: full screen (`fixed inset-0 rounded-none`)

**DataTable:**
- Wrap in `overflow-x-auto`
- Inner table: `min-w-[600px]`
- Sticky first column (Name): `sticky left-0 bg-white z-raised`
- Sticky last column (Actions): `sticky right-0 bg-white z-raised`

**Request Details Panel:**
- Becomes a bottom sheet on mobile (not side panel)
- Activated by tapping a table row
- Occupies ~80% of viewport height

**FileUpload zone:**
- `min-h-[160px]` for easy drag target
- "Tap to browse" as mobile copy (not "Drag files here")
- "Drag files here or tap to browse" when supporting both

**Status Filter Tabs:**
- Horizontally scrollable: `overflow-x-auto flex gap-2 pb-1 -mx-4 px-4`
- No line wrap
- Tabs do not collapse into a dropdown on mobile (scroll instead)

---

## 2. Small (640px — 767px)

Target devices: Large phones in landscape, small tablets.

### Changes from Mobile

```
Navigation:     Still uses hamburger + drawer (sidebar not shown yet)
Cards grid:     grid-cols-1 → grid-cols-2 (sm:grid-cols-2)
                Stats cards: still single column OR 2-col if 3 cards → 3-col at md
Buttons:        Can reduce to min-h-[40px] (still accessible)
Modals:         Center in viewport (no longer bottom sheet)
                rounded-modal on all sides
Portal card:    max-w-lg centered, rounded-modal (not full-bleed)
Form fields:    Can arrange in 2-column grid for non-required short fields
                e.g. Phone + Company side by side: grid grid-cols-2 gap-4
```

---

## 3. Medium (768px — 1023px)

Target devices: iPad portrait, larger Android tablets.

### Layout Changes

```
Sidebar:        APPEARS — fixed left column (w-64)
                Main content: ml-64 to clear sidebar space
                Mobile header + hamburger: HIDDEN
Header:         Optional slim header within main content area (not fixed)
Page padding:   px-6 py-6

Stats grid:     sm:grid-cols-2 → md:grid-cols-3
                All three stat cards in one row

Quick Actions:  flex-row (side by side)
Table:          No horizontal scroll needed — full columns visible
Form modals:    Centered, max-w-modal-md (576px)
```

### Sidebar Details

```
Sidebar (md+):
  fixed inset-y-0 left-0 w-64
  bg-white border-r border-gray-200
  flex flex-col
  z-sidebar

Main content (md+):
  ml-64 flex-1 min-h-screen
```

---

## 4. Large (1024px — 1279px)

Target devices: Laptop 13", Desktop 1024px–1280px.

### Layout Changes

```
Requests page:  Two-column layout unlocks
                Left: requests table (flex-1 min-w-0)
                Right: details panel (w-80 flex-shrink-0 hidden lg:block)

Navigation:     Sidebar can show labels + icons (no icon-only mode needed)

Dashboard:      Consider optional 2-column layout:
                Left (60%): stats + recent activity
                Right (40%): deadlines widget (optional)
```

### Two-Column Pattern (Requests Page)

```
<div class="flex gap-6 items-start">
  <div class="flex-1 min-w-0">
    <!-- RequestsTable -->
  </div>
  <div class="w-80 flex-shrink-0 sticky top-6 hidden lg:block">
    <!-- RequestDetails panel -->
  </div>
</div>
```

---

## 5. XLarge (1280px+)

Target devices: Desktop 1280px+, external monitors.

### Layout Changes

```
Content area:   max-w-content (1152px / max-w-6xl) centered with mx-auto
                Matches Phase 1 dashboard max-w-6xl mx-auto pattern
                Prevents excessively wide lines on ultrawide screens

Sidebar:        Same as lg — no change

Table columns:  Can show additional columns if needed
                (e.g. "Last Updated" on clients table)
```

---

## Responsive Grid Recipes

### Stats Cards Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6">
  <!-- 3 stat cards -->
</div>
```

### Quick Actions Row

```html
<div class="flex flex-col sm:flex-row gap-3 mt-6">
  <button class="btn-primary w-full sm:w-auto min-h-[44px]">Add Client</button>
  <button class="btn-secondary w-full sm:w-auto min-h-[44px]">New Request</button>
</div>
```

### Page Header (Title + CTA)

```html
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
  <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Clients</h1>
  <button class="btn-primary w-full sm:w-auto min-h-[44px]">Add Client</button>
</div>
```

### Form Field Row (Two Columns at sm+)

```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <FormField label="Phone" name="phone" type="tel" />
  <FormField label="Company" name="company" />
</div>
```

### Table Container

```html
<div class="w-full overflow-x-auto rounded-lg shadow-light">
  <table class="w-full min-w-[600px] divide-y divide-gray-200">
    ...
  </table>
</div>
```

---

## Testing Matrix

Each page must be verified at these specific viewport widths:

| Width  | Device Simulation         | Must Pass                                   |
|--------|---------------------------|---------------------------------------------|
| 375px  | iPhone SE / small Android | No horizontal scroll, all content accessible|
| 390px  | iPhone 14 Pro             | Touch targets ≥ 44px                        |
| 640px  | Small tablet / landscape  | 2-col grids appear if applicable             |
| 768px  | iPad portrait             | Sidebar visible, hamburger hidden            |
| 1024px | Small laptop              | Detail panels visible (requests page)        |
| 1280px | Standard desktop          | max-w-content centering active               |
| 1440px | Large desktop             | Content does not stretch beyond cap          |

---

## No-Horizontal-Scroll Rule

Every page must be free of horizontal scroll at 375px. Enforcement:

1. Never use fixed pixel widths on layout containers wider than the viewport.
2. Use `overflow-x-auto` on DataTable containers (not on `<body>`).
3. Avoid padding/margin that pushes content past the viewport edge. Use `px-4` (16px each side) as the minimum mobile padding.
4. Long text content: use `truncate`, `break-words`, or `overflow-wrap: anywhere` as appropriate.
5. Images/media: always `max-w-full h-auto`.

---

## Dark Mode Responsive Notes

Dark mode is toggled by adding `class="dark"` to `<html>`. All dark mode variants (`dark:`) are active at all breakpoints — dark mode does not change layout, only colors. No responsive dark mode overrides are needed.
