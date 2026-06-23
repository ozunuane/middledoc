# Component Specifications — Accountant Hub Phase 2

**Authored by:** UI/UX Designer Agent
**Date:** 2026-06-23
**Status:** Ready for Frontend Specialist (Wave 2)

All components follow these conventions:
- Tailwind CSS 4 utility classes
- `'use client'` directive required (all are interactive)
- Strict TypeScript props interfaces
- WCAG 2.1 AA accessibility
- Mobile-first responsive behavior
- Dark mode aware (class-based: `dark:` prefix)

---

## 1. StatusBadge

**File:** `components/ui/StatusBadge.tsx`
**Purpose:** Communicates the state of a document request at a glance. Appears in DataTable rows, request detail panels, and the dashboard activity feed.

### Props Interface

```typescript
type RequestStatus = 'pending' | 'received' | 'overdue' | 'complete'

interface StatusBadgeProps {
  status: RequestStatus
  // Optional: render as a larger pill in detail views
  size?: 'sm' | 'md'
  // Optional: render without icon (compact table cells)
  showIcon?: boolean
  // Optional: additional CSS classes
  className?: string
}
```

### Visual Variants

| Status   | Background     | Border         | Text           | Hex (text)  | Icon              |
|----------|----------------|----------------|----------------|-------------|-------------------|
| pending  | `#FEF9C3`      | `#FEF08A`      | `#CA8A04`      | warning-600 | Clock (outline)   |
| received | `#DCFCE7`      | `#BBF7D0`      | `#16A34A`      | success-600 | Check circle      |
| overdue  | `#FFE4E6`      | `#FECDD3`      | `#DC2626`      | danger-600  | Exclamation circle|
| complete | `#F3F4F6`      | `#E5E7EB`      | `#4B5563`      | neutral-600 | Check (solid)     |

### Tailwind Class Map

```
pending:  bg-yellow-100 border border-yellow-200 text-yellow-700
received: bg-green-100  border border-green-200  text-green-700
overdue:  bg-red-100    border border-red-200    text-red-700
complete: bg-gray-100   border border-gray-200   text-gray-600
```

### Size Variants

- `sm` (default, for table cells):
  - `text-xs font-semibold uppercase tracking-wide`
  - `px-2.5 py-0.5 rounded-full`
  - Icon: 12px × 12px, `mr-1`
- `md` (for detail panels, dashboard):
  - `text-sm font-semibold uppercase tracking-wide`
  - `px-3 py-1 rounded-full`
  - Icon: 14px × 14px, `mr-1.5`

### States

| State   | Change                                                   |
|---------|----------------------------------------------------------|
| Default | Pill with background, border, text, optional icon        |
| Hover   | Slight brightness increase: `hover:brightness-95`        |

No disabled, loading, or error state — this is a display-only component.

### Accessibility

```html
<span
  role="status"
  aria-label="{Status}: {humanReadableLabel}"
  class="..."
>
  <!-- SVG icon with aria-hidden="true" -->
  <svg aria-hidden="true" focusable="false" ...>...</svg>
  <!-- Text visible to screen readers and sighted users -->
  Pending
</span>
```

- `role="status"`: announces live updates when status changes without page reload
- `aria-label`: full readable label, e.g. `"Status: Pending"`, `"Status: Received"`
- SVG icons: `aria-hidden="true"` and `focusable="false"` to avoid double-reading

### Human-Readable Labels

```typescript
const STATUS_LABELS: Record<RequestStatus, string> = {
  pending:  'Pending',
  received: 'Received',
  overdue:  'Overdue',
  complete: 'Complete',
}
```

### Dark Mode

```
dark:pending:  dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400
dark:received: dark:bg-green-900/30  dark:border-green-800  dark:text-green-400
dark:overdue:  dark:bg-red-900/30    dark:border-red-800    dark:text-red-400
dark:complete: dark:bg-gray-800      dark:border-gray-700   dark:text-gray-400
```

---

## 2. Modal

**File:** `components/ui/Modal.tsx`
**Purpose:** Reusable dialog overlay for forms (Add Client, Create Request), confirmation prompts (Delete Client), and detail views on mobile. Wraps any content via `children`.

