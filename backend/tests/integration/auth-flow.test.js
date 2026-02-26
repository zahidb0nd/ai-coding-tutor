import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authRouter from '../../routes/auth.js';
import usersRouter from '../../routes/users.js';

const prisma = require('../../lib/prisma');

process.env.JWT_SECRET = 'test-integration-secret';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

describe('Auth Flow Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        prisma.user = {
            findUnique: vi.fn(),
            create: vi.fn(),
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

    describe('Complete Registration and Authentication Flow', () => {
        it('registers user, logs in, and accesses protected resource', async () => {
            const newUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'securepass123',
            };

            // Step 1: Register
            prisma.user.findUnique.mockResolvedValue(null); // No existing user
            prisma.user.create.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: newUser.name,
                email: newUser.email,
                level: 1,
                createdAt: new Date(),
            });

            const registerRes = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(registerRes.status).toBe(201);
            expect(registerRes.body.token).toBeDefined();
            const token1 = registerRes.body.token;

            // Verify token is valid
            const decoded1 = jwt.verify(token1, process.env.JWT_SECRET);
            expect(decoded1.email).toBe(newUser.email);

            // Step 2: Login with same credentials
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: newUser.name,
                email: newUser.email,
                passwordHash: hashedPassword,
                level: 1,
            });

            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: newUser.email, password: newUser.password });

            expect(loginRes.status).toBe(200);
            expect(loginRes.body.token).toBeDefined();
            const token2 = loginRes.body.token;

            // Step 3: Access protected resource with token
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: newUser.name,
                email: newUser.email,
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
            prisma.challenge.count.mockResolvedValue(10);
            prisma.submission.findMany.mockResolvedValue([]);

            const progressRes = await request(app)
                .get('/api/users/507f1f77bcf86cd799439011/progress')
                .set('Authorization', `Bearer ${token2}`);

            expect(progressRes.status).toBe(200);
            expect(progressRes.body.user.email).toBe(newUser.email);
        });

        it('prevents duplicate registration', async () => {
            const existingUser = {
                name: 'Existing User',
                email: 'existing@example.com',
                password: 'password123',
            };

            // First registration succeeds
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: existingUser.name,
                email: existingUser.email,
                level: 1,
            });

            const res1 = await request(app)
                .post('/api/auth/register')
                .send(existingUser);

            expect(res1.status).toBe(201);

            // Second registration with same email fails
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                email: existingUser.email,
            });

            const res2 = await request(app)
                .post('/api/auth/register')
                .send(existingUser);

            expect(res2.status).toBe(409);
            expect(res2.body.error).toContain('already exists');
        });

        it('rejects access to protected routes without token', async () => {
            const res = await request(app)
                .get('/api/users/507f1f77bcf86cd799439011/progress');

            expect(res.status).toBe(401);
        });

        it('rejects access with invalid token', async () => {
            const res = await request(app)
                .get('/api/users/507f1f77bcf86cd799439011/progress')
                .set('Authorization', 'Bearer invalid-token-here');

            expect(res.status).toBe(401);
        });

        it('rejects access with expired token', async () => {
            const expiredToken = jwt.sign(
                { id: '507f1f77bcf86cd799439011' },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );

            // Wait a moment to ensure expiration
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .get('/api/users/507f1f77bcf86cd799439011/progress')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(res.status).toBe(401);
        });
    });
});
