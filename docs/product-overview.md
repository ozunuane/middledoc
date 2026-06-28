# MiddleDoc — Product Overview

*The document collection platform built for accountants who are tired of chasing clients.*

---

## 1. Executive Summary

MiddleDoc is a SaaS platform that eliminates the single biggest time drain in accounting: collecting documents from clients. Accountants create a checklist of what they need, send a secure link, and clients upload directly — no account required, no back-and-forth emails, no lost attachments. AI automatically recognizes and categorizes every uploaded document, matching it to the request checklist. Built-in e-signatures, automated reminders, client invoicing, and team collaboration round out a platform that replaces a patchwork of email, Dropbox, DocuSign, and spreadsheets with one focused tool.

MiddleDoc is priced as a flat monthly fee — not per user — making it 60-85% cheaper than incumbents like TaxDome, Canopy, and Liscio for any firm with more than one person. The product is fully built, security-audited (A- rating across 48 findings fixed), and production-ready with 68 commits and a perfect 40/40 QA pass rate. The primary market is the 50,885 CPA practices in the United States, with a secondary beachhead in West Africa where zero dedicated competitors exist.

---

## 2. The Problem

**Accountants lose 5-10 hours every week chasing documents by email.**

Tax season turns every accounting firm into a document collection agency. A solo accountant with 150 clients needs W-2s, 1099s, bank statements, mortgage docs, and receipts from every single one. The current workflow looks like this:

- **Email #1:** "Hi Sarah, please send your W-2, 1099s, and bank statements."
- **Email #2 (5 days later):** "Just following up on those documents."
- **Email #3 (2 days later):** "I got the W-2 but still need the 1099-INT and bank statements."
- **Email #4:** "The file you sent is corrupted, can you resend?"
- **Email #5:** "Thanks, but this is from 2024 — I need 2025."

Multiply that by 150 clients. The result:

| Pain Point | Impact |
|---|---|
| Hours lost to email follow-ups | 5-10 hours/week per accountant |
| Documents scattered across email, text, Dropbox | No single source of truth |
| No visibility into what is still missing | Manual tracking in spreadsheets |
| E-signature costs (DocuSign, etc.) | $1-3 per signature, $500-2,000/year |
| Existing solutions (TaxDome, Canopy) | $67-150 per user/month — prohibitive for small firms |

Solo accountants and small firms (1-10 people) are priced out of the tools that large firms use. They are left with email and prayer.

---

## 3. The Solution

MiddleDoc is the middle layer between accountant and client — purpose-built for one job: getting the right documents from the right people, on time, with zero friction.

**For the accountant:**
- One dashboard to see every client, every document, every status
- AI that recognizes what was uploaded and matches it to what was requested
- Automated reminders that send themselves at 7 days, 3 days, and deadline
- E-signatures that cost $0 (not $1-3 per envelope)
- Team collaboration with granular access control
- Client invoicing built into the document request flow

**For the client:**
- No account to create, no password to remember
- Click a link, see a checklist, upload files, done
- Take a photo directly from phone camera
- Pay invoices and sign documents in the same portal

**For the firm:**
- Flat pricing: $19-79/month regardless of team size
- 60-85% cheaper than every major competitor
- QuickBooks integration for client sync
- Analytics dashboard with completion rates, response times, and upload trends

---

## 4. How It Works

**Three steps. That is the entire workflow.**

```
+-------------------+     +-------------------+     +-------------------+
|                   |     |                   |     |                   |
|   1. CREATE       |---->|   2. SHARE        |---->|   3. TRACK        |
|                   |     |                   |     |                   |
|  Build a request  |     |  Send secure link |     |  Monitor uploads  |
|  from a template  |     |  to client email  |     |  AI auto-matches  |
|  or from scratch  |     |  (no signup)      |     |  Reminders auto-  |
|                   |     |                   |     |  send on schedule  |
+-------------------+     +-------------------+     +-------------------+
```

