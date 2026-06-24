# MiddleDoc: Subscription Pricing & Admin Panel Specification

**Version:** 1.0
**Date:** 2026-06-23
**Status:** Draft for Review

---

## Table of Contents

1. [Competitive Landscape Summary](#1-competitive-landscape-summary)
2. [Recommended Pricing Tiers](#2-recommended-pricing-tiers)
3. [Pricing Strategy Rationale](#3-pricing-strategy-rationale)
4. [Admin Panel Page-by-Page Specification](#4-admin-panel-page-by-page-specification)
5. [Stripe Integration Plan](#5-stripe-integration-plan)
6. [Database Schema Additions](#6-database-schema-additions)
7. [Build Priority and Effort Estimates](#7-build-priority-and-effort-estimates)

---

## 1. Competitive Landscape Summary

| Competitor   | Entry Price       | Mid Price         | Top Price          | Model          | Focus                        |
|--------------|-------------------|-------------------|--------------------|----------------|------------------------------|
| TaxDome      | $67/mo (annual)   | ~$83/user/mo      | ~$100/user/mo      | Per-user/year  | All-in-one practice mgmt     |
| Canopy       | $45/user/mo       | $66/user/mo       | $150/mo + modules  | Per-user + add-ons | Modular practice mgmt     |
| Liscio       | $49/user/mo       | $55/user/mo       | $75/user/mo        | Per-user/mo    | Client communication         |
| SmartVault   | $25/user/mo       | $45/user/mo       | $65/user/mo        | Per-user/mo    | Document management          |
| Karbon       | $59/user/mo       | $79/user/mo       | $99/user/mo        | Per-user/mo    | Workflow & practice mgmt     |

**Key takeaway:** MiddleDoc's scope is narrower than most competitors (focused on document collection, not full practice management). This is a strength -- it means we can undercut on price while delivering a best-in-class experience for the specific job of "get documents from clients." The closest comparable is SmartVault at $25-65/user/mo, but even SmartVault is broader (general document management vs. targeted collection workflows).

**Positioning:** MiddleDoc should be the affordable, focused, zero-learning-curve tool for document collection. Not trying to be TaxDome. Trying to be the thing accountants adopt in 15 minutes and never think about again.

---

## 2. Recommended Pricing Tiers

### Overview Table

| Tier        | Monthly | Annual (per mo) | Annual Total | Clients | Storage  | Team Members | Email Reminders/mo |
|-------------|---------|-----------------|--------------|---------|----------|--------------|-------------------|
| **Free**    | $0      | $0              | $0           | 5       | 1 GB     | 1 (solo)     | 20                |
| **Solo**    | $19/mo  | $15/mo          | $180/yr      | 50      | 10 GB    | 1 (solo)     | 200               |
| **Team**    | $39/mo  | $32/mo          | $384/yr      | 250     | 50 GB    | 5 included   | 1,000             |
| **Firm**    | $79/mo  | $65/mo          | $780/yr      | Unlimited| 200 GB   | 15 included  | 5,000             |

Additional team members beyond included count: **$8/member/month** (Team and Firm only).

Additional storage beyond plan limit: **$2/GB/month**.

### Tier Details

#### FREE -- "Try It Forever"

**Target persona:** Accountant evaluating the product, side-hustle bookkeeper, very small sole proprietor with a handful of clients.

**Purpose:** Reduce friction to zero. Let people use the product, fall in love with it, and hit the client limit naturally.

| Feature                          | Included |
|----------------------------------|----------|
| Client management                | Up to 5 clients |
| Document requests                | Unlimited per client |
| Client upload portal             | Yes |
| Email reminders (auto)           | 20/month |
| Custom email templates           | 1 template per type |
| File storage                     | 1 GB |
| Team members                     | None (solo only) |
| Groups / access control          | No |
| Document rejection workflow      | Yes |
| Client multiple emails           | No (1 per client) |
| Notification BCC emails          | No |
| Branding / white-label           | No (MiddleDoc branding on portal) |
| API access                       | No |
| Priority support                 | No (community only) |

**Upgrade trigger:** Hits 5-client limit. This is intentionally low -- any real accountant will hit it within their first week. The free tier exists to eliminate "will this work for me?" doubt, not to be a permanent home.

---

#### SOLO -- $19/mo ($15/mo annual)

**Target persona:** Solo accountant or bookkeeper with 10-50 clients. No staff. Wants simple, affordable document collection.

| Feature                          | Included |
|----------------------------------|----------|
| Client management                | Up to 50 clients |
| Document requests                | Unlimited |
| Client upload portal             | Yes |
| Email reminders (auto)           | 200/month |
| Custom email templates           | Unlimited templates |
| File storage                     | 10 GB |
| Team members                     | None (solo only) |
| Groups / access control          | No |
| Document rejection workflow      | Yes |
| Client multiple emails           | Up to 3 per client |
| Notification BCC emails          | 1 |
| Branding / white-label           | No (MiddleDoc branding on portal) |
| Due date calendar view           | Yes |
| Bulk request creation            | Yes (up to 10 at once) |
| Request templates (save & reuse) | Up to 10 templates |
| API access                       | No |
| Email support                    | Yes (48hr SLA) |

**Upgrade trigger:** Hires first employee, exceeds 50 clients, or needs team collaboration features.

**Why $19/mo:** This is roughly 60-75% cheaper than the cheapest competitor seat (SmartVault at $25). At $15/mo annual, it is genuinely impulse-purchase territory for any working professional. The goal is to make the "should I just keep using email and Dropbox?" calculation land firmly on MiddleDoc.

---

#### TEAM -- $39/mo ($32/mo annual) + $8/extra member

**Target persona:** Small firm (2-10 people) that needs collaboration, access control, and client segmentation.

| Feature                          | Included |
|----------------------------------|----------|
| Client management                | Up to 250 clients |
| Document requests                | Unlimited |
| Client upload portal             | Yes |
| Email reminders (auto)           | 1,000/month |
| Custom email templates           | Unlimited |
| File storage                     | 50 GB |
| Team members                     | 5 included (+$8/mo each additional) |
| Teams & groups                   | Yes |
| Group-based access control       | Yes |
| Direct client assignments        | Yes |
| Document rejection workflow      | Yes |
| Client multiple emails           | Up to 5 per client |
| Notification BCC emails          | 5 |
| Branding / white-label           | Partial (custom logo on portal) |
| Due date calendar view           | Yes |
| Bulk request creation            | Yes (up to 50 at once) |
| Request templates                | Unlimited |
| Activity log (team actions)      | Yes |
| API access                       | Read-only |
| Email support                    | Yes (24hr SLA) |
| Client status dashboard          | Yes |

**Upgrade trigger:** Exceeds 250 clients, needs more than 5 team members (cost per additional member makes Firm more economical at ~8+ members), needs advanced integrations or white-label.

**Why $39/mo base:** This is the firm's first taste of MiddleDoc as a team tool. At $39 + $8/additional member, a 5-person firm pays $39/mo total. A 10-person firm pays $39 + (5 x $8) = $79/mo. Compare to Liscio at $49/user/mo = $490/mo for 10 users. The value proposition is overwhelming.

---

#### FIRM -- $79/mo ($65/mo annual) + $8/extra member

**Target persona:** Established firm (10-50 people) with hundreds of clients, needing full control, compliance features, and integrations.

| Feature                          | Included |
|----------------------------------|----------|
| Client management                | Unlimited |
| Document requests                | Unlimited |
| Client upload portal             | Yes |
| Email reminders (auto)           | 5,000/month |
| Custom email templates           | Unlimited |
| File storage                     | 200 GB |
| Team members                     | 15 included (+$8/mo each additional) |
| Teams & groups                   | Yes |
| Group-based access control       | Yes |
| Direct client assignments        | Yes |
| Document rejection workflow      | Yes |
| Client multiple emails           | Unlimited |
| Notification BCC emails          | Unlimited |
| Branding / white-label           | Full (custom domain, logo, colors) |
| Due date calendar view           | Yes |
| Bulk request creation            | Unlimited |
| Request templates                | Unlimited |
| Activity log (full audit trail)  | Yes |
| API access                       | Full (read/write) |
| Webhooks                         | Yes |
| SSO (SAML)                       | Yes |
| Data export (CSV/ZIP)            | Yes |
| Priority email + chat support    | Yes (4hr SLA) |
| Client status dashboard          | Yes |
| Custom fields on requests        | Yes |
| Scheduled/recurring requests     | Yes |

**Why $79/mo base:** A 15-person firm pays $79/mo. A 30-person firm pays $79 + (15 x $8) = $199/mo. Compare to TaxDome at $83/user/mo x 30 = $2,490/mo or Karbon at $79/user/mo x 30 = $2,370/mo. Even though those tools do more, the price gap is so extreme that MiddleDoc sells itself as the dedicated document collection layer alongside whatever practice management tool the firm already uses.

---

### Free Trial Strategy

**Recommendation: 14-day free trial of Team tier for all new signups, then automatic downgrade to Free.**

Rationale:
- 14 days is enough to complete a full client document cycle (send requests, get documents back)
- Starting on Team (not Firm) gives users collaboration features without overwhelming them
- Auto-downgrade to Free (not cancellation) means they keep their data and can upgrade whenever
- No credit card required for trial -- reduces signup friction dramatically
- After downgrade, show gentle in-app prompts: "You have 23 clients but Free supports 5. Upgrade to keep all your clients active."

---

### Annual Discount Structure

| Tier   | Monthly | Annual/mo | Discount | Annual Total |
|--------|---------|-----------|----------|--------------|
| Solo   | $19     | $15       | 21%      | $180         |
| Team   | $39     | $32       | 18%      | $384         |
| Firm   | $79     | $65       | 18%      | $780         |

Annual discounts are 18-21%. This is above the industry standard of 15-20% because at these low price points, the absolute dollar savings are small. A higher percentage makes the annual option feel meaningful: "Save $48/year" on Solo is modest, but "21% off" reads well.

---

## 3. Pricing Strategy Rationale

### Why NOT per-seat pricing as the primary model

Most competitors charge per-seat. MiddleDoc deliberately uses a base-price + overage model because:

1. **Lower perceived cost.** "$39/mo for your team" converts better than "$12/user/mo x your headcount."
2. **Reduces purchase friction.** The buyer (firm owner) does not need to calculate total cost or get approval for each new seat.
3. **Encourages full-team adoption.** When adding a team member costs $0 (within the included count), firms add everyone. This increases stickiness.
4. **Aligns with value.** The value of MiddleDoc scales with client count and document volume, not team size. A 3-person firm with 200 clients gets more value than a 10-person firm with 30 clients.

### Why a forever-free tier

1. **Reduces risk for evaluators.** Accountants are conservative buyers. "Free forever" removes the "what if I forget to cancel?" objection.
2. **Creates a funnel.** Free users hit the 5-client limit fast and self-qualify as real prospects.
3. **Word of mouth.** Solo bookkeepers on the Free tier talk to firm owners who become Team/Firm customers.
4. **Low cost to serve.** 5 clients and 1 GB storage costs nearly nothing. The marginal cost of a Free user is effectively zero.

### Revenue model projections (illustrative)

Assuming a mature customer mix at 1,000 paying customers:
- 40% Solo ($15/mo avg): 400 x $15 = $6,000/mo
- 40% Team ($45/mo avg incl. extra seats): 400 x $45 = $18,000/mo
- 20% Firm ($100/mo avg incl. extra seats): 200 x $100 = $20,000/mo
- **Total MRR: ~$44,000 ($528K ARR)**

This assumes no storage overages, which would add 5-10% on top.

---

## 4. Admin Panel Page-by-Page Specification

### Architecture Decision

**Recommendation: Same Next.js app, separate route group (`/admin`), separate auth layer.**

Rationale:
- Shared codebase reduces maintenance overhead (shared DB utilities, shared types, shared component library)
- Route group isolation (`app/(admin)/admin/...`) keeps admin code cleanly separated
- Admin auth uses a separate `super_admins` table with role-based access, completely independent of the `accountants` table
- Admin routes are protected by middleware that checks for `super_admin` JWT claims
- If the admin panel later needs to be extracted to a separate app, the route group structure makes this straightforward

Authentication:
- Super admins authenticate via email + password + mandatory TOTP (2FA)
- Admin sessions use a separate JWT cookie (`middledoc_admin_token`) with a shorter expiration (4 hours)
- Impersonation generates a time-limited, audit-logged session token for the target accountant
- All admin actions are written to `admin_audit_log`

---

### Page 1: Dashboard (Overview)

**Route:** `/admin`

**Purpose:** At-a-glance health of the business. The first thing you see when you log in.

**Layout:**
```
+------------------------------------------------------------------+
| MIDDLEDOC ADMIN                           [Admin Name] [Logout]  |
+------------------------------------------------------------------+
| [Sidebar]  |  KEY METRICS (top row, 6 cards)                     |
|            |  +--------+ +--------+ +--------+                   |
| Dashboard  |  | MRR    | | ARR    | | Active |                   |
| Customers  |  | $44.2K | | $530K  | | Cust.  |                   |
| Revenue    |  | +3.2%  | | +3.2%  | | 847    |                   |
| Analytics  |  +--------+ +--------+ +--------+                   |
| Plans      |  +--------+ +--------+ +--------+                   |
| Content    |  | Churn  | | Trial  | | NPS    |                   |
| System     |  | Rate   | | Conv.  | |        |                   |
| Security   |  | 2.1%   | | 34%    | | 52     |                   |
|            |  +--------+ +--------+ +--------+                   |
|            |                                                      |
|            |  SIGNUPS (line chart, 30 days)                       |
|            |  [daily new signups with trend line]                 |
|            |                                                      |
|            |  REVENUE (line chart, 12 months)                     |
|            |  [MRR growth over time, by plan tier]                |
|            |                                                      |
|            |  RECENT ACTIVITY (feed, 20 items)                    |
|            |  - Acme CPA upgraded to Team (2 min ago)             |
|            |  - Failed payment: Smith & Co ($39) (15 min ago)     |
|            |  - New signup: jane@example.com (1 hr ago)           |
|            |  - Support ticket #4421 escalated (2 hr ago)         |
+------------------------------------------------------------------+
```

**Data requirements:**
- MRR: `SUM(plan_price + extra_seat_charges + storage_overages)` for all active subscriptions
- ARR: `MRR x 12`
- Active customers: `COUNT(subscriptions WHERE status = 'active')`
- Churn rate: `cancelled_last_30_days / active_start_of_period`
- Trial conversion: `converted_last_30_days / trials_ended_last_30_days`
- NPS: From periodic survey data (separate system, displayed here)
- Signups chart: `GROUP BY date FROM accountants ORDER BY created_at`
- Revenue chart: Monthly MRR snapshots from `mrr_snapshots` table
- Recent activity: From `admin_activity_feed` materialized view

---

### Page 2: Customers List

**Route:** `/admin/customers`

**Purpose:** Find, filter, and act on any customer account.

**Layout:**
```
+------------------------------------------------------------------+
| CUSTOMERS                                    [+ Add Customer]    |
+------------------------------------------------------------------+
| Search: [________________________] [Plan: All v] [Status: All v] |
| [Date range: _____ to _____]  [Sort: Newest v]  [Export CSV]     |
+------------------------------------------------------------------+
| Name/Firm       | Email           | Plan  | Status | Clients |   |
|                  |                 |       |        | /Limit  | $ |
+------------------------------------------------------------------+
| Acme CPA LLC    | john@acme.com   | Team  | Active | 142/250 | > |
| Jane Smith      | jane@smith.com  | Solo  | Active | 38/50   | > |
| Bob's Books     | bob@bobs.com    | Free  | Active | 5/5     | > |
| Old Tax Co      | old@tax.co      | Team  | Past   | 0/250   | > |
|                 |                  |       | Due    |         |   |
+------------------------------------------------------------------+
| Showing 1-25 of 847  [< 1 2 3 ... 34 >]                         |
+------------------------------------------------------------------+
```

**Filters:**
- Plan tier (Free / Solo / Team / Firm / Trial)
- Status (Active / Trial / Past Due / Suspended / Cancelled)
- Date range (signup date)
- Usage threshold (e.g., "storage > 80%", "clients > 90% of limit")
- Has team (Yes/No)
- Text search (name, email, firm name)

**Bulk actions:**
- Export selected to CSV
- Send email to selected
- Tag selected

**Row click** navigates to Customer Detail.

---

### Page 3: Customer Detail

**Route:** `/admin/customers/[id]`

**Purpose:** Complete view of one customer. The support agent's primary workspace.

**Layout:**
```
+------------------------------------------------------------------+
| < Back to Customers                                               |
+------------------------------------------------------------------+
| ACME CPA LLC                                                      |
| john@acmecpa.com | Signed up: Jan 15, 2026 | Last login: 2h ago |
+------------------------------------------------------------------+
| [Overview] [Subscription] [Usage] [Billing] [Team] [Notes] [Log] |
+------------------------------------------------------------------+

--- OVERVIEW TAB ---
+------------------+  +------------------+  +-------------------+
| ACCOUNT          |  | QUICK ACTIONS    |  | HEALTH SCORE      |
| Name: John Doe   |  | [Impersonate]    |  | [========--] 78   |
| Firm: Acme CPA   |  | [Send Email]     |  | Clients: Good     |
| Plan: Team       |  | [Upgrade Plan]   |  | Storage: Warning  |
| Status: Active   |  | [Suspend]        |  | Activity: Good    |
| MRR: $55         |  | [Reset Password] |  | Payments: Good    |
+------------------+  +------------------+  +-------------------+

--- SUBSCRIPTION TAB ---
Current Plan: Team ($39/mo, monthly billing)
Extra members: 2 x $8 = $16/mo
Storage overage: 0
Total MRR: $55/mo
Next billing: Jul 1, 2026
Stripe Customer ID: cus_xxxxx [link to Stripe dashboard]

Plan History:
| Date           | Change                  | By        |
| Jun 1, 2026    | Upgraded Solo -> Team   | Customer  |
| Jan 15, 2026   | Trial started (Team)    | System    |
| Jan 29, 2026   | Trial ended -> Solo     | System    |

[Change Plan v]  [Apply Coupon]  [Cancel Subscription]

--- USAGE TAB ---
| Metric              | Current  | Limit    | % Used |
| Clients             | 142      | 250      | 57%    |
| Storage             | 43.2 GB  | 50 GB    | 86%    |
| Team members        | 7        | 5 + 2    | 100%   |
| Emails sent (month) | 324      | 1,000    | 32%    |
| Active requests     | 89       | Unlimited| -      |
| Document uploads    | 1,247    | -        | -      |

Usage over time (line chart): [clients, storage, emails over 6 months]

--- BILLING TAB ---
Invoices:
| Date        | Amount | Status  | PDF   |
| Jun 1, 2026 | $55.00 | Paid    | [dl]  |
| May 1, 2026 | $55.00 | Paid    | [dl]  |
| Apr 1, 2026 | $39.00 | Paid    | [dl]  |
| Mar 1, 2026 | $19.00 | Paid    | [dl]  |

Payment Method: Visa ending 4242, exp 12/28
Stripe Customer: cus_xxxxx [open in Stripe]

--- TEAM TAB ---
| Member          | Email              | Role   | Joined      |
| John Doe        | john@acme.com      | Owner  | Jan 15      |
| Sarah Lee       | sarah@acme.com     | Admin  | Feb 3       |
| Mike Chen       | mike@acme.com      | Member | Mar 12      |
...

Groups: [Tax Returns] [Bookkeeping] [Payroll]

--- NOTES TAB ---
Internal notes (not visible to customer):
[Add note: _________________________________ [Save]]

Jun 20 - Called about storage, considering upgrade (by: admin@middledoc)
Jun 15 - Requested bulk import feature (by: admin@middledoc)

Tags: [high-value] [at-risk] [+ Add tag]

--- AUDIT LOG TAB ---
| Timestamp        | Actor        | Action                          |
| Jun 23 10:42     | john@acme    | Uploaded 3 files to req #892    |
| Jun 23 09:15     | sarah@acme   | Created request for Client #42  |
| Jun 22 16:30     | admin@md     | Impersonated account            |
| Jun 22 14:00     | system       | Auto-reminder sent to 12 clients|
```

**Impersonate flow:**
1. Admin clicks "Impersonate"
2. Confirmation modal: "You are about to view MiddleDoc as John Doe (Acme CPA). All actions will be logged. Session expires in 1 hour."
3. Admin sees the customer's dashboard with a persistent yellow banner: "IMPERSONATION MODE - Viewing as john@acmecpa.com [End Session]"
4. All actions taken during impersonation are logged to `admin_audit_log` with `impersonated_accountant_id`
5. Click "End Session" to return to admin panel

---

### Page 4: Plans and Pricing Management

**Route:** `/admin/plans`

**Purpose:** CRUD for subscription tiers. Change prices, limits, and feature gates without code deploys.

**Layout:**
```
+------------------------------------------------------------------+
| PLANS & PRICING                                  [+ Create Plan] |
+------------------------------------------------------------------+
| Active Plans                                                      |
+------------------------------------------------------------------+
| Plan    | Monthly | Annual | Clients | Storage | Members | Subs  |
| Free    | $0      | $0     | 5       | 1 GB    | 1       | 2,341 |
| Solo    | $19     | $15    | 50      | 10 GB   | 1       | 487   |
| Team    | $39     | $32    | 250     | 50 GB   | 5       | 312   |
| Firm    | $79     | $65    | Unlim   | 200 GB  | 15      | 48    |
+------------------------------------------------------------------+

| Archived Plans                                                    |
| (Plans that are no longer offered but have existing subscribers)  |
| Beta     | $0     | $0     | 100     | 5 GB    | 3       | 23    |
+------------------------------------------------------------------+

--- PLAN EDITOR (modal or page) ---
+------------------------------------------------------------------+
| Edit Plan: Team                                                   |
+------------------------------------------------------------------+
| Display name:     [Team                    ]                      |
| Internal slug:    [team                    ] (immutable)          |
| Description:      [For small firms         ]                      |
| Monthly price:    [$39.00                  ]                      |
| Annual price/mo:  [$32.00                  ]                      |
| Extra seat price: [$8.00                   ]                      |
| Storage overage:  [$2.00         ] per GB                         |
|                                                                   |
| LIMITS                                                            |
| Max clients:        [250     ] (0 = unlimited)                    |
| Max storage (GB):   [50      ]                                    |
| Included members:   [5       ]                                    |
| Max members:        [25      ] (0 = unlimited)                    |
| Email reminders/mo: [1000    ]                                    |
| Client emails each: [5       ]                                    |
| BCC emails:         [5       ]                                    |
| Request templates:  [0       ] (0 = unlimited)                    |
| Bulk request limit: [50      ] (0 = unlimited)                    |
|                                                                   |
| FEATURE FLAGS                                                     |
| [x] Teams & groups                                                |
| [x] Client assignments                                            |
| [ ] White-label (full)                                            |
| [x] White-label (logo only)                                       |
| [ ] API access (full)                                             |
| [x] API access (read-only)                                        |
| [ ] SSO/SAML                                                      |
| [ ] Webhooks                                                      |
| [x] Activity log                                                  |
| [ ] Custom fields                                                 |
| [ ] Recurring requests                                            |
| [x] Bulk requests                                                 |
| [ ] Data export                                                   |
|                                                                   |
| Stripe Product ID: prod_xxxxx                                     |
| Stripe Monthly Price ID: price_xxxxx                              |
| Stripe Annual Price ID: price_xxxxx                               |
|                                                                   |
| [Save Draft]  [Publish Changes]  [Archive Plan]                  |
+------------------------------------------------------------------+
```

**Price change behavior:**
- Existing subscribers stay on their current price until next renewal (grandfathering)
- New subscribers get the new price immediately
- Admin can choose to apply new price to existing subscribers with 30-day notice
- All price changes logged in `admin_audit_log`

**Coupon management (sub-page):**
```
+------------------------------------------------------------------+
| COUPONS                                          [+ Create]      |
+------------------------------------------------------------------+
| Code       | Discount    | Duration   | Uses  | Expires    | Act |
| LAUNCH50   | 50% off     | 3 months   | 45/100| Jul 31     | [E] |
| PARTNER20  | 20% off     | Forever    | 12/Inf| Never      | [E] |
| TAXSEASON  | $10 off/mo  | 6 months   | 0/500 | Apr 15     | [E] |
+------------------------------------------------------------------+
```

---

### Page 5: Revenue

**Route:** `/admin/revenue`

**Purpose:** Financial health, trends, and cohort analysis.

**Layout:**
```
+------------------------------------------------------------------+
| REVENUE                                    [Date range: 12mo v]  |
+------------------------------------------------------------------+
| +--------+ +--------+ +--------+ +--------+                      |
| | MRR    | | ARR    | | ARPU   | | LTV    |                      |
| | $44.2K | | $530K  | | $52    | | $936   |                      |
| | +3.2%  | | +3.2%  | | +$2    | | +$48   |                      |
| +--------+ +--------+ +--------+ +--------+                      |
|                                                                   |
| MRR OVER TIME (line chart)                                        |
| [Stacked area: Free(gray) Solo(blue) Team(green) Firm(purple)]   |
| Shows new MRR, expansion MRR, churned MRR, net new MRR           |
|                                                                   |
| MRR MOVEMENTS (waterfall chart, monthly)                          |
| Start: $42.8K                                                     |
|   + New: $2,100                                                   |
|   + Expansion: $800                                               |
|   - Contraction: -$300                                            |
|   - Churn: -$1,200                                                |
| End: $44.2K                                                       |
|                                                                   |
| PLAN DISTRIBUTION (pie chart)                                     |
| Solo: 28% of MRR | Team: 42% | Firm: 30%                         |
|                                                                   |
| COHORT RETENTION (heatmap table)                                  |
| Signup Month | M1   | M2   | M3   | M6   | M12  |               |
| Jan 2026     | 89%  | 78%  | 72%  | 65%  | -    |               |
| Feb 2026     | 91%  | 80%  | 74%  | -    | -    |               |
| Mar 2026     | 87%  | 76%  | -    | -    | -    |               |
|                                                                   |
| FAILED PAYMENTS (dunning)                                         |
| 12 subscriptions with failed payments ($744 MRR at risk)          |
| [View all] -> leads to list with retry/contact actions            |
+------------------------------------------------------------------+
```

---

### Page 6: Analytics

**Route:** `/admin/analytics`

**Purpose:** Product usage, conversion funnels, feature adoption.

**Layout:**
```
+------------------------------------------------------------------+
| ANALYTICS                                 [Period: Last 30d v]   |
+------------------------------------------------------------------+
|                                                                   |
| USER ACTIVITY                                                     |
| +--------+ +--------+ +--------+ +--------+                      |
| | DAU    | | WAU    | | MAU    | | DAU/   |                      |
| | 234    | | 612    | | 789    | | MAU    |                      |
| |        | |        | |        | | 29.7%  |                      |
| +--------+ +--------+ +--------+ +--------+                      |
|                                                                   |
| CONVERSION FUNNEL                                                 |
| Signup ----> First Client ----> First Request ----> Paid          |
| 1,000        720 (72%)          580 (58%)          340 (34%)     |
| [Bar chart visualization of funnel with drop-off %]              |
|                                                                   |
| FEATURE USAGE (last 30 days)                                      |
| Feature              | Users  | Sessions | Trend                 |
| Document requests    | 742    | 12,400   | [up arrow]            |
| Email reminders      | 698    | 3,200    | [steady]              |
| File uploads viewed  | 651    | 8,900    | [up arrow]            |
| Rejection workflow   | 234    | 890      | [up arrow]            |
| Teams/groups         | 187    | 1,200    | [steady]              |
| Bulk requests        | 145    | 430      | [new]                 |
| Custom templates     | 312    | 780      | [steady]              |
| Client assignments   | 98     | 340      | [down arrow]          |
|                                                                   |
| STORAGE                                                           |
| Total used: 2.4 TB / 8.1 TB provisioned                          |
| Growth rate: +120 GB/month                                        |
| Customers near limit (>80%): 47                                   |
| [Histogram: storage usage distribution across customers]          |
|                                                                   |
| EMAIL METRICS                                                     |
| Sent: 34,200 | Delivered: 33,800 (98.8%) | Opened: 21,400 (63%) |
| Bounced: 400 (1.2%) | Complained: 3 (0.009%)                     |
| [Daily email volume chart]                                        |
|                                                                   |
| SIGNUP SOURCES (if tracking UTM)                                  |
| Direct: 45% | Google: 28% | Referral: 15% | Social: 12%         |
+------------------------------------------------------------------+
```

---

### Page 7: Content and Communication

**Route:** `/admin/content`

**Purpose:** Communicate with customers via announcements, emails, and help content.

**Sub-pages:**

**Announcements** (`/admin/content/announcements`)
- Create/edit/schedule in-app banners and notifications
- Target by plan, status, or tag
- Set start/end dates
- Preview before publishing

**Email Campaigns** (`/admin/content/emails`)
- Compose emails to customer segments
- Templates: welcome, feature announcement, billing reminder, survey
- Track open/click rates
- Schedule for future delivery

**Changelog** (`/admin/content/changelog`)
- Markdown editor for release notes
- Version tagging
- Publish to in-app changelog widget
- Email notification toggle (notify subscribers of new entries)

---

### Page 8: System Health

**Route:** `/admin/system`

**Purpose:** Operational health, background jobs, errors.

**Layout:**
```
+------------------------------------------------------------------+
| SYSTEM                                                            |
+------------------------------------------------------------------+
|                                                                   |
| SERVICE STATUS                                                    |
| API: [GREEN] 99.97% uptime (30d) | p50: 45ms | p99: 320ms      |
| Database: [GREEN] Connections: 23/100 | Size: 12.4 GB            |
| Storage (S3/GCS): [GREEN] 2.4 TB used                            |
| Email (SendGrid): [GREEN] 98.8% delivery rate                    |
| Payments (Stripe): [GREEN] Last webhook: 2 min ago               |
|                                                                   |
| BACKGROUND JOBS                                                   |
| Job                  | Last Run    | Next Run    | Status        |
| Email reminders      | 10:00 AM    | 10:00 AM+1d | OK            |
| Overdue checker      | 09:00 AM    | 09:00 AM+1d | OK            |
| Storage calculator   | 06:00 AM    | 06:00 AM+1d | OK            |
| MRR snapshot         | 00:00 AM    | 00:00 AM+1d | OK            |
| Trial expiration     | 08:00 AM    | 08:00 AM+1d | OK            |
| Dunning retry        | 12:00 PM    | 12:00 PM+1d | OK            |
|                                                                   |
| ERROR LOG (last 24h)                                              |
| 3 errors | 12 warnings                                           |
| [10:42] ERROR: Stripe webhook timeout for evt_xxx (retried OK)   |
| [09:15] WARN: Email bounce rate >1% for domain @old-isp.com      |
| [08:30] ERROR: Storage upload failed for customer #234 (S3 503)  |
| [Full error log ->]                                               |
|                                                                   |
| DATABASE                                                          |
| Size: 12.4 GB | Growth: +200 MB/month                            |
| Slow queries (>500ms): 2 in last 24h [View]                      |
| Connection pool: 23/100 active                                    |
+------------------------------------------------------------------+
```

---

### Page 9: Security and Compliance

**Route:** `/admin/security`

**Purpose:** Audit trail, GDPR compliance, suspicious activity.

**Sub-pages:**

**Audit Log** (`/admin/security/audit-log`)
```
+------------------------------------------------------------------+
| AUDIT LOG                                [Filter] [Export]       |
+------------------------------------------------------------------+
| Timestamp        | Actor           | Action          | Target     |
| Jun 23 10:42     | admin@md        | impersonate     | cust #234  |
| Jun 23 10:40     | admin@md        | view_customer   | cust #234  |
| Jun 23 09:15     | admin@md        | change_plan     | cust #102  |
| Jun 23 09:00     | system          | dunning_retry   | cust #89   |
+------------------------------------------------------------------+
```

**Data Requests** (`/admin/security/data-requests`)
- GDPR data export requests (customer-initiated or admin-initiated)
- Account deletion requests with grace period status
- Data processing agreements

**Security Alerts** (`/admin/security/alerts`)
- Failed login attempts (grouped by IP and account)
- Suspicious patterns (bulk downloads, unusual access times)
- API key abuse (rate limit violations)

---

## 5. Stripe Integration Plan

### Architecture

```
MiddleDoc App                          Stripe
+------------------+                   +------------------+
| Signup Flow      |                   | Products         |
|   |              |                   |   solo_monthly   |
|   v              |                   |   solo_annual    |
| Select Plan -----|--- Create ------->|   team_monthly   |
|   |              |   Customer +      |   team_annual    |
|   v              |   Subscription    |   firm_monthly   |
| Checkout --------|--- Checkout ----->|   firm_annual    |
|   |              |   Session         |                  |
|   v              |                   | Prices           |
| Webhook <--------|--- Events --------|   (per plan/     |
|   |              |                   |    interval)     |
|   v              |                   |                  |
| Update DB        |                   | Coupons          |
+------------------+                   +------------------+
```

### Stripe Objects to Create

**Products (one per plan):**
- `prod_solo` - MiddleDoc Solo
- `prod_team` - MiddleDoc Team
- `prod_firm` - MiddleDoc Firm
- `prod_extra_seat` - Additional Team Member (metered)
- `prod_extra_storage` - Additional Storage GB (metered)

**Prices (two per product for monthly/annual):**
- `price_solo_monthly` - $19/mo
- `price_solo_annual` - $180/yr ($15/mo)
- `price_team_monthly` - $39/mo
- `price_team_annual` - $384/yr ($32/mo)
- `price_firm_monthly` - $79/mo
- `price_firm_annual` - $780/yr ($65/mo)
- `price_extra_seat` - $8/mo (quantity-based)
- `price_extra_storage` - $2/mo (metered, usage-based)

### Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription, update DB |
| `customer.subscription.created` | Record subscription start |
| `customer.subscription.updated` | Handle plan changes, quantity changes |
| `customer.subscription.deleted` | Mark as cancelled, start grace period |
| `invoice.paid` | Record payment, clear any past-due flags |
| `invoice.payment_failed` | Start dunning sequence, notify admin |
| `invoice.upcoming` | Pre-billing notifications (optional) |
| `customer.updated` | Sync customer details |
| `charge.refunded` | Record refund, notify admin |
| `charge.dispute.created` | Flag account, notify admin immediately |

### Dunning (Failed Payment) Sequence

1. **Day 0:** Payment fails. Stripe retries automatically (Smart Retries).
2. **Day 1:** Email customer: "Payment failed, please update your card."
3. **Day 3:** Second email + in-app banner warning.
4. **Day 7:** Third email. Account marked "Past Due" in admin panel.
5. **Day 14:** Final email. Account features restricted (read-only mode -- can view but not create new requests).
6. **Day 21:** Subscription cancelled. Account downgraded to Free tier. Data preserved for 90 days.

### Checkout Flow

1. Customer selects plan on pricing page
2. App creates Stripe Checkout Session with `mode: 'subscription'`
3. Customer completes payment on Stripe-hosted checkout
4. Stripe redirects to `/billing/success?session_id=xxx`
5. Webhook fires `checkout.session.completed`
6. App updates `subscriptions` table with Stripe IDs and plan details
7. Customer sees their new plan immediately

### Customer Portal

Use Stripe Customer Portal for self-service:
- Update payment method
- View invoices
- Cancel subscription
- Switch plans (within configured allowable transitions)

This avoids building custom billing UI and is PCI-compliant by default.

---

## 6. Database Schema Additions

### New Tables

```sql
-- ============================================================
-- SUBSCRIPTION & BILLING
-- ============================================================

-- Pricing plans (admin-managed)
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,           -- 'free', 'solo', 'team', 'firm'
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL DEFAULT 0,
  annual_price_cents INTEGER NOT NULL DEFAULT 0,  -- annual total, not per-month
  extra_seat_price_cents INTEGER NOT NULL DEFAULT 0,
  storage_overage_price_cents INTEGER NOT NULL DEFAULT 0, -- per GB/mo
  max_clients INTEGER NOT NULL DEFAULT 0,     -- 0 = unlimited
  max_storage_gb INTEGER NOT NULL DEFAULT 1,
  included_team_members INTEGER NOT NULL DEFAULT 1,
  max_team_members INTEGER NOT NULL DEFAULT 1, -- 0 = unlimited
  max_email_reminders_per_month INTEGER NOT NULL DEFAULT 20,
  max_client_emails INTEGER NOT NULL DEFAULT 1,
  max_bcc_emails INTEGER NOT NULL DEFAULT 0,
  max_request_templates INTEGER NOT NULL DEFAULT 0, -- 0 = unlimited
  max_bulk_requests INTEGER NOT NULL DEFAULT 0,     -- 0 = unlimited
  -- Feature flags
  feature_teams BOOLEAN NOT NULL DEFAULT false,
  feature_groups BOOLEAN NOT NULL DEFAULT false,
  feature_client_assignments BOOLEAN NOT NULL DEFAULT false,
  feature_whitelabel_logo BOOLEAN NOT NULL DEFAULT false,
  feature_whitelabel_full BOOLEAN NOT NULL DEFAULT false,
  feature_api_readonly BOOLEAN NOT NULL DEFAULT false,
  feature_api_full BOOLEAN NOT NULL DEFAULT false,
  feature_sso BOOLEAN NOT NULL DEFAULT false,
  feature_webhooks BOOLEAN NOT NULL DEFAULT false,
  feature_activity_log BOOLEAN NOT NULL DEFAULT false,
  feature_custom_fields BOOLEAN NOT NULL DEFAULT false,
  feature_recurring_requests BOOLEAN NOT NULL DEFAULT false,
  feature_data_export BOOLEAN NOT NULL DEFAULT false,
  -- Stripe mapping
  stripe_product_id VARCHAR(255),
  stripe_monthly_price_id VARCHAR(255),
  stripe_annual_price_id VARCHAR(255),
  -- Lifecycle
  is_active BOOLEAN NOT NULL DEFAULT true,    -- false = archived
  is_public BOOLEAN NOT NULL DEFAULT true,    -- false = hidden from pricing page
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Customer subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status VARCHAR(30) NOT NULL DEFAULT 'trialing',
    -- trialing, active, past_due, cancelled, suspended
  billing_interval VARCHAR(10) NOT NULL DEFAULT 'monthly',
    -- monthly, annual
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  -- Extra seats and storage
  extra_seats INTEGER NOT NULL DEFAULT 0,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  -- Stripe mapping
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_subscriptions_accountant
  ON subscriptions(accountant_id)
  WHERE status IN ('trialing', 'active', 'past_due');
  -- Ensures one active subscription per accountant

CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Payment/invoice history (synced from Stripe webhooks)
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(30) NOT NULL, -- draft, open, paid, void, uncollectible
  invoice_url TEXT,
  invoice_pdf TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);

-- Coupons (synced with Stripe)
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(10) NOT NULL, -- 'percent' or 'amount'
  discount_value INTEGER NOT NULL,    -- percentage (e.g. 50) or cents (e.g. 1000)
  currency VARCHAR(3) DEFAULT 'usd',
  duration VARCHAR(20) NOT NULL,      -- 'once', 'repeating', 'forever'
  duration_months INTEGER,            -- only if duration = 'repeating'
  max_redemptions INTEGER,            -- null = unlimited
  times_redeemed INTEGER NOT NULL DEFAULT 0,
  applies_to_plans INTEGER[],         -- plan IDs, null = all plans
  expires_at TIMESTAMPTZ,
  stripe_coupon_id VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Coupon redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id SERIAL PRIMARY KEY,
  coupon_id INTEGER NOT NULL REFERENCES coupons(id),
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  redeemed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coupon_id, subscription_id)
);

-- ============================================================
-- MRR TRACKING
-- ============================================================

-- Daily MRR snapshots for revenue charts
CREATE TABLE IF NOT EXISTS mrr_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL UNIQUE,
  total_mrr_cents INTEGER NOT NULL,
  free_count INTEGER NOT NULL DEFAULT 0,
  solo_mrr_cents INTEGER NOT NULL DEFAULT 0,
  solo_count INTEGER NOT NULL DEFAULT 0,
  team_mrr_cents INTEGER NOT NULL DEFAULT 0,
  team_count INTEGER NOT NULL DEFAULT 0,
  firm_mrr_cents INTEGER NOT NULL DEFAULT 0,
  firm_count INTEGER NOT NULL DEFAULT 0,
  extra_seats_mrr_cents INTEGER NOT NULL DEFAULT 0,
  storage_mrr_cents INTEGER NOT NULL DEFAULT 0,
  new_mrr_cents INTEGER NOT NULL DEFAULT 0,
  expansion_mrr_cents INTEGER NOT NULL DEFAULT 0,
  contraction_mrr_cents INTEGER NOT NULL DEFAULT 0,
  churned_mrr_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ADMIN SYSTEM
-- ============================================================

-- Super admins (platform operators, NOT accountants)
CREATE TABLE IF NOT EXISTS super_admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
    -- super_admin, admin, support, viewer
  totp_secret VARCHAR(255),        -- encrypted TOTP seed
  totp_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admin audit log (immutable, append-only)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES super_admins(id),
  action VARCHAR(100) NOT NULL,
    -- e.g. 'impersonate', 'change_plan', 'suspend_account',
    -- 'create_coupon', 'view_customer', 'export_data'
  target_type VARCHAR(50),           -- 'accountant', 'subscription', 'plan', 'coupon'
  target_id INTEGER,
  details JSONB,                     -- flexible payload for action-specific data
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX idx_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX idx_audit_log_created ON admin_audit_log(created_at);

-- Customer notes and tags
CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  admin_id INTEGER NOT NULL REFERENCES super_admins(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_notes_accountant ON customer_notes(accountant_id);

CREATE TABLE IF NOT EXISTS customer_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280', -- hex color
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_tag_assignments (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(accountant_id, tag_id)
);

-- ============================================================
-- PLATFORM ANALYTICS
-- ============================================================

-- Daily usage snapshots per customer (for usage charts and limit enforcement)
CREATE TABLE IF NOT EXISTS usage_snapshots (
  id BIGSERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  client_count INTEGER NOT NULL DEFAULT 0,
  active_request_count INTEGER NOT NULL DEFAULT 0,
  total_upload_count INTEGER NOT NULL DEFAULT 0,
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  emails_sent_count INTEGER NOT NULL DEFAULT 0,
  team_member_count INTEGER NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  UNIQUE(accountant_id, snapshot_date)
);

CREATE INDEX idx_usage_snapshots_date ON usage_snapshots(snapshot_date);

-- Aggregate platform metrics (daily)
CREATE TABLE IF NOT EXISTS platform_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  total_accountants INTEGER NOT NULL DEFAULT 0,
  new_signups INTEGER NOT NULL DEFAULT 0,
  dau INTEGER NOT NULL DEFAULT 0,
  wau INTEGER NOT NULL DEFAULT 0,
  mau INTEGER NOT NULL DEFAULT 0,
  total_clients INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_uploads INTEGER NOT NULL DEFAULT 0,
  total_storage_bytes BIGINT NOT NULL DEFAULT 0,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_delivered INTEGER NOT NULL DEFAULT 0,
  emails_bounced INTEGER NOT NULL DEFAULT 0,
  emails_opened INTEGER NOT NULL DEFAULT 0,
  api_requests INTEGER NOT NULL DEFAULT 0,
  avg_response_ms INTEGER,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- CONTENT & COMMUNICATION
-- ============================================================

-- System announcements (in-app banners)
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  announcement_type VARCHAR(20) NOT NULL DEFAULT 'info',
    -- info, warning, success, maintenance
  target_plans VARCHAR(50)[] DEFAULT '{}', -- empty = all plans
  target_statuses VARCHAR(30)[] DEFAULT '{}', -- empty = all statuses
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_dismissible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Changelog entries
CREATE TABLE IF NOT EXISTS changelog_entries (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,                 -- markdown
  category VARCHAR(30) DEFAULT 'improvement',
    -- feature, improvement, fix, breaking
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  notify_subscribers BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES super_admins(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SECURITY & COMPLIANCE
-- ============================================================

-- Data export/deletion requests (GDPR)
CREATE TABLE IF NOT EXISTS data_requests (
  id SERIAL PRIMARY KEY,
  accountant_id INTEGER NOT NULL REFERENCES accountants(id),
  request_type VARCHAR(20) NOT NULL, -- 'export', 'deletion'
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, cancelled
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  download_url TEXT,                  -- for exports, time-limited signed URL
  download_expires_at TIMESTAMPTZ,
  processed_by INTEGER REFERENCES super_admins(id),
  notes TEXT
);

CREATE INDEX idx_data_requests_accountant ON data_requests(accountant_id);
CREATE INDEX idx_data_requests_status ON data_requests(status);

-- Failed login tracking
CREATE TABLE IF NOT EXISTS failed_logins (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_type VARCHAR(20) NOT NULL DEFAULT 'customer',
    -- customer, admin
  attempted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_failed_logins_email ON failed_logins(email);
CREATE INDEX idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX idx_failed_logins_at ON failed_logins(attempted_at);

-- ============================================================
-- MODIFICATIONS TO EXISTING TABLES
-- ============================================================

-- Add last_login_at to accountants for activity tracking
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Add suspended flag to accountants
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE accountants ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
```

### Entity Relationship Summary

```
super_admins --(writes)--> admin_audit_log
super_admins --(writes)--> customer_notes
super_admins --(manages)--> plans
super_admins --(manages)--> coupons
super_admins --(manages)--> announcements
super_admins --(manages)--> changelog_entries

accountants --(has one)--> subscriptions --(belongs to)--> plans
subscriptions --(has many)--> invoices
subscriptions --(has many)--> coupon_redemptions --(belongs to)--> coupons

accountants --(has many)--> usage_snapshots
accountants --(has many)--> customer_notes
accountants --(has many)--> customer_tag_assignments --(belongs to)--> customer_tags
accountants --(has many)--> data_requests

platform_metrics (daily aggregate, no FK)
mrr_snapshots (daily aggregate, no FK)
failed_logins (append-only log, no FK to accountants -- tracks by email)
```

---

## 7. Build Priority and Effort Estimates

### Phase 1: Foundation (Weeks 1-3) -- MUST HAVE FOR LAUNCH

These are the absolute minimum to accept money.

| Item | Effort | Description |
|------|--------|-------------|
| `plans` table + seed data | 0.5 days | Create the 4 tiers with limits and feature flags |
| `subscriptions` table | 0.5 days | Core subscription tracking |
| Stripe Products/Prices setup | 0.5 days | Create products and prices in Stripe dashboard |
| Stripe Checkout integration | 2 days | Checkout Session creation, success/cancel redirects |
| Stripe Webhook handler | 2 days | Handle subscription lifecycle events |
| Plan limit enforcement | 3 days | Middleware/helpers that check client count, storage, features before allowing actions |
| Free tier logic | 1 day | Default plan assignment on signup, limit enforcement |
| Trial logic | 1 day | 14-day trial, auto-downgrade to Free on expiry |
| Basic billing page (customer) | 1 day | Show current plan, link to Stripe Customer Portal |
| `super_admins` table + auth | 1 day | Separate login, JWT, TOTP setup |
| Admin middleware | 0.5 days | Route protection for /admin/* |

**Phase 1 total: ~13 days (roughly 3 weeks for one developer)**

---

### Phase 2: Admin Panel Core (Weeks 4-6)

The operator needs to see what is happening.

| Item | Effort | Description |
|------|--------|-------------|
| Admin Dashboard page | 2 days | Key metrics cards, signup chart, revenue chart, activity feed |
| Customer List page | 2 days | Table with search, filters, pagination, sorting |
| Customer Detail page | 3 days | All tabs: overview, subscription, usage, billing, team, notes |
| Plan management CRUD | 1.5 days | Edit tiers, feature flags, prices (syncs to Stripe) |
| `admin_audit_log` + logging | 1 day | Log all admin actions automatically |
| `customer_notes` + `customer_tags` | 1 day | Notes and tagging on customer detail |
| Impersonation | 1.5 days | Secure impersonation with audit trail and session management |

**Phase 2 total: ~12 days (roughly 3 weeks)**

---

### Phase 3: Revenue and Analytics (Weeks 7-9)

Understanding the business.

| Item | Effort | Description |
|------|--------|-------------|
| `invoices` table + Stripe sync | 1 day | Populate from webhook events |
| Revenue page (MRR charts) | 2 days | MRR over time, waterfall, plan distribution |
| `mrr_snapshots` + daily job | 1 day | Nightly job to snapshot MRR data |
| Cohort retention analysis | 2 days | Signup cohort heatmap |
| Coupon management | 1.5 days | CRUD + Stripe sync |
| Dunning management UI | 1 day | View failed payments, manual retry, contact |
| `usage_snapshots` + daily job | 1 day | Nightly job to snapshot per-customer usage |
| `platform_metrics` + daily job | 1 day | Nightly aggregate metrics job |
| Analytics page (usage, funnels) | 2.5 days | DAU/MAU, conversion funnel, feature usage, email metrics |

**Phase 3 total: ~13 days (roughly 3 weeks)**

---

### Phase 4: Communication and Compliance (Weeks 10-12)

Communicating with customers and staying compliant.

| Item | Effort | Description |
|------|--------|-------------|
| Announcements system | 2 days | CRUD, targeting, scheduling, in-app display |
| Changelog system | 1.5 days | Markdown editor, versioning, publish flow |
| `data_requests` + GDPR export | 2 days | Data export job, download link generation |
| Account deletion flow | 1 day | Request, grace period, permanent deletion |
| `failed_logins` tracking | 0.5 days | Log failed attempts, display in admin |
| Security alerts page | 1 day | Suspicious activity flags, failed login grouping |
| System health page | 2 days | DB stats, job status, error log, API metrics |

**Phase 4 total: ~10 days (roughly 2.5 weeks)**

---

### Phase 5: Polish and Advanced (Weeks 13+)

Nice to have, builds on the foundation.

| Item | Effort | Description |
|------|--------|-------------|
| Email campaigns from admin | 3 days | Compose, segment, schedule, track |
| Storage overage billing (metered) | 2 days | Usage reporting to Stripe, automated invoicing |
| Extra seat billing (metered) | 1.5 days | Quantity-based subscription items |
| Advanced analytics (storage histogram, email metrics) | 2 days | Detailed breakdowns |
| A/B testing framework for pricing | 3 days | Show different prices to different cohorts |
| Customer health score algorithm | 2 days | Composite score based on usage, payments, activity |
| Bulk admin operations | 1.5 days | Mass email, mass tag, mass plan change |
| Admin role-based access (viewer vs support vs admin) | 1.5 days | Restrict actions by admin role |

**Phase 5 total: ~16 days (roughly 4 weeks)**

---

### Total Effort Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 3 weeks | Stripe integration, plan enforcement, trial, basic admin auth |
| Phase 2 | 3 weeks | Admin panel core pages (dashboard, customers, plans) |
| Phase 3 | 3 weeks | Revenue analytics, MRR tracking, coupons, usage metrics |
| Phase 4 | 2.5 weeks | Communication tools, GDPR compliance, system health |
| Phase 5 | 4 weeks | Advanced features, polish, metered billing |
| **Total** | **~15.5 weeks** | **Full implementation for one full-stack developer** |

With two developers working in parallel (one on Stripe/billing, one on admin UI), Phases 1-3 could compress to about 6 weeks total, getting to a fully operational admin panel with revenue tracking in under two months.

---

### What to Build Before Public Launch

**Minimum for accepting money (Phase 1):** Plans, Stripe Checkout, webhook handling, limit enforcement, free tier, trial logic. This is the non-negotiable baseline.

**Minimum for operating the business (Phase 1 + 2):** Add the admin dashboard, customer list, customer detail, and impersonation. Without these, you cannot provide customer support or understand what is happening on the platform.

**Nice for launch but not blocking (Phase 3):** Revenue analytics and coupons. You can track MRR manually in Stripe's dashboard initially. Coupons can be created directly in Stripe if needed before the admin UI exists.

**Can wait until post-launch (Phases 4-5):** Communication tools, GDPR automation, advanced analytics. Handle these manually for the first few months while the customer base is small.

---

## Appendix: Tech Stack Specifics

### Current Stack (from codebase analysis)
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via `pg` driver, no ORM)
- **Email:** SendGrid (`@sendgrid/mail`)
- **Auth:** Custom JWT (via `jose` + `bcryptjs`)
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest

### Additions Needed
- **`stripe` npm package** -- Official Stripe SDK for Node.js
- **`@stripe/stripe-js`** -- Client-side Stripe.js for Checkout redirect
- **`otplib`** -- TOTP generation/verification for admin 2FA
- **`qrcode`** -- QR code generation for TOTP enrollment
- **No ORM needed** -- Continue using raw `pg` queries for consistency with existing codebase

### Admin Panel UI Approach
- Use the existing Tailwind setup
- Admin pages live under `app/(admin)/admin/` route group
- Charts: Consider `recharts` or `chart.js` (lightweight, React-compatible)
- Tables: Build a reusable `<DataTable>` component with sorting, filtering, pagination
- Modals: Build a reusable `<Modal>` component using native `<dialog>` element
- No need for a separate UI framework -- keep it consistent with the customer-facing app

### Database Approach
- Same PostgreSQL database, no separate schema needed at this scale
- Admin tables are prefixed or clearly named (`super_admins`, `admin_audit_log`)
- The `plans` and `subscriptions` tables integrate directly with existing `accountants` table
- All new tables include proper indexes and foreign keys as shown in the schema above
- Consider adding a `_admin` prefix to admin-only views if query complexity grows
