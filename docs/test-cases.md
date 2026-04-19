# Test Cases — AI Coding Tutor

> Total: **138 test cases** across 15 test files. All passing ✅

---

## Backend Unit Tests

### AUTH (`backend/tests/unit/auth.test.js`) — 13 Tests

| ID | Test Case | Input | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| AU-01 | Register with valid data | name, email, password | 201 + JWT + user object | ✅ |
| AU-02 | Register with existing email | duplicate email | 409 "already exists" | ✅ |
| AU-03 | Register with invalid email | "invalid-email" | 400 "Invalid email" | ✅ |
| AU-04 | Register with short password | "12345" (5 chars) | 400 "at least 6 characters" | ✅ |
| AU-05 | Register with short name | "A" (1 char) | 400 "at least 2 characters" | ✅ |
| AU-06 | Password hashed before storage | "password123" | Hash length > 20, not plaintext | ✅ |
| AU-07 | JWT contains correct payload | Valid registration | Token has id, email, name | ✅ |
| AU-08 | Login with correct credentials | valid email + password | 200 + token + user | ✅ |
| AU-09 | Login with non-existent email | unknown email | 401 "Invalid email or password" | ✅ |
| AU-10 | Login with wrong password | wrong password | 401 "Invalid email or password" | ✅ |
| AU-11 | Login with invalid email format | "not-an-email" | 400 "Invalid email" | ✅ |
| AU-12 | Login with missing password | empty string | 400 "required" | ✅ |
| AU-13 | Login returns valid JWT | valid login | Decodable JWT with id + email | ✅ |

### CHALLENGES (`backend/tests/unit/challenges.test.js`) — 12 Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| CH-01 | Get all challenges (no filter) | 200 + array of challenges | ✅ |
| CH-02 | Filter by difficulty | Query has `difficulty: 3` | ✅ |
| CH-03 | Filter by language | Query has `language: 'python'` | ✅ |
| CH-04 | Filter by both difficulty and language | Combined where clause | ✅ |
| CH-05 | Results ordered correctly | difficulty asc, title asc | ✅ |
| CH-06 | Database error on list → 500 | 500 "Failed to fetch challenges" | ✅ |
| CH-07 | Get single challenge by valid ID | 200 + challenge object | ✅ |
| CH-08 | Get non-existent challenge | 404 "Challenge not found" | ✅ |
| CH-09 | Database error on single → 500 | 500 "Failed to fetch challenge" | ✅ |
| CH-10 | Get distinct languages (sorted) | Sorted array of language strings | ✅ |
| CH-11 | Languages with empty DB | 200 + empty array | ✅ |
| CH-12 | Languages database error → 500 | 500 "Failed to fetch languages" | ✅ |

### STREAK (`backend/tests/unit/streak.test.js`) — 5 Tests

| ID | Test Case | Input | Expected | Status |
|----|-----------|-------|----------|--------|
| ST-01 | New user, no prior submissions | streak=0, lastDate=null | streak = 1 | ✅ |
| ST-02 | Next-day submission | 1 day gap | streak increments (+1) | ✅ |
| ST-03 | Missed day (48h+ gap) | 2 day gap | streak resets to 1 | ✅ |
| ST-04 | Same-day duplicate submission | 0 day gap | streak unchanged | ✅ |
| ST-05 | Timezone midnight crossing (IST +05:30) | offset=-330 | streak increments correctly | ✅ |

### USERS (`backend/tests/unit/users.test.js`) — 11 Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| US-01 | Leaderboard returns sorted users | totalScore desc order | ✅ |
| US-02 | Pagination parameters respected | Correct skip/take values | ✅ |
| US-03 | Only users with score > 0 shown | where: totalScore gt 0 | ✅ |
| US-04 | Sort by score then solve time | Correct orderBy array | ✅ |
| US-05 | Leaderboard database error | 500 "Failed to fetch leaderboard" | ✅ |
| US-06 | User progress returns full stats | Complete stats object | ✅ |
| US-07 | Progress for non-existent user | 404 "User not found" | ✅ |
| US-08 | Progress requires authentication | 401 without token | ✅ |
| US-09 | Zero submissions edge case | All stats = 0, empty arrays | ✅ |
| US-10 | Recent scores capped at 30 | take: 30 in query | ✅ |
| US-11 | Progress database error | 500 "Failed to fetch progress" | ✅ |

---

## Backend Integration Tests