### Props Interface

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  // Optional footer with action buttons (e.g. Cancel + Submit)
  footer?: React.ReactNode
  // Controls max-width of the dialog panel
  size?: 'sm' | 'md' | 'lg'
  // Prevents closing on backdrop click (for destructive confirmations)
  disableBackdropClose?: boolean
}
```

### Size Map

| Size | Max Width | Use Case                          |
|------|-----------|-----------------------------------|
| `sm` | `24rem` (384px)  | Delete confirmations, alerts     |
| `md` | `36rem` (576px)  | Add Client, Create Request forms |
| `lg` | `48rem` (768px)  | Request detail view on mobile    |

### Structure

```
┌─────────────────────────────────────────┐
│ BACKDROP (fixed, full-screen)           │
│ bg-black/50 backdrop-blur-sm            │
│                                         │
│   ┌───────────────────────────────┐     │
│   │ PANEL (bg-white rounded-xl)   │     │
│   │ shadow-dark max-w-{size}      │     │
│   │                               │     │
│   │  HEADER                       │     │
│   │  ┌──────────────────────────┐ │     │
│   │  │ <h2> Title    [X button] │ │     │
│   │  └──────────────────────────┘ │     │
│   │  border-b border-gray-200     │     │
│   │                               │     │
│   │  BODY (overflow-y-auto)       │     │
│   │  p-6                          │     │
│   │  {children}                   │     │
│   │                               │     │
│   │  FOOTER (if provided)         │     │
│   │  ┌──────────────────────────┐ │     │
│   │  │ [Cancel]       [Submit]  │ │     │
│   │  └──────────────────────────┘ │     │
│   │  border-t border-gray-200     │     │
│   │  p-4 flex justify-end gap-3   │     │
│   └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Behavior

1. **Open:** Backdrop fades in (`animate-fade-in`), panel scales in (`animate-scale-in`). Body scroll is locked (`overflow: hidden` on `<body>`).
2. **Close triggers:**
   - ESC key — always closes
   - Backdrop click — closes unless `disableBackdropClose={true}`
   - Explicit `onClose()` call from footer buttons
3. **Focus trap:** On open, focus moves to the first focusable element inside the panel. Tab cycles only within the modal. Shift+Tab cycles backwards. On close, focus returns to the element that triggered the modal.
4. **Animation on close:** Reverse of open — scale out + fade out (150ms).

### Keyboard Interactions

| Key        | Action                                                  |
|------------|---------------------------------------------------------|
| `Escape`   | Calls `onClose()`                                       |
| `Tab`      | Moves to next focusable element within modal only        |
| `Shift+Tab`| Moves to previous focusable element within modal only   |
| `Enter`    | Activates the focused element (button or link)          |

### Tailwind Classes (Core)

```
Backdrop:  fixed inset-0 z-overlay bg-black/50 backdrop-blur-sm flex items-center justify-center p-4
Panel:     relative bg-white rounded-xl shadow-dark w-full max-w-{size} max-h-[90vh] flex flex-col
Header:    flex items-center justify-between px-6 py-4 border-b border-gray-200
Title:     text-lg font-semibold text-gray-900
CloseBtn:  p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-indigo-500
Body:      flex-1 overflow-y-auto p-6
Footer:    px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3
```

### Accessibility

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title-{uniqueId}"
  aria-describedby="modal-body-{uniqueId}"
>
  <h2 id="modal-title-{uniqueId}">Add Client</h2>
  <div id="modal-body-{uniqueId}">
    {children}
  </div>
</div>
```

- `role="dialog"`: identifies the element as a dialog
- `aria-modal="true"`: tells screen readers that content outside is inert
- `aria-labelledby`: points to the `<h2>` title element
- Close button: `aria-label="Close dialog"`
- When modal opens, screen readers announce the dialog title

### Dark Mode

```
dark:Panel: dark:bg-gray-900 dark:border-gray-700
dark:Header border: dark:border-gray-700
dark:Title: dark:text-gray-100
dark:CloseBtn: dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800
dark:Footer border: dark:border-gray-700
```

---

## 3. DataTable

**File:** `components/ui/DataTable.tsx`
**Purpose:** Reusable tabular data display for Clients list, Document Requests list, and file lists within request details. Supports loading skeleton, empty states, row click, and sortable column headers.

### Props Interface

```typescript
interface Column<T> {
  // Display text in the <th>
  header: string
  // Key of T, or a render function for custom cells
  accessor: keyof T | ((row: T) => React.ReactNode)
  // Optional: 'left' | 'center' | 'right' — default 'left'
  align?: 'left' | 'center' | 'right'
  // Optional: whether this column is sortable
  sortable?: boolean
  // Optional: minimum column width
  minWidth?: string
}