**Step 1 — Create a Request**
Choose from 4 built-in templates (Individual Tax Return, Business Tax Return, Bookkeeping, Payroll) or build a custom checklist. Returning clients get smart suggestions based on what they submitted last year.

**Step 2 — Share with the Client**
Send a secure link via email. The client clicks it, sees their personalized checklist, and uploads directly. No account creation. Works on any device. Phone camera supported.

**Step 3 — Track and Collect**
Watch documents arrive in real-time with push notifications. AI recognizes each file (W-2, 1099, bank statement — 25 categories) and matches it to the checklist. Automated reminders handle follow-ups. Reject a document with a reason and the client gets a re-upload prompt.

---

## 5. Key Features

### Document Collection (Core)
| Feature | Detail |
|---|---|
| Document requests | Template-based or custom checklists with deadlines |
| Client portal | No-login upload via secure share link |
| Status tracking | Pending, Received, Overdue — per item and per request |
| Document browser | Filter by type (PDF/Images/Docs/Other), keyword search, bulk delete |
| File downloads | Authenticated with access control and path traversal protection |
| CSV import | Bulk-add clients from spreadsheet |

### AI and Intelligence
| Feature | Detail |
|---|---|
| Document recognition | Identifies 25 document categories automatically |
| Dual AI provider | OpenAI GPT-4o or Anthropic Claude Sonnet (configurable) |
| Auto-matching | Maps uploads to checklist items with confidence scores |
| Smart requests | Suggests next-year checklist based on prior submissions |
| Analytics dashboard | Completion rates, avg response time, daily upload sparkline, top clients |

### Communication
| Feature | Detail |
|---|---|
| Automated reminders | 7-day, 3-day, and deadline triggers |
| Manual reminders | One-click nudge anytime |
| 5 email templates | Fully editable per accountant |
| Document rejection | Reason provided, client prompted to re-upload |
| BCC notifications | Multiple notification email addresses supported |
| Push notifications | Real-time alerts when clients upload (PWA + web-push) |

### E-Signatures
| Feature | Detail |
|---|---|
| Cost | $0 per signature (competitors charge $1-3) |
| Signature capture | HTML5 canvas — draw with mouse or finger on touchscreen |
| PDF embedding | Signature placed on document, audit trail page appended |
| Legal compliance | ESIGN Act / UETA compliant — IP, timestamp, user agent, SHA-256 hash |

### Teams and Collaboration
| Feature | Detail |
|---|---|
| Roles | Owner, Admin, Member |
| Groups | Segment clients for granular visibility |
| Direct assignments | Give contractors access to specific clients only |
| API-level enforcement | Members cannot see, query, or access unauthorized data |

### Payments and Billing
| Feature | Detail |
|---|---|
| Dual payment provider | Stripe (USD / international) + Paystack (NGN / Africa) |
| Auto-detection | Currency determines provider automatically |
| Client invoicing | Attach fees to document requests, clients pay in-portal |
| Subscription management | Plan enforcement on client count, storage, and reminders |

### Integrations
| Feature | Detail |
|---|---|
| QuickBooks Online | OAuth 2.0, one-way client sync, auto-refresh tokens |
| Planned | Xero, Zapier |

### Mobile (PWA)
| Feature | Detail |
|---|---|
| Installable | Add-to-homescreen on iOS and Android |
| Camera upload | "Take Photo" opens device camera directly |
| Offline capable | Core functionality works without connection |
| Push notifications | Native-style alerts on mobile devices |

### Admin Panel (Platform Operator)
| Feature | Detail |
|---|---|
| Customer management | List, search, suspend, reactivate, delete |
| Plan management | Full CRUD with edit modal |
| Revenue metrics | MRR, ARR, churn rate — live |
| System stats | Database size, table sizes, signup trends |
| Audit log | Every admin action recorded |
| Separate auth | 8-hour sessions, audience-scoped JWT |

---

## 6. AI and Intelligence — The Differentiator

Most competitors treat document collection as a dumb file drop. MiddleDoc treats every upload as structured data.

**How AI document recognition works:**

