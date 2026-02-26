import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRouter from '../../routes/auth.js';

const prisma = require('../../lib/prisma');

process.env.JWT_SECRET = 'test-secret-key';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock Prisma methods
        prisma.user = {
            findUnique: vi.fn(),
            create: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('POST /api/auth/register', () => {
        const validRegistration = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        it('successfully registers a new user with valid data', async () => {
            prisma.user.findUnique.mockResolvedValue(null); // No existing user
            prisma.user.create.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                level: 1,
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send(validRegistration);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.name).toBe('John Doe');
            expect(res.body.user.email).toBe('john@example.com');
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('rejects registration with existing email', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                email: 'john@example.com',
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send(validRegistration);

            expect(res.status).toBe(409);
            expect(res.body.error).toBe('An account with this email already exists.');
            expect(prisma.user.create).not.toHaveBeenCalled();
        });

        it('rejects registration with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validRegistration, email: 'invalid-email' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid email');
        });

        it('rejects registration with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validRegistration, password: '12345' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('at least 6 characters');
        });

        it('rejects registration with short name', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ ...validRegistration, name: 'A' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('at least 2 characters');
        });

        it('hashes password before storing', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockImplementation((data) => {
                expect(data.data.passwordHash).not.toBe(validRegistration.password);
                expect(data.data.passwordHash.length).toBeGreaterThan(20);
                return Promise.resolve({
                    id: '507f1f77bcf86cd799439011',
                    name: data.data.name,
                    email: data.data.email,
                    level: 1,
                });
            });

            await request(app)
                .post('/api/auth/register')
                .send(validRegistration);

            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('returns JWT token with correct payload', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                level: 1,
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send(validRegistration);

            expect(res.status).toBe(201);
            const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
            expect(decoded.id).toBe('507f1f77bcf86cd799439011');
            expect(decoded.email).toBe('john@example.com');
            expect(decoded.name).toBe('John Doe');
        });
    });

    describe('POST /api/auth/login', () => {
        const validLogin = {
            email: 'john@example.com',
            password: 'password123',
        };

        it('successfully logs in with correct credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: hashedPassword,
                level: 2,
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('john@example.com');
            expect(res.body.user.level).toBe(2);
        });

        it('rejects login with non-existent email', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin);

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid email or password.');
        });

        it('rejects login with incorrect password', async () => {
            const hashedPassword = await bcrypt.hash('differentpassword', 10);
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                email: 'john@example.com',
                passwordHash: hashedPassword,
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin);

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid email or password.');
        });

        it('rejects login with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid email');
        });

        it('rejects login with missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'john@example.com', password: '' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('required');
        });

        it('returns valid JWT token on successful login', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prisma.user.findUnique.mockResolvedValue({
                id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                passwordHash: hashedPassword,
                level: 2,
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send(validLogin);

            expect(res.status).toBe(200);
            const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
            expect(decoded.id).toBe('507f1f77bcf86cd799439011');
            expect(decoded.email).toBe('john@example.com');
        });
    });
});
