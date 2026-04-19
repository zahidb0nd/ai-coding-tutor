# Software Testing Report — AI Coding Tutor (CodeTutor)

**Project:** AI-Powered Coding Platform (CodeTutor)  
**Course:** BCA 6th Semester — Software Testing  
**Author:** Zahid  
**Date:** April 2026  

---

## 1. Introduction

CodeTutor is a full-stack AI-powered coding education platform. It uses a Large Language Model (Groq's `llama-3.3-70b-versatile`) to dynamically generate coding challenges, evaluate student submissions, and provide personalized feedback. This report documents the complete testing strategy applied across all layers of the application.

## 2. System Under Test

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, Vite, Monaco Editor, TailwindCSS v4 |
| Backend | Node.js, Express 5, Prisma ORM |
| Database | MongoDB |
| AI Engine | Groq API (llama-3.3-70b-versatile) |
| Testing Frameworks | Vitest, Supertest, Nock, React Testing Library, Playwright, Zod |

## 3. Testing Strategy

### 3.1 Testing Levels Applied

| Level | Scope | Tool | Location |
|-------|-------|------|----------|
| Unit Testing | Individual functions and route handlers | Vitest + Supertest | `backend/tests/unit/` |
| Integration Testing | Multi-route flows, AI service pipelines | Vitest + Nock | `backend/tests/integration/` |
| AI Contract Testing | LLM output schema validation | Vitest + Zod + Nock | `backend/tests/ai-safety/` |
| Component Testing | React UI components in isolation | Vitest + React Testing Library | `frontend/src/components/__tests__/` |
| Page-Level Testing | Full page rendering and interactions | Vitest + React Testing Library | `frontend/src/pages/__tests__/` |
| API Client Testing | Axios API client functions | Vitest | `frontend/src/api/__tests__/` |
| E2E Testing | Complete user journey through browser | Playwright | `frontend/tests/e2e/` |
| Live QA Automation | Real API + AI responses against live server | Node.js + Axios | `backend/tests/run_qa_suite_1.js` |

### 3.2 Testing Techniques Used

- **Equivalence Partitioning:** Valid/invalid email, password lengths (auth tests)
- **Boundary Value Analysis:** Streak calculations at midnight boundaries, timezone offsets
- **Mocking & Stubbing:** Prisma DB mocked via `vi.fn()`, Groq API mocked via Nock
- **Schema Validation:** Zod schemas enforce AI output structure contracts
- **Error Path Testing:** 500 errors, 404s, expired tokens, rate limits all tested

## 4. Test Results Summary

| Category | Files | Tests | Passed | Failed |
|----------|-------|-------|--------|--------|
| Backend Unit | 4 | 41 | 41 | 0 |
| Backend Integration | 3 | 23 | 23 | 0 |
| AI Contract/Safety | 1 | 5 | 5 | 0 |
| Frontend Component | 4 | 42 | 42 | 0 |
| Frontend Page | 2 | 17 | 17 | 0 |
| Frontend API | 1 | 12 | 12 | 0 |
| **Total** | **15** | **138** | **138** | **0** |

> All 138 automated tests pass successfully across 15 test files.

## 5. Key Test Scenarios

### 5.1 Authentication (Unit + Integration)
- User registration with valid data → 201 + JWT token
- Duplicate email → 409 conflict
- Invalid email format → 400 with Zod validation error
- Password hashing verification (bcrypt, hash length > 20)
- Login → access protected route → verify token chain (end-to-end flow)
- Expired token rejection, invalid token rejection

### 5.2 Challenge System (Unit + Integration)
- Fetch all challenges with filtering and pagination
- Filter by difficulty, language, or both
- AI challenge generation with Groq API (mocked via Nock)
- Rate limiting enforcement (1 req/min per user, 1 hint/30s)
- Advanced challenge generation with full schema validation
- Input parameter validation for challenge generation

### 5.3 AI Safety & Compliance
- Hint generation returns valid JSON with `hint` key (Zod validated)
- Code feedback matches strict schema: `{score, summary, line_comments[], next_steps[]}`
- Graceful fallback when AI fails twice → safe default response with `score: 0`
- Challenge generation maintains expected structure
- Hallucination resistance testing (C header validation in QA suite)

### 5.4 Streak System (Pure Unit Tests)
- New user with no submissions → streak = 1
- Consecutive day submission → streak increments
- Missed day (48h+ gap) → streak resets to 1
- Same-day duplicate submission → streak unchanged
- Timezone-aware midnight crossing (IST +05:30 offset)

### 5.5 User Progress & Leaderboard
- Paginated leaderboard sorted by total score, then fastest solve time
- Only users with score > 0 appear on leaderboard
- Comprehensive progress data: submissions, averages, highs, lows
- Recent scores capped at 30 entries
- Zero-submission edge case handled gracefully

### 5.6 Frontend Components
- ChallengeCard rendering with difficulty badges and language tags
- Monaco Editor loading and code propagation
- FeedbackPanel score display with line-level comments
- Navbar authentication state handling and role-based links
- Dashboard statistics cards and chart rendering
- Login form validation and authentication flow

## 6. Defects Found

See [defects.md](./defects.md) for the full defect log.

| Severity | Count | Resolved |
|----------|-------|----------|
| Critical | 0 | - |
| High | 1 | ✅ |
| Medium | 2 | ✅ |
| Low | 1 | ⬜ |

## 7. Tools & Environment

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.18 | Test runner for both backend and frontend |
| Supertest | 7.2.2 | HTTP assertion library for Express routes |
| Nock | 14.0.11 | HTTP mocking for Groq API calls |
| React Testing Library | 16.3.2 | DOM testing utilities for React components |
| Playwright | 1.58.2 | Browser automation for E2E tests |
| Zod | 4.3.6 | Runtime schema validation for AI outputs |
| jsdom | 28.1.0 | Browser environment simulation for frontend tests |

## 8. Conclusion

The testing suite provides comprehensive coverage across all critical paths: authentication, challenge CRUD, AI integration, streak logic, submission processing, and UI rendering. The use of contract testing (Zod schemas) for AI outputs is a particularly important pattern for LLM-integrated applications, ensuring the system degrades gracefully when AI responses are malformed or unavailable. All 138 automated tests pass successfully, validating the reliability and correctness of the application.