```
Client uploads "sarah_w2_2025.pdf"
        |
        v
AI analyzes file content (not just filename)
        |
        v
Classification: W-2 (confidence: 94%)
        |
        v
Auto-matched to checklist item: "W-2 from employer"
        |
        v
Status updated: Pending --> Received
        |
        v
Accountant notified via push notification
```

**25 recognized document categories:**
W-2, 1099-NEC, 1099-INT, 1099-DIV, 1099-MISC, 1099-R, 1099-G, 1099-B, 1099-K, 1099-SA, Bank Statements, Mortgage Statements, Property Tax Statements, Charitable Donation Receipts, Medical Expense Receipts, Business Expense Receipts, Profit and Loss Statements, Balance Sheets, Vehicle Mileage Logs, Home Office Expenses, Childcare Receipts, Education Expenses (1098-T), Student Loan Interest (1098-E), Health Insurance (1095-A/B/C), and General Receipts.

**Dual provider support:** Firms choose between OpenAI GPT-4o and Anthropic Claude Sonnet based on preference, cost, or compliance requirements. No vendor lock-in.

**Smart requests from prior year:** When creating a new request for a returning client, MiddleDoc analyzes what that client submitted last year and pre-populates the checklist. A returning client who sent 8 documents last year gets an 8-item checklist suggested automatically — the accountant just clicks confirm.

**AI is available on every pricing tier, including Free.** Competitors gate intelligence features behind enterprise plans.

---

## 7. Pricing and Business Model

### MiddleDoc Pricing

| | Free | Solo | Team | Firm |
|---|---|---|---|---|
| **Price** | $0/mo | $19/mo | $39/mo | $79/mo |
| **Pricing model** | Flat | Flat | Flat | Flat |
| **Users** | 1 | 1 | Unlimited | Unlimited |
| **Clients** | 5 | 50 | 200 | Unlimited |
| **AI recognition** | Yes | Yes | Yes | Yes |
| **E-signatures** | Yes | Yes | Yes | Yes |
| **Templates** | 4 default | Custom | Custom | Custom |
| **Reminders** | Manual only | Automated | Automated | Automated |
| **Teams/Groups** | -- | -- | Yes | Yes |
| **QuickBooks sync** | -- | -- | Yes | Yes |
| **Analytics** | Basic | Full | Full | Full |
| **Storage** | 1 GB | 10 GB | 50 GB | Unlimited |

### Competitor Comparison: 5-Person Firm

| Platform | Monthly Cost | Pricing Model | E-Signatures | AI Recognition |
|---|---|---|---|---|
| **MiddleDoc** | **$39-79** | **Flat** | **$0/signature** | **Included** |
| TaxDome | $335-500 | $67-100/user | $1-3/signature | Limited |
| Canopy | $110-750 | $22-150/user | Add-on | No |
| Liscio | $245-375 | $49-75/user | Add-on | No |
| SmartVault | $125-325 | $25-65/user | Add-on | No |

**MiddleDoc is 60-85% cheaper for any firm with 2+ people.** The flat pricing model means firms never pay more as they hire.

### Revenue Model
- Subscription revenue (primary)
- Client invoicing transaction fees (secondary, planned)
- Dual payment rails: Stripe for US/international, Paystack for African markets

---

## 8. Target Market and Opportunity

### Primary Market: United States

| Segment | Size | Description |
|---|---|---|
| Total CPA practices | 50,885 | All registered CPA firms in the US |
| Solo accountants | 33,850 | Single-practitioner firms |
| Small firms (2-10) | ~12,000 | Firms priced out of per-user tools |
| Target segment | ~45,850 | Solo + small firms |

### Secondary Market: Africa

| Segment | Opportunity |
|---|---|
| Nigeria | Largest economy in Africa, growing formal accounting sector |
| Kenya | East Africa's financial hub, mobile-first population |
| West Africa | Underserved by every major accounting SaaS vendor |
| Competition | Zero dedicated document collection tools |

Paystack integration provides native payment processing in NGN, removing the primary adoption barrier in African markets.

### Market Sizing

