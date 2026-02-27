# AI Coding Tutor

A full-stack AI-driven coding tutor platform that generates algorithmic challenges, evaluates user code, and provides AI-powered feedback using the Groq API.

## Features

- **AI Challenge Generator:** Dynamically creates coding challenges based on language, difficulty, and selected concepts.
- **Code Evaluation:** Automatically grades users' submitted code logic and identifies missing optimizations. 
- **AI Feedback system:** Provides nuanced code-level hints and feedback for learning instead of just giving away the answer.
- **Streak & Leaderboard System:** Gamifies the experience to reward consistency and improvement.
- **Multi-language Support:** Choose from Javascript, C, C++, Java, and Python.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)
- Groq API Key

### Installation

1. Clone the repository
2. Install dependencies for the backend and frontend:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Configure Environment Variables:
   Create a `.env` file in the `backend` directory based on provided templates. Make sure to define `DATABASE_URL`, `GROQ_API_KEY`, `JWT_SECRET`, and `PORT`.

4. Start the Application:

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

## Built With

- **Frontend:** React, TailwindCSS, Monaco Editor, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Prisma ORM
- **AI Integration:** Groq SDK (Llama 3)
