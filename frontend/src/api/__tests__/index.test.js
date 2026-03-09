import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// We need to mock axios BEFORE importing the API module
// The API module creates an axios instance via axios.create()
vi.mock('axios', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    };
    return {
        default: {
            create: vi.fn(() => mockInstance),
        },
        __mockInstance: mockInstance,
    };
});

// Import after mocking
import * as api from '../index';

// Get the mock instance
const getMockInstance = () => {
    return axios.create();
};

describe('API Module Tests', () => {
    let mockInstance;

    beforeEach(() => {
        mockInstance = getMockInstance();
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Authentication API', () => {
        it('loginUser sends correct credentials', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: { id: '123', email: 'test@example.com' },
                },
            };

            mockInstance.post.mockResolvedValue(mockResponse);

            const result = await api.loginUser({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(mockInstance.post).toHaveBeenCalledWith(
                '/api/auth/login',
                { email: 'test@example.com', password: 'password123' }
            );
            expect(result.data.token).toBe('test-token');
        });

        it('registerUser sends user data', async () => {
            const mockResponse = {
                data: {
                    token: 'new-token',
                    user: { id: '456', name: 'New User', email: 'new@example.com' },
                },
            };

            mockInstance.post.mockResolvedValue(mockResponse);

            const result = await api.registerUser({
                name: 'New User',
                email: 'new@example.com',
                password: 'securepass',
            });

            expect(mockInstance.post).toHaveBeenCalledWith(
                '/api/auth/register',
                { name: 'New User', email: 'new@example.com', password: 'securepass' }
            );
        });
    });

    describe('Challenges API', () => {
        it('getChallenges fetches all challenges', async () => {
            const mockChallenges = {
                data: [
                    { id: '1', title: 'Challenge 1', difficulty: 1 },
                    { id: '2', title: 'Challenge 2', difficulty: 2 },
                ],
            };

            mockInstance.get.mockResolvedValue(mockChallenges);

            const result = await api.getChallenges();

            expect(mockInstance.get).toHaveBeenCalledWith('/api/challenges', { params: undefined });
            expect(result.data).toHaveLength(2);
        });

        it('getChallenges accepts filter parameters', async () => {
            mockInstance.get.mockResolvedValue({ data: [] });

            await api.getChallenges({ difficulty: 3, language: 'python' });

            expect(mockInstance.get).toHaveBeenCalledWith(
                '/api/challenges',
                { params: { difficulty: 3, language: 'python' } }
            );
        });

        it('getChallenge fetches single challenge by ID', async () => {
            const mockChallenge = {
                data: {
                    id: 'challenge-123',
                    title: 'Test Challenge',
                    description: 'Test description',
                },
            };

            mockInstance.get.mockResolvedValue(mockChallenge);

            const result = await api.getChallenge('challenge-123');

            expect(mockInstance.get).toHaveBeenCalledWith('/api/challenges/challenge-123');
            expect(result.data.title).toBe('Test Challenge');
        });

        it('getHint sends data and challenge ID', async () => {
            const mockHint = { data: { hint: 'Try using a loop' } };

            mockInstance.post.mockResolvedValue(mockHint);

            const result = await api.getHint('challenge-123', { code: 'function test() {}' });

            expect(mockInstance.post).toHaveBeenCalledWith(
                '/api/challenges/challenge-123/hint',
                { code: 'function test() {}' }
            );
        });
    });

    describe('Submissions API', () => {
        it('submitCode sends code and user/challenge IDs', async () => {
            const mockSubmission = {
                data: {
                    submission: { id: 'sub-123', score: 85 },
                    feedback: { summary: 'Good job!' },
                },
            };

            mockInstance.post.mockResolvedValue(mockSubmission);

            const result = await api.submitCode({
                userId: 'user-123',
                challengeId: 'challenge-456',
                code: 'console.log("test")',
                language: 'javascript',
            });

            expect(mockInstance.post).toHaveBeenCalledWith(
                '/api/submissions',
                {
                    userId: 'user-123',
                    challengeId: 'challenge-456',
                    code: 'console.log("test")',
                    language: 'javascript',
                }
            );
        });

        it('getSubmissions fetches user submission history', async () => {
            const mockSubmissions = {
                data: [
                    { id: 'sub1', score: 80 },
                    { id: 'sub2', score: 90 },
                ],
            };

            mockInstance.get.mockResolvedValue(mockSubmissions);

            const result = await api.getSubmissions('user-123');

            expect(mockInstance.get).toHaveBeenCalledWith('/api/submissions/user-123');
        });
    });

    describe('Users API', () => {
        it('getUserProgress fetches progress data', async () => {
            const mockProgress = {
                data: {
                    user: { id: 'user-123', name: 'Test' },
                    stats: { totalSubmissions: 10 },
                },
            };

            mockInstance.get.mockResolvedValue(mockProgress);

            const result = await api.getUserProgress('user-123');

            expect(mockInstance.get).toHaveBeenCalledWith('/api/users/user-123/progress');
        });

        it('getLeaderboard fetches top users', async () => {
            const mockLeaderboard = {
                data: {
                    users: [
                        { id: '1', name: 'User 1', totalScore: 1000 },
                        { id: '2', name: 'User 2', totalScore: 900 },
                    ],
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            mockInstance.get.mockResolvedValue(mockLeaderboard);

            const result = await api.getLeaderboard();

            expect(mockInstance.get).toHaveBeenCalledWith('/api/users/leaderboard', { params: undefined });
            expect(result.data.users).toHaveLength(2);
        });
    });

    describe('Error Handling', () => {
        it('rejects on failed request', async () => {
            mockInstance.post.mockRejectedValue({
                response: { data: { error: 'Invalid credentials' } },
            });

            await expect(api.loginUser({ email: 'test@test.com', password: 'wrong' }))
                .rejects.toEqual({ response: { data: { error: 'Invalid credentials' } } });
        });

        it('exports all expected API functions', () => {
            expect(typeof api.loginUser).toBe('function');
            expect(typeof api.registerUser).toBe('function');
            expect(typeof api.getChallenges).toBe('function');
            expect(typeof api.getChallenge).toBe('function');
            expect(typeof api.getHint).toBe('function');
            expect(typeof api.submitCode).toBe('function');
            expect(typeof api.getSubmissions).toBe('function');
            expect(typeof api.getUserProgress).toBe('function');
            expect(typeof api.getLeaderboard).toBe('function');
        });
    });
});