| Metric | Value | Calculation |
|---|---|---|
| **TAM** (Global accounting software) | $23.5B | Growing at 8.85% CAGR |
| **SAM** (US small-firm document collection) | ~$330M | 45,850 firms x $600 avg annual spend |
| **SOM** (Year 1-3 realistic capture) | $1-5M | 1,500-8,000 paying customers |

### Ideal Customer Profile
- Solo accountant or small firm (1-10 people)
- 50-200 active clients
- Losing 5-10 hours/week to document collection via email
- Cannot justify $67-150/user/month for TaxDome or Canopy
- Wants modern software but not a full practice management suite

---

## 9. Competitive Landscape

### Positioning Map

```
                        FULL SUITE
                            |
                   TaxDome  |  Canopy
                     ($$$)  |  ($$$)
                            |
    EXPENSIVE -------- -----+------------- AFFORDABLE
                            |
                   Liscio   |  MiddleDoc
                  SmartVault|  (focused + cheap)
                            |
                       FOCUSED
```

**MiddleDoc occupies the "focused and affordable" quadrant.** This is a deliberate strategic choice:

- **Not trying to be TaxDome.** TaxDome is a full practice management suite (CRM, billing, workflow, documents). MiddleDoc does one thing — document collection — and does it better and cheaper.
- **Not competing on feature count.** Competing on workflow simplicity, AI intelligence, and price.
- **Per-user pricing is the industry's vulnerability.** Every competitor charges per user. MiddleDoc's flat pricing is structurally disruptive for multi-person firms.

### Competitive Advantages

| Advantage | MiddleDoc | Competitors |
|---|---|---|
| Pricing model | Flat monthly fee | Per user per month |
| AI document recognition | Every tier, dual provider | Limited or enterprise-only |
| E-signatures | $0 (built-in, unlimited) | $1-3 per signature or add-on |
| Client experience | No account needed | Often requires client login |
| African market support | Native (Paystack) | Not available |
| Setup complexity | Send link, collect docs | Days of onboarding |

### Competitive Score: 7.5/10

Where MiddleDoc leads: price, AI, e-signatures, client simplicity, African market.
Where competitors lead: full practice management, workflow automation, established brand, integrations ecosystem.

---

## 10. Traction and Product Readiness

### What Is Built

| Metric | Value |
|---|---|
| Codebase commits | 68 |
| QA test pass rate | 40/40 (100%) |
| Security audits completed | 2 |
| Security findings identified and fixed | 48 |
| Security rating | A- |
| Features shipped | All features listed in this document are built and functional |
| Database tables | Fully indexed (20+ indexes) |
| Production readiness | Requires only infrastructure deployment (Docker to managed services) |

### Security Audit Results (A- Rating)

48 security findings across 2 audits — all resolved:

- bcrypt password hashing (12 rounds)
- JWT with 24-hour expiry
- Rate limiting on authentication and upload endpoints
- File type validation (extension + MIME type allowlist)
- Full security header suite (CSP, X-Frame-Options, X-Content-Type-Options, HSTS-ready)
- Path traversal protection on file downloads
- HTML escaping in all outbound emails
- Webhook signature verification for Stripe and Paystack
- OAuth tokens encrypted at rest (AES-256-CBC)
- GDPR compliance: data export, account deletion, right to be forgotten

### Conversion Model

| Stage | Rate | Notes |
|---|---|---|
| Landing page visitors | 100% | Baseline |
| Visitor to signup | 3-6% | Industry standard for SaaS |
| Signup to paid conversion | 4-8% | Free tier as on-ramp |
| Monthly visitors needed for $100K ARR | ~100,000 | At midpoint conversion rates |

---

## 11. Go-to-Market Strategy

### Phase 1: Community-Led Growth (Months 1-6)

- **Target:** Solo accountants in online communities (Reddit r/taxpros, Facebook groups, accounting forums)
- **Tactic:** Free tier as entry point, content marketing around document collection pain points
- **Channel:** Direct outreach, SEO content ("how to collect client documents"), social proof
- **Goal:** 500 free users, 50 paid customers

