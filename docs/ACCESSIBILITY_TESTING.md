# Accessibility Testing Guide

## WCAG 2.1 AA Compliance Checklist

The Accountant Client Hub targets **WCAG 2.1 Level AA** compliance. This guide outlines testing procedures.

---

## Automated Testing

### Axe DevTools Browser Extension

1. **Install** axe DevTools from Chrome Web Store or Firefox Add-ons
2. **Open** any page in the application
3. **Click** axe DevTools icon
4. **Scan** the page
5. **Review** results:
   - Red = Errors (must fix)
   - Orange = Warnings (review carefully)
   - Green = Passed

**Target:** 0 errors, < 3 warnings

---

### Lighthouse Accessibility Audit

1. **Open** DevTools (F12)
2. **Go to** Lighthouse tab
3. **Select** "Accessibility"
4. **Click** "Generate report"
5. **Review** Accessibility score (target: > 90)

---

### Automated Test Suite

Add to test files:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('Dashboard page has no accessibility violations', async () => {
  const { container } = render(<Dashboard />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## Manual Testing

### 1. Keyboard Navigation

**Test that entire application is keyboard accessible:**

1. **Open** any page
2. **Disconnect mouse** (or use on-screen keyboard)
3. **Use Tab** to move through interactive elements
4. **Use Shift+Tab** to move backwards
5. **Use Enter/Space** to activate buttons
6. **Use Arrow Keys** in menus/selects
7. **Use Escape** to close modals/dropdowns

**Checklist:**
- [ ] All interactive elements reachable with keyboard
- [ ] Focus order is logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps (can always move forward/backward)
- [ ] Focus indicator always visible
- [ ] Modals trap focus inside until closed

---

### 2. Screen Reader Testing

#### Option A: macOS VoiceOver (Free)

1. **Enable** VoiceOver: System Preferences → Accessibility → VoiceOver → Enable
2. **Keyboard control** Ctrl+Option → navigate with arrow keys
3. **Test these elements:**
   - Page title is announced
   - Form labels read before inputs
   - Buttons announce their purpose
   - Status badges announce status
   - Links announce their destination

#### Option B: NVDA (Windows, Free)

1. **Download** from nvaccess.org
2. **Install** and run
3. **Launch** web browser
4. **Test** page elements as above

#### Option C: JAWS (Premium, Most Used)

1. **Use** if available in your organization
2. **Test** same elements as above

**Checklist:**
- [ ] Page title announced on load
- [ ] Form labels associated with inputs (via `htmlFor`)
- [ ] Buttons have accessible labels
- [ ] Links have descriptive text (not just "Click here")
- [ ] Status changes announced
- [ ] Errors announced to screen reader

---

### 3. Color Contrast Testing

#### Using WebAIM Contrast Checker

1. **Go to** webaim.org/resources/contrastchecker/
2. **Enter foreground color** (text)
3. **Enter background color** (background)
4. **Check** results

**WCAG 2.1 AA Requirements:**
- Normal text: 4.5:1 ratio
- Large text (18px+): 3:1 ratio
- UI components: 3:1 ratio

**How to test in browser:**
1. **Inspect element** (right-click → Inspect)
2. **Note colors** (computed styles tab)
3. **Test in WebAIM** contrast checker

---

### 4. Font Size and Spacing Testing

**Test 1: Zoom to 200%**
1. Browser → View → Zoom → 200%
2. Verify no content is cut off
3. Verify text is still readable
4. Verify no horizontal scrolling

**Test 2: Line Height**
1. Lines of text should be spaced 1.5x font size minimum
2. Paragraph spacing should be 1.5x line height

**Test 3: Letter Spacing**
1. Text should not be too cramped
2. Minimum 0.12em spacing between letters

**Checklist:**
- [ ] Page readable at 200% zoom
- [ ] No content cut off when zoomed
- [ ] Adequate line spacing (1.5x minimum)
- [ ] Adequate paragraph spacing
- [ ] Text is at least 12px (14px preferred)

---

### 5. Focus Indicator Testing

**Requirement:** Focus indicator must be visible and at least 3px

**Test:**
1. **Tab through** all pages
2. **Verify** focus indicator is visible
3. **Verify** focus indicator has sufficient contrast (4.5:1)
4. **Verify** indicator size is at least 3px

**Common issues:**
- Black text on dark background (no contrast)
- Border-radius too small
- Indicator too thin (< 2px)

---

### 6. Form Accessibility Testing

**Form Label Association:**
```html
<!-- ✅ Correct -->
<label htmlFor="email">Email</label>
<input id="email" type="email" />

<!-- ❌ Wrong -->
<label>Email
  <input type="email" />
</label>
```

**Test checklist:**
- [ ] Every input has associated label
- [ ] Labels are positioned above or to left of input
- [ ] Required fields are marked (with asterisk or text)
- [ ] Error messages linked to field via `aria-describedby`
- [ ] Helper text linked to field via `aria-describedby`

**Error Message Association:**
```html
<input
  id="password"
  type="password"
  aria-describedby="passwordError"
/>
<span id="passwordError" role="alert">
  Password must be at least 8 characters
</span>
```

---

### 7. Modal/Dialog Testing

**Requirements:**
- Focus trapped inside modal
- Backdrop disables interaction with page
- ESC key closes modal
- Focus returned to trigger button on close

**Test:**
1. Open modal
2. Tab through all elements
3. Verify focus doesn't leave modal
4. Press ESC
5. Verify focus returns to "Open" button

---

### 8. Data Table Testing

**Accessible tables must have:**
- `<table>` semantic element
- `<th>` headers with `scope="col"` or `scope="row"`
- `<thead>`, `<tbody>` sections
- No merged cells without proper structure

**Test:**
1. Use screen reader
2. Verify column headers are announced
3. Verify each cell is associated with its header

**Example:**
```html
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
      <td>Active</td>
    </tr>
  </tbody>
</table>
```

---

### 9. Image and Icon Testing

**All images need alt text:**
```html
<!-- ✅ Correct -->
<img src="logo.png" alt="Accountant Hub Logo" />

<!-- ❌ Wrong -->
<img src="logo.png" alt="logo" />
<img src="logo.png" alt="" /> <!-- decorative image only -->
```

**Decorative images should have empty alt:**
```html
<img src="divider.png" alt="" aria-hidden="true" />
```

**Icons need labels:**
```html
<!-- ✅ Correct -->
<button aria-label="Close">
  <XIcon />
</button>

<!-- ❌ Wrong -->
<button>
  <XIcon />
</button>
```

---

### 10. Link Testing

**All links must be descriptive:**
```html
<!-- ✅ Correct -->
<a href="/clients">Manage Clients</a>
<a href="/requests">View Document Requests</a>

<!-- ❌ Wrong -->
<a href="/clients">Click here</a>
<a href="/requests">More</a>
```

**Test:**
1. Use screen reader
2. Activate "List all links"
3. Verify link text is descriptive out of context

---

## Accessibility Testing Checklist

### Before Every Release

- [ ] **Automated tests pass**: `npm run test`
- [ ] **No Axe violations**: axe DevTools shows 0 errors
- [ ] **Lighthouse score > 90**: Lighthouse audit
- [ ] **Keyboard navigation**: Tab through entire app
- [ ] **Screen reader test**: VoiceOver/NVDA on one page
- [ ] **Color contrast**: WebAIM checker on brand colors
- [ ] **Zoom to 200%**: No content cut off
- [ ] **Focus indicators visible**: Tab through and verify
- [ ] **Form labels**: Every input has label
- [ ] **Error messages**: Linked to fields
- [ ] **Images have alt text**: All images checked
- [ ] **Links descriptive**: No "click here" links
- [ ] **Tables semantic**: Proper headers and structure
- [ ] **Modals accessible**: Focus trap works, ESC closes

---

## Resources

### Tools
- **axe DevTools**: browser.google.com/webstore
- **Lighthouse**: Built into Chrome DevTools (F12)
- **WebAIM Contrast Checker**: webaim.org/resources/contrastchecker/
- **WAVE Tool**: wave.webaim.org
- **NVDA Screen Reader**: nvaccess.org
- **Color Blind Simulator**: color-blindness.com/coblis-color-blindness-simulator

### Learning Resources
- **WCAG 2.1 Guidelines**: w3c.org/WAI/WCAG21/quickref
- **WebAIM**: webaim.org
- **Inclusive Components**: inclusive-components.design
- **a11y Project**: a11yproject.com

---

## Success Criteria

✅ **Phase 2 Accessibility Complete When:**
- WCAG 2.1 Level AA compliance achieved
- Zero Axe violations
- Lighthouse accessibility score > 90
- All manual testing checklist items completed
- Team trained on accessible patterns
- QA sign-off received
