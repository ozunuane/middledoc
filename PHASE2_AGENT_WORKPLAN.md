# Phase 2 Agent Work Plan — Accountant Client Hub

Generated: 2026-06-23
Status: Ready for agent execution

---

## Codebase Audit Summary (Phase 1 Baseline)

Before assigning work, key facts were extracted from the live codebase:

| Item | Detail |
|---|---|
| Framework | Next.js App Router (confirmed by `app/` directory layout) |
| Auth pattern | Cookie-based JWT (`token` httpOnly cookie, 7-day expiry) |
| Auth middleware | `@/lib/middleware` -> `withAuth(request, handler)` |
| DB layer | `@/lib/db` -> `query(sql, params)` — raw pg, no ORM |
| DB user | `accountants` table with `id`, `email`, `password_hash`, `name` |
| Docker | `docker-compose.yml` runs postgres:15-alpine + app container |
| Upload volume | `./uploads:/app/uploads` already mounted in compose |
| Alias | `@/*` maps to project root via tsconfig paths |
| TypeScript | strict mode, target ES2017, moduleResolution bundler |
| Styling | Tailwind CSS + Geist font via `next/font/google` |
| Scripts dir | `scripts/init.sql` referenced in compose but not yet created |

CRITICAL — AGENTS.md constraint: This Next.js version has breaking changes. All agents must read `node_modules/next/dist/docs/` before writing code. Key confirmed differences already observed:
- Data refresh uses `refresh()` from `next/cache` (not `router.refresh()`)
- Route Handler params must be awaited: `const { id } = await ctx.params`
- `cookies()` and `headers()` are async and must be awaited
- Cache invalidation uses `revalidatePath` / `revalidateTag` / `updateTag`
- Server Functions use `'use server'` directive, not API routes, for mutations where appropriate

---

## Agent Roster and Role Assignments

### Agent 1 — Fullstack Developer
Primary owner: database schema, all Route Handlers, file I/O, server-side validation.

### Agent 2 — UI/UX Designer
Primary owner: design system tokens, component specifications, page wireframes, accessibility specs, responsive breakpoints.

### Agent 3 — Frontend Specialist
Primary owner: all React components, client state management, API integration hooks, form handling.

### Agent 4 — QA Expert
Primary owner: test suite scaffolding, E2E plans, testing checklists, CI integration points, bug templates.

---

## Dependency Graph and Sequencing

### Wave 0 — Foundation (Day 1, all agents in parallel, no cross-agent dependencies)

These tasks have no inbound dependencies and can start immediately.

| Agent | Wave 0 Task | Output |
|---|---|---|
| Fullstack Developer | Write `scripts/init.sql` with full Phase 2 schema | SQL file, Docker re-init instructions |
| Fullstack Developer | Create `lib/db.ts` (already imported; confirm it exists or create it) and `lib/auth.ts` | Shared utility modules |
| UI/UX Designer | Define design tokens: color palette, typography scale, spacing, breakpoints | `styles/tokens.ts` or Tailwind config extensions |
| UI/UX Designer | Write component specification docs for all 5 component groups | Spec docs used by Frontend Specialist |
| QA Expert | Set up test infrastructure: Vitest config, testing library, mock DB helper | `vitest.config.ts`, test helpers |
| QA Expert | Write bug report template and testing checklist documents | `docs/BUG_TEMPLATE.md`, `docs/TEST_CHECKLIST.md` |

### Wave 1 — Backend Core (Day 2-3, Fullstack Developer leads)

Unblocks: Frontend Specialist (needs real endpoints), QA Expert (needs routes to test).

| Task | File Path | Notes |
|---|---|---|
| Clients API | `app/api/clients/route.ts` | GET + POST handlers |
| Delete client | `app/api/clients/[id]/route.ts` | DELETE handler, ownership check |
| Document Requests API | `app/api/requests/route.ts` | GET + POST handlers |
| Patch request status | `app/api/requests/[id]/route.ts` | PATCH handler |
| Request details | `app/api/requests/[id]/details/route.ts` | GET handler |
| File upload | `app/api/upload/route.ts` | POST, write to `/app/uploads/` |
| List files | `app/api/files/[requestId]/route.ts` | GET handler |
| Delete file | `app/api/files/[fileId]/route.ts` | DELETE handler |
| Portal (public) | `app/api/portal/[shareToken]/route.ts` | GET, no auth required |
| Portal upload (public) | `app/api/portal/[shareToken]/upload/route.ts` | POST, no auth required |
| Dashboard stats query | `lib/queries/stats.ts` | Aggregation functions |
| Status tracking stored procedures | In `scripts/init.sql` additions | Postgres functions |
| DB indices | In `scripts/init.sql` additions | clients, requests, files tables |

### Wave 1 — Design System (Day 2-3, UI/UX Designer leads)

