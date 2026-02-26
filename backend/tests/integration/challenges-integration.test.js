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
});