interface DataTableProps<T extends { id: number | string }> {
  data: T[]
  columns: Column<T>[]
  // Optional: callback when a row is clicked (highlights row)
  onRowClick?: (row: T) => void
  // Optional: ID of the currently selected row (for detail panel pattern)
  selectedRowId?: number | string | null
  // Show skeleton loader rows
  isLoading?: boolean
  // Number of skeleton rows to show when loading
  loadingRowCount?: number
  // Content to display when data is empty (after loading)
  emptyState?: React.ReactNode
  // Default empty message if emptyState not provided
  emptyMessage?: string
  // Optional: controlled sort state
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  // Optional: additional table class
  className?: string
}
```

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│ TABLE CONTAINER                                           │
│ bg-white rounded-lg shadow-light overflow-hidden          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ <thead> bg-gray-50 border-b border-gray-200        │  │
│  │ ┌──────────┬──────────┬──────────┬──────────────┐  │  │
│  │ │ NAME  ↑↓ │ EMAIL    │ CREATED  │ ACTIONS      │  │  │
│  │ │ (sorted) │          │          │              │  │  │
│  │ └──────────┴──────────┴──────────┴──────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  <tbody>                                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ROW 1 — bg-white hover:bg-gray-50 cursor-pointer   │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ROW 2 — bg-gray-50/50 (zebra stripe)               │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ROW 3 — bg-white (selected: bg-indigo-50)          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  EMPTY STATE (when data.length === 0 and !isLoading)     │
│  ┌────────────────────────────────────────────────────┐  │
│  │           [icon]                                   │  │
│  │     No clients yet.                                │  │
│  │     Add one to get started.                        │  │
│  │           [Add Client]                             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Row States

| State      | Background             | Border                    |
|------------|------------------------|---------------------------|
| Default    | `bg-white`             | `border-b border-gray-100`|
| Zebra odd  | `bg-gray-50/50`        | `border-b border-gray-100`|
| Hover      | `bg-gray-50`           | unchanged                 |
| Selected   | `bg-indigo-50`         | `border-b border-indigo-100` |
| Focused    | `bg-gray-50` + focus ring | `ring-2 ring-indigo-500 ring-inset` |

### Loading State (Skeleton)

When `isLoading={true}`:
- Render `loadingRowCount` (default: 5) skeleton rows
- Each cell contains a `<div>` with `animate-pulse bg-gray-200 rounded h-4 w-{random}`
- Column headers still render normally

### Empty State

When `data.length === 0` and `!isLoading`:
1. If `emptyState` prop provided: render it directly
2. Otherwise: render a default centered block with `emptyMessage` text

Default empty state structure:
```
<td colspan="{columns.length}">
  <div class="text-center py-16 px-6">
    <svg ...>  <!-- document/inbox icon, text-gray-300, 48px --></svg>
    <p class="mt-4 text-sm font-medium text-gray-900">{emptyMessage}</p>
    <p class="mt-1 text-sm text-gray-500">Get started by adding your first item.</p>
  </div>
</td>
```

### Sortable Headers

When `column.sortable={true}`:
```html
<th
  scope="col"
  aria-sort="ascending|descending|none"
  class="cursor-pointer select-none group ..."
>
  <button class="flex items-center gap-1 ...">
    {column.header}
    <svg aria-hidden="true"><!-- sort icon, changes direction --></svg>
  </button>
