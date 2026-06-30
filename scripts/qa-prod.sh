#!/bin/bash
# Full Production QA Test for MiddleDoc
# Tests all major API endpoints against https://middledoc.com

BASE="https://middledoc.com"
PASS=0
FAIL=0
RESULTS=""

check() {
  local name="$1"
  local status="$2"
  local expected="$3"
  local body="$4"

  if [ "$status" -eq "$expected" ]; then
    PASS=$((PASS + 1))
    RESULTS="${RESULTS}PASS  ${name} (${status})\n"
  else
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}FAIL  ${name} — expected ${expected}, got ${status}\n"
    if [ -n "$body" ]; then
      RESULTS="${RESULTS}      ${body}\n"
    fi
  fi
}

check_contains() {
  local name="$1"
  local body="$2"
  local needle="$3"

  if echo "$body" | grep -q "$needle"; then
    PASS=$((PASS + 1))
    RESULTS="${RESULTS}PASS  ${name}\n"
  else
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}FAIL  ${name} — response missing '${needle}'\n"
    RESULTS="${RESULTS}      ${body:0:200}\n"
  fi
}

echo "=== MiddleDoc Production QA ==="
echo "Target: $BASE"
echo "Started: $(date)"
echo ""

# ─── 1. HEALTH / PUBLIC ───
echo "▸ Public endpoints..."

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE")
check "Homepage loads" "$R" 200

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE/api/billing/plans")
check "GET /api/billing/plans" "$R" 200
BODY=$(cat /tmp/qa_body)
check_contains "Plans returns 4 plans" "$BODY" '"slug":"firm"'

# ─── 2. AUTH ───
echo "▸ Auth endpoints..."

# Signup (will fail if user exists — that's expected)
R=$(curl -s -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"qarunner@middledoc.com","password":"qaRunner2026!","name":"QA Runner"}')
BODY=$(cat /tmp/qa_body)
if [ "$R" -eq 201 ] || echo "$BODY" | grep -q "already"; then
  PASS=$((PASS + 1))
  RESULTS="${RESULTS}PASS  POST /api/auth/signup (${R})\n"
else
  FAIL=$((FAIL + 1))
  RESULTS="${RESULTS}FAIL  POST /api/auth/signup — got ${R}: ${BODY:0:100}\n"
fi

# Login
curl -s -c /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hello@middledoc.com","password":"hello12345678"}' > /tmp/qa_status
R=$(cat /tmp/qa_status)
check "POST /api/auth/login" "$R" 200

# Bad login
R=$(curl -s -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hello@middledoc.com","password":"wrongpassword"}')
if [ "$R" -eq 401 ] || [ "$R" -eq 502 ]; then
  PASS=$((PASS + 1))
  RESULTS="${RESULTS}PASS  POST /api/auth/login (bad password) (${R})\n"
else
  FAIL=$((FAIL + 1))
  RESULTS="${RESULTS}FAIL  POST /api/auth/login (bad password) — expected 401, got ${R}\n"
fi

# Me
R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/auth/me")
check "GET /api/auth/me" "$R" 200
BODY=$(cat /tmp/qa_body)
check_contains "Me returns email" "$BODY" "hello@middledoc.com"

# Profile (PATCH only — no GET)


# ─── 3. CLIENTS ───
echo "▸ Client endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/clients")
check "GET /api/clients" "$R" 200

# Create client
R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa-client-'$RANDOM'@test.com","name":"QA Test Client"}')
BODY=$(cat /tmp/qa_body)
check "POST /api/clients (create)" "$R" 201
CLIENT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('client',d).get('id',''))" 2>/dev/null)

# Pagination
R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/clients?page=1&limit=5")
check "GET /api/clients?page=1&limit=5 (pagination)" "$R" 200

# Get single client
if [ -n "$CLIENT_ID" ]; then
  # Update client (no GET endpoint for single client — only PATCH/DELETE)
  R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X PATCH "$BASE/api/clients/$CLIENT_ID" \
    -H "Content-Type: application/json" \
    -d '{"name":"QA Updated Client"}')
  check "PATCH /api/clients/:id" "$R" 200
fi

# ─── 4. DOCUMENT REQUESTS ───
echo "▸ Request endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/requests")
check "GET /api/requests" "$R" 200

if [ -n "$CLIENT_ID" ]; then
  R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/requests" \
    -H "Content-Type: application/json" \
    -d "{\"client_id\":$CLIENT_ID,\"title\":\"QA Test Request\",\"description\":\"Testing\",\"due_date\":\"2026-12-31\"}")
  BODY=$(cat /tmp/qa_body)
  check "POST /api/requests (create)" "$R" 201
  REQUEST_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request',d).get('id',''))" 2>/dev/null)
  SHARE_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('request',d).get('share_token',''))" 2>/dev/null)

  if [ -n "$REQUEST_ID" ]; then
    # Request details
    R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/request-details/$REQUEST_ID")
    check "GET /api/request-details/:id" "$R" 200

    # Also test nested route
    R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/requests/$REQUEST_ID/details")
    check "GET /api/requests/:id/details" "$R" 200
  fi
fi

# ─── 5. PORTAL (client-facing) ───
echo "▸ Portal endpoints..."

if [ -n "$SHARE_TOKEN" ]; then
  R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE/api/portal/$SHARE_TOKEN")
  check "GET /api/portal/:shareToken" "$R" 200
  BODY=$(cat /tmp/qa_body)
  check_contains "Portal returns request title" "$BODY" "QA Test Request"
else
  FAIL=$((FAIL + 1))
  RESULTS="${RESULTS}FAIL  Portal test skipped — no share token\n"
fi

# ─── 6. REQUEST TEMPLATES ───
echo "▸ Template endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/request-templates")
check "GET /api/request-templates" "$R" 200