Runs in parallel with Wave 1 backend. Unblocks Frontend Specialist.

| Task | Output | Notes |
|---|---|---|
| Tailwind config extension | `tailwind.config.ts` updates | Brand colors, custom spacing |
| Modal/dialog system | `components/ui/Modal.tsx` spec | Backdrop, focus trap, keyboard dismiss |
| Status badge variants | `components/ui/StatusBadge.tsx` spec | pending/received/overdue/complete |
| Data table layout | `components/ui/DataTable.tsx` spec | Sortable columns, empty states |
| Form input system | `components/ui/FormField.tsx` spec | Label, input, error message, helper text |
| File upload area spec | `components/ui/FileUpload.tsx` spec | Drag-drop zone, progress bar, file list |
| Mobile breakpoints doc | Written spec | sm:640 md:768 lg:1024 xl:1280 |
| Clients page wireframe | Written layout spec | List + modal overlay pattern |
| Requests page wireframe | Written layout spec | Table + sidebar details pattern |
| Portal page wireframe | Written layout spec | Centered card, mobile-first |
| Dashboard enhancements wireframe | Written layout spec | Stats + quick actions + activity |

### Wave 2 — Frontend Components (Day 3-4, Frontend Specialist leads)

Blocked on: Wave 1 backend endpoints (for real data shapes) + Wave 1 design specs.
Frontend Specialist and UI/UX Designer should maintain a shared Slack/sync channel for live spec questions.

| Task | File Path | Blocked On |
|---|---|---|
| Shared layout + nav | `app/(dashboard)/layout.tsx` | Wave 1 design tokens |
| Auth hook | `hooks/useAuth.ts` | Phase 1 auth routes |
| API client module | `lib/api.ts` | Wave 1 backend endpoints |
| Clients list page | `app/(dashboard)/clients/page.tsx` | Clients API, design specs |
| Add client modal | `components/clients/AddClientModal.tsx` | Form component spec |
| Delete client confirmation | `components/clients/DeleteClientDialog.tsx` | Modal spec |
| Requests list page | `app/(dashboard)/requests/page.tsx` | Requests API, design specs |
| Create request form | `components/requests/CreateRequestForm.tsx` | Form spec |
| Request details view | `components/requests/RequestDetails.tsx` | Details API |
| Status badge component | `components/ui/StatusBadge.tsx` | Design spec |
| Upcoming deadlines widget | `components/requests/DeadlinesWidget.tsx` | Requests API |
| Dashboard stats (live) | `app/(dashboard)/dashboard/page.tsx` | Stats query API |
| Quick actions bar | `components/dashboard/QuickActions.tsx` | Design spec |
| Recent activity feed | `components/dashboard/ActivityFeed.tsx` | Requests + files APIs |
| Portal page (public) | `app/portal/[shareToken]/page.tsx` | Portal API |
| Portal file upload UI | `components/portal/PortalUpload.tsx` | Upload API, file upload spec |
| Share link generator | `components/requests/ShareLinkGenerator.tsx` | Portal API |
| Upload progress component | `components/ui/UploadProgress.tsx` | File upload spec |
| Data table component | `components/ui/DataTable.tsx` | Design spec |
| Reusable form field | `components/ui/FormField.tsx` | Design spec |

### Wave 2 — QA Test Authoring (Day 3-4, QA Expert leads)

Runs in parallel with Frontend wave. Blocked on Wave 1 backend (need endpoint contracts).

| Task | File Path | Notes |
|---|---|---|
| API unit tests — Clients | `__tests__/api/clients.test.ts` | Mock db query |
| API unit tests — Requests | `__tests__/api/requests.test.ts` | Mock db query |
| API unit tests — Upload | `__tests__/api/upload.test.ts` | Mock fs, mock db |
| API unit tests — Portal | `__tests__/api/portal.test.ts` | Public route, no auth |
| Auth middleware tests | `__tests__/lib/middleware.test.ts` | JWT validation scenarios |
| DB query function tests | `__tests__/lib/queries.test.ts` | Stats aggregation |
| Component tests — StatusBadge | `__tests__/components/StatusBadge.test.tsx` | Variant rendering |
| Component tests — DataTable | `__tests__/components/DataTable.test.tsx` | Sort, empty state |
| Component tests — FileUpload | `__tests__/components/FileUpload.test.tsx` | Drag-drop, progress |
| Component tests — forms | `__tests__/components/forms.test.tsx` | Validation messages |
| E2E plan document | `docs/E2E_TEST_PLAN.md` | Full user flow descriptions |

### Wave 3 — Integration and Wiring (Day 5, all agents)

Blocked on Wave 2 completion. This is the integration phase where components connect to real APIs.

