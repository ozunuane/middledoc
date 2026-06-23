# Page Layout Specifications — Accountant Hub Phase 2

**Authored by:** UI/UX Designer Agent
**Date:** 2026-06-23
**Status:** Ready for Frontend Specialist (Wave 2)

All layouts follow the shared dashboard shell: persistent sidebar on `lg+`, collapsible on `md`, hidden (hamburger drawer) on mobile.

---

## Shared Dashboard Shell

The `app/(dashboard)/layout.tsx` wraps all authenticated pages. The shell is a Server Component.

### Desktop Layout (lg+: 1024px and above)

```
┌────────────────────────────────────────────────────────────────┐
│ SIDEBAR (256px fixed, bg-white, border-r border-gray-200)      │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ LOGO / BRAND                                               │ │
│ │ ┌──────────────────────────────────────────────────────┐   │ │
│ │ │  Accountant Hub                                      │   │ │
│ │ │  text-lg font-bold text-gray-900                     │   │ │
│ │ └──────────────────────────────────────────────────────┘   │ │
│ │                                                            │ │
│ │ NAV LINKS (gap-1)                                          │ │
│ │ ┌──────────────────────────────────────────────────────┐   │ │
│ │ │ [grid icon] Dashboard                                │   │ │ <- active: bg-indigo-50 text-indigo-700
│ │ │ [users icon] Clients                                 │   │ │ <- hover: bg-gray-50 text-gray-900
│ │ │ [doc icon]  Requests                                 │   │ │
│ │ └──────────────────────────────────────────────────────┘   │ │
│ │                                                            │ │
│ │ BOTTOM AREA (mt-auto)                                      │ │
│ │ ┌──────────────────────────────────────────────────────┐   │ │
│ │ │ [avatar] {user.name}          [logout icon]          │   │ │
│ │ └──────────────────────────────────────────────────────┘   │ │
│ └────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│ MAIN CONTENT AREA (flex-1, bg-gray-50, overflow-y-auto)        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ TOP BAR (bg-white border-b border-gray-200 h-16)           │ │
│ │ ┌──────────────────────────────────────────────────────┐   │ │
│ │ │ Page Title (h1 text-2xl font-bold text-gray-900)     │   │ │
│ │ │                              [Primary Action Button] │   │ │
│ │ └──────────────────────────────────────────────────────┘   │ │
│ │                                                            │ │
│ │ PAGE CONTENT (max-w-content mx-auto px-6 py-6)            │ │
│ │ ┌──────────────────────────────────────────────────────┐   │ │
│ │ │ {children}                                           │   │ │
│ │ └──────────────────────────────────────────────────────┘   │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌─────────────────────────────────────┐
│ MOBILE HEADER (h-16 bg-white)       │
│ [≡ Menu]  Accountant Hub  [avatar]  │
├─────────────────────────────────────┤
│ PAGE CONTENT (px-4 py-4)           │
│ {children}                          │
└─────────────────────────────────────┘

MOBILE NAV DRAWER (slides in from left on [≡])
┌───────────────────────────────────────────────┐
│ OVERLAY (bg-black/50)                         │
│ ┌─────────────────────────────────────────┐   │
│ │ DRAWER (bg-white w-72 h-full shadow-dark│   │
│ │ ┌───────────────────────────────────┐   │   │
│ │ │ [×] Close       Accountant Hub   │   │   │
│ │ ├───────────────────────────────────┤   │   │
│ │ │ [grid] Dashboard                 │   │   │
│ │ │ [users] Clients                  │   │   │
│ │ │ [doc] Requests                   │   │   │
│ │ ├───────────────────────────────────┤   │   │
│ │ │ {user.name}      [Logout]        │   │   │
│ │ └───────────────────────────────────┘   │   │
│ └─────────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

### Navigation Active State

```
Active nav item:
  bg-indigo-50 text-indigo-700 font-semibold
  rounded-standard

Default nav item:
  text-gray-600 font-medium
  hover:bg-gray-50 hover:text-gray-900
  rounded-standard
  transition-colors duration-150

