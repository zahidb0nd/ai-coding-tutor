# Defect Log — AI Coding Tutor

## Summary

| Severity | Count | Resolved |
|----------|-------|----------|
| Critical | 0 | — |
| High | 1 | ✅ |
| Medium | 2 | ✅ |
| Low | 1 | ⬜ |

---

## Defect Details

### DEF-001: AI double-failure returns unstructured error (**HIGH**) ✅ RESOLVED

- **Found in:** AI Contract Tests (`backend/tests/ai-safety/groq-hints.test.js`)
- **Test ID:** AI-04
- **Description:** When the Groq API fails twice consecutively, the `getCodeFeedback()` function originally threw an unhandled error instead of returning a safe default response.
- **Impact:** Frontend would crash with an unhandled promise rejection if AI was temporarily unavailable, breaking the submission flow entirely.
- **Root Cause:** Missing retry fallback logic in `services/aiService.js`.
- **Fix:** Added fallback logic that returns a structured safe default after double failure:
  ```json
  {
    "score": 0,
    "summary": "Unable to generate AI feedback. Please try again later.",
    "line_comments": [],
    "next_steps": []
  }
  ```
- **Verified by:** Test AI-04 confirms Zod schema validation passes on the fallback response.

---

### DEF-002: Rate limit not scoped per user (**MEDIUM**) ✅ RESOLVED

- **Found in:** Integration Tests (`backend/tests/integration/challenges-integration.test.js`)
- **Test IDs:** CI-02, CI-08
- **Description:** Rate limiting for challenge generation and hint requests was initially implemented with a global counter, meaning one user's request could block all other users from generating challenges.
- **Impact:** In a classroom scenario with multiple students, one active student could inadvertently lock out all others.
- **Root Cause:** Rate limit map was keyed by endpoint only, not by `userId + endpoint`.
- **Fix:** Rate limit map keyed by `userId + endpoint` combination. Each user gets independent rate limits.
- **Verified by:** Tests CI-02 (hint rate limit) and CI-08 (generation rate limit) use unique user tokens to confirm per-user scoping.

---

### DEF-003: Streak timezone boundary error (**MEDIUM**) ✅ RESOLVED

- **Found in:** Unit Tests (`backend/tests/unit/streak.test.js`)
- **Test ID:** ST-05
- **Description:** Streak calculation used raw UTC dates for day comparison. For users in IST (+05:30) timezone, a submission at 12:30 AM local time (7:00 PM UTC previous day) was incorrectly treated as the same UTC day, failing to increment the streak.
- **Impact:** Users in non-UTC timezones (IST, JST, etc.) would see incorrect streak counts, breaking the gamification feature.
- **Root Cause:** `calculateStreak()` compared UTC day-of-year without accounting for timezone offset.
- **Fix:** `calculateStreak()` now accepts a `timezoneOffset` parameter (in minutes) and adjusts both dates to the user's local timezone before comparison.
- **Verified by:** Test ST-05 specifically tests the IST (+05:30, offset=-330) midnight crossing scenario.

---

### DEF-004: E2E tests need `data-testid` attributes (**LOW**) ⬜ OPEN

- **Found in:** E2E scaffold (`frontend/tests/e2e/student-flow.spec.ts`)
- **Test ID:** E2E-01
- **Description:** The Playwright end-to-end test is marked with `test.fixme()` because the React UI components lack `data-testid` attributes needed for reliable E2E element selection.
- **Impact:** The E2E test suite cannot run automatically. Manual testing is required for full user journey validation.
- **Selectors needed:**
  - `data-testid="challenge-card-loops-01"` on challenge cards
  - `data-testid="request-hint-btn"` on hint button
  - `data-testid="ai-hint-box"` on hint display
  - `data-testid="submit-code-btn"` on submit button
  - `data-testid="submission-success-modal"` on success modal
  - `data-testid="nav-dashboard"` on dashboard nav link
  - `data-testid="current-streak-counter"` on streak display
- **Plan:** Add `data-testid` props to key interactive elements in a future sprint. Low priority since unit and integration tests already cover the underlying logic.
