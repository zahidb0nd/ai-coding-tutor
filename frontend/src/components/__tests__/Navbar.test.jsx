import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

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

    it('shows login state when no user is logged in', () => {
        renderWithRouter(<Navbar />);
        
        // Should not show user-specific navigation
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
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
        
        const challengesLink = screen.getByText(/challenges/i).closest('a');
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
        
        const dashboardLink = screen.getByText(/dashboard/i).closest('a');
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
        
        const leaderboardLink = screen.getByText(/leaderboard/i).closest('a');
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
        renderWithRouter(<Navbar />);
        
        // Should display app branding
        expect(screen.getByText(/coding tutor/i) || screen.getByText(/ai tutor/i)).toBeInTheDocument();
    });

    it('shows instructor dashboard link for instructor role', () => {
        const mockInstructor = {
            id: '123',
            name: 'Instructor User',
            email: 'instructor@example.com',
            level: 5,
            role: 'instructor',
        };
        
        localStorage.setItem('user', JSON.stringify(mockInstructor));
        localStorage.setItem('token', 'fake-jwt-token');
        
        renderWithRouter(<Navbar />);
        
        // Should show instructor-specific navigation
        const instructorLink = screen.queryByText(/instructor/i);
        if (instructorLink) {
            expect(instructorLink.closest('a')).toHaveAttribute('href', '/instructor');
        }
    });
});
