import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import nock from 'nock';
import challengesRouter from '../../routes/challenges.js';

const prisma = require('../../lib/prisma');

process.env.JWT_SECRET = 'test-secret-key';
const validToken = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'student' }, process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use('/api/challenges', challengesRouter);

describe('Challenges Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        nock.cleanAll();
        
        // Clear rate limit maps by reimporting the module
        vi.resetModules();
        
        prisma.challenge = {
            findUnique: vi.fn(),
            create: vi.fn(),
        };
        prisma.user = {
            findUnique: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        nock.cleanAll();
    });

    describe('POST /api/challenges/:id/hint', () => {
        const mockChallenge = {
            id: 'challenge-123',
            description: 'Write a function to reverse a string',
        };

        it('successfully generates a hint for authenticated user', async () => {
            prisma.challenge.findUnique.mockResolvedValue(mockChallenge);

            const mockHintResponse = { hint: 'Think about using array methods' };
            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockHintResponse) } }],
                });

            const res = await request(app)
                .post('/api/challenges/challenge-123/hint')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ code: 'function reverse() {}' });

            expect(res.status).toBe(200);
            expect(res.body.hint).toBe('Think about using array methods');
        });

        it('rate limits hints to 1 per 30 seconds', async () => {
            prisma.challenge.findUnique.mockResolvedValue(mockChallenge);

            const mockHintResponse = { hint: 'First hint' };
            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .times(2)
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockHintResponse) } }],
                });

            // Use a unique challenge ID to avoid rate limit conflicts with other tests
            const uniqueChallengeId = 'unique-challenge-' + Date.now();
            prisma.challenge.findUnique.mockResolvedValue({ ...mockChallenge, id: uniqueChallengeId });

            // First request should succeed
            const res1 = await request(app)
                .post(`/api/challenges/${uniqueChallengeId}/hint`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ code: 'code' });

            expect(res1.status).toBe(200);

            // Second request within 30s should be rate limited
            const res2 = await request(app)
                .post(`/api/challenges/${uniqueChallengeId}/hint`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ code: 'code' });

            expect(res2.status).toBe(429);
            expect(res2.body.error).toContain('30 seconds');
        });

        it('returns 404 for non-existent challenge', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/challenges/nonexistent/hint')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ code: 'code' });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Challenge not found.');
        });

        it('handles AI service failures gracefully', async () => {
            const uniqueChallengeId = 'error-challenge-' + Date.now();
            prisma.challenge.findUnique.mockResolvedValue({ ...mockChallenge, id: uniqueChallengeId });

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(500, { error: 'API error' });

            const res = await request(app)
                .post(`/api/challenges/${uniqueChallengeId}/hint`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({ code: 'code' });

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to generate hint.');
        });

        it('requires authentication', async () => {
            const res = await request(app)
                .post('/api/challenges/challenge-123/hint')
                .send({ code: 'code' });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/challenges/generate', () => {
        it('generates a new challenge based on user level', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                level: 3,
            });

            const mockGeneratedChallenge = {
                title: 'Two Sum',
                description: 'Find two numbers that add up to a target',
                difficulty: 3,
                language: 'javascript',
                rubric: 'Must use O(n) time complexity',
                difficultyExplanation: 'Requires hash map knowledge',
            };

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockGeneratedChallenge) } }],
                });

            prisma.challenge.create.mockResolvedValue({
                id: 'new-challenge-id',
                ...mockGeneratedChallenge,
            });

            const res = await request(app)
                .post('/api/challenges/generate')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ language: 'javascript' });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Two Sum');
            expect(res.body.difficulty).toBe(3);
            expect(prisma.challenge.create).toHaveBeenCalled();
        });

        it('defaults to level 1 for new users', async () => {
            // Use a different user ID to avoid rate limit from previous test
            const newUserToken = jwt.sign({ id: '507f1f77bcf86cd799439012', role: 'student' }, process.env.JWT_SECRET);
            
            prisma.user.findUnique.mockResolvedValue(null);

            const mockChallenge = {
                title: 'Hello World',
                description: 'Print Hello World',
                difficulty: 1,
                language: 'javascript',
                rubric: 'Basic syntax',
                difficultyExplanation: 'Beginner level',
            };

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockChallenge) } }],
                });

            prisma.challenge.create.mockResolvedValue({ id: 'new-id', ...mockChallenge });

            const res = await request(app)
                .post('/api/challenges/generate')
                .set('Authorization', `Bearer ${newUserToken}`)
                .send({ language: 'javascript' });

            expect(res.status).toBe(201);
        });

        it('rate limits to 1 request per minute per user', async () => {
            // Use a unique user ID for this rate limit test
            const rateLimitToken = jwt.sign({ id: '507f1f77bcf86cd799439013', role: 'student' }, process.env.JWT_SECRET);
            
            prisma.user.findUnique.mockResolvedValue({ id: '507f1f77bcf86cd799439013', level: 2 });

            const mockChallenge = {
                title: 'Test',
                description: 'Test',
                difficulty: 2,
                language: 'javascript',
                rubric: 'Test',
                difficultyExplanation: 'Test',
            };

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .times(2)
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockChallenge) } }],
                });

            prisma.challenge.create.mockResolvedValue({ id: 'id', ...mockChallenge });

            // First request
            const res1 = await request(app)
                .post('/api/challenges/generate')
                .set('Authorization', `Bearer ${rateLimitToken}`)
                .send({ language: 'javascript' });

            expect(res1.status).toBe(201);

            // Second request within a minute
            const res2 = await request(app)
                .post('/api/challenges/generate')
                .set('Authorization', `Bearer ${rateLimitToken}`)
                .send({ language: 'javascript' });

            expect(res2.status).toBe(429);
            expect(res2.body.error).toContain('wait a minute');
        });

        it('handles AI generation failures', async () => {
            // Use a unique user ID to avoid rate limit
            const errorToken = jwt.sign({ id: '507f1f77bcf86cd799439014', role: 'student' }, process.env.JWT_SECRET);
            
            prisma.user.findUnique.mockResolvedValue({ id: '507f1f77bcf86cd799439014', level: 2 });

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(500, { error: 'AI service down' });

            const res = await request(app)
                .post('/api/challenges/generate')
                .set('Authorization', `Bearer ${errorToken}`)
                .send({ language: 'python' });

            expect(res.status).toBe(500);
            expect(res.body.error).toContain('Failed to generate challenge');
        });

        it('requires authentication', async () => {
            const res = await request(app)
                .post('/api/challenges/generate')
                .send({ language: 'javascript' });

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/challenges/generate-advanced', () => {
        it('generates a comprehensive challenge with full prompt.txt specification', async () => {
            const advancedToken = jwt.sign({ id: '507f1f77bcf86cd799439015', role: 'student' }, process.env.JWT_SECRET);
            
            prisma.user.findUnique.mockResolvedValue({ id: '507f1f77bcf86cd799439015', level: 3 });
            
            const mockAdvancedChallenge = {
                title: 'Binary Search Implementation',
                difficulty: 'Medium',
                topic: 'arrays',
                problem_style: 'Algorithmic',
                language: 'Python',
                problem_statement: 'Implement binary search algorithm to find element in sorted array',
                input_format: 'A sorted array and target value',
                output_format: 'Index of target or -1 if not found',
                constraints: ['1 <= arr.length <= 10^4', '-10^4 <= arr[i] <= 10^4'],
                examples: [
                    {
                        input: '[1, 2, 3, 4, 5], target=3',
                        output: '2',
                        explanation: 'Element 3 is at index 2'
                    }
                ],
                starter_code: 'def binary_search(arr, target):\n    # Your code here\n    pass',
                reference_solution: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
                time_complexity: 'O(log n)',
                space_complexity: 'O(1)',
                edge_cases: ['Empty array', 'Single element', 'Target not found'],
                hints: ['Think about dividing the search space in half', 'Use two pointers'],
                test_cases: [
                    { input: '[1,2,3,4,5], 3', expected_output: '2' },
                    { input: '[1,2,3,4,5], 6', expected_output: '-1' }
                ]
            };

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockAdvancedChallenge) } }]
                });

            prisma.challenge.create.mockResolvedValue({
                id: 'challenge-advanced-1',
                title: mockAdvancedChallenge.title,
                description: mockAdvancedChallenge.problem_statement,
                difficulty: 3,
                language: mockAdvancedChallenge.language,
                rubric: 'Test rubric',
                difficultyExplanation: 'Test explanation',
                topic: mockAdvancedChallenge.topic,
                problemStyle: mockAdvancedChallenge.problem_style,
                inputFormat: mockAdvancedChallenge.input_format,
                outputFormat: mockAdvancedChallenge.output_format,
                constraints: JSON.stringify(mockAdvancedChallenge.constraints),
                examples: JSON.stringify(mockAdvancedChallenge.examples),
                starterCode: mockAdvancedChallenge.starter_code,
                referenceSolution: mockAdvancedChallenge.reference_solution,
                timeComplexity: mockAdvancedChallenge.time_complexity,
                spaceComplexity: mockAdvancedChallenge.space_complexity,
                edgeCases: JSON.stringify(mockAdvancedChallenge.edge_cases),
                hints: JSON.stringify(mockAdvancedChallenge.hints),
                testCases: JSON.stringify(mockAdvancedChallenge.test_cases),
            });

            const res = await request(app)
                .post('/api/challenges/generate-advanced')
                .set('Authorization', `Bearer ${advancedToken}`)
                .send({
                    language: 'Python',
                    difficulty: 'Medium',
                    topic: 'arrays',
                    problemStyle: 'Algorithmic',
                    outputLength: 'Medium',
                    includeHints: true,
                    includeTests: true
                });

            expect(res.status).toBe(201);
            expect(res.body.title).toBe('Binary Search Implementation');
            expect(res.body.topic).toBe('arrays');
            expect(res.body.problemStyle).toBe('Algorithmic');
            expect(res.body.timeComplexity).toBe('O(log n)');
        });

        it('validates input parameters', async () => {
            const validToken = jwt.sign({ id: '507f1f77bcf86cd799439016', role: 'student' }, process.env.JWT_SECRET);

            const res = await request(app)
                .post('/api/challenges/generate-advanced')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    language: 'InvalidLanguage', // Should fail validation
                    difficulty: 'Medium',
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Invalid input parameters');
        });

        it('uses default values for optional parameters', async () => {
            const defaultToken = jwt.sign({ id: '507f1f77bcf86cd799439017', role: 'student' }, process.env.JWT_SECRET);
            
            const mockChallenge = {
                title: 'Array Sum',
                difficulty: 'Beginner',
                topic: 'arrays',
                problem_style: 'Algorithmic',
                language: 'JavaScript',
                problem_statement: 'Calculate sum of array',
                input_format: 'Array of numbers',
                output_format: 'Sum as number',
                constraints: ['1 <= arr.length <= 100'],
                examples: [{ input: '[1,2,3]', output: '6', explanation: '1+2+3=6' }],
                starter_code: 'function arraySum(arr) {\n  // Your code\n}',
                reference_solution: 'function arraySum(arr) {\n  return arr.reduce((a,b) => a+b, 0);\n}',
                time_complexity: 'O(n)',
                space_complexity: 'O(1)',
                edge_cases: ['Empty array'],
                hints: ['Use a loop or reduce'],
                test_cases: [{ input: '[1,2,3]', expected_output: '6' }]
            };

            nock('https://api.groq.com')
                .post('/openai/v1/chat/completions')
                .reply(200, {
                    choices: [{ message: { content: JSON.stringify(mockChallenge) } }]
                });

            prisma.challenge.create.mockResolvedValue({
                id: 'challenge-default-1',
                title: mockChallenge.title,
                description: mockChallenge.problem_statement,
                difficulty: 1,
                language: mockChallenge.language,
                rubric: 'Test rubric',
                difficultyExplanation: 'Test explanation',
                topic: mockChallenge.topic,
                problemStyle: mockChallenge.problem_style,
                inputFormat: mockChallenge.input_format,
                outputFormat: mockChallenge.output_format,
                constraints: JSON.stringify(mockChallenge.constraints),
                examples: JSON.stringify(mockChallenge.examples),
                starterCode: mockChallenge.starter_code,
                referenceSolution: mockChallenge.reference_solution,
                timeComplexity: mockChallenge.time_complexity,
                spaceComplexity: mockChallenge.space_complexity,
                edgeCases: JSON.stringify(mockChallenge.edge_cases),
                hints: JSON.stringify(mockChallenge.hints),
                testCases: JSON.stringify(mockChallenge.test_cases),
            });

            const res = await request(app)
                .post('/api/challenges/generate-advanced')
                .set('Authorization', `Bearer ${defaultToken}`)
                .send({}); // Empty body, should use defaults

            expect(res.status).toBe(201);
            expect(res.body.language).toBe('JavaScript'); // Default
        });

        it('requires authentication', async () => {
            const res = await request(app)
                .post('/api/challenges/generate-advanced')
                .send({
                    language: 'Python',
                    difficulty: 'Medium'
                });

            expect(res.status).toBe(401);
        });
    });
});
