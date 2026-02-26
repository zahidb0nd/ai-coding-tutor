import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import submissionsRouter from '../../routes/submissions';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

vi.mock('../../lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn()
        },
        challenge: {
            findUnique: vi.fn()
        },
        submission: {
            create: vi.fn(),
            findMany: vi.fn()
        }
    }
}));
import prisma from '../../lib/prisma';

// Generate a real JWT token instead of mocking the middleware
process.env.JWT_SECRET = 'test-secret';
const validToken = jwt.sign({ userId: "507f1f77bcf86cd799439011", role: "student" }, process.env.JWT_SECRET);

vi.mock('../../services/aiService', () => ({
    getCodeFeedback: vi.fn()
}));
import { getCodeFeedback } from '../../services/aiService';

const app = express();
app.use(express.json());
// Import the real router, which uses the real auth middleware
app.use('/api/submissions', submissionsRouter);

describe('Integration: POST /api/submissions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
        prisma.user.findUnique.mockResolvedValueOnce(null);

        const res = await request(app)
            .post('/api/submissions')
            .set('Authorization', `Bearer ${validToken}`)
            .send(validPayload);

        expect(res.status).toBe(404);
        expect(res.body.error).toBe('User not found.');
    });

    it('returns 404 if challenge is not found', async () => {
        prisma.user.findUnique.mockResolvedValueOnce({ id: validPayload.userId });
        prisma.challenge.findUnique.mockResolvedValueOnce(null);

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
        prisma.user.findUnique.mockResolvedValueOnce(mockUser);

        const mockChallenge = { id: validPayload.challengeId, description: 'Desc', rubric: 'Rubric' };
        prisma.challenge.findUnique.mockResolvedValueOnce(mockChallenge);

        const mockFeedback = { score: 100, summary: "Perfect" };
        getCodeFeedback.mockResolvedValueOnce(mockFeedback);

        prisma.submission.create.mockResolvedValueOnce({ id: "sub-123", score: 100, submittedAt: new Date() });
        prisma.submission.findMany.mockResolvedValueOnce([]); // Mock for checkAndScaleLevel

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
