# Mobile-First Testing Guide

## 🧪 Testing Checklist

### Browser DevTools Testing

#### Chrome DevTools
1. Open DevTools (F12)
2. Click Device Toolbar (Ctrl+Shift+M)
3. Test these viewports:
   - **iPhone SE** - 375×667 (smallest common)
   - **iPhone 12/13 Pro** - 390×844
   - **iPhone 14 Pro Max** - 430×932
   - **Pixel 5** - 393×851
   - **iPad Air** - 820×1180
   - **Galaxy Fold** - 280×653 (folded)
   - **Custom** - 320×568 (minimum)

#### Testing Steps per Viewport

**1. Navigation**
- [ ] Bottom nav appears on mobile (<768px)
- [ ] Top nav appears on desktop (≥768px)
- [ ] Bottom nav has safe-area padding on iPhone X+
- [ ] All nav items are tappable (≥44px)
- [ ] Active state is visible

**2. ChallengeView**
- [ ] Mobile: Vertical layout (description → editor → button)
- [ ] Desktop: Side-by-side layout
- [ ] Description section is collapsible on mobile
- [ ] Code editor is full-width on mobile
- [ ] Submit button is sticky at bottom
- [ ] No horizontal scroll
- [ ] Timer fits on one line

**3. Dashboard**
- [ ] Stat cards stack vertically on mobile
- [ ] Stat cards are 2-column on tablet
- [ ] Stat cards are 4-column on desktop
- [ ] Chart height adjusts (250px mobile, 300px desktop)
- [ ] No overflow on small screens
- [ ] Table scrolls horizontally if needed

**4. Monaco Editor**
- [ ] Font size is 16px on mobile (prevents iOS zoom)
- [ ] Font size is 14px on desktop
- [ ] No minimap on any screen size
- [ ] Autocomplete disabled on mobile
- [ ] Line numbers visible on all sizes
- [ ] Scrollbar size is appropriate

**5. Forms & Inputs**
- [ ] All input fields are ≥44px tall
- [ ] Input font-size is ≥16px (prevents iOS zoom)
- [ ] Buttons are ≥44px tap targets
- [ ] Full-width buttons on mobile
- [ ] Auto-width buttons on desktop

**6. Touch Interactions**
- [ ] Tap feedback is visible (active state)
- [ ] No hover-only interactions
- [ ] Swipe to dismiss modals (if implemented)
- [ ] Haptic feedback on button taps (if supported)

---

## 📱 Real Device Testing

### iOS Safari
**Critical Issues to Check:**
- [ ] No double-tap zoom on inputs
- [ ] Safe area respected (notch, home indicator)
- [ ] Bottom nav doesn't cover home indicator
- [ ] Viewport meta tag prevents zoom
- [ ] Smooth scrolling works
- [ ] Position fixed elements work correctly
- [ ] -webkit-overflow-scrolling works

**Test on:**
- iPhone SE (small screen)
- iPhone 12/13 Pro (standard)
- iPhone 14 Pro Max (large, Dynamic Island)

### Android Chrome
**Critical Issues to Check:**
- [ ] Touch targets are ≥48dp
- [ ] Ripple effect on buttons
- [ ] Viewport height with/without address bar
- [ ] Keyboard doesn't cover inputs
- [ ] Scroll behavior is smooth

**Test on:**
- Pixel 5 (standard Android)
- Samsung Galaxy S21 (OneUI)
- Budget device (low RAM, slower CPU)

### Tablet Testing (iPad)
- [ ] Uses desktop layout at 768px+
- [ ] Landscape mode works
- [ ] Split-screen multitasking
- [ ] Hover states work (with mouse/trackpad)

---

## 🔍 Responsive Breakpoint Testing

### Test at Each Breakpoint

**Mobile (320px - 767px)**
```bash
# Test these widths
320px  # iPhone SE (portrait)
375px  # iPhone 12 mini
390px  # iPhone 13 Pro
414px  # iPhone 13 Pro Max
```

**Tablet (768px - 1023px)**
```bash
768px  # iPad mini (portrait)
820px  # iPad Air (portrait)
1024px # iPad Pro (portrait)
```

**Desktop (1024px+)**
```bash
1024px # iPad Pro (landscape), small laptops
1280px # Standard desktop
1440px # Large desktop
1920px # Full HD
```

### Expected Behavior at Each Breakpoint

| Feature | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Navigation | Bottom bar | Top bar | Top bar |
| ChallengeView | Vertical stack | Vertical stack | Side-by-side |
| Dashboard Grid | 1 column | 2 columns | 4 columns |
| Stat Cards | Full width | 50% width | 25% width |
| Container Padding | 16px | 24px | 32px |
| Font Sizes | Smaller | Medium | Larger |
| Editor Font | 16px | 14px | 14px |

---

## ⚡ Performance Testing

### Lighthouse (Mobile)
**Target Scores:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90

**Run Lighthouse:**
```bash
# In Chrome DevTools
1. Open DevTools → Lighthouse tab
2. Select "Mobile" device
3. Check all categories
4. Click "Generate report"
```

### Key Metrics to Check
- **FCP (First Contentful Paint)**: <1.8s
- **LCP (Largest Contentful Paint)**: <2.5s
- **TBT (Total Blocking Time)**: <200ms
- **CLS (Cumulative Layout Shift)**: <0.1
- **Speed Index**: <3.4s