</th>
```

### Tailwind Classes (Core)

```
Container: w-full overflow-x-auto rounded-lg shadow-light
Table:     w-full divide-y divide-gray-200 text-left
THead:     bg-gray-50
TH:        px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap
TBody:     divide-y divide-gray-100 bg-white
TR:        transition-colors duration-150 hover:bg-gray-50
TD:        px-4 py-3 text-sm text-gray-900 whitespace-nowrap
```

### Accessibility

```html
<table role="grid" aria-label="{descriptive label}">
  <thead>
    <tr role="row">
      <th scope="col" aria-sort="none">Name</th>
      <th scope="col">Email</th>
      <!-- Actions column: no sort, no label needed -->
      <th scope="col"><span class="sr-only">Actions</span></th>
    </tr>
  </thead>
  <tbody>
    <tr
      role="row"
      tabindex="0"
      aria-selected="false|true"
      aria-label="Client: {name}, Email: {email}"
    >
      <td>...</td>
    </tr>
  </tbody>
</table>
```

Keyboard navigation:
- `Tab`: move focus to next interactive row or action button
- `Enter` / `Space`: activate `onRowClick` on focused row
- `Arrow Up` / `Arrow Down`: move between rows when `role="grid"` is present

### Responsive Behavior

- Mobile (< 640px): Table scrolls horizontally within `overflow-x-auto` container. Actions column always stays visible (consider `sticky right-0 bg-white`).
- sm (640px+): All columns visible
- Actions column: always contains icon buttons, not text buttons, to save space

---

## 4. FileUploadArea

**File:** `components/ui/FileUpload.tsx`
**Purpose:** Drag-and-drop or click-to-browse file input for the Client Portal upload flow and accountant-side file attachment. Supports progress indicators and file list preview.

### Props Interface

```typescript
interface FileUploadAreaProps {
  onFilesSelected: (files: File[]) => void
  // MIME types string, e.g. ".pdf,.docx,.xlsx,image/*"
  accept?: string
  // Maximum file size in bytes (default: 50MB = 52428800)
  maxSize?: number
  // Allow multiple file selection (default: true)
  multiple?: boolean
  // Show the file list after selection
  showFileList?: boolean
  // Upload progress map: filename -> 0-100
  uploadProgress?: Record<string, number>
  // Upload status per file
  uploadStatus?: Record<string, 'idle' | 'uploading' | 'complete' | 'error'>
  // Callback when a file is removed from the list
  onFileRemove?: (fileName: string) => void
  // Disabled state (while uploading)
  disabled?: boolean
  // Optional helper text below the zone
  helperText?: string
}
```

### Visual States

**1. Idle (default)**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         [Upload cloud icon — text-gray-300, 48px]      │
│                                                         │
│    Drag files here or click to browse                   │
│         text-base text-gray-600 font-medium            │
│                                                         │
│    PDF, DOCX, XLSX, PNG, JPG up to 50MB                 │
│         text-sm text-gray-400                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
border-2 border-dashed border-gray-300 rounded-modal
bg-white p-8 text-center cursor-pointer
transition-colors duration-200
```

**2. Drag Over (active)**
```
border-2 border-dashed border-indigo-500 rounded-modal
bg-indigo-50 p-8 text-center cursor-copy
```
- Border changes from `border-gray-300` to `border-indigo-500`
- Background changes to `bg-indigo-50` (`#EEF2FF`)
- Icon changes color to `text-indigo-400`
- Text updates to: "Drop files here"

