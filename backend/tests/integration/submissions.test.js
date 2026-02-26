import request from 'supertest';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import express from 'express';
import submissionsRouter from '../../routes/submissions';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Import the REAL prisma singleton
const prisma = require('../../lib/prisma');

// Generate a real JWT token instead of mocking the middleware
import nock from 'nock';

process.env.JWT_SECRET = 'test-secret';
const validToken = jwt.sign({ userId: "507f1f77bcf86cd799439011", role: "student" }, process.env.JWT_SECRET);

const app = express();
app.use(express.json());
// Import the real router, which uses the real auth middleware
app.use('/api/submissions', submissionsRouter);

describe('Integration: POST /api/submissions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        nock.cleanAll();

        // Directly override properties to bypass Vitest CJS/ESM module caching issues
        // and avoid errors if PrismaClient isn't generated yet.
        prisma.user = {
            findUnique: vi.fn().mockResolvedValue(null),
            update: vi.fn().mockResolvedValue({})
        };
        prisma.challenge = {
            findUnique: vi.fn().mockResolvedValue(null)
        };
        prisma.submission = {
            create: vi.fn().mockResolvedValue({}),
            findMany: vi.fn().mockResolvedValue([])
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const validPayload = {
        userId: "507f1f77bcf86cd799439011",
        challengeId: "507f191e810c19729de860ea",
        code: "print('Hello World')",
        language: "python"
    };

    it('rejects invalid inputs based on schema without hitting DB', async () => {
        const res = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ ...validPayload, userId: 'invalid-id' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid user ID');
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 if user is not found', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${validToken}`)
            .send(validPayload);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('User not found.');
    });

    it('returns 404 if challenge is not found', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: validPayload.userId });
        prisma.challenge.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${validToken}`)
            .send(validPayload);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Challenge not found.');
    });

    it('processes valid submission successfully and increments streak', async () => {
        // Setup mock logic
        const mockUser = { id: validPayload.userId, currentStreak: 5, lastActiveDate: new Date('2020-01-01') };
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const mockChallenge = { id: validPayload.challengeId, description: 'Desc', rubric: 'Rubric' };
        prisma.challenge.findUnique.mockResolvedValue(mockChallenge);

        const mockFeedback = { score: 100, summary: "Perfect" };
        nock('https://api.groq.com')
            .post('/openai/v1/chat/completions')
            .reply(200, {
                choices: [{ message: { content: JSON.stringify(mockFeedback) } }]
            });

        prisma.submission.create.mockResolvedValue({ id: "sub-123", score: 100, submittedAt: new Date() });
        prisma.submission.findMany.mockResolvedValue([]); // Mock for checkAndScaleLevel

        const res = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${validToken}`)
            .send(validPayload);

        expect(res.status).toBe(201);
        expect(res.body.feedback.score).toBe(100);

        // Verify correct streak logic call
        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: validPayload.userId },
                data: expect.objectContaining({
                    currentStreak: 1, // Because lastActiveDate was 2020
                    totalScore: { increment: 100 }
                })
            })
        );
    });
});
