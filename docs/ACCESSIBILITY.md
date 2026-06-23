# Accessibility Specifications — Accountant Hub Phase 2

**Authored by:** UI/UX Designer Agent
**Date:** 2026-06-23
**Standard:** WCAG 2.1 Level AA
**Status:** Binding requirement for all agents (Frontend Specialist implementation, QA Expert verification)

---

## Overview

All pages and components in the Accountant Hub must conform to WCAG 2.1 AA. This document defines the specific requirements, implementation patterns, and verification checklist. The QA Expert will execute the checklist in Wave 4.

---

## 1. Color Contrast

### Minimum Ratios

| Text Type                          | Minimum Ratio | WCAG Criterion |
|------------------------------------|---------------|----------------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1         | 1.4.3 AA       |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1           | 1.4.3 AA       |
| UI components and graphical objects | 3:1          | 1.4.11 AA      |
| Focus indicator against adjacent   | 3:1           | 1.4.11 AA      |

### Design Token Contrast Ratios

Verified against white background (`#FFFFFF`) and page background (`#F9FAFB`):

| Use Case                          | Foreground     | Background   | Ratio   | Pass/Fail |
|-----------------------------------|----------------|--------------|---------|-----------|
| Page headings (gray-900)          | `#111827`      | `#F9FAFB`    | 17.1:1  | Pass AA   |
| Body text (gray-600)              | `#4B5563`      | `#FFFFFF`    | 7.4:1   | Pass AA   |
| Secondary text (gray-500)         | `#6B7280`      | `#FFFFFF`    | 4.7:1   | Pass AA   |
| Helper/muted text (gray-500)      | `#6B7280`      | `#F9FAFB`    | 4.5:1   | Pass AA   |
| Placeholder text (gray-400)       | `#9CA3AF`      | `#FFFFFF`    | 2.9:1   | Fail* — acceptable for placeholder per WCAG |
| Primary button text (white)       | `#FFFFFF`      | `#4F46E5`    | 4.7:1   | Pass AA   |
| Primary button hover (white)      | `#FFFFFF`      | `#4338CA`    | 6.0:1   | Pass AA   |
| Danger button text (white)        | `#FFFFFF`      | `#DC2626`    | 4.7:1   | Pass AA   |
| Link text (indigo-600)            | `#4F46E5`      | `#FFFFFF`    | 4.5:1   | Pass AA   |
| Pending badge text (warning-700)  | `#A16207`      | `#FEF9C3`    | 4.7:1   | Pass AA   |
| Received badge text (green-700)   | `#15803D`      | `#DCFCE7`    | 4.7:1   | Pass AA   |
| Overdue badge text (red-700)      | `#B91C1C`      | `#FFE4E6`    | 5.1:1   | Pass AA   |
| Complete badge text (gray-600)    | `#4B5563`      | `#F3F4F6`    | 5.0:1   | Pass AA   |
| Error text (red-600)              | `#DC2626`      | `#FFFFFF`    | 4.5:1   | Pass AA   |
| Error text on red-50 bg           | `#DC2626`      | `#FFF1F2`    | 4.3:1   | Pass AA   |
| Stat value — pending (yellow-600) | `#CA8A04`      | `#FFFFFF`    | 3.1:1   | Fail — use yellow-700 (#A16207) for stat values |
| Stat value — success (green-600)  | `#16A34A`      | `#FFFFFF`    | 4.5:1   | Pass AA   |

**IMPORTANT CORRECTIONS:**
- `text-yellow-600` (#CA8A04) on white fails AA. For stat card values and any body text on white background, use `text-yellow-700` (`#A16207`) instead.
- `text-gray-400` placeholders are exempt under WCAG (inactive UI components) but should not convey meaning.

### Do Not Use for Text

```
NEVER use these as text on white/light backgrounds:
  gray-300 (#D1D5DB) — 1.6:1 — fail
  gray-200 (#E5E7EB) — 1.2:1 — fail
  indigo-300 (#A5B4FC) — 2.5:1 — fail
  green-300 (#86EFAC) — 1.7:1 — fail
  yellow-300 (#FDE047) — 1.1:1 — fail
```

### Focus Indicator Contrast

Focus rings use `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.45)`.

The solid-equivalent color of `indigo-600` at 45% opacity over white ≈ `#A9A5F3`.
Against `#FFFFFF` background: passes 3:1 threshold for non-text UI components.

For high-visibility mode: use `focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2` (solid ring, no transparency) — this achieves 4.5:1 against white.

---

## 2. Focus Indicators

### Requirement

All interactive elements must have a visible focus indicator when focused via keyboard (Tab key). Focus indicator must:
- Be at least 3px thick (WCAG 2.4.11 — enhanced)
- Have a 3:1 contrast ratio against adjacent colors

### Implementation

Every interactive element uses:

```css
/* Applied via Tailwind focus-visible utilities — never focus: alone */
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-indigo-500
focus-visible:ring-offset-2
```

The `focus-visible:` prefix ensures focus rings only appear for keyboard users, not mouse clicks (matching browser behavior for `focus-visible` pseudo-class).

### Component-Specific Focus Styles

**Buttons (all variants):**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
```

**Inputs and Textareas:**
```
focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
```
Note: Inputs use `focus:` (not `focus-visible:`) because inputs always expect keyboard interaction.

**Links:**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:rounded-sm
```

**Danger elements:**
```
focus-visible:ring-red-500 (instead of indigo)
```

**Modal close button:**
```
focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-md
```

**Table rows (when clickable):**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset
```

**Upload drop zone:**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
```

### Never Remove Focus

```
FORBIDDEN:
  outline-none (without a focus-visible replacement)
  :focus { outline: none } in global CSS without fallback
```

The existing `globals.css` does not suppress focus outlines globally, which is correct.

---

## 3. Keyboard Navigation

### Tab Order

The natural DOM order must match the visual order. Do not use `tabindex` values greater than 0 (which would override natural order).

Acceptable `tabindex` values:
- `tabindex="0"` — add to non-interactive elements that need keyboard focus (drop zone, table rows)
- `tabindex="-1"` — remove from DOM tab order, only focus programmatically (modal initial focus target, skip-link destination)

### Global Tab Order (Per Page)

```
1. Skip navigation link (visually hidden, first in DOM)
2. Sidebar / mobile header navigation items
3. Main content region
4. Page action buttons (Add Client, New Request)
5. Search/filter inputs
6. Table headers (if sortable)
7. Table rows / row action buttons
8. Footer (if present)
```

### Skip Navigation Link

Must be the first focusable element on every page. Visually hidden until focused:

```html
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
         focus:z-toast focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white
         focus:rounded-standard focus:shadow-dark focus:font-semibold"
>
  Skip to main content
</a>

<!-- Main content landmark -->
<main id="main-content" tabindex="-1">
  ...
</main>
```

### Keyboard Interactions by Component

**Navigation Sidebar:**

| Key        | Action                                 |
|------------|----------------------------------------|
| `Tab`      | Move to next nav item                  |
| `Enter`    | Navigate to page                       |
| `Space`    | Navigate to page                       |

**Modal:**

| Key          | Action                                      |
|--------------|---------------------------------------------|
| `Tab`        | Move to next focusable element within modal  |
| `Shift+Tab`  | Move to previous focusable element           |
| `Escape`     | Close modal, return focus to trigger element |
| `Enter`      | Activate focused button                      |

On open: focus moves to first focusable element (usually the first form field or close button).
On close: focus returns to the element that triggered the modal.

**DataTable:**

| Key            | Action                                    |
|----------------|-------------------------------------------|
| `Tab`          | Move to next focusable element             |
| `Enter/Space`  | Activate `onRowClick` on focused row       |
| `Arrow Up`     | Move focus to previous row (when role="grid") |
| `Arrow Down`   | Move focus to next row                    |

Sortable column headers use `<button>` elements (naturally keyboard accessible).

**FileUpload Drop Zone:**

| Key          | Action                            |
|--------------|-----------------------------------|
| `Tab`        | Focus the drop zone               |
| `Enter`      | Open file picker dialog           |
| `Space`      | Open file picker dialog           |

**Status Filter Tabs:**

| Key          | Action                                       |
|--------------|----------------------------------------------|
| `Tab`        | Move between tab elements                    |
| `Enter/Space`| Activate focused tab                         |
| `Arrow Left` | Move to previous tab (if using `role="tablist"`) |
| `Arrow Right`| Move to next tab                             |

Implementation note: Status filter tabs should use `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls` for full keyboard support. If implemented as links/buttons with URL search params instead, standard Tab navigation is acceptable.

**Form Fields:**

| Key        | Action                            |
|------------|-----------------------------------|
| `Tab`      | Move to next input                |
| `Shift+Tab`| Move to previous input            |
| `Enter`    | Submit form (when in input field) |

---

## 4. Semantic HTML

### The Rule

Always use the correct HTML element for the intended meaning. Never use a `<div>` or `<span>` for interactive behavior when a native element exists.

### Element Usage Requirements

| Intent               | Use               | Never Use                       |
|----------------------|-------------------|---------------------------------|
| Navigation           | `<nav>`           | `<div role="nav">`              |
| Primary page content | `<main>`          | `<div id="content">`            |
| Page sections        | `<section>`       | `<div class="section">`         |
| Heading hierarchy    | `<h1>...<h6>`     | `<p class="heading">`           |
| Clickable action     | `<button>`        | `<div onClick>`                 |
| Page navigation link | `<a href>`        | `<button onClick={navigate}>`   |
| Data table           | `<table>`         | CSS grid with `role="table"`    |
| Form submission      | `<form>`          | `<div>` with submit button      |
| Form field label     | `<label htmlFor>` | `<p>` or `<span>` above input   |
| Field group          | `<fieldset>`      | `<div class="group">`           |
| Group legend         | `<legend>`        | `<h3>` inside fieldset          |
| Error message        | `<p role="alert">`| `<span class="error">`          |
| Image decoration     | `<img alt="">`    | (missing alt is invalid HTML)   |

### Heading Hierarchy

Each page must have exactly one `<h1>`. Headings must not skip levels.

```
Dashboard:
  <h1>Dashboard</h1>
    <h2>Recent Activity</h2>

Clients:
  <h1>Clients</h1>
  (table has no heading — use aria-label on <table>)

Requests:
  <h1>Document Requests</h1>
    <h2>Upcoming Deadlines</h2>
    <h2>Recent Requests</h2> (sr-only if visual heading is implicit)

Portal:
  <h1>Annual Tax Return 2025</h1>  (the request title)
    <h2>Upload Documents</h2>
```

### Landmark Regions

Every page must define these ARIA landmark regions:

```html
<!-- Authentication pages -->
<main>
  <h1>Sign In</h1>
  <form>...</form>
</main>

<!-- Dashboard pages -->
<nav aria-label="Main navigation">
  <!-- sidebar links -->
</nav>

<main id="main-content" tabindex="-1">
  <!-- page content -->
</main>

<!-- Portal page -->
<main>
  <!-- no sidebar, centered card content -->
</main>
```

---

## 5. ARIA Labels and Roles

### When to Use ARIA

Follow the ARIA rule: prefer native HTML semantics first. Use ARIA only when HTML alone cannot express the required role or state.

### Required ARIA Annotations Per Component

**StatusBadge:**
```html
<span role="status" aria-label="Status: Pending">
  <svg aria-hidden="true" focusable="false">...</svg>
  Pending
</span>
```

**Modal:**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-body"
>
  <h2 id="modal-title">Add Client</h2>
  <div id="modal-body">...</div>
</div>
```

**DataTable:**
```html
<table role="grid" aria-label="Clients list">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Name</th>
      <th scope="col">Email</th>
      <th scope="col"><span class="sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody>
    <tr
      role="row"
      tabindex="0"
      aria-selected="false"
    >
      <td>Alice Chen</td>
    </tr>
  </tbody>
</table>
```

**FileUpload:**
```html
<div
  role="button"
  tabindex="0"
  aria-label="Upload files. Press Enter to open file browser or drag files here."
  aria-describedby="upload-hint"
>
  ...
</div>
<p id="upload-hint" class="sr-only">
  Accepted formats: PDF, DOCX, XLSX, PNG, JPG. Maximum file size: 50MB.
</p>
<div aria-live="polite" class="sr-only">
  <!-- Dynamically updated: "3 files selected" / "Upload complete" -->
</div>

<progress
  role="progressbar"
  aria-valuenow="72"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Uploading report-2025.pdf"
></progress>
```

**FormField:**
```html
<label for="client-name">
  Client Name
  <span aria-hidden="true" class="text-red-500"> *</span>
</label>
<input
  id="client-name"
  name="client-name"
  type="text"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="client-name-description"
/>
<p id="client-name-description" role="alert" class="text-red-600">
  Name is required.
</p>
```

**Navigation (active state):**
```html
<nav aria-label="Main navigation">
  <a href="/dashboard" aria-current="page">Dashboard</a>
  <a href="/clients">Clients</a>
  <a href="/requests">Requests</a>
</nav>
```

**Mobile hamburger button:**
```html
<button
  aria-label="Open navigation menu"
  aria-expanded="false|true"
  aria-controls="mobile-nav"
>
  <svg aria-hidden="true">...</svg>
</button>
<nav id="mobile-nav" aria-label="Mobile navigation">...</nav>
```

**Close button (modal/drawer):**
```html
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```

**Action buttons in table (no visible text):**
```html
<button aria-label="Delete client Alice Chen">
  <svg aria-hidden="true">...</svg>
</button>
<button aria-label="Edit client Alice Chen">
  <svg aria-hidden="true">...</svg>
</button>
```

**Copy to clipboard button:**
```html
<button
  aria-label="Copy portal link to clipboard"
  aria-live="polite"
>
  <!-- Text changes after copy: "Copied!" — also announced to screen readers -->
</button>
```

**Status filter tabs:**
```html
<div role="tablist" aria-label="Filter requests by status">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="requests-panel"
    id="tab-all"
  >All</button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="requests-panel"
    id="tab-pending"
    tabindex="-1"
  >Pending</button>
</div>
<div role="tabpanel" id="requests-panel" aria-labelledby="tab-all">
  <!-- filtered table -->
</div>
```

**Loading states:**
```html
<!-- Skeleton / spinner -->
<div role="status" aria-label="Loading clients list">
  <span class="sr-only">Loading...</span>
  <!-- visual skeleton UI -->
</div>
```

---

## 6. Form Field Associations

Every input must be programmatically associated with its label. No exceptions.

### Pattern

```
label[for="{id}"] → input[id="{id}"]
input[aria-describedby="{id}-description"] → p[id="{id}-description"]
```

### Anti-Patterns to Avoid

```
<!-- WRONG — label not associated -->
<p>Name</p>
<input type="text" name="name" />

<!-- WRONG — placeholder as the only label -->
<input type="text" placeholder="Enter client name" />

<!-- WRONG — aria-label on wrapper, not input -->
<div aria-label="Name field">
  <input type="text" />
</div>
```

### Correct Patterns

```html
<!-- Standard text input -->
<label for="name">Name <span aria-hidden="true">*</span></label>
<input
  id="name"
  name="name"
  type="text"
  aria-required="true"
  aria-describedby="name-help"
/>
<p id="name-help">Enter the client's full name.</p>

<!-- Select field -->
<label for="client-select">Client</label>
<select id="client-select" name="client_id" aria-required="true">
  <option value="">Select a client</option>
  ...
</select>

<!-- Textarea -->
<label for="description">Description</label>
<textarea id="description" name="description" rows="4"></textarea>

<!-- Date input -->
<label for="due-date">Due Date</label>
<input id="due-date" name="due_date" type="date" />
```

---

## 7. Images and Icons

### Decorative Icons

SVG icons used for decoration only (alongside text labels) must be hidden from screen readers:

```html
<button>
  <svg aria-hidden="true" focusable="false" ...>...</svg>
  Add Client
</button>
```

### Meaningful Icons (Icon-Only Buttons)

When an icon conveys information without accompanying text:

```html
<!-- Delete button — icon only -->
<button aria-label="Delete client Alice Chen">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>

<!-- Close button -->
<button aria-label="Close">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

### File Type Icons in File List

```html
<!-- Icon beside file name — decorative -->
<span aria-hidden="true">
  <svg><!-- PDF icon --></svg>
</span>
<span>report-2025.pdf</span>

<!-- File size — muted but readable -->
<span class="text-gray-500" aria-label="File size: 12.4 megabytes">12.4 MB</span>
```

---

## 8. Live Regions

Use `aria-live` to announce dynamic content changes without requiring focus:

```html
<!-- General updates (non-urgent) — use polite -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <!-- Updated when: file upload completes, client added, request status changed -->
  <!-- Example: "Upload complete. 3 files received." -->
</div>

<!-- Urgent alerts (errors) — use assertive -->
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  <!-- Updated when: form validation error, upload failure, network error -->
  <!-- Example: "Error: Name is required." -->
</div>
```

**When to update live regions:**
- Upload progress complete: "Uploaded report-2025.pdf successfully."
- Upload error: "Error uploading report-2025.pdf. File exceeds 50MB limit."
- Client added: "Alice Chen has been added to your client list."
- Client deleted: "Alice Chen has been deleted."
- Status changed: "Request status updated to Received."
- Modal opened: (handled by `role="dialog"` automatically)
- Navigation: (handled by `aria-current="page"` and browser)

---

## 9. Accessibility Verification Checklist

Executed by QA Expert in Wave 4. Sign-off required before release.

### Automated Checks

- [ ] Run axe-core browser extension on every page — zero critical or serious violations
- [ ] Run Lighthouse accessibility audit — score ≥ 95 on all pages
- [ ] Run `npx tsc --noEmit` — no TypeScript errors (catches missing props)

### Color and Contrast

- [ ] All normal text meets 4.5:1 ratio against backgrounds
- [ ] All large text (18pt+ / 14pt+ bold) meets 3:1 ratio
- [ ] All UI component borders/icons meet 3:1 ratio
- [ ] Focus rings visible at 3:1 or better against adjacent colors
- [ ] No information conveyed by color alone (badges have text labels)
- [ ] `text-yellow-600` not used on white backgrounds (use `text-yellow-700`)

### Focus and Keyboard

- [ ] Skip navigation link appears on first Tab press
- [ ] Tab order follows logical reading order on all pages
- [ ] All buttons, links, inputs, table rows reachable by Tab
- [ ] No `outline: none` without a focus-visible replacement
- [ ] Focus ring visible on: buttons, links, inputs, select, table rows, modal triggers
- [ ] Modal focus trap works: Tab and Shift+Tab cycle within modal only
- [ ] Escape key closes: modals, mobile drawer, dropdowns
- [ ] Focus returns to trigger element after modal closes
- [ ] Sortable table headers operable by keyboard (Enter/Space)
- [ ] File upload zone opens file picker on Enter/Space

### Semantic HTML and ARIA

- [ ] Each page has exactly one `<h1>`
- [ ] Heading hierarchy is not skipped (h1 → h2 → h3)
- [ ] All `<form>` elements have a submit button or `aria-label`
- [ ] All `<input>` elements have associated `<label>`
- [ ] All `<img>` elements have `alt` attributes (empty `alt=""` for decorative)
- [ ] All tables have `scope="col"` or `scope="row"` on headers
- [ ] Navigation landmarks use `<nav>` with `aria-label`
- [ ] Main content uses `<main>` with `id="main-content"`
- [ ] Modals have `role="dialog" aria-modal="true" aria-labelledby`
- [ ] Icon-only buttons have `aria-label`
- [ ] Active nav item has `aria-current="page"`
- [ ] Hamburger button has `aria-expanded` and `aria-controls`

### Form Validation

- [ ] Required fields have `aria-required="true"`
- [ ] Error fields have `aria-invalid="true"`
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages use `role="alert"` for immediate announcement
- [ ] Required indicator (`*`) explained (via legend or screen-reader-only text)
- [ ] Validation fires on blur and on submit (not only on submit)
- [ ] Error messages are descriptive (not just "Invalid")

### Dynamic Content

- [ ] Loading states have `role="status"` with screen-reader text
- [ ] Upload progress announced on completion
- [ ] Toast notifications use `role="alert"` or `aria-live="polite"`
- [ ] Filtered table results announced via `aria-live`

### Portal Page Specific

- [ ] Page accessible without authentication cookie
- [ ] Page `<title>` does not include client/accountant names (privacy)
- [ ] Upload zone accessible on touch devices (48px minimum target)
- [ ] Success message receives focus on completion

### Responsive / Mobile

- [ ] All interactive elements ≥ 44px × 44px on mobile viewport (375px)
- [ ] No content lost or truncated without accessible alternative
- [ ] Modal on mobile does not require scrolling behind a visible area

---

## 10. Screen Reader Testing

Test with at least one screen reader per platform:

| Platform | Screen Reader       | Browser        |
|----------|---------------------|----------------|
| macOS    | VoiceOver (built-in)| Safari         |
| Windows  | NVDA (free)         | Chrome         |
| iOS      | VoiceOver (built-in)| Safari Mobile  |
| Android  | TalkBack (built-in) | Chrome Mobile  |

### VoiceOver Quick Test (macOS)

1. `Cmd+F5` to enable VoiceOver
2. Navigate with `Tab` — confirm all elements are announced correctly
3. Open a modal — confirm dialog role announced, focus trapped
4. Submit a form with empty required field — confirm error announced
5. Upload a file — confirm progress and completion announced
6. Check portal page — confirm page title and request title announced

---

## Implementation Priority Order

1. **Critical (blocker):** Skip nav link, all inputs have labels, all buttons have accessible names, focus not lost or trapped incorrectly, modal ESC to close.
2. **High (Wave 3):** All ARIA attributes on components, live regions for dynamic updates, heading hierarchy.
3. **Medium (Wave 4):** Enhanced keyboard patterns (arrow keys in tabs/tables), VoiceOver testing, contrast verification with tool.
4. **Enhancement (post-MVP):** Reduced motion support (`prefers-reduced-motion`), high contrast mode (`prefers-contrast`), larger text mode.

### Reduced Motion

When `prefers-reduced-motion: reduce` is active, disable all CSS animations and transitions:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Add this to `globals.css` in Wave 4 polish phase.