Icon color mirrors text color using currentColor.
```

---

## 1. Dashboard Page

**Route:** `/dashboard`
**File:** `app/(dashboard)/dashboard/page.tsx` (Server Component)

### Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ BREADCRUMB / PAGE HEADER                                        │
│ "Dashboard"  h1 text-3xl font-bold text-gray-900               │
│ "Welcome back, {name}"  text-base text-gray-600                │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ STATS ROW (grid grid-cols-1 md:grid-cols-3 gap-6)              │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│ │ Total Clients │  │Pending Requests│  │Docs Received  │        │
│ │               │  │               │  │               │        │
│ │      12       │  │      4        │  │      23       │        │
│ │ text-gray-900 │  │ text-yellow-600│ │ text-green-600│        │
│ │               │  │               │  │               │        │
│ │ [+2 this week]│  │               │  │ [+5 today]    │        │
│ └───────────────┘  └───────────────┘  └───────────────┘        │
│ bg-white rounded-lg shadow-light p-6                           │
│                                                                 │
│ QUICK ACTIONS ROW (flex flex-wrap gap-3 mt-6)                  │
│ ┌──────────────────────┐  ┌───────────────────────┐            │
│ │ [+ icon] Add Client  │  │ [doc icon] New Request │            │
│ │ btn-primary          │  │ btn-secondary          │            │
│ └──────────────────────┘  └───────────────────────┘            │
│                                                                 │
│ RECENT ACTIVITY (mt-8)                                         │
│ ┌─────────────────────────────────────────────────────────┐    │
│ │ CARD HEADER                                             │    │
│ │ "Recent Activity"  text-lg font-semibold text-gray-900  │    │
│ ├─────────────────────────────────────────────────────────┤    │
│ │ ACTIVITY LIST (divide-y divide-gray-100)                │    │
│ │                                                         │    │
│ │ ┌─────────────────────────────────────────────────────┐ │    │
│ │ │ [doc icon]  Jane Smith uploaded "W2 2025.pdf"       │ │    │
│ │ │             for Tax Return 2025      2 min ago      │ │    │
│ │ │             [StatusBadge: received]                 │ │    │
│ │ └─────────────────────────────────────────────────────┘ │    │
│ │ ┌─────────────────────────────────────────────────────┐ │    │
│ │ │ [user icon] New client: Bob Johnson   1 hour ago    │ │    │
│ │ └─────────────────────────────────────────────────────┘ │    │
│ │ ┌─────────────────────────────────────────────────────┐ │    │
│ │ │ [clock icon] Q3 Payroll — overdue    yesterday      │ │    │
│ │ │              [StatusBadge: overdue]                 │ │    │
│ │ └─────────────────────────────────────────────────────┘ │    │
│ │                                                         │    │
│ │ [Show all activity →]  text-sm text-indigo-600          │    │
│ └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Stats Card Anatomy

```
┌─────────────────────────────────┐
│ p-6 bg-white rounded-lg shadow-light
│                                 │
│  LABEL ROW (flex items-center justify-between)
│  "Total Clients"                │  [optional icon bg-indigo-50 rounded-lg p-2]
│  text-sm font-semibold          │  [icon: text-indigo-600 w-5 h-5]
│  text-gray-500 uppercase        │
│                                 │
│  VALUE                          │
│  "12"                           │
│  text-4xl font-bold text-gray-900
│  mt-2                           │
│                                 │
│  CHANGE (optional)              │
│  "+2 this week"                 │
│  text-sm text-green-600 mt-1    │
└─────────────────────────────────┘
```

### Activity Feed Item Anatomy

```
┌─────────────────────────────────────────────────────────┐
│ py-4 flex items-start gap-3                             │
│                                                         │
│ ICON (flex-shrink-0)           TEXT CONTENT             │
│ w-8 h-8 rounded-full           flex-1 min-w-0           │
│ bg-gray-100 flex items-center                           │
│ justify-center                 DESCRIPTION              │
│                                text-sm text-gray-900    │
│ [doc/user/clock SVG icon]      font-medium truncate     │
│ text-gray-500 w-4 h-4                                   │
│                                CONTEXT                  │
│                                text-sm text-gray-500    │
│                                                         │
│                                TIMESTAMP                │
│                                text-xs text-gray-400    │
│                                flex-shrink-0            │
└─────────────────────────────────────────────────────────┘
```

### Responsive Notes

- Mobile: Stats cards stack (single column). Quick actions stack vertically. Activity list remains single column.
- md (768px+): Stats cards in 3-column grid. Quick actions row stays horizontal.
- lg (1024px+): Consider adding a right column for a "Deadlines This Week" mini-widget (optional enhancement).

---

## 2. Clients Page

**Route:** `/clients`
**File:** `app/(dashboard)/clients/page.tsx` (Server Component)

### Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE HEADER (flex items-center justify-between mb-6)            │
│ ┌────────────────────────┐    ┌──────────────────────────────┐  │
│ │ "Clients"              │    │ [+ icon]  Add Client         │  │
│ │ h1 text-3xl font-bold  │    │ btn-primary                  │  │
│ │ text-gray-900          │    └──────────────────────────────┘  │
│ └────────────────────────┘                                      │
│                                                                 │
│ SEARCH + FILTER BAR (mb-4)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [search icon] Search clients...                             │ │
│ │ w-full max-w-sm bg-white border border-gray-300 rounded-standard
│ │ px-3 py-2.5 text-sm                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ CLIENTS TABLE (DataTable component)                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ NAME           EMAIL             COMPANY       ACTIONS       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Alice Chen     alice@corp.com    Acme Corp     [Edit][Delete]│ │
│ │ Bob Johnson    bob@biz.com       —             [Edit][Delete]│ │
│ │ Carol White    carol@firm.io     White & Co    [Edit][Delete]│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ EMPTY STATE (shown when data.length === 0)                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │           [users icon — text-gray-300 w-12 h-12]            │ │
│ │                                                             │ │
│ │            No clients yet.                                  │ │
│ │            text-sm font-medium text-gray-900                │ │
│ │                                                             │ │
│ │            Add one to get started.                          │ │
│ │            text-sm text-gray-500                            │ │
│ │                                                             │ │
│ │                    [Add Your First Client]                  │ │
│ │                     btn-primary mt-4                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Clients Table Columns

| Column  | Width    | Sortable | Notes                                           |
|---------|----------|----------|-------------------------------------------------|
| Name    | flex-1   | Yes      | Truncate at 200px with `truncate`               |
| Email   | 200px    | No       | Truncate, mailto link on click                  |
| Company | 160px    | No       | Show "—" if null                                |
| Created | 120px    | Yes      | Format: "Jun 12, 2026"                          |
| Actions | 96px     | No       | Icon buttons only: Edit (pencil), Delete (trash)|

### Add Client Modal

Triggered by "Add Client" button in page header.

```
┌──────────────────────────────────────┐
│ MODAL (size="md" max-w-modal-md)     │
│                                      │
│ HEADER                               │
│ "Add New Client"           [×]       │
│                                      │
│ BODY                                 │
│ ┌────────────────────────────────┐   │
│ │ Name *                         │   │
│ │ [________________________]     │   │
│ │                                │   │
│ │ Email                          │   │
│ │ [________________________]     │   │
│ │                                │   │
│ │ Phone                          │   │
│ │ [________________________]     │   │
│ │                                │   │
│ │ Company                        │   │
│ │ [________________________]     │   │
│ │                                │   │
│ │ Notes                          │   │
│ │ [                          ]   │   │
│ │ [________________________]     │   │
│ │ [________________________]     │   │
│ └────────────────────────────────┘   │
│                                      │
│ FOOTER                               │
│           [Cancel]  [Add Client]     │
└──────────────────────────────────────┘
```

### Delete Client Confirmation Dialog

Triggered by delete icon in Actions column.

```
┌────────────────────────────────────┐
│ MODAL (size="sm" max-w-modal-sm)   │
│                                    │
│ HEADER                             │
│ "Delete Client"          [×]       │
│                                    │
│ BODY                               │
│ ┌──────────────────────────────┐   │
│ │ [warning triangle — red]     │   │
│ │                              │   │
│ │ Are you sure you want to     │   │
│ │ delete Alice Chen?           │   │
│ │ (client name in font-semibold)│  │
│ │                              │   │
│ │ This will permanently delete │   │
│ │ all associated document      │   │
│ │ requests and files.          │   │
│ │ text-sm text-gray-600        │   │
│ └──────────────────────────────┘   │
│                                    │
│ FOOTER                             │
│         [Cancel]  [Delete Client]  │
│                   (btn-danger)     │
└────────────────────────────────────┘
```

### Responsive Notes

- Mobile: Table scrolls horizontally. Name column is sticky (left). Actions column is sticky (right).
- On narrow screens, Company and Created columns can be hidden at sm breakpoint using `hidden sm:table-cell`.
- Search bar: full width on mobile, `max-w-sm` on desktop.
- Action buttons: icon-only on mobile, icon+label on lg+ (or always icon-only to keep table clean).

---

## 3. Document Requests Page

**Route:** `/requests`
**File:** `app/(dashboard)/requests/page.tsx` (Server Component)

### Desktop Layout (lg+)

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE HEADER (flex items-center justify-between mb-4)            │
│ "Document Requests"                    [+ New Request]          │
│ h1 text-3xl font-bold text-gray-900     btn-primary             │
│                                                                 │
│ DEADLINES WIDGET (mb-6) — DeadlinesWidget component             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ bg-amber-50 border border-amber-200 rounded-card p-4        │ │
│ │ [clock icon text-amber-600]  Upcoming Deadlines             │ │
│ │                                                             │ │
│ │ Q3 Payroll — Alice Chen         Due in 2 days               │ │
│ │ Annual Tax Return — Bob Johnson  Due tomorrow               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ (hidden if no requests due within 7 days)                       │
│                                                                 │
│ STATUS FILTER TABS (mb-4)                                       │
│ ┌──────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐                  │
│ │ All  │ │ Pending │ │ Received │ │ Overdue │                  │
│ └──────┘ └─────────┘ └──────────┘ └─────────┘                  │
│ Active tab: border-b-2 border-indigo-600 text-indigo-600        │
│ Inactive: text-gray-500 hover:text-gray-700                     │
│                                                                 │
│ TWO-COLUMN LAYOUT (gap-6)                                       │
│ ┌──────────────────────────────────────┐ ┌──────────────────┐  │
│ │ REQUESTS TABLE (flex-1)              │ │ DETAILS PANEL    │  │
│ │ ┌──────────────────────────────────┐ │ │ (w-80 flex-shrink│  │
│ │ │ TITLE    CLIENT  DUE   STATUS  ⋯ │ │ │ hidden lg:block) │  │
│ │ ├──────────────────────────────────┤ │ │                  │  │
│ │ │ Tax Rtn  Alice   6/30  [Pending] │ │ │ (empty state if  │  │
│ │ │ Payroll  Bob     7/15  [Pending] │ │ │  no row selected)│  │
│ │ │ W2 Form  Carol   —     [Received]│ │ │                  │  │
│ │ └──────────────────────────────────┘ │ │ ┌──────────────┐ │  │
│ └──────────────────────────────────────┘ │ │ REQUEST DETAIL│ │  │
│                                          │ │ (see below)  │ │  │
│                                          │ └──────────────┘ │  │
│                                          └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Details Panel

Shown in right column on `lg+`, as Modal on `< lg`.

```
┌──────────────────────────────────────────┐
│ PANEL (bg-white rounded-lg shadow-light  │
│         sticky top-6)                    │
│                                          │
│ HEADER (border-b border-gray-200 p-4)    │
│ Title: "Annual Tax Return 2025"          │
│ text-base font-semibold text-gray-900    │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ STATUS   [StatusBadge: Pending]      │ │
│ │ CLIENT   Alice Chen                  │ │
│ │ DUE DATE June 30, 2026               │ │
│ └──────────────────────────────────────┘ │
│ text-sm text-gray-500 + text-sm gray-900 │
│                                          │
│ DESCRIPTION (if present)                 │
│ "Please upload your W2 forms and..."     │
│ text-sm text-gray-600 mt-3              │
│                                          │
│ SHARE LINK (ShareLinkGenerator)          │
│ ┌──────────────────────────────────────┐ │
│ │ Portal Link                          │ │
│ │ ┌──────────────────────────────────┐ │ │
│ │ │ https://hub.io/portal/abc123…   │ │ │
│ │ │ text-xs text-gray-500 truncate  │ │ │
│ │ └──────────────────────────────────┘ │ │
│ │                  [Copy Link] btn-sm  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ UPLOADED FILES (mt-4)                    │
│ "Uploaded Files" text-sm font-semibold   │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ [PDF icon] W2-2025.pdf   812 KB [↓]  │ │
│ ├──────────────────────────────────────┤ │
│ │ [IMG icon] receipt.jpg    94 KB [↓]  │ │
│ └──────────────────────────────────────┘ │
│ (empty: "No files uploaded yet.")        │
│                                          │
│ STATUS ACTIONS (mt-4 border-t pt-4)     │
│ ┌──────────────────────────────────────┐ │
│ │ Update status:                       │ │
│ │ [Mark Received] [Mark Complete]      │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### Create Request Modal