**3. File List (after selection)**
```
┌─────────────────────────────────────────────┐
│ Idle drop zone (smaller variant, top)       │
│                                             │
├─────────────────────────────────────────────┤
│ SELECTED FILES                              │
│ ┌─────────────────────────────────────────┐ │
│ │ [PDF icon] report-2025.pdf    12.4 MB   │ │
│ │ [────────────────────] 67%  [×]         │ │
│ ├─────────────────────────────────────────┤ │
│ │ [IMG icon] photo.jpg          3.1 MB    │ │
│ │ [████████████████████] Done  [×]        │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**4. Error State (invalid file)**
```
border-2 border-dashed border-red-400 rounded-modal
bg-red-50 — brief flash then resets to idle
```
Error message below zone: `text-sm text-red-600 mt-2`

**5. Disabled State**
```
border-gray-200 bg-gray-50 cursor-not-allowed opacity-60
```

### Progress Indicator per File

Each file in the list shows an `UploadProgress` sub-component:

```
┌──────────────────────────────────────────────────────────────┐
│ [File type icon]  filename.pdf          3.2 MB        [×]    │
│ ──────────────────────────────────────────────────────────── │
│ [████████████████░░░░░░░] 72%           uploading...         │
└──────────────────────────────────────────────────────────────┘
```

Progress bar:
```
Track:    h-1.5 w-full bg-gray-200 rounded-full
Fill:     h-1.5 bg-indigo-600 rounded-full transition-[width] duration-300
Complete: bg-green-500
Error:    bg-red-500
```

### Validation Rules

| Rule               | Check                            | Error Message                              |
|--------------------|----------------------------------|--------------------------------------------|
| File size          | `file.size > maxSize`            | "File exceeds 50MB limit"                  |
| MIME type          | Not in allowed list              | "File type not accepted. Use PDF, DOCX..." |
| Empty drop         | `event.dataTransfer.files.length === 0` | (silent — no state change)          |

### Keyboard Trigger

The drop zone is a `<div>` with:
```html
<div
  role="button"
  tabindex="0"
  aria-label="Upload files. Press Enter to browse or drag files here."
  aria-describedby="upload-hint-{id}"
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
>
```

A visually hidden `<input type="file" />` is triggered programmatically.

### Accessibility

- `role="button"` on the drop zone with keyboard activation via `Enter`/`Space`
- `aria-label` describes both drag and keyboard interaction
- `aria-live="polite"` region below the zone announces: "3 files selected" or "Upload complete"
- File remove buttons: `aria-label="Remove {fileName}"`
- Progress bars: `role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Uploading {fileName}"`
- Error messages: `role="alert"` for immediate announcement

### Accepted File Types Reference

```typescript
export const ACCEPTED_TYPES = {
  documents: '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt',
  images:    '.png,.jpg,.jpeg,.gif,.webp',
  all:       '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp',
}

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]
```

---

## 5. FormField

**File:** `components/ui/FormField.tsx`
**Purpose:** Wraps a label, input/textarea/select, optional helper text, and error message into a single cohesive form field. Ensures consistent spacing, focus styles, and accessibility associations across all forms (Add Client, Create Request, Login, Signup).

### Props Interface

```typescript
type InputType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'textarea' | 'select'

interface FormFieldProps {
  // Form label text (visible)
  label: string
  // HTML name and id attribute (must be unique per form)
  name: string
  // Input type (default: 'text')
  type?: InputType
  // Controlled value
  value?: string
  // Change handler
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  // Error message — renders below input, sets aria-invalid
  error?: string
  // Helper text — renders below input when no error
  helperText?: string
  // Marks field as required (adds asterisk, sets aria-required)
  required?: boolean
  // Placeholder text
  placeholder?: string
  // For textarea: number of rows (default: 4)
  rows?: number
  // For select: option list
  options?: Array<{ value: string; label: string }>
  // Disabled state
  disabled?: boolean
  // Autocomplete hint for browsers
  autoComplete?: string
  // Additional class on the outer wrapper div
  className?: string
}
```

### Visual Structure

```
WRAPPER div (flex flex-col gap-1.5)
│
├── LABEL ROW
│   ├── <label htmlFor="{name}">
│   │   {label}
│   │   <span aria-hidden="true" class="text-red-500 ml-0.5"> *</span>  {/* if required */}
│   │   </label>
│
├── INPUT
│   <input id="{name}" name="{name}" ... />
│   OR <textarea ... />
│   OR <select ... />
│
└── HELPER / ERROR
    <p id="{name}-description">
      {error ? errorMessage : helperText}
    </p>
```

### Input Visual States

| State    | Border               | Background  | Ring                           | Text            |
|----------|----------------------|-------------|--------------------------------|-----------------|
| Default  | `border-gray-300`    | `bg-white`  | none                           | `text-gray-900` |
| Focus    | `border-indigo-500`  | `bg-white`  | `ring-2 ring-indigo-500/30`    | `text-gray-900` |
| Error    | `border-red-500`     | `bg-red-50` | `ring-2 ring-red-500/30` (on focus) | `text-gray-900` |
| Disabled | `border-gray-200`    | `bg-gray-50`| none                           | `text-gray-400` |
| Filled   | `border-gray-300`    | `bg-white`  | none                           | `text-gray-900` |

### Tailwind Classes (Core)