### Common Issues & Fixes

**Large JavaScript bundles:**
- [ ] Code split by route
- [ ] Lazy load Monaco editor
- [ ] Tree-shake unused code

**Layout shift:**
- [ ] Reserve space for images
- [ ] Set explicit dimensions
- [ ] Avoid loading UI above content

**Slow network:**
- [ ] Test on "Slow 3G" throttling
- [ ] Implement loading skeletons
- [ ] Show offline message

---

## 🎨 Visual Regression Testing

### Manual Visual Checks
- [ ] No text overflow
- [ ] No overlapping elements
- [ ] Proper spacing between elements
- [ ] Consistent button sizes
- [ ] Aligned text and icons
- [ ] Proper contrast ratios (WCAG AA)

### Screenshot Comparison
Take screenshots at key viewports and compare:
```bash
# Mobile
- Login page (375×667)
- Dashboard (375×667)
- ChallengeView (375×812)

# Desktop
- Login page (1280×720)
- Dashboard (1280×720)
- ChallengeView (1440×900)
```

---

## ♿ Accessibility Testing

### Screen Reader Testing
**VoiceOver (iOS):**
- [ ] All buttons are labeled
- [ ] Form fields have labels
- [ ] Images have alt text
- [ ] Focus order is logical

**TalkBack (Android):**
- [ ] Touch exploration works
- [ ] Gestures are accessible
- [ ] Content is announced correctly

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Skip navigation link (optional)

### Touch Target Size
**Tool:** Chrome DevTools → Lighthouse → Accessibility
- [ ] All tap targets ≥44×44px
- [ ] Adequate spacing between targets (8px min)

---

## 🐛 Common Mobile Issues to Check

### Layout Issues
- [ ] **Horizontal scroll**: Should never happen
  - Test: Set width to 320px, scroll horizontally
- [ ] **Text overflow**: All text should wrap or truncate
- [ ] **Fixed headers**: Should stick properly with keyboard open

### Input Issues
- [ ] **Zoom on focus**: 16px font prevents this
- [ ] **Keyboard covering input**: Scroll into view
- [ ] **Autocorrect/autocapitalize**: Disabled where appropriate

### Touch Issues
- [ ] **Tap delay**: Should be instant (no 300ms delay)
- [ ] **Double-tap zoom**: Disabled where intentional
- [ ] **Swipe conflicts**: Don't conflict with browser gestures

### Performance Issues
- [ ] **Janky scrolling**: Should be smooth 60fps
- [ ] **Monaco lag**: Consider textarea fallback on low-end
- [ ] **Large images**: Optimize and lazy load

---

## 🔧 Testing Commands

### Start Dev Server with Network Access
```bash
cd ai-coding-tutor/frontend
npm run dev -- --host
```
Access from phone at: `http://YOUR_IP:5173`

### Test Specific Breakpoints
```javascript
// In browser console
window.resizeTo(375, 667);  // iPhone SE
window.resizeTo(820, 1180); // iPad Air
```

### Simulate Touch Events
```javascript
// Chrome DevTools → Settings → Devices
// Add custom device with touch support
```

---

## 📋 Pre-Launch Checklist

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] ESLint passes
- [ ] All tests pass

### Mobile Optimization
- [ ] Viewport meta tag correct
- [ ] Touch-action set properly
- [ ] Safe area insets respected
- [ ] No fixed positioning issues

### Cross-Browser
- [ ] Works in Chrome (Android)
- [ ] Works in Safari (iOS)
- [ ] Works in Firefox (mobile)
- [ ] Works in Samsung Internet

### Features
- [ ] Bottom nav functional
- [ ] Collapsible sections work
- [ ] Modals/sheets work
- [ ] Forms submit correctly
- [ ] Editor saves code

### Performance
- [ ] Lighthouse score ≥90
- [ ] No layout shift
- [ ] Fast load time (<3s)
- [ ] Smooth animations (60fps)

---

## 🚀 Quick Test Script

```bash
# Run this to test locally on mobile device

# 1. Get your local IP
ipconfig getifaddr en0  # Mac
hostname -I            # Linux
ipconfig               # Windows

# 2. Start dev server
cd ai-coding-tutor/frontend
npm run dev -- --host

# 3. Access from phone
# http://YOUR_IP:5173

# 4. Test checklist
# - Login
# - Navigate to challenges
# - Open a challenge
# - Write code in editor
# - Submit code
# - Check dashboard
# - Check bottom nav
```

---

## 📊 Testing Tools

### Browser Extensions
- **Responsive Viewer** - Test multiple viewports at once
- **Lighthouse** - Performance and accessibility
- **WAVE** - Accessibility checker
- **VisBug** - Visual debugging

### Online Tools
- **BrowserStack** - Real device testing
- **LambdaTest** - Cross-browser testing
- **Responsively App** - Desktop app for responsive testing

### Mobile Debugging
- **iOS Safari** - Connect via USB, debug in Safari Dev Tools
- **Android Chrome** - chrome://inspect for remote debugging
- **Eruda** - Console for mobile web debugging

---

**Remember:** Real device testing is essential! DevTools simulation is good but not perfect.
