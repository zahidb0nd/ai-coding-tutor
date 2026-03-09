# Tech Stack
## AI-Enhanced Coding Tutor
**SwipeGen Web Tech Project | February 2026 | Vibe-coded with Antigravity IDE**

> Every tool below has a free tier sufficient for a student project. No credit card required.

---

## 1. Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework — component-based, huge ecosystem |
| Vite | 5+ | Blazing fast dev server & bundler |
| Tailwind CSS | 3+ | Utility-first styling — rapid UI without writing CSS files |
| Monaco Editor | latest | VS Code's editor in the browser — syntax highlighting + IntelliSense |
| React Router | 6+ | Client-side routing between pages |
| Axios | 1+ | HTTP client for API calls |
| Recharts | 2+ | Progress charts on the dashboard |

---

## 2. Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | JavaScript runtime — same language as frontend |
| Express.js | 4+ | Minimal web framework — fast to set up routes |
| Prisma ORM | 5+ | Type-safe DB access — auto-generates client from schema |
| jsonwebtoken | 9+ | Stateless JWT auth tokens |
| bcrypt | 5+ | Password hashing |
| Zod | 3+ | Runtime input validation — catch bad requests early |

---

## 3. AI / APIs

| Service | Free Tier | Use |
|---------|-----------|-----|
| **Groq API** | 14,400 req/day — Llama 3.3 70B | Primary AI: code feedback & challenge generation (very fast) |
| **Gemini API** | 1,500 req/day — Gemini 1.5 Flash | Fallback AI if Groq quota is hit |

### Getting your Groq API key
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Create an API key
4. Add to your `.env`: `GROQ_API_KEY=your_key_here`

### Basic Groq call (copy this into Antigravity)
```javascript
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getCodeFeedback(code, challengeDescription, rubric) {
  const prompt = `You are a coding tutor. Challenge: ${challengeDescription}. Rubric: ${rubric}. Student code: ${code}. Respond ONLY with JSON: { "score": 0-100, "summary": "...", "line_comments": [], "next_steps": [] }`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## 4. Database

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Neon** | 0.5 GB storage, auto-pause | Serverless Postgres — instant setup, Prisma-friendly ✅ Recommended |
| Supabase (alt) | 500 MB, 2 projects | Also has auth built-in if you want to skip JWT |

### Prisma schema (starter)
```prisma
model User {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  passwordHash String
  level        Int          @default(1)
  createdAt    DateTime     @default(now())
  submissions  Submission[]
}

model Challenge {
  id          String       @id @default(uuid())
  title       String
  description String
  difficulty  Int
  language    String
  rubric      String
  submissions Submission[]
}

model Submission {
  id          String    @id @default(uuid())
  userId      String
  challengeId String
  code        String
  aiFeedback  String?
  score       Int?
  submittedAt DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  challenge   Challenge @relation(fields: [challengeId], references: [id])
}
```

---

## 5. Deployment

| Tool | Free Tier | Purpose |
|------|-----------|---------|
| **Vercel** | Unlimited hobby projects | Frontend hosting — auto-deploys from GitHub on every push |
| **Render** | 750 hrs/month | Backend Express API hosting |
| **GitHub** | Free | Source control + triggers Vercel deploys |
| **Antigravity IDE** | Free | Your primary AI-assisted dev environment |

> **Note:** Render's free tier spins down after 15 min of inactivity. First request after spin-down takes ~30 seconds. Fine for a student project.

---

## 6. Dev Tools

- **ESLint + Prettier** — code style consistency (set up once, forget about it)
- **Thunder Client** — VS Code extension for testing API endpoints (like Postman, but in your IDE)
- **React DevTools** — browser extension for component debugging
- **Prisma Studio** — `npx prisma studio` gives you a free visual DB browser

---

## 7. Folder Structure

```
ai-coding-tutor/
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.jsx         # Monaco editor wrapper
│   │   │   ├── FeedbackPanel.jsx  # AI feedback display
│   │   │   ├── ChallengeCard.jsx  # Challenge list item
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Challenge.jsx      # Main coding screen
│   │   │   ├── Dashboard.jsx      # Progress view
│   │   │   └── Login.jsx
│   │   ├── api/
│   │   │   └── index.js           # All axios calls to backend
│   │   └── App.jsx
│   └── package.json
│
├── backend/                   # Node.js + Express
│   ├── routes/
│   │   ├── auth.js
│   │   ├── challenges.js
│   │   └── submissions.js
│   ├── services/
│   │   └── aiService.js           # Groq/Gemini wrapper
│   ├── middleware/
│   │   └── auth.js                # JWT verification
│   ├── prisma/
│   │   └── schema.prisma
│   ├── index.js                   # Express entry point
│   └── package.json
│
└── README.md
```

---

## 8. Sprint Plan

| Sprint | Timeline | Deliverables |
|--------|----------|-------------|
| Sprint 1 | Week 1–2 | Project setup, Monaco editor rendering, Groq API connected, basic code feedback working end-to-end |
| Sprint 2 | Week 2–3 | User auth (register/login), DB schema + Prisma, challenge library, progress tracking |
| Sprint 3 | Week 3–4 | Auto-difficulty scaling, dashboard with charts, UI polish, deploy to Vercel + Render |

---

## 9. Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql://...       # from Neon dashboard
GROQ_API_KEY=gsk_...               # from console.groq.com
GEMINI_API_KEY=AIza...             # from aistudio.google.com
JWT_SECRET=some_long_random_string

# frontend/.env
VITE_API_URL=http://localhost:3000  # change to Render URL on deploy
```

---

*Good luck building! 🚀*