### AUTH FLOW (`backend/tests/integration/auth-flow.test.js`) — 5 Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| IF-01 | Register → Login → Access protected route | Full chain succeeds (201 → 200 → 200) | ✅ |
| IF-02 | Duplicate registration blocked | 409 on second attempt | ✅ |
| IF-03 | No token → protected route | 401 unauthorized | ✅ |
| IF-04 | Invalid token → protected route | 401 unauthorized | ✅ |
| IF-05 | Expired token → protected route | 401 unauthorized | ✅ |

### CHALLENGES INTEGRATION (`backend/tests/integration/challenges-integration.test.js`) — 14 Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| CI-01 | Generate hint (authenticated) | 200 + hint text from AI | ✅ |
| CI-02 | Rate limit hints (30s cooldown) | 429 on rapid second request | ✅ |
| CI-03 | Hint for non-existent challenge | 404 "Challenge not found" | ✅ |
| CI-04 | AI failure on hint generation | 500 "Failed to generate hint" | ✅ |
| CI-05 | Hint requires authentication | 401 without token | ✅ |
| CI-06 | Generate challenge from user level | 201 + full challenge object | ✅ |
| CI-07 | Default to level 1 for new user | Challenge created at difficulty 1 | ✅ |
| CI-08 | Rate limit generation (1/min) | 429 "wait a minute" | ✅ |
| CI-09 | AI generation failure | 500 "Failed to generate challenge" | ✅ |
| CI-10 | Generation requires auth | 401 without token | ✅ |
| CI-11 | Advanced generation with full schema | All fields (title, topic, complexity, etc.) | ✅ |
| CI-12 | Invalid language validation | 400 "Invalid input parameters" | ✅ |
| CI-13 | Default values for optional params | 201 with JavaScript default | ✅ |
| CI-14 | Advanced generation requires auth | 401 without token | ✅ |

### SUBMISSIONS (`backend/tests/integration/submissions.test.js`) — 4 Tests

| ID | Test Case | Expected Result | Status |
|----|-----------|-----------------|--------|
| SI-01 | Invalid input rejected early (no DB hit) | 400 "Invalid user ID" | ✅ |
| SI-02 | User not found in database | 404 "User not found" | ✅ |
| SI-03 | Challenge not found in database | 404 "Challenge not found" | ✅ |
| SI-04 | Valid submission + streak update | 201, streak recalculated, score incremented | ✅ |

---

## Backend AI Contract/Safety Tests

### GROQ HINTS (`backend/tests/ai-safety/groq-hints.test.js`) — 5 Tests

| ID | Test Case | Validation | Status |
|----|-----------|-----------|--------|
| AI-01 | getHint() returns valid `{hint}` JSON | Zod schema parse succeeds | ✅ |
| AI-02 | getHint() on API 500 → throws | "Failed to get hint" error thrown | ✅ |
| AI-03 | getCodeFeedback() matches strict schema | `{score, summary, line_comments[], next_steps[]}` | ✅ |
| AI-04 | Double AI failure → safe fallback | `{score:0, summary:"Unable to generate..."}` | ✅ |
| AI-05 | generateChallenge() schema valid | `{title, description, difficulty, language, rubric}` | ✅ |

---

## Frontend Component Tests

### ChallengeCard (`frontend/src/components/__tests__/ChallengeCard.test.jsx`) — 11 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FC-01 | Renders challenge title | ✅ |
| FC-02 | Displays difficulty badge with correct level | ✅ |
| FC-03 | Shows language tag | ✅ |
| FC-04 | Renders challenge description/preview | ✅ |
| FC-05 | Handles click navigation | ✅ |
| FC-06 | Applies correct difficulty color coding | ✅ |
| FC-07 | Renders multiple cards in a list | ✅ |
| FC-08 | Handles missing optional fields | ✅ |
| FC-09 | Displays topic when available | ✅ |
| FC-10 | Shows problem style indicator | ✅ |
| FC-11 | Accessibility: proper ARIA attributes | ✅ |

### Editor (`frontend/src/components/__tests__/Editor.test.jsx`) — 8 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FE-01 | Renders Monaco editor wrapper | ✅ |
| FE-02 | Passes language prop correctly | ✅ |
| FE-03 | Code changes propagate to parent | ✅ |
| FE-04 | Handles initial value | ✅ |
| FE-05 | Theme configuration applies | ✅ |
| FE-06 | Read-only mode works | ✅ |
| FE-07 | Height configuration | ✅ |
| FE-08 | Loading state handled | ✅ |