```
┌──────────────────────────────────────┐
│ MODAL (size="md")                    │
│                                      │
│ HEADER                               │
│ "New Document Request"     [×]       │
│                                      │
│ BODY                                 │
│ ┌────────────────────────────────┐   │
│ │ Request Title *                │   │
│ │ [________________________]     │   │
│ │                                │   │
│ │ Client *                       │   │
│ │ [Select a client ▼]            │   │
│ │                                │   │
│ │ Due Date                       │   │
│ │ [________________________]     │   │
│ │ (date picker, optional)        │   │
│ │                                │   │
│ │ Description                    │   │
│ │ [                          ]   │   │
│ │ [________________________]     │   │
│ │ [________________________]     │   │
│ │ Optional instructions...       │   │
│ └────────────────────────────────┘   │
│                                      │
│ FOOTER                               │
│      [Cancel]  [Create Request]      │
└──────────────────────────────────────┘
```

### Status Filter Tabs

```
Tab container: border-b border-gray-200 flex gap-6 mb-4

Each tab:
  Default:  pb-3 text-sm font-medium text-gray-500 hover:text-gray-700
            border-b-2 border-transparent hover:border-gray-300
  Active:   pb-3 text-sm font-medium text-indigo-600
            border-b-2 border-indigo-600
  Count badge (optional): ml-2 inline-flex items-center
            px-2 py-0.5 text-xs rounded-full
            Active: bg-indigo-100 text-indigo-700
            Default: bg-gray-100 text-gray-600
```

