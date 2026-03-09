import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

// Mock the useIsMobile hook to always return false (desktop)
vi.mock('../../hooks/useMediaQuery', () => ({
    useIsMobile: () => false,
}));

// Mock MobileBottomNav
vi.mock('../MobileBottomNav', () => ({
    default: () => <div data-testid="mobile-nav">Mobile Nav</div>,
}));

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('returns null when no user is logged in', () => {
        const { container } = renderWithRouter(<Navbar />);

        // Navbar returns null when not logged in
        expect(container.innerHTML).toBe('');
    });

    it('shows user navigation when logged in', () => {
        const mockUser = {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
            level: 2,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/challenges/i)).toBeInTheDocument();
    });

    it('displays user name when logged in', () => {
        const mockUser = {
            id: '123',
            name: 'Jane Smith',
            email: 'jane@example.com',
            level: 3,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    it('has link to challenges page', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 1,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        const challengesLink = screen.getByText('Challenges').closest('a');
        expect(challengesLink).toHaveAttribute('href', '/challenges');
    });

    it('has link to dashboard page', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 1,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        const dashboardLink = screen.getByText('Dashboard').closest('a');
        expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    });

    it('has link to leaderboard page', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 1,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        const leaderboardLink = screen.getByText('Leaderboard').closest('a');
        expect(leaderboardLink).toHaveAttribute('href', '/leaderboard');
    });

    it('handles logout action', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 1,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        const logoutButton = screen.getByText(/logout/i);
        fireEvent.click(logoutButton);

        // After logout, localStorage should be cleared
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('displays app title/logo', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 1,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        // App branding is "CodeTutor"
        expect(screen.getByText('CodeTutor')).toBeInTheDocument();
    });

    it('shows instructor dashboard link for instructor role', () => {
        const mockInstructor = {
            id: '123',
            name: 'Prof Smith',
            email: 'instructor@example.com',
            level: 5,
            role: 'instructor',
        };

        localStorage.setItem('user', JSON.stringify(mockInstructor));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        // The nav has an "Instructor" link
        const instructorLink = screen.getByText('Instructor').closest('a');
        expect(instructorLink).toHaveAttribute('href', '/instructor');
    });

    it('displays user level badge', () => {
        const mockUser = {
            id: '123',
            name: 'User',
            email: 'user@example.com',
            level: 3,
        };

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'fake-jwt-token');

        renderWithRouter(<Navbar />);

        expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    });
});