### FeedbackPanel (`frontend/src/components/__tests__/FeedbackPanel.test.jsx`) — 11 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FF-01 | Displays score with correct value | ✅ |
| FF-02 | Shows summary text | ✅ |
| FF-03 | Renders line-level comments | ✅ |
| FF-04 | Displays next steps | ✅ |
| FF-05 | Handles zero score | ✅ |
| FF-06 | Handles perfect score (100) | ✅ |
| FF-07 | Empty feedback state | ✅ |
| FF-08 | Loading state | ✅ |
| FF-09 | Score color coding (red/yellow/green) | ✅ |
| FF-10 | Multiple line comments rendering | ✅ |
| FF-11 | Error feedback display | ✅ |

### Navbar (`frontend/src/components/__tests__/Navbar.test.jsx`) — 10 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FN-01 | Returns null when no user logged in | ✅ |
| FN-02 | Shows navigation when logged in | ✅ |
| FN-03 | Displays user name | ✅ |
| FN-04 | Has link to challenges page | ✅ |
| FN-05 | Has link to dashboard page | ✅ |
| FN-06 | Has link to leaderboard page | ✅ |
| FN-07 | Handles logout action | ✅ |
| FN-08 | Displays app title/logo | ✅ |
| FN-09 | Shows instructor dashboard link for instructor role | ✅ |
| FN-10 | Displays user level badge | ✅ |

---

## Frontend Page Tests

### Dashboard (`frontend/src/pages/__tests__/Dashboard.test.jsx`) — 8 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FD-01 | Displays loading state while fetching data | ✅ |
| FD-02 | Displays user progress statistics | ✅ |
| FD-03 | Displays score chart when data available | ✅ |
| FD-04 | Displays submission history | ✅ |
| FD-05 | Handles errors gracefully | ✅ |
| FD-06 | Shows retry button on error | ✅ |
| FD-07 | Displays user level badge | ✅ |
| FD-08 | Redirects to login if not authenticated | ✅ |

### Login (`frontend/src/pages/__tests__/Login.test.jsx`) — 9 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FL-01 | Renders login and register tabs | ✅ |
| FL-02 | Allows switching between login and register | ✅ |
| FL-03 | Has email and password fields | ✅ |
| FL-04 | Shows Sign In button in login mode | ✅ |
| FL-05 | Shows Create Account in register mode | ✅ |
| FL-06 | Successfully logs in with valid credentials | ✅ |
| FL-07 | Displays error message on failed login | ✅ |
| FL-08 | Successfully registers a new user | ✅ |
| FL-09 | Shows loading state during authentication | ✅ |

---

## Frontend API Client Tests

### API Index (`frontend/src/api/__tests__/index.test.js`) — 12 Tests

| ID | Test Case | Status |
|----|-----------|--------|
| FA-01 | Login API call with correct payload | ✅ |
| FA-02 | Register API call | ✅ |
| FA-03 | Get challenges with auth header | ✅ |
| FA-04 | Get single challenge by ID | ✅ |
| FA-05 | Submit code with auth | ✅ |
| FA-06 | Get user progress | ✅ |
| FA-07 | Get leaderboard data | ✅ |
| FA-08 | Generate challenge | ✅ |
| FA-09 | Request hint | ✅ |
| FA-10 | Error handling for network failures | ✅ |
| FA-11 | Token included in auth headers | ✅ |
| FA-12 | Base URL configuration | ✅ |

---

## E2E Test Scaffold

### Student Flow (`frontend/tests/e2e/student-flow.spec.ts`) — 1 Test

| ID | Scenario | Status |
|----|----------|--------|
| E2E-01 | Complete challenge → hint → submit → streak update | 🔧 Scaffold (fixme — needs `data-testid` attrs) |

---

## Live QA Automation Script

### QA Suite (`backend/tests/run_qa_suite_1.js`) — 3 Tests

| ID | Scenario | Requires | Status |
|----|----------|----------|--------|
| QA-01 | Advanced challenge generation (live AI) | Running server + GROQ_API_KEY | Manual |
| QA-02 | Auto-grading accuracy (negative case) | Running server + GROQ_API_KEY | Manual |
| QA-03 | Hallucination resistance (C headers) | Running server + GROQ_API_KEY | Manual |
