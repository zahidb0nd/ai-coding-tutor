# 🧠 CodeTutor: AI-Powered Coding Platform

Live Demo: [Insert Vercel URL]

CodeTutor is a modern, responsive web application that reimagines the coding challenge experience. Instead of relying on rigid, traditional compilers, it utilizes a Large Language Model (LLM) to evaluate code, providing users with nuanced, peer-like feedback, dynamic hints, and real-time syntax checking.

## 🚀 Tech Stack & Architecture

* **Frontend:** React 19, Vite, React Router v7
* **Editor:** Monaco Editor (`@monaco-editor/react`)
* **Backend:** Node.js, Express
* **Database & ORM:** MongoDB with Prisma
* **AI Engine:** Groq API (`llama-3.3-70b-versatile`)
* **Deployment:** Vercel

## 🧠 Key Engineering Decisions

I built this project to demonstrate a deep understanding of modern frontend performance and AI integration:

1.  **AI as a Compiler (Groq Integration):** Rather than sandboxing an execution environment (like WebContainers), the backend pipes user code, a strict grading rubric, and the challenge constraints to the Groq API. This allows for subjective evaluation (e.g., "Is this variable named well?") alongside objective execution checks.
2.  **Performance Optimization (Lazy Loading):** The Monaco Editor is a heavy dependency. To protect initial load times and Core Web Vitals, the editor is code-split using React's `lazy()` and wrapped in a `<Suspense>` boundary with a custom skeleton loader fallback.
3.  **Real-Time AI Streaming (SSE):** To prevent UI blocking while the LLM generates feedback, the evaluation engine uses HTTP streaming. A custom React hook parses the chunks as they arrive, creating a highly responsive "typing" effect without triggering excessive DOM re-renders.

## Features

- **AI Challenge Generator:** Dynamically creates coding challenges based on language, difficulty, and selected concepts.
- **Code Evaluation:** Automatically grades users' submitted code logic and identifies missing optimizations. 
- **AI Feedback system:** Provides nuanced code-level hints and feedback for learning instead of just giving away the answer.
- **Streak & Leaderboard System:** Gamifies the experience to reward consistency and improvement.
- **Multi-language Support:** Choose from Javascript, C, C++, Java, and Python.

## 🛠️ Local Development

1. Clone the repository: `git clone [URL]`
2. Install dependencies for the backend and frontend:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Set up your environment variables (`.env`):
   - `DATABASE_URL` (MongoDB URI)
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `PORT`

4. Seed the database:
```bash
node prisma/seed.js
```

5. Start the Application:

**Backend Server:**
```bash
cd backend
npm start
```

**Frontend Server:**
```bash
cd frontend
npm run dev
```

## Testing

The application includes robust testing suites to ensure reliability, AI compliance, and accurate grading.

### Backend Tests

Run the standard suite of unit and integration tests for the backend logic and API using Vitest:

```bash
cd backend
npm run test
```

### QA Automation Suite

Run the end-to-end automation suite to verify that the Groq AI service produces challenges appropriately and evaluates solutions accurately without hallucinating:

```bash
cd backend
node tests/run_qa_suite_1.js
```

*(Note: Verify that the backend server is running locally on port 3001 before running the QA suite)*