| Agent | Task |
|---|---|
| Frontend Specialist | Wire all components to `lib/api.ts`, replace hardcoded zeros in dashboard |
| Frontend Specialist | Implement optimistic UI updates using `useTransition` / `useActionState` |
| Fullstack Developer | Validate all endpoint error responses match what frontend expects |
| Fullstack Developer | Add request body validation middleware |
| UI/UX Designer | Accessibility audit pass: ARIA labels, keyboard nav, focus management |
| QA Expert | Execute manual testing checklist, file bugs in template |
| QA Expert | Run E2E flows against local Docker stack |

### Wave 4 — Polish and Hardening (Day 6-7)

| Agent | Task |
|---|---|
| Fullstack Developer | Add rate limiting on upload and portal endpoints |
| Fullstack Developer | Sanitize file names, validate MIME types on upload |
| Frontend Specialist | Responsive breakpoint QA across all pages |
| Frontend Specialist | Loading skeleton states for all async data |
| UI/UX Designer | Final mobile design review (sm breakpoint) |
| QA Expert | Coverage report — confirm >80% on all API routes |
| QA Expert | WCAG 2.1 AA checklist sign-off |
| All agents | Final Docker integration test on clean environment |

---

## Detailed Agent Assignments

---

### Fullstack Developer Agent — Complete Task List

#### Wave 0 Tasks

1. Create or confirm `lib/db.ts` exists with the `query` export already used by auth routes. If missing, create it with pg Pool using `DATABASE_URL` env var.

2. Create or confirm `lib/auth.ts` with `hashPassword`, `verifyPassword`, `createToken`, and `withAuth` exports.

3. Create `scripts/init.sql` with the following schema additions to the existing `accountants` table:

```sql
-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document requests table
CREATE TABLE IF NOT EXISTS document_requests (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','received','overdue','complete')),
  due_date DATE,
  share_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  original_name VARCHAR(500) NOT NULL,
  stored_name VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_clients_accountant ON clients(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_accountant ON document_requests(accountant_id);
CREATE INDEX IF NOT EXISTS idx_requests_client ON document_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_share_token ON document_requests(share_token);
CREATE INDEX IF NOT EXISTS idx_requests_status ON document_requests(status);
CREATE INDEX IF NOT EXISTS idx_files_request ON uploaded_files(request_id);
```

#### Wave 1 Tasks — Route Handlers