### Phase 2: Referral and Word-of-Mouth (Months 6-12)

- **Tactic:** Accountant-to-accountant referral program
- **Channel:** Tax season campaigns (Jan-Apr), conference presence (AICPA Engage, state CPA events)
- **Partnership:** Accounting influencers on YouTube and LinkedIn
- **Goal:** 2,000 free users, 200 paid customers, $50K ARR

### Phase 3: African Market Entry (Months 6-18)

- **Tactic:** Partner with accounting associations in Nigeria and Kenya
- **Channel:** Local conferences, WhatsApp-based marketing (dominant channel in West Africa)
- **Advantage:** First mover — zero competition in dedicated document collection
- **Goal:** 500 users, establish market presence

### Phase 4: Integration-Driven Expansion (Months 12-24)

- **Tactic:** Xero integration, Zapier marketplace listing, accounting app directory listings
- **Channel:** Integration marketplaces drive organic discovery
- **Goal:** 5,000+ total users, $200K+ ARR

### Pricing as Distribution

The flat pricing model is itself a go-to-market weapon. Every firm evaluating TaxDome at $500/month for 5 users will discover MiddleDoc at $39-79/month. Price comparison content and SEO targeting "[competitor] alternative" keywords drive high-intent traffic.

---

## 12. Technology and Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | Next.js API Routes (Node.js) |
| Database | PostgreSQL 15 with 20+ performance indexes |
| AI | OpenAI GPT-4o / Anthropic Claude Sonnet (configurable) |
| Payments | Stripe + Paystack (dual-rail) |
| Auth | bcrypt + JWT (24h expiry, audience-scoped) |
| E-Signatures | pdf-lib (server-side PDF manipulation) |
| Mobile | PWA with web-push notifications |
| Deployment | Docker + Nginx, designed for Cloud Run / ECS |

### Architecture Principles

- **Stateless:** No server-side sessions. Horizontally scalable from day one.
- **Multi-tenant:** Single database with row-level access control enforced at the API layer.
- **Provider-agnostic:** AI provider, payment provider, and cloud provider are all swappable.
- **Security-first:** A- audit rating, GDPR-compliant, ESIGN Act-compliant.

The system is production-ready. Deployment requires swapping from Docker Compose to managed services (Cloud Run, managed PostgreSQL) — no code changes needed.

---

## 13. Roadmap

### Shipped (Current)
- Complete document collection workflow
- AI document recognition (25 categories, dual provider)
- E-signatures with audit trail
- Teams, groups, and access control
- Stripe + Paystack billing
- QuickBooks Online integration
- PWA with push notifications
- Admin panel with revenue metrics
- Security audit (A- rating)

### Next (Q3-Q4 2026)
- Xero integration
- Zapier connector
- Bulk document download (ZIP)
- Client messaging within the portal
- White-label / custom branding per firm
- Advanced analytics and reporting

### Future (2027)
- OCR data extraction (pull numbers from documents, not just classify)
- Tax return preparation workflow
- Accounting workflow automation
- API for third-party integrations
- Mobile native apps (if PWA proves insufficient)
- International expansion beyond Africa (UK, Australia, Canada)

---

## 14. Team and Ask

*[Team bios to be added]*

### What Has Been Built

A complete, security-audited, production-ready SaaS platform with:
- 68 commits of shipped code
- 40/40 QA pass rate
- 48 security findings resolved (A- rating)
- Dual payment processing (US + Africa)
- AI-powered document intelligence
- $0 e-signatures
- Flat pricing that undercuts every competitor by 60-85%

### What Is Needed

*[Funding ask, resource requirements, and use of funds to be added]*

### Key Metrics to Watch

| Metric | Target (Year 1) |
|---|---|
| Free users | 2,000 |
| Paid customers | 200 |
| ARR | $50-100K |
| Monthly churn | < 5% |
| NPS | > 40 |
| CAC payback | < 6 months |

---

*MiddleDoc — Stop chasing documents. Start collecting them.*
