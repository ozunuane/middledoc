# Design Implementation — Quick Start Checklist

**Status:** Ready to implement
**Estimated Time:** 3-4 weeks (1 engineer)
**Difficulty:** Medium
**Impact:** High (visual overhaul)

---

## Phase 1: Design Tokens (Week 1) — Days 1-5

### Day 1: Planning & Setup
- [ ] Read `DESIGN_SUMMARY.md` (15 min)
- [ ] Review `ui/Accountant Hub UI.dc.html` (20 min)
- [ ] Open `DESIGN_IMPLEMENTATION_GUIDE.md` section 7 (plan phase)
- [ ] Create feature branch: `git checkout -b design/brand-upgrade`

### Day 2-3: Tailwind Config
- [ ] Back up `tailwind.config.ts`
- [ ] Add emerald color palette (follow `DESIGN_CODE_EXAMPLES.md` section 1)
- [ ] Replace cool grays with warm neutrals
- [ ] Add status colors (pending/received/overdue)
- [ ] Test: `npm run dev` and verify no build errors
- [ ] Verify: Page loads without color issues

### Day 4: Typography
- [ ] Install Instrument Serif font
- [ ] Update `app/layout.tsx` with font imports
- [ ] Add typography sizes to Tailwind config
- [ ] Test: Inspect a heading in DevTools, verify serif font loads
- [ ] Check: Font loading in network tab (< 1s)

### Day 5: Testing & Commit
- [ ] Visual check: All colors load correctly
- [ ] Browser check: Chrome, Safari, Firefox
- [ ] Mobile check: Does it look good on mobile?
- [ ] Commit: `git commit -m "design: add brand tokens (colors & fonts)"`
- [ ] Test coverage: Create `TOKENS_TEST.md` with screenshots

**Deliverable:** Design tokens (colors + fonts) ready for component updates

---

## Phase 2: Base Components (Week 2) — Days 6-10

### Day 6: Button Component
- [ ] Read: `DESIGN_CODE_EXAMPLES.md` section 3 (Button code)
- [ ] Update `components/ui/Button.tsx`:
  - [ ] Replace indigo with emerald
  - [ ] Change border-radius from 6px to 9px
  - [ ] Update focus ring to emerald
  - [ ] Update hover/pressed states
- [ ] Test: All button variants (primary, secondary, danger, ghost)
- [ ] Test: Button in hover, pressed, disabled, loading states
- [ ] Commit: `git commit -m "design: update Button component"`

### Day 7: Input & Form Components
- [ ] Update `components/ui/Input.tsx`:
  - [ ] Change focus ring to emerald
  - [ ] Update borders to warm neutrals
  - [ ] Update error state colors
  - [ ] Update disabled state
- [ ] Update `components/ui/FormField.tsx` (if exists)
- [ ] Test: Input focus, error, disabled states
- [ ] Test: Form validation feedback
- [ ] Commit: `git commit -m "design: update Input component"`

### Day 8: Status Badge & Modal
- [ ] Update `components/ui/StatusBadge.tsx`:
  - [ ] Change to pill shape (999px)
  - [ ] Update colors (pending/received/overdue)
  - [ ] Update badge size variants
- [ ] Update `components/ui/Modal.tsx`:
  - [ ] Change background to #F7F4EE
  - [ ] Update shadows
  - [ ] Update padding
  - [ ] Update title font (serif)
- [ ] Test: Modal open/close, backdrop color
- [ ] Test: Badge in table, list, etc.
- [ ] Commit: `git commit -m "design: update StatusBadge & Modal"`

### Day 9: New Components
- [ ] Create `components/ui/ProgressBar.tsx`
- [ ] Create `components/ui/StatCard.tsx`
- [ ] Create `components/ui/Avatar.tsx` (initials)
- [ ] Test: Each component in isolation
- [ ] Commit: `git commit -m "design: add ProgressBar, StatCard, Avatar"`

### Day 10: Integration Testing
- [ ] Run `npm run dev`
- [ ] Check dashboard page: do new colors look good?
- [ ] Check all pages: any color mismatches?
- [ ] Test in dark mode (if applicable)
- [ ] Mobile responsiveness check
- [ ] Commit: `git commit -m "design: verify Phase 2 integration"`

**Deliverable:** 8 updated + 3 new components, ready for layout work

---

## Phase 3: Layout Components (Week 3) — Days 11-15

### Day 11: Checklist & Progress
- [ ] Create `components/ui/DocumentChecklist.tsx`
- [ ] Create `components/ui/ProgressRing.tsx` (donut chart)
- [ ] Test: Checklist item states (completed/pending)
- [ ] Test: Progress ring rendering
- [ ] Commit: `git commit -m "design: add DocumentChecklist & ProgressRing"`

### Day 12: Layout Components
- [ ] Create `components/ui/BentoGrid.tsx`
- [ ] Create `components/ui/DataTable.tsx` (refactor existing)
- [ ] Test: Grid layout with multiple column spans
- [ ] Test: Table sorting, filtering
- [ ] Commit: `git commit -m "design: add BentoGrid & refactor DataTable"`

