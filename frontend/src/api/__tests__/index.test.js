import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import * as api from '../index';

vi.mock('axios');

describe('API Module Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Authentication API', () => {
        it('login sends correct credentials', async () => {
            const mockResponse = {
                data: {
                    token: 'test-token',
                    user: { id: '123', email: 'test@example.com' },
                },
            };
            
            axios.post = vi.fn().mockResolvedValue(mockResponse);
            
            const result = await api.login({
                email: 'test@example.com',
                password: 'password123',
            });
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/login'),
                { email: 'test@example.com', password: 'password123' }
            );
            expect(result.data.token).toBe('test-token');
        });

        it('register sends user data', async () => {
            const mockResponse = {
                data: {
                    token: 'new-token',
                    user: { id: '456', name: 'New User', email: 'new@example.com' },
                },
            };
            
            axios.post = vi.fn().mockResolvedValue(mockResponse);
            
            const result = await api.register({
                name: 'New User',
                email: 'new@example.com',
                password: 'securepass',
            });
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/auth/register'),
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
            
            axios.get = vi.fn().mockResolvedValue(mockChallenges);
            
            const result = await api.getChallenges();
            
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/challenges'));
            expect(result.data).toHaveLength(2);
        });

        it('getChallenges accepts filter parameters', async () => {
            axios.get = vi.fn().mockResolvedValue({ data: [] });
            
            await api.getChallenges({ difficulty: 3, language: 'python' });
            
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/challenges'),
                expect.objectContaining({
                    params: { difficulty: 3, language: 'python' },
                })
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
            
            axios.get = vi.fn().mockResolvedValue(mockChallenge);
            
            const result = await api.getChallenge('challenge-123');
            
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/challenges/challenge-123'));
            expect(result.data.title).toBe('Test Challenge');
        });

        it('getHint sends code and challenge ID', async () => {
            const mockHint = { data: { hint: 'Try using a loop' } };
            
            axios.post = vi.fn().mockResolvedValue(mockHint);
            localStorage.setItem('token', 'test-token');
            
            const result = await api.getHint('challenge-123', 'function test() {}');
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/challenges/challenge-123/hint'),
                { code: 'function test() {}' },
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
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
            
            axios.post = vi.fn().mockResolvedValue(mockSubmission);
            localStorage.setItem('token', 'test-token');
            
            const result = await api.submitCode({
                userId: 'user-123',
                challengeId: 'challenge-456',
                code: 'console.log("test")',
                language: 'javascript',
            });
            
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/submissions'),
                expect.objectContaining({
                    userId: 'user-123',
                    challengeId: 'challenge-456',
                    code: 'console.log("test")',
                    language: 'javascript',
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
        });

        it('getSubmissions fetches user submission history', async () => {
            const mockSubmissions = {
                data: [
                    { id: 'sub1', score: 80 },
                    { id: 'sub2', score: 90 },
                ],
            };
            
            axios.get = vi.fn().mockResolvedValue(mockSubmissions);
            localStorage.setItem('token', 'test-token');
            
            const result = await api.getSubmissions('user-123');
            
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/submissions/user-123'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
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
            
            axios.get = vi.fn().mockResolvedValue(mockProgress);
            localStorage.setItem('token', 'test-token');
            
            const result = await api.getUserProgress('user-123');
            
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/users/user-123/progress'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token',
                    }),
                })
            );
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
            
            axios.get = vi.fn().mockResolvedValue(mockLeaderboard);
            
            const result = await api.getLeaderboard();
            
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users/leaderboard'));
            expect(result.data.users).toHaveLength(2);
        });
    });

    describe('Error Handling', () => {
        it('throws error on failed request', async () => {
            axios.post = vi.fn().mockRejectedValue({
                response: { data: { error: 'Invalid credentials' } },
            });
            
            await expect(api.login({ email: 'test@test.com', password: 'wrong' }))
                .rejects.toThrow();
        });

        it('includes authorization header for protected routes', async () => {
            axios.get = vi.fn().mockResolvedValue({ data: {} });
            localStorage.setItem('token', 'my-jwt-token');
            
            await api.getUserProgress('user-123');
            
            expect(axios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer my-jwt-token',
                    }),
                })
            );
        });
    });
});
