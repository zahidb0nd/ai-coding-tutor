import { describe, it, expect, beforeEach, afterAll, afterEach } from 'vitest';
import { z } from 'zod';
import nock from 'nock';
import { getHint, generateChallenge, getCodeFeedback } from '../../services/aiService.js';

describe('AI Service Contract & Safety Tests (nock)', () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        nock.restore();
    });

    // Helper to mock Groq API response
    const mockGroqApi = (content, status = 200) => {
        if (status === 200) {
            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    id: 'chatcmpl-mock',
                    object: 'chat.completion',
                    created: Date.now(),
                    model: 'llama-3.3-70b-versatile',
                    choices: [
                        {
                            index: 0,
                            message: { role: 'assistant', content },
                            finish_reason: 'stop'
                        }
                    ]
                });
        } else {
            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(status, { error: { message: content } });
        }
    };

    describe('getHint()', () => {
        const HintSchema = z.object({
            hint: z.string().min(1)
        });

        it('requests a JSON object with a hint key', async () => {
            mockGroqApi('{"hint": "Try using a for loop"}');

            const result = await getHint('def test(): pass', 'Write a loop');

            const parsed = HintSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.hint).toBe('Try using a for loop');
        });

        it('throws an error if Groq API fails entirely', async () => {
            mockGroqApi('Network Error', 500);

            await expect(getHint('code', 'desc')).rejects.toThrow('Failed to get hint. Please try again.');
        });
    });

    describe('getCodeFeedback()', () => {
        const FeedbackSchema = z.object({
            score: z.number().min(0).max(100),
            summary: z.string(),
            line_comments: z.array(z.object({
                line: z.number(),
                comment: z.string()
            })),
            next_steps: z.array(z.string())
        });

        it('parses successful feedback into strictly typed schema', async () => {
            const mockResponse = {
                score: 85,
                summary: "Good effort",
                line_comments: [{ line: 1, comment: "Missing type hint" }],
                next_steps: ["Read PEP 8"]
            };

            mockGroqApi(JSON.stringify(mockResponse));

            const result = await getCodeFeedback('def test(): pass', 'Write a test', 'Standard Python');

            const parsed = FeedbackSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.score).toBe(85);
        });

        it('falls back to safe default response if AI fails twice', async () => {
            // Setup two failed responses for the retry logic
            mockGroqApi('First failure', 500);
            mockGroqApi('Second failure', 500);

            const result = await getCodeFeedback('code', 'desc', 'rubric');

            expect(result.score).toBe(0);
            expect(result.summary).toContain('Unable to generate AI feedback');
            // Ensure schema safety even on failure
            const parsed = FeedbackSchema.safeParse(result);
            expect(parsed.success).toBe(true);
        });
    });

    describe('generateChallenge()', () => {
        const ChallengeSchema = z.object({
            title: z.string(),
            description: z.string(),
            difficulty: z.number(),
            language: z.string(),
            rubric: z.string()
        });

        it('maintains expected structure for generation', async () => {
            const mockGen = {
                title: "Two Sum",
                description: "Find two numbers",
                difficulty: 3,
                language: "python",
                rubric: "O(n) time"
            };

            mockGroqApi(JSON.stringify(mockGen));

            const result = await generateChallenge(3, 'python', ['arrays']);

            const parsed = ChallengeSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.title).toBe("Two Sum");
        });
    });
});