### Day 13: Dashboard Layouts
- [ ] Create `components/layouts/DashboardLayout.tsx`
- [ ] Create variant: Sidebar (Dashboard A)
- [ ] Create variant: Bento (Dashboard B)
- [ ] Create variant: Dark/Command (Dashboard C)
- [ ] Test: Layout switching
- [ ] Commit: `git commit -m "design: add dashboard layout variants"`

### Day 14: Page Components
- [ ] Create `components/ShareLinkCard.tsx`
- [ ] Create `components/ActivityTimeline.tsx`
- [ ] Create `components/RequestListItem.tsx`
- [ ] Test: Share card copyable link
- [ ] Test: Activity timeline rendering
- [ ] Commit: `git commit -m "design: add page-specific components"`

### Day 15: Integration
- [ ] Update `Sidebar.tsx` for new design
- [ ] Update `Navbar.tsx` for new design
- [ ] Test: Sidebar collapse/expand
- [ ] Test: Navbar responsive behavior
- [ ] Commit: `git commit -m "design: update Sidebar & Navbar"`

**Deliverable:** Complete layout component library

---

## Phase 4: Page Implementation (Week 4) — Days 16-20

### Day 16: Dashboard Page
- [ ] Update `app/dashboard/page.tsx`:
  - [ ] Choose dashboard layout variant (A, B, or C)
  - [ ] Replace StatCard component usage
  - [ ] Update page styling
  - [ ] Test: All stats display correctly
- [ ] Test: Mobile/tablet/desktop responsive
- [ ] Commit: `git commit -m "design: update dashboard page"`

### Day 17: Clients Page
- [ ] Update `app/dashboard/clients/page.tsx`:
  - [ ] Use refactored DataTable
  - [ ] Update search/filter styling
  - [ ] Update button styles
- [ ] Test: Table rendering, pagination
- [ ] Test: Search functionality
- [ ] Commit: `git commit -m "design: update clients page"`

### Day 18: Requests Pages
- [ ] Update `app/dashboard/requests/page.tsx`:
  - [ ] Update list layout
  - [ ] Update filter pills
  - [ ] Update modal styling
- [ ] Update request detail page (if exists):
  - [ ] Use DocumentChecklist
  - [ ] Use ShareLinkCard
  - [ ] Use ActivityTimeline
- [ ] Test: Create/edit request flow
- [ ] Commit: `git commit -m "design: update requests pages"`

### Day 19: Portal & Misc
- [ ] Update `app/portal/[shareToken]/page.tsx`:
  - [ ] Update background color
  - [ ] Update upload area
  - [ ] Update checklist display
- [ ] Update login/signup pages (if needed)
- [ ] Test: Portal without login
- [ ] Commit: `git commit -m "design: update portal page"`

### Day 20: Full Page Testing
- [ ] Smoke test all pages
- [ ] Verify all colors correct
- [ ] Check typography (serif headings)
- [ ] Test all interactive elements
- [ ] Take screenshots for comparison
- [ ] Commit: `git commit -m "design: Phase 4 complete"`

**Deliverable:** All pages updated with new design

---

## Phase 5: Polish & Testing (Week 5) — Days 21-25

### Day 21-22: Visual Testing
- [ ] Create side-by-side comparison (before/after)
- [ ] Color audit: Verify all hex values match design file
- [ ] Typography audit: Check font sizes, weights, line heights
- [ ] Component audit: Check buttons, inputs, badges, cards
- [ ] Edge cases: Truncation, overflow, loading states
- [ ] Document any discrepancies in `VISUAL_AUDIT.md`

### Day 23: Accessibility Testing
- [ ] Color contrast check: All text ≥ 4.5:1 (WCAG AA)
- [ ] Focus visible: All interactive elements
- [ ] Keyboard nav: Tab through entire page
- [ ] Form labels: All inputs have associated labels
- [ ] Alt text: All icons/images have descriptions
- [ ] Run axe DevTools, fix any issues
- [ ] Document: `ACCESSIBILITY_AUDIT.md`

### Day 24: Cross-Browser & Responsive
- [ ] Chrome: Latest version
- [ ] Safari: Latest version
- [ ] Firefox: Latest version
- [ ] Mobile: iPhone/Android screen sizes
- [ ] Tablet: iPad screen sizes
- [ ] Desktop: 1280px+
- [ ] Test print styles (if applicable)
- [ ] Document: `BROWSER_TESTING.md`

### Day 25: Launch Prep
- [ ] Run full test suite: `npm run test`
- [ ] Build check: `npm run build` (no errors/warnings)
- [ ] Performance: Lighthouse score ≥ 90
- [ ] Final review: Compare with design file
- [ ] Create pull request with screenshots
- [ ] Document: `LAUNCH_CHECKLIST.md`
- [ ] Commit: `git commit -m "design: Phase 5 complete, ready for review"`

**Deliverable:** Production-ready implementation, ready to merge

---

## Testing Checklist

