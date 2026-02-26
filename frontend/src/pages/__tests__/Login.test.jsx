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

    it('renders login and register forms', () => {
        renderWithRouter(<Login />);
        
        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByText(/register/i) || screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('allows switching between login and register modes', () => {
        renderWithRouter(<Login />);
        
        // Find toggle/switch to register
        const registerButton = screen.getAllByText(/register/i)[0] || screen.getAllByText(/sign up/i)[0];
        if (registerButton) {
            fireEvent.click(registerButton);
            expect(screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        }
    });

    it('validates required fields on login', async () => {
        renderWithRouter(<Login />);
        
        const submitButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(submitButton);
        
        // Should show validation errors
        await waitFor(() => {
            expect(screen.getByText(/email/i) || screen.getByText(/required/i)).toBeInTheDocument();
        });
    });

    it('validates email format', async () => {
        renderWithRouter(<Login />);
        
        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        const submitButton = screen.getByRole('button', { name: /login/i });
        
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.queryByText(/invalid/i) || screen.queryByText(/valid email/i)).toBeInTheDocument();
        });
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
        
        api.login = vi.fn().mockResolvedValue(mockResponse);
        
        renderWithRouter(<Login />);
        
        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i) || screen.getByPlaceholderText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });
        
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith({
                email: 'john@example.com',
                password: 'password123',
            });
        });
        
        // Should store token and user in localStorage
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockResponse.data.user);
    });

    it('displays error message on failed login', async () => {
        api.login = vi.fn().mockRejectedValue({
            response: {
                data: { error: 'Invalid email or password.' },
            },
        });
        
        renderWithRouter(<Login />);
        
        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i) || screen.getByPlaceholderText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });
        
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
        
        api.register = vi.fn().mockResolvedValue(mockResponse);
        
        renderWithRouter(<Login />);
        
        // Switch to register mode
        const registerToggle = screen.getAllByText(/register/i)[0] || screen.getAllByText(/sign up/i)[0];
        if (registerToggle) {
            fireEvent.click(registerToggle);
        }
        
        const nameInput = screen.getByLabelText(/name/i) || screen.getByPlaceholderText(/name/i);
        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i) || screen.getByPlaceholderText(/password/i);
        const submitButton = screen.getByRole('button', { name: /register/i }) || 
                             screen.getByRole('button', { name: /sign up/i });
        
        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(api.register).toHaveBeenCalledWith({
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password123',
            });
        });
        
        expect(localStorage.getItem('token')).toBe('new-user-token');
    });

    it('shows loading state during authentication', async () => {
        api.login = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
        
        renderWithRouter(<Login />);
        
        const emailInput = screen.getByLabelText(/email/i) || screen.getByPlaceholderText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i) || screen.getByPlaceholderText(/password/i);
        const submitButton = screen.getByRole('button', { name: /login/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.click(submitButton);
        
        // Should show loading indicator
        expect(submitButton).toBeDisabled();
    });
});