### Requests Table Columns

| Column   | Width  | Notes                                                 |
|----------|--------|-------------------------------------------------------|
| Title    | flex-1 | Truncate, clicking row opens detail panel             |
| Client   | 150px  | Client name text only                                 |
| Due Date | 120px  | Format: "Jun 30, 2026"; show "—" if null; red if past |
| Status   | 120px  | StatusBadge component                                 |
| Actions  | 80px   | Menu icon (kebab) opens: Edit, Mark Complete, Delete  |

### Responsive Notes

- Mobile (< lg): Detail panel becomes a bottom sheet modal when row is tapped. Status filter tabs scroll horizontally.
- sm-md: Table scrolls horizontally. Details modal is full-screen on mobile.
- lg+: Two-column layout — table left, details panel sticky on right.

---

## 4. Client Portal Page

**Route:** `/portal/[shareToken]`
**File:** `app/portal/[shareToken]/page.tsx` (Server Component, no auth)

This page is public. No navigation header. Optimized for mobile — most clients will access via a link on their phone.

### Layout Wireframe (Mobile-first)

```
┌─────────────────────────────────────┐
│ PAGE (min-h-screen bg-gray-50)      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ CENTERED CARD                   │ │
│ │ max-w-lg w-full mx-auto         │ │
│ │ px-4 py-8 (mobile: full bleed)  │ │
│ │                                 │ │
│ │ BRANDING                        │ │
│ │ "Accountant Hub"                │ │
│ │ text-sm font-medium text-gray-500│ │
│ │ mb-6 text-center                │ │
│ │                                 │ │
│ │ CARD PANEL                      │ │
│ │ bg-white rounded-modal          │ │
│ │ shadow-medium p-6 sm:p-8        │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ CONTEXT HEADER              │ │ │
│ │ │ "Requested by:"             │ │ │
│ │ │ text-xs text-gray-500       │ │ │
│ │ │ "{accountant.name}"         │ │ │
│ │ │ text-sm font-medium         │ │ │
│ │ │ text-gray-700               │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ TITLE                           │ │
│ │ "Annual Tax Return 2025"        │ │
│ │ text-2xl font-bold text-gray-900│ │
│ │ mt-2 mb-1                       │ │
│ │                                 │ │
│ │ DESCRIPTION (if present)        │ │
│ │ "Please upload your W2 forms..."│ │
│ │ text-sm text-gray-600 mb-6      │ │
│ │                                 │ │
│ │ DIVIDER (border-t mb-6)         │ │
│ │                                 │ │
│ │ UPLOAD SECTION                  │ │
│ │ "Upload Documents"              │ │
│ │ text-base font-semibold         │ │
│ │ text-gray-900 mb-3              │ │
│ │                                 │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ FileUploadArea component    │ │ │
│ │ │                             │ │ │
│ │ │  [cloud upload icon]        │ │ │
│ │ │                             │ │ │
│ │ │  Drag files here or         │ │ │
│ │ │  click to browse            │ │ │
│ │ │                             │ │ │
│ │ │  PDF, DOCX, XLSX up to 50MB │ │ │
│ │ └─────────────────────────────┘ │ │
│ │                                 │ │
│ │ FOOTER NOTE                     │ │
│ │ "Your files are encrypted and   │ │
│ │  only accessible by your        │ │
│ │  accountant."                   │ │
│ │ text-xs text-gray-400 mt-4      │ │
│ │ text-center                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Success State (after upload completes)

```
┌─────────────────────────────────────┐
│ CARD PANEL                          │
│                                     │
│   [check-circle icon]               │
│   text-green-500 w-16 h-16          │
│   mx-auto mb-4                      │
│                                     │
│   "Files Received!"                 │
│   text-xl font-bold text-gray-900   │
│   text-center mb-2                  │
│                                     │
│   "Thank you. Your accountant"      │
│   "will be notified."               │
│   text-sm text-gray-600 text-center │
│                                     │
│   UPLOADED FILE LIST                │
│   ┌───────────────────────────────┐ │
│   │ [PDF] W2-2025.pdf      812 KB │ │
│   │ [IMG] receipt.jpg       94 KB │ │
│   └───────────────────────────────┘ │
│   text-sm text-gray-700 mt-6       │
│   "Uploaded files" heading         │
│                                     │
│   [Upload More Files]               │
│   btn-secondary mt-4 w-full         │
└─────────────────────────────────────┘
```

### Error / Not Found State

When shareToken is invalid or expired:
```
┌─────────────────────────────────────┐
│ CARD PANEL                          │
│                                     │
│   [x-circle icon — text-red-400]    │
│   w-12 h-12 mx-auto mb-4            │
│                                     │
│   "Link Not Found"                  │
│   text-xl font-bold text-gray-900   │
│                                     │
│   "This upload link is invalid or   │
│   has expired. Please contact your  │
│   accountant for a new link."       │
│   text-sm text-gray-600 text-center │
└─────────────────────────────────────┘
```

### Responsive Behavior

- Mobile (< 640px): Card is full-width with `rounded-none` or `rounded-none mx-0`. Padding reduced to `p-4`. Upload zone fills full width with large tap target.
- sm (640px+): Card becomes `rounded-modal`, centered with auto margins. `max-w-lg` caps width.
- The upload trigger button / drop zone minimum height: `min-h-[160px]` for easy mobile interaction.

### Accessibility Notes for Portal

- No authentication state — no user-specific references that leak data.
- Page `<title>`: "Upload Documents — Accountant Hub" (no client/accountant names in title).
- `lang="en"` on `<html>`.
- Upload zone and submit are fully keyboard accessible.
- After successful upload, focus moves to the success message heading.

---

## Layout Constants (Reference for Frontend Specialist)

```typescript
export const LAYOUT = {
  sidebarWidth:    'w-64',         // 256px
  headerHeight:    'h-16',         // 64px
  contentMaxWidth: 'max-w-content', // 1152px (max-w-6xl equivalent)
  pagePadding:     'px-6 py-6',    // 24px horizontal, 24px vertical
  pagePaddingMobile: 'px-4 py-4',  // 16px horizontal, 16px vertical
  cardGap:         'gap-6',        // 24px between cards
  sectionGap:      'gap-8',        // 32px between sections
  portalMaxWidth:  'max-w-lg',     // 512px — portal card
  modalSmWidth:    'max-w-sm',     // 384px
  modalMdWidth:    'max-w-modal-md', // 576px
  modalLgWidth:    'max-w-modal-lg', // 768px
} as const
```