```
Wrapper:   flex flex-col gap-1.5
Label:     text-sm font-medium text-gray-700
Required:  text-red-500 ml-0.5 (aria-hidden="true")

Input base:
  w-full px-3 py-2.5 text-sm text-gray-900
  bg-white border border-gray-300 rounded-standard
  placeholder:text-gray-400
  transition-colors duration-200
  focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed

Input error variant (applied when error prop is present):
  border-red-500 bg-red-50
  focus:border-red-500 focus:ring-2 focus:ring-red-500/30

HelperText: text-sm text-gray-500
ErrorText:  text-sm text-red-600 font-medium flex items-center gap-1
            (with small exclamation icon: aria-hidden="true")
```

### Error Rendering

```html
<!-- Error message region — only rendered when error prop is non-empty -->
<p
  id="{name}-description"
  role="alert"
  class="text-sm text-red-600 font-medium flex items-center gap-1 mt-1"
>
  <svg aria-hidden="true" focusable="false" class="w-4 h-4 flex-shrink-0">
    <!-- exclamation-circle icon -->
  </svg>
  {error}
</p>
```

When no error:
```html
<p id="{name}-description" class="text-sm text-gray-500 mt-1">
  {helperText}
</p>
```

### Required Indicator

Visual: Red asterisk ` *` after label text.
Accessible: `aria-required="true"` on the input (not just visual). The asterisk span has `aria-hidden="true"` so screen readers don't read "asterisk".

### Accessibility

```html
<div>
  <label for="client-name">
    Client Name
    <span aria-hidden="true" class="text-red-500"> *</span>
  </label>

  <input
    id="client-name"
    name="client-name"
    type="text"
    aria-required="true"
    aria-invalid="true|false"
    aria-describedby="client-name-description"
    class="..."
  />

  <p id="client-name-description" role="alert">
    <!-- error message OR helper text -->
  </p>
</div>
```

Key associations:
- `label[for]` ↔ `input[id]`: associates label with input
- `aria-describedby` ↔ `p[id]`: associates error/helper with input
- `aria-required="true"` when `required={true}`
- `aria-invalid="true"` when `error` prop is non-empty string
- `role="alert"` on error paragraph: announces error to screen readers without requiring focus

### Dark Mode

```
dark:Label:      dark:text-gray-300
dark:Input:      dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500
dark:InputFocus: dark:border-indigo-400 dark:ring-indigo-400/30
dark:InputError: dark:border-red-400 dark:bg-red-900/20
dark:Helper:     dark:text-gray-400
dark:Error:      dark:text-red-400
```

---

## Component Composition Patterns

### Add Client Modal (Modal + FormField)

```
<Modal isOpen={...} onClose={...} title="Add Client" size="md"
  footer={
    <div class="flex gap-3 justify-end">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Add Client</button>
    </div>
  }
>
  <form class="flex flex-col gap-5">
    <FormField label="Name" name="name" required />
    <FormField label="Email" name="email" type="email" />
    <FormField label="Phone" name="phone" type="tel" />
    <FormField label="Company" name="company" />
    <FormField label="Notes" name="notes" type="textarea" rows={3} />
  </form>
</Modal>
```

### Requests Table Row (DataTable + StatusBadge)

```
columns={[
  { header: 'Title', accessor: 'title' },
  { header: 'Client', accessor: 'client_name' },
  { header: 'Due Date', accessor: 'due_date' },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={row.status} />,
  },
  {
    header: 'Actions',
    accessor: (row) => <ActionsMenu requestId={row.id} />,
  },
]}
```

---

## Shared Button Styles (Referenced by All Components)

```
btn-primary:
  inline-flex items-center justify-center gap-2
  px-4 py-2.5 text-sm font-semibold text-white
  bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
  rounded-standard border border-transparent
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200

btn-secondary:
  inline-flex items-center justify-center gap-2
  px-4 py-2.5 text-sm font-semibold text-gray-700
  bg-white hover:bg-gray-50 active:bg-gray-100
  rounded-standard border border-gray-300
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200

btn-danger:
  inline-flex items-center justify-center gap-2
  px-4 py-2.5 text-sm font-semibold text-white
  bg-red-600 hover:bg-red-700 active:bg-red-800
  rounded-standard border border-transparent
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-200
```

Minimum touch target: `min-h-[44px]` on mobile (applied via responsive class `min-h-touch-sm sm:min-h-auto`).
