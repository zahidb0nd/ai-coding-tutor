import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import usersRouter from '../../routes/users.js';

const prisma = require('../../lib/prisma');

process.env.JWT_SECRET = 'test-secret-key';
const validToken = jwt.sign({ id: '507f1f77bcf86cd799439011', role: 'student' }, process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

describe('Users Routes Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        prisma.user = {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        };
        prisma.submission = {
            count: vi.fn(),
            aggregate: vi.fn(),
            groupBy: vi.fn(),
            findMany: vi.fn(),
        };
        prisma.challenge = {
            count: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('GET /api/users/leaderboard', () => {
        it('returns paginated leaderboard sorted by total score', async () => {
            const mockUsers = [
                { id: '1', name: 'Alice', totalScore: 1000, currentStreak: 5, level: 4, fastestSolveTime: 120000 },
                { id: '2', name: 'Bob', totalScore: 800, currentStreak: 3, level: 3, fastestSolveTime: 150000 },
            ];

            prisma.user.findMany.mockResolvedValue(mockUsers);
            prisma.user.count.mockResolvedValue(2);

            const res = await request(app).get('/api/users/leaderboard');

            expect(res.status).toBe(200);
            expect(res.body.users).toHaveLength(2);
            expect(res.body.users[0].name).toBe('Alice');
            expect(res.body.users[0].totalScore).toBe(1000);
            expect(res.body.totalPages).toBe(1);
            expect(res.body.currentPage).toBe(1);
        });

        it('respects pagination parameters', async () => {
            prisma.user.findMany.mockResolvedValue([]);
            prisma.user.count.mockResolvedValue(25);

            const res = await request(app)
                .get('/api/users/leaderboard')
                .query({ page: 2, limit: 10 });

            expect(res.status).toBe(200);
            expect(res.body.totalPages).toBe(3);
            expect(res.body.currentPage).toBe(2);
            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 10,
                    take: 10,
                })
            );
        });

        it('only includes users with totalScore > 0', async () => {
            prisma.user.findMany.mockResolvedValue([]);
            prisma.user.count.mockResolvedValue(0);

            await request(app).get('/api/users/leaderboard');

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { totalScore: { gt: 0 } },
                })
            );
        });

        it('sorts by totalScore desc, then fastestSolveTime asc', async () => {
            prisma.user.findMany.mockResolvedValue([]);
            prisma.user.count.mockResolvedValue(0);

            await request(app).get('/api/users/leaderboard');

            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [
                        { totalScore: 'desc' },
                        { fastestSolveTime: 'asc' },
                    ],
                })
            );
        });

        it('handles database errors gracefully', async () => {
            prisma.user.findMany.mockRejectedValue(new Error('DB connection failed'));

            const res = await request(app).get('/api/users/leaderboard');

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to fetch leaderboard.');
        });
    });

    describe('GET /api/users/:id/progress', () => {
        const mockUserId = '507f1f77bcf86cd799439011';

        it('returns comprehensive progress data for valid user', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: mockUserId,
                name: 'John Doe',
                email: 'john@example.com',
                level: 3,
                createdAt: new Date('2026-01-01'),
            });

            prisma.submission.count.mockResolvedValue(15);
            prisma.submission.aggregate.mockResolvedValue({
                _avg: { score: 75.5 },
                _max: { score: 95 },
                _min: { score: 50 },
            });
            prisma.submission.groupBy.mockResolvedValue([
                { challengeId: 'c1' },
                { challengeId: 'c2' },
            ]);
            prisma.challenge.count.mockResolvedValue(20);
            prisma.submission.findMany.mockResolvedValue([
                { score: 80, submittedAt: new Date(), challenge: { title: 'Challenge 1' } },
            ]);

            const res = await request(app)
                .get(`/api/users/${mockUserId}/progress`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.user.name).toBe('John Doe');
            expect(res.body.stats.totalSubmissions).toBe(15);
            expect(res.body.stats.averageScore).toBe(76);
            expect(res.body.stats.highestScore).toBe(95);
            expect(res.body.stats.lowestScore).toBe(50);
            expect(res.body.stats.completedChallenges).toBe(2);
            expect(res.body.stats.totalChallenges).toBe(20);
            expect(res.body.recentScores).toHaveLength(1);
        });

        it('returns 404 for non-existent user', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/users/${mockUserId}/progress`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('User not found.');
        });

        it('requires authentication', async () => {
            const res = await request(app).get(`/api/users/${mockUserId}/progress`);

            expect(res.status).toBe(401);
        });

        it('handles zero submissions correctly', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: mockUserId,
                name: 'New User',
                email: 'new@example.com',
                level: 1,
                createdAt: new Date(),
            });

            prisma.submission.count.mockResolvedValue(0);
            prisma.submission.aggregate.mockResolvedValue({
                _avg: { score: null },
                _max: { score: null },
                _min: { score: null },
            });
            prisma.submission.groupBy.mockResolvedValue([]);
            prisma.challenge.count.mockResolvedValue(20);
            prisma.submission.findMany.mockResolvedValue([]);

            const res = await request(app)
                .get(`/api/users/${mockUserId}/progress`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.stats.totalSubmissions).toBe(0);
            expect(res.body.stats.averageScore).toBe(0);
            expect(res.body.stats.highestScore).toBe(0);
            expect(res.body.recentScores).toHaveLength(0);
        });

        it('limits recent scores to 30 submissions', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: mockUserId,
                name: 'John Doe',
                email: 'john@example.com',
                level: 3,
                createdAt: new Date(),
            });

            prisma.submission.count.mockResolvedValue(50);
            prisma.submission.aggregate.mockResolvedValue({
                _avg: { score: 75 },
                _max: { score: 95 },
                _min: { score: 50 },
            });
            prisma.submission.groupBy.mockResolvedValue([]);
            prisma.challenge.count.mockResolvedValue(20);
            prisma.submission.findMany.mockResolvedValue([]);

            await request(app)
                .get(`/api/users/${mockUserId}/progress`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(prisma.submission.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 30,
                })
            );
        });

        it('handles database errors gracefully', async () => {
            prisma.user.findUnique.mockRejectedValue(new Error('DB error'));

            const res = await request(app)
                .get(`/api/users/${mockUserId}/progress`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Failed to fetch progress data.');
        });
    });
});