### Visual ✓
- [ ] All emerald colors correct (#0F7A63, #10A37F, #0B5C4A, #06281F)
- [ ] All warm neutrals correct (#F7F4EE, #EDEAE2, #E4DFD4, etc.)
- [ ] Status colors correct (pending/received/overdue)
- [ ] Button border-radius is 9px
- [ ] Badge border-radius is 999px (pill)
- [ ] Headings use Instrument Serif
- [ ] Fonts load without CLS (Cumulative Layout Shift)

### Functional ✓
- [ ] Buttons clickable, state changes visible
- [ ] Inputs focusable, ring visible, validation works
- [ ] Modals open/close, backdrop visible
- [ ] Forms submit without errors
- [ ] Tables sort/filter correctly
- [ ] Dropdowns work
- [ ] Pagination works (if applicable)
- [ ] Search works

### Responsive ✓
- [ ] Mobile (375px): Stacked layout, readable
- [ ] Tablet (768px): 2-column, sidebars appear
- [ ] Desktop (1024px+): Full 3-column layout
- [ ] No horizontal scroll on any device
- [ ] Touch targets ≥ 44px (mobile)

### Accessibility ✓
- [ ] Keyboard navigation: Tab/Shift+Tab works
- [ ] Focus visible: Clear focus indicators
- [ ] Color contrast: All text ≥ 4.5:1 (WCAG AA)
- [ ] Form labels: All inputs labeled
- [ ] Icons: All have aria-labels
- [ ] ARIA: Modals have role="dialog", etc.
- [ ] Landmarks: Header, main, footer clearly defined
- [ ] No keyboard traps

### Performance ✓
- [ ] Instrument Serif font loads < 1s
- [ ] No CLS on page load
- [ ] Lighthouse score ≥ 90
- [ ] No console errors
- [ ] No unused CSS

---

## Command Reference

```bash
# Setup
git checkout -b design/brand-upgrade
npm run dev

# Testing
npm run test
npm run test:coverage
npm run build
npm run lint

# After updates
git add .
git commit -m "design: [specific change]"
git push origin design/brand-upgrade

# Create PR
# (use GitHub web interface or gh cli)
gh pr create --title "Design: Brand upgrade" --body "See DESIGN_SUMMARY.md"
```

---

## Blockers & Solutions

### Problem: Colors not updating
**Solution:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Problem: Instrument Serif not loading
**Solution:** Check `app/layout.tsx` has correct font import. Verify in DevTools Network tab that font file loads.

### Problem: Tailwind classes not recognized
**Solution:** Ensure tailwind.config.ts is saved. Restart dev server. Check for typos in color names.

### Problem: Component test failures
**Solution:** Update test snapshots if styling changes intentionally:
```bash
npm run test -- --update-snapshots
```

---

## Success Criteria (Definition of Done)

- [ ] All colors match design file (verified with color picker)
- [ ] All typography matches (serif headings, Geist body, Geist Mono data)
- [ ] All components updated/created and tested
- [ ] All pages load without errors
- [ ] Mobile/tablet/desktop responsive
- [ ] WCAG AA accessibility (4.5:1 contrast, keyboard nav, etc.)
- [ ] Lighthouse score ≥ 90
- [ ] PR created with screenshots and documentation
- [ ] Code review passed
- [ ] Ready to merge to main

---

## Daily Standup Template

```
Date: [Day X, Phase Y]

Completed:
- [ ] [Specific task]
- [ ] [Specific task]

In Progress:
- [ ] [Specific task]

Blocked:
- [ ] [Issue, if any]

Next:
- [ ] [Tomorrow's task]

Screenshots:
[Attach before/after if applicable]
```

---

## Documentation Trail

Keep these files updated:
- `DESIGN_SUMMARY.md` — Overview (read first)
- `DESIGN_IMPLEMENTATION_GUIDE.md` — Technical details
- `DESIGN_CODE_EXAMPLES.md` — Code snippets
- `DESIGN_QUICK_START.md` — This file (checklist)
- `VISUAL_AUDIT.md` — Compare with design file
- `ACCESSIBILITY_AUDIT.md` — WCAG compliance
- `BROWSER_TESTING.md` — Cross-browser results

---

## Resources

- **Design file:** `/ui/Accountant Hub UI.dc.html`
- **Color reference:** `DESIGN_IMPLEMENTATION_GUIDE.md` section 1
- **Typography:** `DESIGN_IMPLEMENTATION_GUIDE.md` section 2
- **Components:** `DESIGN_IMPLEMENTATION_GUIDE.md` section 3
- **Code examples:** `DESIGN_CODE_EXAMPLES.md` section 3
- **Tailwind docs:** https://tailwindcss.com
- **Google Fonts:** https://fonts.google.com/specimen/Instrument+Serif

---

## Ready to Start?

1. Print this checklist
2. Open `DESIGN_SUMMARY.md`
3. Create feature branch
4. Start with Phase 1, Day 1
5. Update checklist daily
6. Ask for help if blocked

**Good luck! This is going to look amazing.**

---

**Start:** [Today's date]
**Complete by:** [Start date + 25 days]
**Status:** ⏳ Ready to begin
**Team:** [Your name]

