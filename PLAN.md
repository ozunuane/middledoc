# Accountant Client Hub - MVP Plan

## What We're Building
A platform where accountants can request documents from clients, clients can upload them, and accountants get automated reminders about outstanding requests.

## Architecture
- **Frontend**: Next.js (React) - what users see
- **Backend**: Next.js API Routes - handles logic
- **Database**: Supabase (PostgreSQL) - stores all data
- **Auth**: Supabase Auth - login/signup
- **File Storage**: Supabase Storage - stores uploaded files
- **Email**: SendGrid - automated reminders
- **Hosting**: Vercel - makes it live

## MVP Features (Phase 1)

### 1. Authentication
- [x] Signup page (accountants only for now)
- [x] Login page
- [x] Protected routes (can't see dashboard without login)
- [x] Logout

### 2. Accountant Dashboard
- [x] View all your clients
- [x] Add new client
- [x] Create document request for a client
- [x] See status of all requests (pending, received, overdue)
- [x] Mark documents as received

### 3. Client Portal
- [x] Client gets a link to upload documents
- [x] Simple upload interface (no login needed initially)
- [x] See what documents are requested
- [x] Upload deadline
- [x] Confirmation when uploaded

### 4. Automations
- [x] Send reminder email 1 week before deadline
- [x] Send reminder email 3 days before deadline
- [x] Send reminder email on deadline day

## Tech Stack
```
Frontend: Next.js 15 + React + TypeScript + Tailwind CSS
Backend: Next.js API Routes
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Storage: Supabase Storage
Email: SendGrid
Hosting: Vercel
```

## Database Schema (Simple)

```sql
-- Accountants table
CREATE TABLE accountants (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  accountant_id UUID REFERENCES accountants,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP
);

-- Document Requests table
CREATE TABLE document_requests (
  id UUID PRIMARY KEY,
  accountant_id UUID REFERENCES accountants,
  client_id UUID REFERENCES clients,
  title TEXT (e.g., "2025 Tax Returns"),
  due_date DATE,
  status TEXT (pending, received, overdue),
  created_at TIMESTAMP
);

-- Document Uploads table
CREATE TABLE document_uploads (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES document_requests,
  file_name TEXT,
  file_path TEXT (Supabase Storage path),
  uploaded_at TIMESTAMP
);
```

## Build Order
1. **Week 1**: Auth + Basic UI + Database setup
2. **Week 2**: Create clients + Create requests + Client portal
3. **Week 3**: File uploads + Status tracking
4. **Week 4**: Email reminders + Testing + Polish

## What You Need to Do
1. Create Supabase account (FREE)
2. Create SendGrid account (FREE tier)
3. Create Vercel account (FREE)
4. Copy environment variables to `.env.local`
5. Test features as we build

## Success Criteria
- Accountant can sign up and login
- Accountant can add clients
- Accountant can create document requests
- Clients can upload files
- Reminders get sent via email
- Everything is deployed and live
