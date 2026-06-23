# Phase 2 Testing Checklist

## API Testing (Phase 1 + Phase 2)

### Authentication Routes
- [ ] POST /api/auth/signup - Create account with valid data
- [ ] POST /api/auth/signup - Reject duplicate email
- [ ] POST /api/auth/signup - Validate password min 8 characters
- [ ] POST /api/auth/signup - Return JWT token cookie
- [ ] POST /api/auth/login - Login with correct credentials
- [ ] POST /api/auth/login - Reject invalid password
- [ ] POST /api/auth/login - Reject non-existent email
- [ ] GET /api/auth/me - Return user info when authenticated
- [ ] GET /api/auth/me - Return 401 when unauthenticated
- [ ] POST /api/auth/logout - Clear token cookie

### Clients Management Routes
- [ ] POST /api/clients - Create client with valid data (requires auth)
- [ ] POST /api/clients - Reject duplicate email for same accountant
- [ ] POST /api/clients - Validate email format
- [ ] POST /api/clients - Require authentication
- [ ] GET /api/clients - List all clients for authenticated user
- [ ] GET /api/clients - Return empty array when no clients
- [ ] GET /api/clients - Only return current user's clients (isolation)
- [ ] DELETE /api/clients/:id - Delete client (requires auth)
- [ ] DELETE /api/clients/:id - Verify ownership before deletion
- [ ] DELETE /api/clients/:id - Return 404 for non-existent client

### Document Requests Routes
- [ ] POST /api/requests - Create request with valid data
- [ ] POST /api/requests - Validate due_date is in future
- [ ] POST /api/requests - Validate required fields
- [ ] POST /api/requests - Require authentication
- [ ] GET /api/requests - List requests for authenticated user
- [ ] GET /api/requests - Show request status (pending/received/overdue)
- [ ] GET /api/requests - Only return current user's requests
- [ ] GET /api/requests/:id/details - Get full request details
- [ ] PATCH /api/requests/:id - Update request status
- [ ] PATCH /api/requests/:id - Verify ownership before update

### File Upload Routes
- [ ] POST /api/upload - Upload file (requires auth)
- [ ] POST /api/upload - Reject files > 10MB
- [ ] POST /api/upload - Validate file type
- [ ] POST /api/upload - Save to /app/uploads directory
- [ ] POST /api/upload - Return file metadata
- [ ] GET /api/files/:requestId - List uploaded files for request
- [ ] GET /api/files/:requestId - Only return files from current user's request
- [ ] DELETE /api/files/:fileId - Delete file
- [ ] DELETE /api/files/:fileId - Verify ownership before delete

### Public Portal Routes (No Auth Required)
- [ ] GET /api/portal/:shareToken - Return request details for valid token
- [ ] GET /api/portal/:shareToken - Return 404 for invalid token
- [ ] GET /api/portal/:shareToken - Return 404 for expired token
- [ ] POST /api/portal/:shareToken/upload - Upload file without auth
- [ ] POST /api/portal/:shareToken/upload - Auto-update request status to 'received'

---

## Frontend Component Testing

### Authentication Pages
- [ ] SignUp page - Render all form fields (name, email, password, confirm)
- [ ] SignUp page - Validate required fields
- [ ] SignUp page - Validate password length (min 8 chars)
- [ ] SignUp page - Validate password match
- [ ] SignUp page - Validate email format
- [ ] SignUp page - Show error on duplicate email
- [ ] SignUp page - Navigate to dashboard on success
- [ ] Login page - Render email and password fields
- [ ] Login page - Show error on wrong credentials
- [ ] Login page - Navigate to dashboard on success

### Dashboard Page
- [ ] Dashboard - Show loading state while fetching user
- [ ] Dashboard - Display accountant name
- [ ] Dashboard - Show logout button
- [ ] Dashboard - Redirect to login if not authenticated
- [ ] Dashboard - Display stats: Clients, Pending Requests, Documents Received
- [ ] Dashboard - Show quick action buttons

### Clients Page
- [ ] Clients page - Render list of all clients
- [ ] Clients page - Show client name and email
- [ ] Clients page - Show creation date
- [ ] Clients page - "Add Client" button opens modal
- [ ] Add Client form - Validate required fields
- [ ] Add Client form - Validate email format
- [ ] Add Client form - Submit creates new client
- [ ] Add Client form - Show success message
- [ ] Client list - Delete button shows confirmation
- [ ] Client list - Deletion removes client from list

### Document Requests Page
- [ ] Requests page - Show all document requests
- [ ] Requests page - Display title, client, due date, status
- [ ] Requests page - Show status badges with correct colors
- [ ] Requests page - "Create Request" button opens form
- [ ] Create Request form - Select client from dropdown
- [ ] Create Request form - Validate title required
- [ ] Create Request form - Validate due_date is future
- [ ] Create Request form - Submit creates request
- [ ] Request list - Click row shows details panel
- [ ] Details panel - Show uploaded files list

### File Upload Component
- [ ] File upload - Render drag-drop zone
- [ ] File upload - Accept drag-drop files
- [ ] File upload - Show file list preview
- [ ] File upload - Display file size
- [ ] File upload - Show upload progress bar
- [ ] File upload - Disable upload button during upload
- [ ] File upload - Show success message on complete
- [ ] File upload - Show error on failed upload
- [ ] File upload - Reject files > 10MB

### Client Portal (Public)
- [ ] Portal page - Load with valid share token
- [ ] Portal page - Show request title and due date
- [ ] Portal page - Show file upload area
- [ ] Portal page - Accept file uploads without auth
- [ ] Portal page - Show success confirmation after upload
- [ ] Portal page - Show request status update

---

## End-to-End Testing

### Complete User Workflows
- [ ] Signup → Create Account → Login → See Dashboard
- [ ] Add Client → Create Request → See in list
- [ ] Create Request → Get share token → Send to client
- [ ] Client uses share token → Upload file → Request marked received
- [ ] Accountant sees uploaded files → Download file
- [ ] Complete document collection flow (client receives request → uploads → accountant confirms)

### Error Handling
- [ ] Invalid share token shows error
- [ ] Expired requests handled gracefully
- [ ] Network error retry mechanism
- [ ] Concurrent uploads handled correctly
- [ ] Deletion with confirmation dialogs

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All pages navigable with Tab key only
- [ ] Focus order is logical
- [ ] Form fields can be filled with keyboard
- [ ] Buttons and links can be activated with Enter/Space
- [ ] Modals can be dismissed with ESC key

### Screen Reader Testing
- [ ] Page titles are descriptive
- [ ] Form labels associated with inputs
- [ ] Buttons have accessible labels
- [ ] Status badges announced correctly
- [ ] File upload progress announced
- [ ] Errors announced to screen reader

### Visual Testing
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators visible (3px minimum)
- [ ] Text scales properly with browser zoom
- [ ] No text below 12px font size

---

## Performance Testing

- [ ] Page load time < 3 seconds (3G)
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse Performance score > 80
- [ ] Core Web Vitals within acceptable ranges
- [ ] File uploads don't block UI

---

## Security Testing

- [ ] Authentication tokens not exposed in logs
- [ ] Passwords hashed with bcryptjs
- [ ] SQL injection prevented via parameterized queries
- [ ] CSRF protection on state-changing requests
- [ ] File uploads validate type and size
- [ ] Client data isolated by accountant_id
