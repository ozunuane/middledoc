# QA Strategy for Phase 2

## Coverage Goals

Target minimum code coverage by component type:

| Category | Target | Rationale |
|----------|--------|-----------|
| API Routes (`app/api/`) | 85% | Business logic; must be thoroughly tested |
| Database Utils (`lib/db.ts`, `lib/queries/`) | 90% | Pure functions; high testability; critical for data integrity |
| Auth Utils (`lib/auth.ts`, `lib/middleware.ts`) | 90% | Security-critical; extensive edge cases |
| React Components | 80% | UI testing is slower; focus on behavior over visual details |
| Utility Functions (`lib/`, `utils/`) | 85% | High ROI; easier to test than components |
| **Overall Project** | 80% | Balanced approach; focus on critical paths |

**Coverage measured by:**
- Line coverage: % of lines executed
- Branch coverage: % of conditional branches taken
- Function coverage: % of functions called
- Statement coverage: % of statements executed

---

## Testing Pyramid

```
        /\
       /  \
      /____\  E2E Tests (~5%)
     /      \  - Full user workflows
    /        \  - Browser automation
   /          \  - 3-5 critical paths
  /____________\

  /            \
 /              \  Integration Tests (~25%)
/________________\  - API + Database
                  - Component + Hooks
                  - Realistic scenarios
                  - Error cases

/                  \
                    \  Unit Tests (~70%)
/____________________\  - Individual functions
                        - Isolated components
                        - Mock dependencies
                        - Fast execution < 100ms
```

---

## Test Types and Scope

### Unit Tests (70% - Fast, Isolated)

**File locations:** `*.test.ts`, `*.spec.ts` alongside source code

**Examples:**
- `lib/auth.ts` → `lib/auth.test.ts`
- `app/api/auth/signup/route.ts` → `app/api/auth/signup/route.test.ts`
- `components/StatusBadge.tsx` → `components/StatusBadge.test.tsx`

**Characteristics:**
- Test one function or component in isolation
- Mock all external dependencies (DB, API calls, file system)
- Execute in < 100ms
- No real database or network calls
- Deterministic (no flakiness)

**Run with:**
```bash
npm run test -- lib/
npm run test -- components/
```

---

### Integration Tests (25% - Slower, Realistic)

**File locations:** `__tests__/integration/` directory

**Examples:**
- Create client → Verify in database
- File upload → Auto-update request status
- Login → Verify cookie and redirect

**Characteristics:**
- Test multiple components working together
- Use real or seeded test database
- Test with actual API responses
- Verify side effects (database changes, redirects)
- Slower than unit tests (1-5 seconds per test)

**Run with:**
```bash
npm run test -- __tests__/integration/
```

---

### End-to-End Tests (5% - Critical User Flows Only)

**File locations:** `e2e/` directory (Playwright, Cypress, or Selenium)

**Critical paths to test:**
1. Accountant signup → login → create client → create request → download file
2. Client receives share link → uploads file → accountant downloads
3. Error scenarios (network failure, file too large)

**Characteristics:**
- Run in real browser (Chrome, Firefox, Safari)
- Test full UI workflows
- Very slow (10-60 seconds per test)
- Flaky due to network/timing issues
- Only test 3-5 most critical paths
- Run nightly, not on every commit

**Note:** E2E setup (Playwright/Cypress) is Phase 3 scope. Phase 2 focuses on unit + integration.

---

## Automation and CI/CD Integration

### Local Development
```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file change)
npm run test:watch

# Run with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Pre-Commit Hook (Recommended)

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run test -- --run --bail
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

This prevents committing code with failing tests.

### CI/CD Pipeline (GitHub Actions Example)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test -- --run --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Testing Checklist Before Merge

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage > 80%
- [ ] No console errors or warnings
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All accessibility requirements met

---

## Test Data and Fixtures

### Seed Data

Create `test/fixtures/data.ts`:
```typescript
export const testAccountant = {
  id: 1,
  email: 'test@example.com',
  name: 'Test Accountant'
}

export const testClient = {
  id: 1,
  accountant_id: 1,
  email: 'client@example.com',
  name: 'Test Client'
}

export const testRequest = {
  id: 1,
  accountant_id: 1,
  client_id: 1,
  title: 'Tax Documents 2025',
  due_date: '2025-12-31',
  status: 'pending'
}
```

### Test Database

For integration tests, use:
1. **SQLite in memory** (fast, clean between tests)
2. **Docker Postgres** (realistic but slower)
3. **Test database copy** (restore from snapshot per test)

---

## Debugging Failed Tests

### Common Issues and Fixes

**Test times out:**
- Increase timeout: `test('name', async () => {...}, { timeout: 5000 })`
- Check for unresolved promises
- Look for infinite loops

**Test is flaky (sometimes passes, sometimes fails):**
- Check for race conditions (timing issues)
- Ensure test data is isolated
- Verify mocks are reset between tests

**Component not rendering:**
- Verify all required props provided
- Check for missing context providers
- Look for async data loading

**Database assertion fails:**
- Verify data was actually written
- Check primary key/unique constraints
- Review transaction rollback logic

### Debug Mode

Run tests with verbose output:
```bash
npm run test -- --reporter=verbose
```

Or step through with Node debugger:
```bash
node --inspect-brk node_modules/vitest/vitest.mjs run
```

---

## Coverage Report Analysis

After running `npm run test:coverage`, review `coverage/` directory:

- `coverage/index.html` - Open in browser for interactive report
- Identifies untested lines (red)
- Identifies partially tested branches (yellow)
- Shows coverage trends over time

**Action items from coverage:**
- Lines < 80%: Write more unit tests
- Branches < 80%: Add tests for error cases
- Functions < 80%: Test utility functions more thoroughly

---

## Success Criteria for Phase 2

- ✅ 80%+ overall code coverage
- ✅ All tests pass locally
- ✅ Zero critical bugs in testing checklist
- ✅ All accessibility requirements met
- ✅ Performance baseline established
- ✅ QA sign-off before deployment to Hetzner
