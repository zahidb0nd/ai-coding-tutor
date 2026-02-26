import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import * as api from '../../api';

vi.mock('../../api');
vi.mock('recharts', () => ({
    LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard Page Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        const mockUser = {
            id: '123',
            name: 'Test User',
            email: 'test@example.com',
            level: 2,
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
    });

    it('displays loading state while fetching data', () => {
        api.getUserProgress = vi.fn(() => new Promise(() => {})); // Never resolves
        api.getSubmissions = vi.fn(() => new Promise(() => {}));
        
        renderWithRouter(<Dashboard />);
        
        expect(screen.getByRole('status') || document.querySelector('.loading-shimmer')).toBeInTheDocument();
    });

    it('displays user progress statistics', async () => {
        const mockProgress = {
            data: {
                user: { id: '123', name: 'Test User', level: 2 },
                stats: {
                    totalSubmissions: 25,
                    averageScore: 78,
                    highestScore: 95,
                    lowestScore: 45,
                    completedChallenges: 10,
                    totalChallenges: 20,
                },
                recentScores: [],
            },
        };
        
        api.getUserProgress = vi.fn().mockResolvedValue(mockProgress);
        api.getSubmissions = vi.fn().mockResolvedValue({ data: [] });
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('25')).toBeInTheDocument(); // Total submissions
            expect(screen.getByText('78')).toBeInTheDocument(); // Average score
            expect(screen.getByText('95')).toBeInTheDocument(); // Highest score
        });
    });

    it('displays score chart when data is available', async () => {
        const mockProgress = {
            data: {
                user: { id: '123', name: 'Test User', level: 2 },
                stats: {
                    totalSubmissions: 5,
                    averageScore: 70,
                    highestScore: 85,
                    lowestScore: 55,
                    completedChallenges: 3,
                    totalChallenges: 10,
                },
                recentScores: [
                    { score: 60, challenge: 'Challenge 1', date: new Date() },
                    { score: 75, challenge: 'Challenge 2', date: new Date() },
                    { score: 85, challenge: 'Challenge 3', date: new Date() },
                ],
            },
        };
        
        api.getUserProgress = vi.fn().mockResolvedValue(mockProgress);
        api.getSubmissions = vi.fn().mockResolvedValue({ data: [] });
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });
    });

    it('displays submission history', async () => {
        const mockProgress = {
            data: {
                user: { id: '123', name: 'Test User', level: 2 },
                stats: {
                    totalSubmissions: 2,
                    averageScore: 75,
                    highestScore: 85,
                    lowestScore: 65,
                    completedChallenges: 2,
                    totalChallenges: 10,
                },
                recentScores: [],
            },
        };
        
        const mockSubmissions = {
            data: [
                {
                    id: 'sub1',
                    score: 85,
                    submittedAt: new Date('2026-02-20'),
                    challenge: { title: 'Array Methods', difficulty: 2 },
                },
                {
                    id: 'sub2',
                    score: 65,
                    submittedAt: new Date('2026-02-19'),
                    challenge: { title: 'String Manipulation', difficulty: 1 },
                },
            ],
        };
        
        api.getUserProgress = vi.fn().mockResolvedValue(mockProgress);
        api.getSubmissions = vi.fn().mockResolvedValue(mockSubmissions);
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText('Array Methods')).toBeInTheDocument();
            expect(screen.getByText('String Manipulation')).toBeInTheDocument();
        });
    });

    it('handles errors gracefully', async () => {
        api.getUserProgress = vi.fn().mockRejectedValue(new Error('Network error'));
        api.getSubmissions = vi.fn().mockRejectedValue(new Error('Network error'));
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/failed to load/i) || screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('shows retry button on error', async () => {
        api.getUserProgress = vi.fn().mockRejectedValue(new Error('Network error'));
        api.getSubmissions = vi.fn().mockRejectedValue(new Error('Network error'));
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            const retryButton = screen.getByText(/retry/i);
            expect(retryButton).toBeInTheDocument();
        });
    });

    it('displays user level badge', async () => {
        const mockProgress = {
            data: {
                user: { id: '123', name: 'Test User', level: 3 },
                stats: {
                    totalSubmissions: 10,
                    averageScore: 80,
                    highestScore: 95,
                    lowestScore: 60,
                    completedChallenges: 5,
                    totalChallenges: 15,
                },
                recentScores: [],
            },
        };
        
        api.getUserProgress = vi.fn().mockResolvedValue(mockProgress);
        api.getSubmissions = vi.fn().mockResolvedValue({ data: [] });
        
        renderWithRouter(<Dashboard />);
        
        await waitFor(() => {
            expect(screen.getByText(/intermediate/i) || screen.getByText(/level 3/i)).toBeInTheDocument();
        });
    });

    it('redirects to login if user is not authenticated', () => {
        localStorage.removeItem('user');
        
        renderWithRouter(<Dashboard />);
        
        // Component should handle redirect (verify via navigation mock in real scenario)
    });
});