Route Handler conventions (confirmed from this Next.js version's docs):
- Dynamic params: `const { id } = await ctx.params` (params is a Promise, must await)
- Use `RouteContext<'/api/clients/[id]'>` type from the globally available helper
- Return `Response.json(data)` not `NextResponse.json(data)` where possible (both work but native is preferred)
- Do NOT export `dynamic = 'force-static'` on any of these routes (they hit the database)

File: `app/api/clients/route.ts`
- GET: `withAuth`, query clients WHERE accountant_id = accountantId, return array
- POST: `withAuth`, validate name required, insert client, return 201

File: `app/api/clients/[id]/route.ts`
- DELETE: `withAuth`, verify client.accountant_id === accountantId before deleting, return 204

File: `app/api/requests/route.ts`
- GET: `withAuth`, JOIN clients, return requests with client name
- POST: `withAuth`, validate title + client_id required, insert, return 201 with share_token

File: `app/api/requests/[id]/route.ts`
- PATCH: `withAuth`, verify ownership, update status field only (whitelist the value), return 200

File: `app/api/requests/[id]/details/route.ts`
- GET: `withAuth`, JOIN clients + uploaded_files, return full detail object

File: `app/api/upload/route.ts`
- POST: `withAuth`, parse multipart using native Request (no formidable needed in App Router), write file to `/app/uploads/{requestId}/{uuid}-{safename}`, insert record into uploaded_files, return 201
- Validate: file size < 50MB, allowed MIME types, sanitize filename

File: `app/api/files/[requestId]/route.ts`
- GET: `withAuth`, verify request ownership, return file list

File: `app/api/files/[fileId]/route.ts`
- DELETE: `withAuth`, verify ownership via JOIN, delete DB record, delete from filesystem, return 204

File: `app/api/portal/[shareToken]/route.ts`
- GET: NO auth. Validate shareToken exists, return request title + file list. Return 404 if not found.

File: `app/api/portal/[shareToken]/upload/route.ts`
- POST: NO auth. Validate shareToken, write file, insert uploaded_files record, return 201.

File: `lib/queries/stats.ts`
- `getDashboardStats(accountantId)`: single query returning total_clients, pending_requests, received_documents, overdue_requests
- `getRecentActivity(accountantId, limit)`: recent uploads + status changes

#### Typing convention for Route Handlers with dynamic segments
```ts
// Confirmed pattern from this Next.js version's docs:
import type { NextRequest } from 'next/server'

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/clients/[id]'>) {
  const { id } = await ctx.params
  // ...
}
```

---

### UI/UX Designer Agent — Complete Task List

#### Wave 0 Tasks

1. Extend `tailwind.config.ts` with custom colors matching the existing indigo/gray palette already in Phase 1 components:
   - Primary: indigo-600 (#4F46E5), hover: indigo-700
   - Danger: red-600 (#DC2626)
   - Success: green-600 (#16A34A)
   - Warning: yellow-600 (#CA8A04)
   - Neutral: gray-50 background, gray-900 headings, gray-600 body text

2. Establish typography scale (document for Frontend Specialist):
   - Page headings: text-3xl font-bold text-gray-900 (matches Phase 1 dashboard h1)
   - Section headings: text-2xl font-bold
   - Card labels: text-sm font-semibold text-gray-500 (matches Phase 1 stat labels)
   - Body: text-base text-gray-600
   - Small/helper: text-sm text-gray-500

3. Responsive breakpoint contract:
   - Mobile: default (< 640px) — single column, stacked nav
   - sm: 640px — not typically targeted
   - md: 768px — two-column layouts begin
   - lg: 1024px — three-column layouts, sidebar patterns
   - xl: 1280px — max-w-6xl content area (matches Phase 1 max-w-6xl mx-auto)

#### Wave 1 Tasks — Component Specifications

Each spec must include: props interface, visual states (default/hover/disabled/error), accessibility requirements (ARIA roles, keyboard interactions), and Tailwind class suggestions.

Component: `StatusBadge`
- Props: `status: 'pending' | 'received' | 'overdue' | 'complete'`
- Variants: yellow pill (pending), green (received), red (overdue), gray (complete)
- ARIA: role="status" with aria-label

Component: `Modal`
- Props: `isOpen`, `onClose`, `title`, `children`, `size?: 'sm' | 'md' | 'lg'`
- Behavior: focus trap on open, Escape key closes, backdrop click closes
- ARIA: role="dialog", aria-modal="true", aria-labelledby pointing to title

Component: `DataTable`
- Props: `columns`, `data`, `onRowClick?`, `emptyMessage`
- Features: column headers as th with scope="col", zebra striping, hover row highlight
- Empty state: centered message with call-to-action

Component: `FormField`
- Props: `label`, `name`, `type`, `error?`, `helperText?`, `required?`
- States: default border-gray-300, focus ring-2 ring-indigo-500, error border-red-500
- ARIA: aria-required, aria-invalid, aria-describedby linking to error message

Component: `FileUpload`
- Props: `onFilesSelected`, `accept?`, `maxSize?`, `multiple?`
- States: idle (dashed border), drag-over (indigo border + bg-indigo-50), uploading (progress bar), complete
- ARIA: role="button" on drop zone, keyboard activatable, announce upload completion

#### Page Wireframe Specifications

Clients Page (`/clients`):
- Header row: "Clients" h1 left, "Add Client" button right
- Search input full width below header
- DataTable: Name | Email | Company | Actions columns
- Add Client modal: Name (required), Email, Phone, Company, Notes fields
- Delete confirmation dialog with client name in message

Requests Page (`/requests`):
- Header row: "Document Requests" h1 left, "New Request" button right
- Status filter tabs: All | Pending | Received | Overdue
- DataTable: Title | Client | Due Date | Status | Actions
- Right panel (lg+ screens): selected request details with file list
- Upcoming deadlines widget: card below header showing requests due within 7 days

Portal Page (`/portal/[shareToken]`):
- No navigation header (public, unauthenticated)
- Centered card max-w-lg
- Accountant name + request title as context
- FileUpload component prominent
- Success state: check icon + "Files received" message
- Mobile-first: single column, large tap targets

Dashboard Enhancements:
- Keep existing 3-stat cards but wire to live data
- Add Quick Actions row below stats: "Add Client" and "New Request" buttons
- Recent Activity list: avatar-less timeline of last 10 events

---

### Frontend Specialist Agent — Complete Task List

#### Pre-requisites to read before writing any code
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

#### Architecture Decisions

State management: No external state library. Use React built-ins:
- `useState` for local UI state (modal open, form values)
- `useTransition` for async mutations with pending UI
- `useActionState` for form submissions
- Context (sparingly) for auth user across dashboard layout
- SWR or native fetch + `use()` hook for data fetching in Server Components where possible

API client: Create `lib/api.ts` as a typed fetch wrapper:
- All authenticated requests go through this module
- It reads no cookies directly — auth is automatic via httpOnly cookie on same-origin requests
- Return typed response objects or throw typed errors

#### Wave 2 Tasks — File by File

File: `app/(dashboard)/layout.tsx`
- Server Component
- Renders persistent sidebar navigation and top header
- Sidebar links: Dashboard, Clients, Requests
- Fetch current user via `@/lib/auth` server-side (not client useEffect)
- Logout button as a Client Component island with Server Action

File: `hooks/useAuth.ts`
- Client hook for pages that still need auth state
- Wraps `fetch('/api/auth/me')` with loading/error states

File: `lib/api.ts`
- Typed fetch wrapper
- Functions: `getClients()`, `createClient(data)`, `deleteClient(id)`
- Functions: `getRequests()`, `createRequest(data)`, `updateRequestStatus(id, status)`, `getRequestDetails(id)`
- Functions: `uploadFile(requestId, file)`, `getFiles(requestId)`, `deleteFile(fileId)`
- Functions: `getDashboardStats()`, `getRecentActivity()`
- All return typed interfaces, throw on non-2xx

File: `app/(dashboard)/clients/page.tsx`
- Server Component — fetch initial client list server-side
- Render `ClientsTable` with initial data
- Include `AddClientButton` (Client Component) for modal trigger

File: `components/clients/ClientsTable.tsx`
- Client Component
- Renders DataTable with client data
- Search filter runs client-side on fetched data (no debounced API call for MVP)
- Delete button triggers DeleteClientDialog

File: `components/clients/AddClientModal.tsx`
- Client Component
- Controlled form with `useActionState`
- Call `createClient()` from `lib/api.ts`
- On success: close modal, call `router.refresh()` to re-fetch server data

File: `components/clients/DeleteClientDialog.tsx`
- Client Component
- Confirm dialog showing client name
- Call `deleteClient(id)` then `router.refresh()`

File: `app/(dashboard)/requests/page.tsx`
- Server Component — fetch initial requests list
- Status filter implemented as URL search params (use `searchParams` prop)
- Render `RequestsTable`

File: `components/requests/RequestsTable.tsx`
- Client Component
- DataTable with StatusBadge in status column
- Row click opens RequestDetails panel (slide-in on lg+, modal on mobile)

File: `components/requests/CreateRequestForm.tsx`
- Client Component
- Fields: Title, Client (select from fetched clients list), Due Date, Description
- `useActionState` for submission
- On success: `revalidatePath('/requests')` via Server Action

File: `components/requests/RequestDetails.tsx`
- Client Component
- Displays full request info + file list
- Include `ShareLinkGenerator` sub-component
- Include `FileUpload` for accountant to see uploaded files

File: `components/requests/ShareLinkGenerator.tsx`
- Client Component
- Displays `${window.location.origin}/portal/${shareToken}`
- Copy to clipboard button with confirmation feedback

File: `components/requests/DeadlinesWidget.tsx`
- Can be Server Component
- Fetch requests with due_date within 7 days
- Render as card with sorted list

File: `app/(dashboard)/dashboard/page.tsx`
- Server Component
- Fetch live stats via `getDashboardStats()`
- Replace hardcoded zeros with real counts
- Include QuickActions and ActivityFeed

File: `components/dashboard/QuickActions.tsx`
- Client Component
- "Add Client" button triggers modal
- "New Request" button triggers modal or navigates

File: `components/dashboard/ActivityFeed.tsx`
- Server Component
- Render recent activity from `getRecentActivity()`

File: `app/portal/[shareToken]/page.tsx`
- Server Component (no auth)
- Fetch portal data via `getPortalData(shareToken)`
- If not found, render 404 UI (not a Next.js notFound() since it's public)
- Render `PortalUpload` Client Component

File: `components/portal/PortalUpload.tsx`
- Client Component
- FileUpload component wired to `/api/portal/[shareToken]/upload`
- Show progress, show success confirmation
- No navigation, no auth UI

File: `components/ui/StatusBadge.tsx`
- Pure presentational Client Component
- Props per UI/UX Designer spec

File: `components/ui/DataTable.tsx`
- Client Component
- Props per UI/UX Designer spec

File: `components/ui/Modal.tsx`
- Client Component
- Focus trap using `useEffect` + `ref`
- Escape key handler

File: `components/ui/FormField.tsx`
- Client Component
- Controlled input with forwarded ref

File: `components/ui/FileUpload.tsx`
- Client Component
- Native drag-drop events
- `<input type="file" />` hidden, triggered by drop zone click
- Upload progress via `XMLHttpRequest` (supports progress events, unlike fetch)

File: `components/ui/UploadProgress.tsx`
- Pure presentational
- Props: `progress: number`, `fileName: string`, `status: 'uploading' | 'complete' | 'error'`

---

### QA Expert Agent — Complete Task List

#### Wave 0 Tasks

1. Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['node_modules', '.next'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

2. Create `__tests__/setup.ts` with `@testing-library/jest-dom` matchers import and mock for `next/navigation`.

3. Create `__tests__/helpers/db-mock.ts` — mock factory for the `query` function from `lib/db.ts` using `vi.mock`.

4. Create `__tests__/helpers/auth-mock.ts` — mock for `withAuth` that injects a test accountantId.

5. Create `docs/BUG_TEMPLATE.md`:
```
## Bug Report

**Title**: [Short description]
**Severity**: Critical / High / Medium / Low
**Reporter**: [Agent or tester name]
**Date**:

### Steps to Reproduce
1.
2.
3.

### Expected Behavior

### Actual Behavior

### Environment
- Browser:
- Screen size:
- Docker version:

### Screenshots / Logs

### Suggested Fix
```

6. Create `docs/TEST_CHECKLIST.md` (see Wave 4 section).

#### Wave 2 Tasks — Test Files

File: `__tests__/api/clients.test.ts`
- Test GET returns 401 without auth
- Test GET returns empty array when no clients
- Test GET returns clients belonging only to auth'd accountant
- Test POST validates name is required
- Test POST inserts and returns 201
- Test DELETE rejects wrong accountant_id (403)
- Test DELETE removes record and returns 204

File: `__tests__/api/requests.test.ts`
- Test all CRUD paths including status whitelist validation
- Test PATCH rejects invalid status values

File: `__tests__/api/upload.test.ts`
- Test POST rejects oversized files
- Test POST rejects disallowed MIME types
- Test POST writes to correct directory path
- Test POST inserts DB record with correct fields

File: `__tests__/api/portal.test.ts`
- Test GET with invalid token returns 404
- Test GET with valid token returns request + files without auth cookie
- Test POST upload works without auth cookie
- Test POST with invalid token returns 404

File: `__tests__/lib/middleware.test.ts`
- Test `withAuth` rejects missing cookie (401)
- Test `withAuth` rejects expired JWT (401)
- Test `withAuth` calls handler with correct accountantId

File: `__tests__/lib/queries.test.ts`
- Test `getDashboardStats` returns correct structure
- Test `getRecentActivity` respects limit parameter

File: `__tests__/components/StatusBadge.test.tsx`
- Renders correct text for each status variant
- Has correct aria-label
- Applies correct color class per variant

File: `__tests__/components/DataTable.test.tsx`
- Renders column headers
- Renders rows from data prop
- Renders empty message when data is empty array
- Calls onRowClick with correct row data

File: `__tests__/components/FileUpload.test.tsx`
- Renders upload drop zone
- Handles file drop event
- Shows error for oversized file
- Shows progress bar during upload (mock XMLHttpRequest)

File: `__tests__/components/forms.test.tsx`
- AddClientModal: shows validation error when name empty
- AddClientModal: calls createClient on valid submit
- CreateRequestForm: shows client select populated from prop
- FormField: shows error message when error prop provided
- FormField: aria-invalid set to true when error present

File: `docs/E2E_TEST_PLAN.md`
- Full user workflow: signup -> create client -> create request -> copy portal link -> upload via portal -> verify received in dashboard
- Cross-browser targets: Chrome, Firefox, Safari (macOS)
- Mobile test: Chrome DevTools iPhone 14 simulation
- Accessibility test: keyboard-only navigation through all pages

#### Wave 4 Tasks — `docs/TEST_CHECKLIST.md` contents

```markdown
# Manual Testing Checklist — Phase 2

## Pre-test setup
- [ ] Docker stack running (docker-compose up -d)
- [ ] Fresh DB (or known seed state)
- [ ] No existing session cookie

## Authentication
- [ ] Cannot access /dashboard without auth
- [ ] Cannot access /clients without auth
- [ ] Cannot access /requests without auth
- [ ] Can access /portal/[token] without auth

## Clients
- [ ] Add client with all fields
- [ ] Add client with name only (optional fields blank)
- [ ] Cannot add client without name (error shown)
- [ ] Search filters client list correctly
- [ ] Delete client shows confirmation dialog
- [ ] Confirm delete removes client from list
- [ ] Cancel delete does nothing

## Document Requests
- [ ] Create request with all fields
- [ ] Cannot create request without title (error shown)
- [ ] Status badges display correct colors
- [ ] Status filter tabs update list
- [ ] Overdue badge shown for past due dates
- [ ] Share link copies to clipboard
- [ ] Paste share link in incognito tab opens portal

## File Upload (Portal)
- [ ] Portal page loads without auth cookie
- [ ] Drop zone accepts PDF, DOCX, XLSX, PNG, JPG
- [ ] Drop zone rejects exe, zip files
- [ ] Progress bar shows during upload
- [ ] Success message shown after upload
- [ ] Uploaded file appears in accountant's request details

## Dashboard
- [ ] Total Clients count accurate
- [ ] Pending Requests count accurate
- [ ] Documents Received count accurate
- [ ] Recent activity shows latest uploads
- [ ] Quick Actions navigate correctly

## Responsive / Mobile
- [ ] Dashboard usable at 375px width
- [ ] Clients page usable at 375px width
- [ ] Requests page usable at 375px width
- [ ] Portal page usable at 375px width
- [ ] No horizontal scroll at any breakpoint

## Accessibility (WCAG 2.1 AA)
- [ ] All interactive elements reachable by Tab key
- [ ] Modal traps focus correctly
- [ ] Escape key closes modals
- [ ] Status badges have aria-label
- [ ] Form fields have associated labels
- [ ] Error messages linked via aria-describedby
- [ ] Color contrast >= 4.5:1 for all text
- [ ] Images have alt text (file icons etc.)

## Performance
- [ ] Dashboard loads in < 3s on localhost
- [ ] File upload of 5MB file completes without timeout
- [ ] 50+ clients list renders without visible lag
```

---

## Communication and Handoff Protocol

### Shared Type Definitions (Contract Layer)

The Fullstack Developer must publish type definitions before Frontend Specialist begins Wave 2. Create `types/index.ts`:

```ts
export interface Client {
  id: number
  accountant_id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRequest {
  id: number
  accountant_id: number
  client_id: number
  client_name: string  // JOIN result
  title: string
  description: string | null
  status: 'pending' | 'received' | 'overdue' | 'complete'
  due_date: string | null
  share_token: string
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: number
  request_id: number
  original_name: string
  mime_type: string | null
  size_bytes: number | null
  uploaded_at: string
}

export interface DashboardStats {
  total_clients: number
  pending_requests: number
  received_documents: number
  overdue_requests: number
}

export interface ActivityItem {
  type: 'upload' | 'status_change' | 'client_added'
  description: string
  timestamp: string
  request_id?: number
  client_id?: number
}
```

### Handoff Gates

Gate 1 (End of Wave 0): Fullstack Developer publishes `types/index.ts` and confirms DB schema. Frontend Specialist unblocked to write API client stubs.

Gate 2 (End of Wave 1): Fullstack Developer has all Route Handlers returning correct shapes. Frontend Specialist switches from stub data to real API calls. QA Expert begins writing API tests.

Gate 3 (End of Wave 2): All components built and locally testable. UI/UX Designer does accessibility pass. QA Expert runs test suite.

Gate 4 (End of Wave 3): Integration complete, all tests passing, manual checklist executed. Ready for beta.

---

## Timeline Summary

| Day | Wave | Agents Active | Key Output |
|---|---|---|---|
| 1 | Wave 0 | All agents | Schema SQL, design tokens, test infra |
| 2-3 | Wave 1 | Fullstack + UI/UX | All API routes, design specs |
| 3-4 | Wave 2 | Frontend + QA | All components, test files |
| 5 | Wave 3 | All agents | Integration, wiring, accessibility audit |
| 6-7 | Wave 4 | All agents | Polish, coverage, manual checklist |

Total estimated duration: 7 working days with all 4 agents running in parallel.

---

## Technical Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Next.js breaking changes not accounted for | High | High | All agents must read `node_modules/next/dist/docs/` before coding. AGENTS.md is explicit about this. |
| `ctx.params` not awaited in dynamic routes | High | Medium | Add to code review checklist. QA will catch 500 errors in API tests. |
| File upload: multipart parsing in App Router differs from Pages Router | Medium | High | Fullstack Developer to prototype upload route first and share pattern. |
| `lib/db.ts` and `lib/auth.ts` not yet created | High | High | Fullstack Developer Wave 0 priority #1. |
| `scripts/init.sql` not seeded in running container | Medium | High | Document manual `docker-compose down -v && docker-compose up` reset procedure. |
| Portal route accessible without rate limiting | Low | Medium | Add rate limiting in Wave 4, not a blocker for MVP. |
| File MIME type spoofing on portal upload | Medium | Medium | Validate both Content-Type header and file magic bytes in upload handler. |
| TypeScript strict mode catches type errors at compile time | Low | Low | Benefit, not risk. Run `npx tsc --noEmit` as part of CI. |
| Coverage target >80% missed on portal routes | Medium | Low | QA Expert to prioritize portal test file. |

---

## Success Metrics Per Agent

### Fullstack Developer
- All 10 Route Handler files created and returning correct HTTP status codes
- `scripts/init.sql` creates schema cleanly on fresh Docker container
- `types/index.ts` published and matches actual DB query return shapes
- Upload route rejects oversized and disallowed files
- Portal routes return 404 on invalid shareToken

### UI/UX Designer
- Design token file extends Tailwind config with project palette
- All 5 component specifications written with props interface + accessibility requirements
- All 4 page wireframes documented with layout decisions
- WCAG 2.1 AA checklist completed and signed off in Wave 4
- Responsive breakpoint contract followed by Frontend Specialist confirmed in Wave 3 review

### Frontend Specialist
- All 20+ component files created with no TypeScript errors (`tsc --noEmit` clean)
- Dashboard stats no longer hardcoded zeros
- Portal page functions without an auth cookie (tested in incognito)
- File upload shows progress and success/error states
- All pages pass visual inspection at 375px, 768px, 1280px widths

### QA Expert
- Vitest runs with `npm test` and all tests pass
- Coverage report shows >80% on all API route files
- E2E plan document covers 3+ full user workflows
- Manual testing checklist completed and filed with results
- Zero high-severity bugs open at Wave 4 completion

---

## File Structure After Phase 2 (Expected)

```
/Users/gptemp/Desktop/accountant-hub/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              [Frontend Specialist]
│   │   ├── dashboard/page.tsx      [Frontend Specialist]
│   │   ├── clients/page.tsx        [Frontend Specialist]
│   │   └── requests/page.tsx       [Frontend Specialist]
│   ├── api/
│   │   ├── auth/                   [Phase 1 - unchanged]
│   │   ├── clients/
│   │   │   ├── route.ts            [Fullstack Developer]
│   │   │   └── [id]/route.ts       [Fullstack Developer]
│   │   ├── requests/
│   │   │   ├── route.ts            [Fullstack Developer]
│   │   │   └── [id]/
│   │   │       ├── route.ts        [Fullstack Developer]
│   │   │       └── details/route.ts [Fullstack Developer]
│   │   ├── upload/route.ts         [Fullstack Developer]
│   │   ├── files/
│   │   │   ├── [requestId]/route.ts [Fullstack Developer]
│   │   │   └── [fileId]/route.ts   [Fullstack Developer]
│   │   └── portal/
│   │       └── [shareToken]/
│   │           ├── route.ts        [Fullstack Developer]
│   │           └── upload/route.ts [Fullstack Developer]
│   └── portal/
│       └── [shareToken]/page.tsx   [Frontend Specialist]
├── components/
│   ├── ui/
│   │   ├── StatusBadge.tsx         [Frontend Specialist]
│   │   ├── DataTable.tsx           [Frontend Specialist]
│   │   ├── Modal.tsx               [Frontend Specialist]
│   │   ├── FormField.tsx           [Frontend Specialist]
│   │   ├── FileUpload.tsx          [Frontend Specialist]
│   │   └── UploadProgress.tsx      [Frontend Specialist]
│   ├── clients/
│   │   ├── ClientsTable.tsx        [Frontend Specialist]
│   │   ├── AddClientModal.tsx      [Frontend Specialist]
│   │   └── DeleteClientDialog.tsx  [Frontend Specialist]
│   ├── requests/
│   │   ├── RequestsTable.tsx       [Frontend Specialist]
│   │   ├── CreateRequestForm.tsx   [Frontend Specialist]
│   │   ├── RequestDetails.tsx      [Frontend Specialist]
│   │   ├── ShareLinkGenerator.tsx  [Frontend Specialist]
│   │   └── DeadlinesWidget.tsx     [Frontend Specialist]
│   ├── dashboard/
│   │   ├── QuickActions.tsx        [Frontend Specialist]
│   │   └── ActivityFeed.tsx        [Frontend Specialist]
│   └── portal/
│       └── PortalUpload.tsx        [Frontend Specialist]
├── hooks/
│   └── useAuth.ts                  [Frontend Specialist]
├── lib/
│   ├── db.ts                       [Fullstack Developer Wave 0]
│   ├── auth.ts                     [Fullstack Developer Wave 0]
│   ├── api.ts                      [Frontend Specialist]
│   └── queries/
│       └── stats.ts                [Fullstack Developer]
├── types/
│   └── index.ts                    [Fullstack Developer - Gate 1]
├── __tests__/
│   ├── setup.ts                    [QA Expert]
│   ├── helpers/
│   │   ├── db-mock.ts              [QA Expert]
│   │   └── auth-mock.ts            [QA Expert]
│   ├── api/
│   │   ├── clients.test.ts         [QA Expert]
│   │   ├── requests.test.ts        [QA Expert]
│   │   ├── upload.test.ts          [QA Expert]
│   │   └── portal.test.ts          [QA Expert]
│   ├── lib/
│   │   ├── middleware.test.ts      [QA Expert]
│   │   └── queries.test.ts         [QA Expert]
│   └── components/
│       ├── StatusBadge.test.tsx    [QA Expert]
│       ├── DataTable.test.tsx      [QA Expert]
│       ├── FileUpload.test.tsx     [QA Expert]
│       └── forms.test.tsx          [QA Expert]
├── docs/
│   ├── BUG_TEMPLATE.md             [QA Expert]
│   ├── TEST_CHECKLIST.md           [QA Expert]
│   └── E2E_TEST_PLAN.md            [QA Expert]
├── scripts/
│   └── init.sql                    [Fullstack Developer]
├── styles/
│   └── tokens.ts                   [UI/UX Designer]
├── vitest.config.ts                [QA Expert]
├── docker-compose.yml              [Phase 1 - likely no changes needed]
├── PHASE2_AGENT_WORKPLAN.md        [This file]
└── AGENTS.md                       [Do not modify]
```
