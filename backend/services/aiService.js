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
 * Generate a new challenge using AI
 * @param {number} level - Difficulty level (1-5)
 * @param {string} language - Programming language
 * @param {string[]} recentTopics - Topics the student recently worked on
 * @returns {Object} { title, description, difficulty, rubric }
 */
async function generateChallenge(level, language, recentTopics) {
    const topicsStr = recentTopics.length > 0 ? recentTopics.join(', ') : 'general programming';

    const prompt = `You are a coding tutor. Generate a coding challenge for a student at difficulty level ${level}/5.
Recent topics covered: ${topicsStr}.
Language: ${language}.

Respond ONLY with valid JSON:
{
  "title": "...",
  "description": "A detailed description of what the student must build or solve",
  "difficulty": ${level},
  "language": "${language}",
  "rubric": "scoring criteria for the AI reviewer",
  "difficultyExplanation": "A 1-sentence concise explanation of WHY this challenge is rated at difficulty ${level}."
}`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 1024,
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error('Groq generateChallenge error:', err.message);
        throw new Error('Failed to generate challenge. Please try again.');
    }
}

/**
 * Get a hint for the user's current attempt
 * @param {string} code - User's current code
 * @param {string} challengeDescription - The challenge description
 * @returns {Object} { hint }
 */
async function getHint(code, challengeDescription) {
    const prompt = `You are a coding tutor. The student is stuck on this challenge:
${challengeDescription}

Here is their current code:
${code || '(No code written yet)'}

Provide a SMALL, subtle hint or nudge to help them out. DO NOT write the full solution for them. Keep it under 3 sentences. Only respond with valid JSON:
{
  "hint": "your short hint here"
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

module.exports = { getCodeFeedback, generateChallenge, getHint };