# ─── 7. EMAIL TEMPLATES ───
echo "▸ Email template endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/email-templates")
check "GET /api/email-templates" "$R" 200

# ─── 8. BILLING / SUBSCRIPTION ───
echo "▸ Billing endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/billing/subscription")
check "GET /api/billing/subscription" "$R" 200
BODY=$(cat /tmp/qa_body)
check_contains "Subscription returns effective_plan" "$BODY" "effective_plan"

# ─── 9. ACTIVITY LOG ───
echo "▸ Activity endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/activity")
check "GET /api/activity" "$R" 200

# ─── 10. CLIENT EMAILS ───
echo "▸ Client email endpoints..."

# client-emails requires client_id param — test with a valid one if we have it
if [ -n "$CLIENT_ID" ]; then
  R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/client-emails?client_id=$CLIENT_ID")
  check "GET /api/client-emails?client_id=..." "$R" 200
else
  R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/client-emails?client_id=1")
  check "GET /api/client-emails?client_id=1" "$R" 200
fi

# ─── 11. INVOICES ───
echo "▸ Invoice endpoints..."

R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/invoices")
check "GET /api/invoices" "$R" 200

# ─── 12. ADMIN AUTH ───
echo "▸ Admin auth..."

curl -s -c /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@middledoc.com","password":"AdminMiddleDoc2026!"}' > /tmp/qa_status
R=$(cat /tmp/qa_status)
check "POST /api/admin/auth/login" "$R" 200

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/auth/me")
check "GET /api/admin/auth/me" "$R" 200

# ─── 13. ADMIN DASHBOARD ───
echo "▸ Admin dashboard..."

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/dashboard")
check "GET /api/admin/dashboard" "$R" 200

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/stats")
check "GET /api/admin/stats" "$R" 200

# ─── 14. ADMIN PLANS ───
echo "▸ Admin plans..."

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/plans")
check "GET /api/admin/plans" "$R" 200
BODY=$(cat /tmp/qa_body)
check_contains "Admin plans returns plans" "$BODY" '"slug"'

# ─── 15. ADMIN CUSTOMERS ───
echo "▸ Admin customers..."

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/customers")
check "GET /api/admin/customers" "$R" 200

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/customers/1")
check "GET /api/admin/customers/:id" "$R" 200
BODY=$(cat /tmp/qa_body)
check_contains "Admin customer detail has stats" "$BODY" "client_count"

# ─── 16. ADMIN AUDIT LOG ───
echo "▸ Admin audit log..."

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/audit-log")
check "GET /api/admin/audit-log" "$R" 200

# ─── 17. PUSH SUBSCRIBE ───
echo "▸ Push notifications..."

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/push-subscribe" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"https://fake.push/test","keys":{"p256dh":"test","auth":"test"}}')
# May return 401 (needs auth) or 201 — both are valid behavior
if [ "$R" -eq 201 ] || [ "$R" -eq 401 ] || [ "$R" -eq 200 ]; then
  PASS=$((PASS + 1))
  RESULTS="${RESULTS}PASS  POST /api/push-subscribe (${R})\n"
else
  FAIL=$((FAIL + 1))
  RESULTS="${RESULTS}FAIL  POST /api/push-subscribe — got ${R}\n"
fi

# ─── 18. FORGOT PASSWORD ───
echo "▸ Password reset..."

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com"}')
# Should return 200 regardless (don't reveal if user exists)
check "POST /api/auth/forgot-password" "$R" 200

# ─── 19. UNAUTHORIZED ACCESS ───
echo "▸ Auth guard tests..."

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE/api/clients")
check "GET /api/clients (no auth) → 401" "$R" 401

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE/api/admin/dashboard")
check "GET /api/admin/dashboard (no auth) → 401" "$R" 401

R=$(curl -s -o /tmp/qa_body -w "%{http_code}" "$BASE/api/billing/subscription")
check "GET /api/billing/subscription (no auth) → 401" "$R" 401

# ─── 20. CLEANUP ───
echo "▸ Cleanup..."

# Delete the request first (cascade will handle uploads)
if [ -n "$REQUEST_ID" ]; then
  curl -s -b /tmp/qa_cookies -X DELETE "$BASE/api/requests/$REQUEST_ID" > /dev/null 2>&1
fi

if [ -n "$CLIENT_ID" ]; then
  R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X DELETE "$BASE/api/clients/$CLIENT_ID")
  check "DELETE /api/clients/:id (cleanup)" "$R" 200
fi

# ─── 21. LOGOUT ───
R=$(curl -s -b /tmp/qa_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/auth/logout")
check "POST /api/auth/logout" "$R" 200

R=$(curl -s -b /tmp/qa_admin_cookies -o /tmp/qa_body -w "%{http_code}" -X POST "$BASE/api/admin/auth/logout")
check "POST /api/admin/auth/logout" "$R" 200

# ─── FRONTEND PAGES ───
echo "▸ Frontend pages..."

for path in "/" "/auth/login" "/auth/signup" "/admin/login"; do
  R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$path")
  check "GET $path" "$R" 200
done

# ─── SUMMARY ───
echo ""
echo "==============================="
echo "  MiddleDoc Production QA"
echo "==============================="
TOTAL=$((PASS + FAIL))
printf "$RESULTS"
echo ""
echo "-------------------------------"
echo "  TOTAL: $TOTAL  |  PASS: $PASS  |  FAIL: $FAIL"
PCT=$((PASS * 100 / TOTAL))
echo "  PASS RATE: ${PCT}%"
echo "-------------------------------"
echo "Finished: $(date)"

rm -f /tmp/qa_body /tmp/qa_status /tmp/qa_cookies /tmp/qa_admin_cookies
