import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import challengesRouter from '../../routes/challenges.js';

const prisma = require('../../lib/prisma');

process.env.JWT_SECRET = 'test-secret-key';
const validToken = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'student' }, process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use('/api/challenges', challengesRouter);

describe('Challenges Routes Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        prisma.challenge = {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
        };
        prisma.user = {
            findUnique: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/challenges', () => {
        it('returns all challenges when no filters provided', async () => {
            const mockChallenges = [
                { id: '1', title: 'Challenge 1', difficulty: 1, language: 'javascript', description: 'Desc 1' },
                { id: '2', title: 'Challenge 2', difficulty: 2, language: 'python', description: 'Desc 2' },
            ];

            prisma.challenge.findMany.mockResolvedValue(mockChallenges);

            const res = await request(app).get('/api/challenges');

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0].title).toBe('Challenge 1');
        });

        it('filters challenges by difficulty', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            await request(app).get('/api/challenges?difficulty=3');

            expect(prisma.challenge.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { difficulty: 3 },
                })
            );
        });

        it('filters challenges by language', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            await request(app).get('/api/challenges?language=python');

            expect(prisma.challenge.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { language: 'python' },
                })
            );
        });

        it('filters by both difficulty and language', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            await request(app).get('/api/challenges?difficulty=2&language=javascript');

            expect(prisma.challenge.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { difficulty: 2, language: 'javascript' },
                })
            );
        });

        it('orders results by difficulty then title', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            await request(app).get('/api/challenges');

            expect(prisma.challenge.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
                })
            );
        });

        it('handles database errors gracefully', async () => {
            prisma.challenge.findMany.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/api/challenges');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to fetch challenges.');
        });
    });

    describe('GET /api/challenges/:id', () => {
        const mockChallenge = {
            id: 'challenge-123',
            title: 'Test Challenge',
            description: 'Test description',
            difficulty: 3,
            language: 'javascript',
            rubric: 'Test rubric',
        };

        it('returns challenge details for valid ID', async () => {
            prisma.challenge.findUnique.mockResolvedValue(mockChallenge);

            const res = await request(app).get('/api/challenges/challenge-123');

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Test Challenge');
            expect(res.body.difficulty).toBe(3);
        });

        it('returns 404 for non-existent challenge', async () => {
            prisma.challenge.findUnique.mockResolvedValue(null);

            const res = await request(app).get('/api/challenges/nonexistent');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Challenge not found.');
        });

        it('handles database errors gracefully', async () => {
            prisma.challenge.findUnique.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/api/challenges/challenge-123');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to fetch challenge.');
        });
    });

    describe('GET /api/challenges/languages', () => {
        it('returns sorted distinct languages', async () => {
            prisma.challenge.findMany.mockResolvedValue([
                { language: 'python' },
                { language: 'c' },
                { language: 'javascript' },
            ]);

            const res = await request(app).get('/api/challenges/languages');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(['c', 'javascript', 'python']);
            expect(prisma.challenge.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    distinct: ['language'],
                    select: { language: true },
                })
            );
        });

        it('returns empty array when no challenges exist', async () => {
            prisma.challenge.findMany.mockResolvedValue([]);

            const res = await request(app).get('/api/challenges/languages');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('handles database errors gracefully', async () => {
            prisma.challenge.findMany.mockRejectedValue(new Error('DB error'));

            const res = await request(app).get('/api/challenges/languages');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to fetch languages.');
        });
    });
});
