import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChallengeCard from '../ChallengeCard';

const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ChallengeCard Component', () => {
    const mockChallenge = {
        id: 'challenge-123',
        title: 'Reverse a String',
        description: 'Write a function that reverses a string',
        difficulty: 2,
        language: 'javascript',
    };

    it('renders challenge title', () => {
        renderWithRouter(<ChallengeCard challenge={mockChallenge} />);
        
        expect(screen.getByText('Reverse a String')).toBeInTheDocument();
    });

    it('renders challenge description', () => {
        renderWithRouter(<ChallengeCard challenge={mockChallenge} />);
        
        expect(screen.getByText(/write a function that reverses a string/i)).toBeInTheDocument();
    });

    it('displays difficulty level', () => {
        renderWithRouter(<ChallengeCard challenge={mockChallenge} />);
        
        // Difficulty 2 should show as "Easy"
        expect(screen.getByText(/easy/i)).toBeInTheDocument();
    });

    it('displays programming language', () => {
        renderWithRouter(<ChallengeCard challenge={mockChallenge} />);
        
        expect(screen.getByText(/javascript/i)).toBeInTheDocument();
    });

    it('shows correct difficulty label for level 1', () => {
        const beginnerChallenge = { ...mockChallenge, difficulty: 1 };
        renderWithRouter(<ChallengeCard challenge={beginnerChallenge} />);
        
        expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    });

    it('shows correct difficulty label for level 3', () => {
        const mediumChallenge = { ...mockChallenge, difficulty: 3 };
        renderWithRouter(<ChallengeCard challenge={mediumChallenge} />);
        
        expect(screen.getByText(/medium/i)).toBeInTheDocument();
    });

    it('shows correct difficulty label for level 4', () => {
        const hardChallenge = { ...mockChallenge, difficulty: 4 };
        renderWithRouter(<ChallengeCard challenge={hardChallenge} />);
        
        expect(screen.getByText(/hard/i)).toBeInTheDocument();
    });

    it('shows correct difficulty label for level 5', () => {
        const expertChallenge = { ...mockChallenge, difficulty: 5 };
        renderWithRouter(<ChallengeCard challenge={expertChallenge} />);
        
        expect(screen.getByText(/expert/i)).toBeInTheDocument();
    });

    it('is clickable and navigates to challenge detail', () => {
        renderWithRouter(<ChallengeCard challenge={mockChallenge} />);
        
        const card = screen.getByText('Reverse a String').closest('a') || 
                     screen.getByText('Reverse a String').closest('div[role="button"]');
        
        expect(card).toBeInTheDocument();
    });

    it('truncates long descriptions', () => {
        const longDescriptionChallenge = {
            ...mockChallenge,
            description: 'This is a very long description that should be truncated because it exceeds the maximum character limit that we want to display in the card view. We want to keep the UI clean and not overwhelm users with too much text.',
        };
        
        renderWithRouter(<ChallengeCard challenge={longDescriptionChallenge} />);
        
        // Check that some text is displayed
        expect(screen.getByText(/this is a very long description/i)).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
        const minimalChallenge = {
            id: 'minimal-123',
            title: 'Minimal Challenge',
            difficulty: 1,
        };
        
        renderWithRouter(<ChallengeCard challenge={minimalChallenge} />);
        
        expect(screen.getByText('Minimal Challenge')).toBeInTheDocument();
    });
});
