# Bug Report Template

## Summary
[Write a concise title that describes the bug in one sentence]

Example: "File upload fails with files over 5MB"

---

## Environment
- **Browser**: Chrome 125.0.6422.112 / Firefox 126.0 / Safari 17.4 / Edge 125
- **Operating System**: macOS 14.4 / Windows 11 / Ubuntu 22.04
- **Device**: Desktop / iPhone / iPad / Android
- **URL**: http://localhost:3000/dashboard

---

## Steps to Reproduce

1. [First action]
2. [Second action]
3. [Continue...]

**Example:**
1. Go to /auth/signup
2. Enter name "John Doe"
3. Enter email "john@example.com"
4. Enter password "Test1234"
5. Click "Create Account"
6. [Expected result doesn't happen]

---

## Expected Behavior

What should happen?

**Example**: "User should be redirected to /dashboard and see the dashboard page with their name displayed"

---

## Actual Behavior

What actually happens instead?

**Example**: "User remains on signup page and sees error message 'Email already registered' even though the email was not previously used"

---

## Screenshots or Screen Recording

[Attach screenshot or video showing the bug]

If possible, use:
- Screenshots to show visual bugs
- Screen recordings to show interactive bugs
- Browser DevTools error messages (F12 → Console tab)

---

## Browser Console Error (if applicable)

```
[Paste any error messages from F12 → Console tab]

Example:
TypeError: Cannot read property 'id' of undefined
    at handleSubmit (auth/signup/page.tsx:45)
    at HTMLFormElement.onSubmit [as _onSubmit] (signup/page.tsx:23)
```

---

## Network Tab Information (if applicable)

**Failed Request:**
- Endpoint: `POST /api/auth/signup`
- Status: 500
- Response: `{"error": "Internal server error"}`

---

## Severity

Choose one:

- [ ] **Critical** - App is completely broken or major functionality unavailable
- [ ] **High** - Important feature doesn't work
- [ ] **Medium** - Feature works but has issues
- [ ] **Low** - Cosmetic issue or minor inconvenience

---

## Reproducibility

Choose one:

- [ ] Always - Happens every time
- [ ] Usually - Happens most of the time (~80%+)
- [ ] Sometimes - Happens occasionally (~30-80%)
- [ ] Rarely - Happens infrequently (< 30%)

---

## Additional Context

[Any other information that might help]

Examples:
- This bug happens only when logged in as an accountant with 50+ clients
- This bug started after I cleared my browser cookies
- This works in the old version but not the new one
- I have multiple accounts and the bug happens with one but not the other

---

## Possible Cause (Optional)

[If you have any ideas about what might be causing this]

Example: "The API endpoint might not be returning the share_token correctly, or the frontend might not be handling the response properly"

---

## Testing Notes

- Date/Time Reported: [YYYY-MM-DD HH:MM]
- Tested By: [Your name]
- Environment: Local / Staging / Production
- Last Known Working Version: [e.g., v0.1.0]
