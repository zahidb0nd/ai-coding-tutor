# Design Document
## AI-Enhanced Coding Tutor
**SwipeGen Web Tech Project | February 2026**

---

## 1. System Architecture

The application follows a classic three-tier architecture: a React frontend, a Node.js/Express API layer, and a PostgreSQL database. The AI layer is a thin wrapper around the Groq API (primary) with Gemini as fallback.

| Layer | Responsibility |
|-------|---------------|
| Frontend (React) | Code editor UI, challenge display, progress dashboard, auth forms |
| API (Express) | Route requests, validate input, call AI API, read/write DB |
| AI Service (Groq) | Analyse code, generate feedback, produce new challenges |
| Database (PostgreSQL) | Store users, submissions, challenges, progress records |

---

## 2. Data Models

### Users

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | VARCHAR | Display name |
| email | VARCHAR | Unique, for login |
| password_hash | VARCHAR | bcrypt hashed |
| level | INT | 1–5, auto-scaled |
| created_at | TIMESTAMP | |

### Challenges

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| title | VARCHAR | |
| description | TEXT | What the student must build |
| difficulty | INT | 1–5 |
| language | VARCHAR | js, html, css, etc. |
| rubric | TEXT | Scoring criteria sent to AI |

### Submissions

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → Users |
| challenge_id | UUID | FK → Challenges |
| code | TEXT | Raw submitted code |
| ai_feedback | TEXT | JSON from AI response |
| score | INT | 0–100 AI-assigned score |
| submitted_at | TIMESTAMP | |

---

## 3. Core User Flows

### Flow A — Submit Code for Feedback

1. User opens a challenge and writes/pastes code in Monaco editor
2. User clicks **"Get Feedback"**
3. Frontend sends `POST /api/submissions` with `{ userId, challengeId, code }`
4. API builds prompt: code + challenge description + rubric
5. Groq returns structured JSON: `{ score, summary, line_comments[], next_steps[] }`
6. API saves submission to DB, returns feedback to frontend
7. Frontend renders feedback inline with code highlights

### Flow B — Auto-Generate Next Challenge

1. User scores ≥ 70 on a challenge
2. API checks user's current level and recent topics
3. Groq generates a new challenge at level+1 difficulty
4. Challenge saved to DB and surfaced to user

### Flow C — Auth

1. User registers with name, email, password
2. API hashes password with bcrypt, stores user in DB
3. API returns signed JWT (24hr expiry)
4. All subsequent requests send JWT in `Authorization: Bearer <token>` header

---

## 4. AI Prompt Design

The core feedback prompt sent to Groq:

```
You are a coding tutor reviewing a student's code.

Challenge: {challenge_description}
Rubric: {rubric}
Student code:
{code}

Respond ONLY with valid JSON, no explanation outside the JSON:
{
  "score": 0-100,
  "summary": "brief overall feedback",
  "line_comments": [
    { "line": 5, "comment": "explanation of issue on this line" }
  ],
  "next_steps": ["tip 1", "tip 2"]
}
```

The challenge generation prompt:

```
You are a coding tutor. Generate a coding challenge for a student at difficulty level {level}/5.
Recent topics covered: {topics}.
Language: {language}.

Respond ONLY with valid JSON:
{
  "title": "...",
  "description": "...",
  "difficulty": {level},
  "rubric": "scoring criteria for the AI reviewer"
}
```

---

## 5. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/challenges` | List all challenges (filterable) |
| GET | `/api/challenges/:id` | Get single challenge |
| POST | `/api/submissions` | Submit code, triggers AI feedback |
| GET | `/api/submissions/:userId` | Get user's submission history |
| GET | `/api/users/:id/progress` | Get progress stats for dashboard |

---

## 6. UI Screens

| Screen | Key Components |
|--------|---------------|
| Landing / Login | Hero tagline, Login/Register form, sample challenge preview |
| Challenge View | Monaco code editor (left), challenge description + feedback panel (right) |
| Progress Dashboard | Streak counter, challenge history, score chart, level badge |
| Challenge Library | Grid of challenges filterable by language, difficulty, topic |

---

## 7. Error Handling

- **API rate limit exceeded** → queue request, show "Tutor is thinking..." with spinner
- **Invalid code syntax** → return parse error with line number before calling AI
- **Empty submission** → client-side validation, don't hit the API
- **DB connection failure** → 503 response with user-friendly message
- **AI returns malformed JSON** → retry once, then return a generic feedback message
