const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Get AI feedback on student code
 * @param {string} code - The student's submitted code
 * @param {string} challengeDescription - The challenge description
 * @param {string} rubric - Scoring criteria
 * @returns {Object} { score, summary, line_comments, next_steps }
 */
async function getCodeFeedback(code, challengeDescription, rubric) {
    const prompt = `You are a coding tutor reviewing a student's code.

Challenge: ${challengeDescription}
Rubric: ${rubric}
Student code:
${code}

Respond ONLY with valid JSON, no explanation outside the JSON:
{
  "score": 0-100,
  "summary": "brief overall feedback",
  "line_comments": [
    { "line": 5, "comment": "explanation of issue on this line" }
  ],
  "next_steps": ["tip 1", "tip 2"]
}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 2048,
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content);
    } catch (err) {
        console.error('Groq getCodeFeedback error:', err.message);

        // If first attempt fails, try once more
        try {
            const retryResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.3,
                max_tokens: 2048,
            });

            return JSON.parse(retryResponse.choices[0].message.content);
        } catch (retryErr) {
            console.error('Groq retry failed:', retryErr.message);
            return {
                score: 0,
                summary: 'Unable to generate AI feedback at this time. Please try again later.',
                line_comments: [],
                next_steps: ['Try submitting your code again in a few moments.'],
            };
        }
    }
}

/**
 * Generate a new challenge using AI based on prompt.txt specification
 * @param {Object} params - Generation parameters
 * @param {string} params.language - Programming language (C, C++, Java, JavaScript, Python)
 * @param {string} params.difficulty - Difficulty level (Beginner, Easy, Medium, Hard, Expert)
 * @param {string} params.topic - Topic area (arrays, recursion, OOP, etc.)
 * @param {string} params.problemStyle - Problem style (Algorithmic, Real-world, Debugging, Code Completion, Optimization)
 * @param {string} params.outputLength - Output length (Short, Medium, Long)
 * @param {boolean} params.includeHints - Whether to include hints
 * @param {boolean} params.includeTests - Whether to include test cases
 * @returns {Object} Complete challenge object matching prompt.txt schema
 */
async function generateChallengeFromSpec(params) {
    const {
        language = 'JavaScript',
        difficulty = 'Beginner',
        topic = 'arrays',
        problemStyle = 'Algorithmic',
        outputLength = 'Medium',
        includeHints = true,
        includeTests = true,
    } = params;

    // Build the master prompt from prompt.txt
    const prompt = `# 🧠 MASTER PROMPT — AI Coding Challenge Generator

## 🎯 Role

You are an expert programming educator and competitive programming problem setter.
Your task is to generate **high-quality, original coding challenges** suitable for an AI coding tutor platform.

Focus on:
- Concept clarity
- Progressive difficulty
- Real-world relevance
- Clean evaluation criteria
- Language-idiomatic solutions

## 📥 Inputs (Dynamic Variables)

- LANGUAGE: ${language}
- DIFFICULTY: ${difficulty}
- TOPIC: ${topic}
- PROBLEM_STYLE: ${problemStyle}
- OUTPUT_LENGTH: ${outputLength}
- INCLUDE_HINTS: ${includeHints}
- INCLUDE_TESTS: ${includeTests}

## 📊 Difficulty Calibration

### Beginner
- Basic syntax
- Simple loops/conditions
- No advanced data structures

### Easy
- Arrays, strings
- Basic functions
- Simple OOP

### Medium
- Hash maps, stacks, queues
- Recursion
- Moderate algorithmic thinking
- Multi-step logic

### Hard
- Dynamic programming
- Graph algorithms
- Advanced data structures
- Edge case heavy

### Expert
- Optimization heavy
- Multi-concept fusion
- Requires deep reasoning

## 📦 Required Output Format (STRICT)

Return output in **valid JSON only**.

Generate a challenge that:
- Is original and not copied from known platforms
- Matches the requested difficulty precisely
- Is solvable within reasonable constraints
- Uses idiomatic patterns for the chosen language
- Avoids ambiguity
- Avoids trick questions unless difficulty is Hard+

Respond ONLY with valid JSON matching this exact schema:
{
  "title": "string",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "problem_style": "${problemStyle}",
  "language": "${language}",
  "problem_statement": "string - detailed description of what to solve",
  "input_format": "string - how input is provided",
  "output_format": "string - expected output format",
  "constraints": ["string array - technical constraints like array size, value ranges"],
  "examples": [
    {
      "input": "string - example input",
      "output": "string - expected output",
      "explanation": "string - why this output"
    }
  ],
  "starter_code": "string - skeleton code to help student start",
  "reference_solution": "string - working solution for validation",
  "time_complexity": "string - Big O time complexity",
  "space_complexity": "string - Big O space complexity",
  "edge_cases": ["string array - important edge cases to consider"],
  "hints": ${includeHints ? '["string array - progressive hints"]' : '[]'},
  "test_cases": ${includeTests ? '[{"input": "string", "expected_output": "string"}]' : '[]'}
}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 3072, // Increased for comprehensive output
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error('Groq generateChallengeFromSpec error:', err.message);
        throw new Error('Failed to generate challenge. Please try again.');
    }
}

