import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { getHint, generateChallenge, getCodeFeedback } from '../../services/aiService.js';
import Groq from 'groq-sdk';

// Mock the Groq SDK
vi.mock('groq-sdk', () => {
    const GroqMock = vi.fn();
    GroqMock.prototype.chat = {
        completions: {
            create: vi.fn(),
        },
    };
    return { default: GroqMock };
});

const groqMockClient = new Groq();

describe('AI Service Contract & Safety Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getHint()', () => {
        const HintSchema = z.object({
            hint: z.string().min(1)
        });

        it('requests a JSON object with a hint key', async () => {
            // Setup mock response
            mockCreate.mockResolvedValueOnce({
                choices: [{ message: { content: '{"hint": "Try using a for loop"}' } }]
            });

            const result = await getHint('def test(): pass', 'Write a loop');

            // Validate schema contract
            const parsed = HintSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.hint).toBe('Try using a for loop');

            // Validate we requested JSON format explicitly to avoid parsing errors
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    response_format: { type: 'json_object' }
                })
            );
        });

        it('throws an error if Groq API fails entirely', async () => {
            mockCreate.mockRejectedValueOnce(new Error('Network error'));

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

            mockCreate.mockResolvedValueOnce({
                choices: [{ message: { content: JSON.stringify(mockResponse) } }]
            });

            const result = await getCodeFeedback('def test(): pass', 'Write a test', 'Standard Python');

            const parsed = FeedbackSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.score).toBe(85);
        });

        it('falls back to safe default response if AI fails twice', async () => {
            // getCodeFeedback contains a retry mechanism we should test
            mockCreate
                .mockRejectedValueOnce(new Error('First failure'))
                .mockRejectedValueOnce(new Error('Second failure'));

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

            groqMockClient.chat.completions.create.mockResolvedValueOnce({
                choices: [{ message: { content: JSON.stringify(mockGen) } }]
            });

            const result = await generateChallenge(3, 'python', ['arrays']);

            const parsed = ChallengeSchema.safeParse(result);
            expect(parsed.success).toBe(true);
            expect(result.title).toBe("Two Sum");
        });
    });
});
