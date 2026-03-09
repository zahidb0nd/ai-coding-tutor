import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import * as api from '../../api';

vi.mock('../../api');

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Page Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login and register tabs', () => {
        renderWithRouter(<Login />);

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('allows switching between login and register modes', () => {
        renderWithRouter(<Login />);

        // Click Register tab
        const registerTab = screen.getByText('Register');
        fireEvent.click(registerTab);

        // Name field should appear in register mode
        expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    });

    it('has email and password fields on login', () => {
        renderWithRouter(<Login />);

        expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
    });

    it('shows Sign In button in login mode', () => {
        renderWithRouter(<Login />);

        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows Create Account button in register mode', () => {
        renderWithRouter(<Login />);

        // Switch to register
        fireEvent.click(screen.getByText('Register'));

        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('successfully logs in with valid credentials', async () => {
        const mockResponse = {
            data: {
                token: 'fake-jwt-token',
                user: {
                    id: '123',
                    name: 'John Doe',
                    email: 'john@example.com',
                    level: 2,
                },
            },
        };

        api.loginUser = vi.fn().mockResolvedValue(mockResponse);

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.loginUser).toHaveBeenCalledWith({
                email: 'john@example.com',
                password: 'password123',
            });
        });

        // Should store token and user in localStorage
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockResponse.data.user);
    });

    it('displays error message on failed login', async () => {
        api.loginUser = vi.fn().mockRejectedValue({
            response: {
                data: { error: 'Invalid email or password.' },
            },
        });

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
        });
    });

    it('successfully registers a new user', async () => {
        const mockResponse = {
            data: {
                token: 'new-user-token',
                user: {
                    id: '456',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    level: 1,
                },
            },
        };

        api.registerUser = vi.fn().mockResolvedValue(mockResponse);

        renderWithRouter(<Login />);

        // Switch to register mode
        fireEvent.click(screen.getByText('Register'));

        const nameInput = screen.getByPlaceholderText(/your name/i);
        const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.registerUser).toHaveBeenCalledWith({
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
            });
        });

        expect(localStorage.getItem('token')).toBe('new-user-token');
    });

    it('shows loading state during authentication', async () => {
        api.loginUser = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.click(submitButton);

        // Should show loading indicator
        await waitFor(() => {
            expect(screen.getByText(/please wait/i)).toBeInTheDocument();
        });
    });
});