/**
 * Generate a new challenge using AI (legacy compatibility)
 * @param {number} level - Difficulty level (1-5)
 * @param {string} language - Programming language
 * @param {string[]} recentTopics - Topics the student recently worked on
 * @returns {Object} { title, description, difficulty, rubric }
 */
async function generateChallenge(level, language, recentTopics) {
    // Map numeric level to difficulty string
    const difficultyMap = {
        1: 'Beginner',
        2: 'Easy',
        3: 'Medium',
        4: 'Hard',
        5: 'Expert',
    };

    const difficulty = difficultyMap[level] || 'Beginner';
    const topic = recentTopics.length > 0 ? recentTopics[0] : 'arrays';

    // Use new comprehensive generation
    const fullChallenge = await generateChallengeFromSpec({
        language,
        difficulty,
        topic,
        problemStyle: 'Algorithmic',
        outputLength: 'Medium',
        includeHints: true,
        includeTests: true,
    });

    // Return in legacy format for backward compatibility
    return {
        title: fullChallenge.title,
        description: fullChallenge.problem_statement || fullChallenge.description,
        difficulty: level,
        language: fullChallenge.language,
        rubric: `Evaluate based on correctness, code quality, and efficiency. Expected complexity: ${fullChallenge.time_complexity}`,
        difficultyExplanation: `This is a ${difficulty} level challenge focusing on ${topic}.`,
        // Include all new fields
        ...fullChallenge,
    };
}

/**
 * Get a hint for the user's current attempt
 * @param {string} code - User's current code
 * @param {string} challengeDescription - The challenge description
 * @param {number} level - The hint level (1: Conceptual, 2: Logic Breakdown, 3: Edge Cases, 4: Code Snippet)
 * @returns {Object} { hint }
 */
async function getHint(code, challengeDescription, level = 1) {
    let hintInstruction = "";

    if (!code || code.trim() === "") {
        return { hint: "Just start typing, I'm here to catch you." };
    }

    switch (Number(level)) {
        case 1:
            hintInstruction = "Discuss the theory and high-level approach needed to solve the problem. Do not provide any code or step-by-step logic.";
            break;
        case 2:
            hintInstruction = "Provide a step-by-step logic list of how to solve the problem. Do not write any actual code.";
            break;
        case 3:
            hintInstruction = "Point out specifically where the user's current code might fail, focusing on edge cases like empty arrays, null values, or loop boundaries. Do not rewrite their code.";
            break;
        case 4:
            hintInstruction = "Provide a 2-3 line code correction for the most immediate error in the user's code. Explain briefly why the correction works.";
            break;
        default:
            hintInstruction = "Provide a SMALL, subtle hint or nudge to help them out. DO NOT write the full solution for them. Keep it under 3 sentences.";
    }

    const prompt = `You are a supportive programming peer acting as an AI Tutor. The student is working on this challenge:
${challengeDescription}

Here is their current code:
${code}

Task: ${hintInstruction}

Act like a friendly, supportive peer. KEEP IT CONCISE. Only respond with valid JSON:
{
  "hint": "your response here formatted nicely in markdown"
}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
            max_tokens: 512,
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error('Groq getHint error:', err.message);
        throw new Error('Failed to get hint. Please try again.');
    }
}

module.exports = { getCodeFeedback, generateChallenge, generateChallengeFromSpec, getHint };
