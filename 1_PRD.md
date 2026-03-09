# Product Requirements Document (PRD)
## AI-Enhanced Coding Tutor
**SwipeGen Web Tech Project | February 2026**

---

## 1. Overview

The AI-Enhanced Coding Tutor is a web application that uses AI to help beginner and intermediate developers improve their coding skills. Users paste or write code, receive intelligent real-time feedback, explanations, and are served progressive coding challenges personalised to their level.

---

## 2. Problem Statement

Most beginners struggle to get quality feedback on their code outside of expensive bootcamps or slow Stack Overflow threads. Generic error messages don't explain *why* something is wrong or how to improve. There is no adaptive system that gets harder as you get better.

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| User engagement | Avg session length | > 15 minutes |
| Learning outcome | Challenge completion rate | > 60% |
| Feedback quality | User satisfaction rating | > 4.2 / 5 |
| Retention | 7-day return rate | > 40% |

---

## 4. Target Users

- **Beginner coders** learning HTML, CSS, JavaScript
- **Students** in web development bootcamps or courses (like SwipeGen!)
- **Self-taught developers** wanting structured feedback
- **Instructors** who want to assign tracked coding exercises

---

## 5. User Stories

### Student
- As a student, I want to paste my code and get line-by-line feedback so I understand what I did wrong.
- As a student, I want to receive a new challenge after completing one so I always have something to work on.
- As a student, I want to see my progress over time so I stay motivated.

### Instructor
- As an instructor, I want to create custom challenge sets so my students practice relevant material.
- As an instructor, I want to see my students' submission history so I can identify who needs help.

---

## 6. Features & Scope

| Priority | Feature | Sprint |
|----------|---------|--------|
| P0 — Must Have | Code editor with syntax highlighting (Monaco) | Sprint 1 |
| P0 — Must Have | AI feedback on submitted code (Groq / Gemini) | Sprint 1 |
| P0 — Must Have | Challenge library (10+ starter challenges) | Sprint 1 |
| P1 — Should Have | Progress tracking dashboard | Sprint 2 |
| P1 — Should Have | Difficulty auto-scaling based on performance | Sprint 2 |
| P1 — Should Have | User authentication (register / login) | Sprint 2 |
| P2 — Nice to Have | Instructor dashboard & custom challenge sets | Sprint 3 |
| P2 — Nice to Have | Leaderboard & badges | Sprint 3 |

---

## 7. Out of Scope (v1)

- Mobile native app (web responsive only)
- Video lessons or course content
- Peer-to-peer code review
- Paid subscription / billing system

---

## 8. Constraints

- **Zero-cost infrastructure** — all APIs must have a free tier
- **Student project scope** — completable within ~4 weeks
- **No DevOps complexity** — deployable on Vercel / Netlify + free DB
